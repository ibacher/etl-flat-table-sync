'use strict';
const queueService = require('./queue-service');
const syncService = require('./sync-service');

const def = {
  syncBaseTables,
  queuePatients,
  updateSummaries,
  nightlyUpdates,
  maintenance
}

function maintenance(){
  return new Promise(async (resolve,reject) => {
      await syncService.startSlave();
      await syncService.killIdleConnections();
      resolve('Maintenance done ..');

  });

}

function syncBaseTables(){
  return Promise.allSettled(
    [syncService.updateFlatObs(),
    syncService.updateFlatLabObs(),
    syncService.updateFlatOrders()]
    );
}

function queuePatients(){
  return new Promise((resolve,reject) => {
      const queues = [queueService.generateHivSummarySyncQueue(),
        queueService.generateFlatAppointmentSyncQueue(),
        ];
      
      queues.forEach(async (queue,index) => {
          await queue;
          console.log('Done', index);
      });
      resolve('All summaries updated done');
    });
 
}

function updateSummaries(){
  return Promise.allSettled([
    syncService.updateHivSummary(),
    syncService.updateLabsAndImaging(),
    syncService.updateFlatAppointment()]
  );
}


function nightlyUpdates(){
  return new Promise(async (resolve,reject) => {
      await syncService.updateVitals();
      await syncService.updateBreastCancerScreening();
      await syncService.updateCervicalScreening();
      await syncService.updateOncologyHistory();
      await syncService.updatePepSummary();
      await syncService.updateDefaulters();
      await syncService.updateCaseManager();
      await syncService.updateFamilyTesting();
      await syncService.updateHivMonthlySummary();
      resolve('Done nightly updates ...');

    

  });

}




module.exports = def;