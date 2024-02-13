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

    // Initialize start time
    const startTime = new Date();

    // Handle messages received from the Python script
    this.pythonShell.on("message", (message) => {
      // Log the message received from the Python script
      console.log("Received message from Python script:", message);

      // Check if the message indicates that the hand is near the mouth
      if (message === "Hand near the mouth!") {
        // Get the stop time
        const stopTime = new Date();

        // Format start time
        const formattedStartTime = this.formatDateTime(startTime);

        // Format end time
        const formattedEndTime = this.formatDateTime(stopTime);

        // Calculate the elapsed time in seconds
        const elapsedTime = (stopTime - startTime) / 1000;

        // Notify the module about the verification result along with stop time
        this.sendSocketNotification("VERIFY_MEDICATION_RESULT", {
          success: true,
          message: "Medication intake verified successfully.",
          startTime: formattedStartTime,
          stopTime: formattedEndTime,
          elapsedTime: elapsedTime // Pass elapsed time
        });

        // Output formatted times
        console.log("start_time:", formattedStartTime);
        console.log("end_time:", formattedEndTime);
        console.log("total_time:", elapsedTime);

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
  },

  formatDateTime: function (date) {
    const year = date.getFullYear();
    const month = this.padZero(date.getMonth() + 1);
    const day = this.padZero(date.getDate());
    const hours = this.padZero(date.getHours());
    const minutes = this.padZero(date.getMinutes());
    const seconds = this.padZero(date.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  },

  padZero: function (num) {
    return (num < 10 ? '0' : '') + num;
  }


});
