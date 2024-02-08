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
  start: function () {
    console.log("Medication-Alarm module started...");
    this.notificationSound = new Audio("modules/Medication-Alarm/time_to_take_your_pill.mp3");
    this.alarmActive = false;
    this.notificationsWrapper = document.createElement("div");
    this.notificationsWrapper.className = "medication-notifications";
    this.sendSocketNotification("MEDICATION_ALARM_TEST");
    this.notificationReceivedTime = null;
  },

  stopAlarm: function () {
    if (this.notificationReceivedTime) {
      const stopTime = new Date().getTime();
      const elapsedTime = (stopTime - this.notificationReceivedTime) / 1000;
      console.log("Time elapsed (seconds):", elapsedTime);
      this.notificationReceivedTime = null;
    }
    if (this.notificationSound instanceof Audio) {
      this.alarmActive = false;
      this.notificationSound.loop = false;
      this.notificationSound.pause();
    }
  },

  getStyles: function () {
    return ["Medication-Alarm.css"];
  },

  // Function to create a notification element
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

  toggleModuleVisibility: function (moduleName, show) {
    const module = MM.getModules().enumerate(function (module) {
      return module.name === moduleName;
    }).next().value;

    if (module) {
      if (show) {
        module.show(1000, function () {
          // Optional callback function after the module is shown
        });
      } else {
        module.hide(1000, function () {
          // Optional callback function after the module is hidden
        });
      }
    }
  },

  // startAlarm: function () {
  //   // Play the sound effect continuously
  //   if (this.notificationSound instanceof Audio) {
  //     this.alarmActive = true;
  //     this.notificationSound.loop = true;
  //     this.notificationSound.play();
  //   }
  // },


  getDom: function () {
    const wrapper = document.createElement("div");

    // Create a button element to reset notifications
    const resetButton = document.createElement("button");
    resetButton.innerHTML = "Stop I Am Taking My Pill!!";
    resetButton.addEventListener("click", () => {
      // Remove all child elements (notifications) from the notifications wrapper
      while (this.notificationsWrapper.firstChild) {
        this.notificationsWrapper.removeChild(this.notificationsWrapper.firstChild);
      }

      // Stop the alarm
      this.stopAlarm();

      // Show all hidden modules
      MM.getModules().enumerate((module) => {
        module.show(1000);
      });
    });

    // Append the reset button to the main wrapper
    wrapper.appendChild(resetButton);

    // Append the notifications wrapper to the main wrapper
    wrapper.appendChild(this.notificationsWrapper);

    return wrapper;
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "MEDICATION_ALARM_TEST") {



      this.notificationReceivedTime = new Date().getTime(); // Capture the time when notification is received

      // Handle medication notifications received from the helper
      this.displayMedicationNotification(payload);
      this.alarmActive = true;
      this.notificationSound.loop = true;
      this.notificationSound.play();




    }
  },
});
