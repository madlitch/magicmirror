Module.register("MedicationScanner", {
  // Default module config.
  defaults: {
    updateInterval: 60 * 60 * 1000, // every hour
  },

  // Module properties.
  scannedData: "Sample Medication Data",
  cameraStream: null,

  // Define required scripts.
  getStyles: function () {
    return ["font-awesome.css", "medication-scanner.css"];
  },

  // Override the start function.
  start: function () {
    // Initialize the module
    this.scanMedication();
    // Schedule the first update.
    this.scheduleUpdate(this.config.initialLoadDelay);
  },

  // Override the notification handler.
  notificationReceived: function (notification, payload, sender) {
    // Handle notifications if needed
  },

  // Override the template.
  getTemplate: function () {
    return "medication-scanner.njk";
  },

  // Add all the data to the template.
  getTemplateData: function () {
    return {
      scannedData: this.scannedData,
    };
  },

  // Function to trigger the scanning process
  scanMedication: function () {
    const self = this;

    // Get the button element with ID 'scanButton'
    const scanButton = document.getElementById("scanButton");

    // Add an event listener to the scan button
    if (scanButton) {
      scanButton.addEventListener("click", function () {
        // Request access to the camera
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then(function (stream) {
            // Save the camera stream
            self.cameraStream = stream;

            // Display the camera feed in the video element
            const cameraElement = document.getElementById("camera");
            if (cameraElement) {
              cameraElement.srcObject = stream;
            }

            // Continue with your scanning logic
            self.scannedData = self.getScannedData();
            self.updateDom();
            self.sendNotification("MEDICATION_SCANNED", { data: self.scannedData });
          })
          .catch(function (error) {
            console.error("Error accessing camera:", error);
          });
      });
    }
  },

  // Simulated function to retrieve scanned data
  getScannedData: function () {
    // Replace this with actual scanning logic using hardware or camera
    // For now, return sample data
    return "Sample Medication Data";
  },

  // Schedule periodic updates.
  scheduleUpdate: function (delay) {
    const self = this;
    setInterval(function () {
      self.scanMedication();
    }, this.config.updateInterval);
  },

  // Override the stop function to stop the camera stream when the module is hidden
  stop: function () {
    if (this.cameraStream) {
      const tracks = this.cameraStream.getTracks();
      tracks.forEach((track) => track.stop());
      this.cameraStream = null;
    }
  },
});
