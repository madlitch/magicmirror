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

    // Create an audio element for the sound effect
    this.notificationSound = new Audio("modules/Medication-Alarm/time_to_take_your_pill.mp3"); // Update the path to your sound file

    // Variable to track whether the alarm is active
    this.alarmActive = false;

    // Create a wrapper for notifications
    this.notificationsWrapper = document.createElement("div");
    this.notificationsWrapper.className = "medication-notifications";
    this.sendSocketNotification("MEDICATION_ALARM_TEST"); 
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

  stopAlarm: function () {
    // Stop the sound effect
    if (this.notificationSound instanceof Audio) {
      this.alarmActive = false;
      this.notificationSound.loop = false;
      this.notificationSound.pause();
    }
  },

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
      
           
      // Handle medication notifications received from the helper
      this.displayMedicationNotification(payload);
      this.alarmActive = true;
      this.notificationSound.loop = true;
      this.notificationSound.play();
    

      
    }
  },
});
