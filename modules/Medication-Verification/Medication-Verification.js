/* Magic Mirror
 * Module: Medication-Verification
 *
 * By Lyba Mughees
 * MIT Licensed.
 */

Module.register("Medication-Verification", {
  start: function () {
    console.log("Medication Verification module started...");
  },

  notificationReceived: function (notification, payload) {
    if (notification === "START_MEDICATION_VERIFICATION") {
      // Start the verification process by notifying the helper
      this.sendSocketNotification("START_MEDICATION_VERIFICATION");
    }
  }
});
