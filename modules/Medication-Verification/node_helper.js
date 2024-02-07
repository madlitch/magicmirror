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
    this.initializeVerification();
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "INITIALIZE_VERIFICATION") {
      // Perform any initialization if needed
      console.log("Medication-Verification helper initialized.");
    } else if (notification === "START_MEDICATION_VERIFICATION") {
      // Start the medication verification process
      this.startMedicationVerification();
    }
  },

  initializeVerification: function () {
    // Initialize any required resources or settings for verification
    // For example, you might want to start the Python script here
    // Replace 'path/to/your/script.py' with the actual path to your Python script
    const options = {
      pythonOptions: ["-u"],
      scriptPath: "modules/Medication-Verification",
      args: [],
    };

    this.pythonShell = new PythonShell("Medication-Verification.py", options);

    this.pythonShell.on("message", (message) => {
      // Handle messages received from the Python script
      console.log("Received message from Python script:", message);

      // Assuming the Python script sends a message when the hand is near the mouth
      if (message === "HAND_NEAR_MOUTH") {
        // Notify the module about the verification result
        this.sendSocketNotification("VERIFY_MEDICATION_RESULT", {
          success: true,
          message: "Medication intake verified successfully.",
          // Add any additional information you want to send
        });
      }
    });

    this.pythonShell.end((err, code, signal) => {
      // Handle script termination (if needed)
      console.log("Python script ended:", err, code, signal);
    });
  },

  startMedicationVerification: function () {
    // Notify the Python script to start the medication verification process
    // For example, you might send a specific message to trigger hand tracking
    // Replace 'your_trigger_message' with the actual message expected by your Python script
    this.pythonShell.send("your_trigger_message");
  },
});
