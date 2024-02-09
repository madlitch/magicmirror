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
      // Start the verification process
      this.startVerification();
    }
  },

  startVerification: function () {
    // Your verification logic goes here
    console.log("Starting medication verification...");
    // Use the provided Python script for verification
    this.startPythonScript();
  },

  startPythonScript: function () {
    // Start the Python script for medication verification
    const { PythonShell } = require("python-shell");
    PythonShell.run("path/to/your/python/script.py", null, (err) => {
      if (err) {
        console.error("Error running Python script:", err);
      } else {
        console.log("Python script executed successfully.");
      }
    });
  },
});
