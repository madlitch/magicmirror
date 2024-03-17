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
  notificationSound: null,
  alarmActive: false,
  notificationsWrapper: null,
  alarmTime: null,
  medicationId: null,
  medicationQueue: [], // Initialize an empty array to store medication IDs

  start: function () {
    console.log("Medication-Alarm module started...");
    this.notificationSound = new Audio("modules/Medication-Alarm/alarm.mp3");
    this.alarmActive = false;
    this.notificationsWrapper = document.createElement("div");
    this.notificationsWrapper.className = "medication-notifications";
    this.sendSocketNotification("MEDICATION_ALARM_TEST");
    this.alarmTime = null;
    this.medicationId = null;
  },

  stopAlarm: function () {
    const startTime = new Date().getTime();

    const stopTime = new Date().getTime();
    const elapsedTime = (stopTime - this.alarmTime) / 1000;
    console.log("Time elapsed (seconds):", elapsedTime);

    if (this.notificationSound instanceof Audio) {
      this.alarmActive = false;
      this.notificationSound.loop = false;
      this.notificationSound.pause();
    }

    // Start the verification process for the first medication in the queue
    const medicationId = this.medicationQueue.shift(); // Remove and get the first element from the queue
    if (medicationId) {
      this.sendNotification("START_MEDICATION_VERIFICATION", { medication_id: medicationId, startTime: startTime, alarmTime: this.alarmTime });
    }

    this.updateDom();
  },

  getStyles: function () {
    return ["Medication-Alarm.css"];
  },

  createNotificationElement: function (title, message) {
    const notificationWrapper = document.createElement("div");
    notificationWrapper.className = "medication-notification";

    const titleElement = document.createElement("div");
    titleElement.className = "medication-notification-title";
    titleElement.innerHTML = title;

    const messageElement = document.createElement("div");
    messageElement.className = "medication-notification-message";
    messageElement.innerHTML = message;

    notificationWrapper.appendChild(titleElement);
    notificationWrapper.appendChild(messageElement);

    return notificationWrapper;
  },

  displayMedicationNotification: function (data) {
    const { title, message } = data;
    const notificationElement = this.createNotificationElement(title, message);
    this.notificationsWrapper.appendChild(notificationElement);

  },


  getDom: function () {
    const wrapper = document.createElement("div");
    wrapper.className = "medication-alarm";

    // Dim other modules if the alarm is active
    if (this.alarmActive) {
      this.sendNotification("MODULE_TOGGLE", { hide: ["clock", "weather", "MMM-TouchButton", "ViewNotifications"], show: [], toggle: [] })
      // MM.getModules().enumerate((module) => {
      //   // Exclude the medication alarm module itself
      //   if (module.name !== "Medication-Alarm") {
      //     module.hide(1000);
      //   }
      // });

      const stopButton = document.createElement("button");
      stopButton.className = "medication-alarm button";
      stopButton.innerHTML = "Ready to take my pills";
      stopButton.addEventListener("click", () => {
        while (this.notificationsWrapper.firstChild) {
          this.notificationsWrapper.removeChild(this.notificationsWrapper.firstChild);
        }

        this.stopAlarm();
        this.sendNotification("ALARM_STOPPED");

        this.sendNotification("MODULE_TOGGLE", { hide: [], show: ["clock", "weather", "MMM-TouchButton-Lock"], toggle: [] })
      });

      wrapper.appendChild(stopButton);
    }

    wrapper.appendChild(this.notificationsWrapper);

    return wrapper;
  },


  socketNotificationReceived: function (notification, payload) {
    if (notification === "MEDICATION_ALARM_TEST") {
      this.sendNotification("MEDICATION_ALARM");
      this.notificationReceivedTime = new Date().getTime();

      const medicationId = payload.medication_id;
      const alarmTime = new Date(payload.time);

      console.log("Received Medication ID:", medicationId);
      console.log("Received Alarm Time:", alarmTime);


      // Push the received medication ID into the queue
      this.medicationQueue.push(medicationId);

      // Log the current medication queue
      console.log("Medication Queue:", this.medicationQueue);

      // Display the medication notification and start the alarm
      this.displayMedicationNotification(payload);
      this.alarmActive = true;
      console.log("Alarm Active:", this.alarmActive);
      this.notificationSound.loop = true;
      this.notificationSound.play();
      this.alarmTime = alarmTime; // Set the alarmTime property to the received alarmTime
      this.updateDom();
    }

  },

  notificationReceived: function (notification, payload) {
    if (notification === "VERIFICATION_COMPLETE") {
      // Handle verification complete notification
      // Start verification for the next medication in the queue
      const medicationId = this.medicationQueue.shift(); // Remove and get the first element from the queue
      if (medicationId) {
        const startTime = new Date().getTime();
        this.sendNotification("START_MEDICATION_VERIFICATION", { medication_id: medicationId, startTime: startTime, alarmTime: this.alarmTime });
      }

      // Show confirmation message
      const confirmationMessage = document.createElement("div");
      confirmationMessage.className = "medication-confirmation";
      confirmationMessage.innerHTML = "Verification complete for medication ID";

      // Append the confirmation message to the wrapper
      this.notificationsWrapper.appendChild(confirmationMessage);

      // Set a timeout to remove the confirmation message after 5 seconds
      setTimeout(() => {
        confirmationMessage.remove();
      }, 5000);
    }
  }


});
