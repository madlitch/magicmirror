/* global Module */

/* Magic Mirror
 * Module: Medication-Management
 *
 * By Lyba Mughees
 * MIT Licensed.
 */

Module.register("Medication-Management", { 
  defaults: {},


  start: function () {
    // Fetch medication data from the API
    Log.info("Medication-Management module started...");
    this.sendSocketNotification("FETCH_MEDICATION_DATA");
  },
  
  

  socketNotificationReceived: function (notification, payload) {
    if (notification === "MEDICATION_DATA") {
      // Handle the received medication data, for example, update the module's data and trigger a DOM update
      this.medicationData = payload;
      this.updateDom();
    }
  }
  

  
  
});




