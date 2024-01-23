/* global Module */

/* Magic Mirror
 * Module: Medication-Alarm
 *
 * By Lyba Mughees
 * MIT Licensed.
 */

// TODO read module documentation:
// TODO https://docs.magicmirror.builders/development/core-module-file.html#subclassable-module-methods

/* global Module, Log */


Module.register("Medication-Alarm", {
  defaults: {
    medicationSchedule: []
  },

  start: function () {
    Log.info("Medication-Alarm module started...");
    this.scheduleMedicationAlarms();
  },

  scheduleMedicationAlarms: function () {
    setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

 
      const scheduledMedications = this.config.medicationSchedule.filter((medication) => {
        return (
          medication.day === now.toLocaleDateString() &&
          medication.time === currentTime
        );
      });

      if (scheduledMedications.length > 0) {
        const medication = scheduledMedications[0];
        const message = `It's time for your medication: ${medication.brand_name} at ${medication.time}`;
        this.showNotification(message);
        console.log(message);
      }
    }, 60000); 
    
  },

  getStyles: function () {
    return [
        "Medication-Alarm.css" 
    ];
},


showNotification: function (message) {
  const notificationElement = document.createElement("div");
  notificationElement.className = "popup-div";
  notificationElement.innerHTML = `<span>${message}</span>`;

  
  document.body.appendChild(notificationElement);

  
  setTimeout(() => {
      notificationElement.remove();
  }, 10000);
}

});