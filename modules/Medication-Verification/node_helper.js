/* Magic Mirror
 * Node Helper: Medication-Verification
 *
 * By Lyba Mughees
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
const { PythonShell } = require("python-shell");

module.exports = NodeHelper.create({
  start: function () {
    console.log("Medication-Verification helper started...");
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "START_MEDICATION_VERIFICATION") {
      // Start the medication verification process
      this.startVerification();
    }
  },

  startVerification: function () {
    // Start the Python script for medication verification
    const options = {
      pythonOptions: ["-u"],
      scriptPath: "modules/Medication-Verification",
      args: []
    };

    // Declare pythonShell outside of the startVerification function
    this.pythonShell = new PythonShell("Medication-Verification.py", options);

    // Handle messages received from the Python script
    this.pythonShell.on("message", (message) => {
      // Log the message received from the Python script
      console.log("Received message from Python script:", message);

      // Check if the message indicates that the hand is near the mouth
      if (message === "HAND_NEAR_MOUTH") {
        // Notify the module about the verification result
        this.sendSocketNotification("VERIFY_MEDICATION_RESULT", {
          success: true,
          message: "Medication intake verified successfully.",
        });

        // End the Python script execution
        this.pythonShell.end((err) => {
          if (err) {
            console.error("Error ending Python script:", err);
          } else {
            console.log("Python script ended.");
          }
        });
      }
    });
  }
});
