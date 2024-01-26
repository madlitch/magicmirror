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

// Medication-Alarm.js
Module.register("Medication-Alarm", {
  start: function () {
    console.log("Medication-Alarm module started...");

    // Create an audio element for the sound effect
    this.notificationSound = new Audio("modules/Medication-Alarm/time_to_take_your_pill.mp3"); // Update the path to your sound file

    // Variable to track whether the alarm is active
    this.alarmActive = false;

    // Schedule the function to check and trigger notifications at specific times
    this.scheduleMedicationCheck();
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

  startAlarm: function () {
    // Play the sound effect continuously
    if (this.notificationSound instanceof Audio) {
      this.alarmActive = true;
      this.notificationSound.loop = true;
      this.notificationSound.play();
    }
  },

  stopAlarm: function () {
    // Stop the sound effect
    if (this.notificationSound instanceof Audio) {
      this.alarmActive = false;
      this.notificationSound.loop = false;
      this.notificationSound.pause();
    }
  },

  scheduleMedicationCheck: function () {
    const schedule = require("node-schedule");

    // Schedule the check every minute (adjust as needed)
    schedule.scheduleJob('*/1 * * * *', () => {
      // Check and trigger medication notifications at specific times
      console.log("Medication scheduled")
      this.checkAndTriggerMedicationNotifications();
    });
  },

  checkAndTriggerMedicationNotifications: function () {
    // Perform database query to retrieve medications for the current day and time
    const currentDate = new Date();
    const currentDay = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Replace this with your actual database query logic
    const medicationsForCurrentTimeQuery = `
      SELECT ndc, brand_name, generic_name, day, time
      FROM medication_schedule
      WHERE time = ?
    `;

    const db = new sqlite3.Database("modules/Medication-Management/medications.db");

    db.all(medicationsForCurrentTimeQuery, [currentTime], (err, rows) => {
      if (err) {
        console.error("Error retrieving medications:", err);
        return;
      }

      // Filter medications based on the current day
      const matchingMedications = rows.filter((medication) => {
        const storedDay = medication.day;
        // Convert stored day to a format compatible with toLocaleDateString
        const storedDayFormatted = storedDay.charAt(0).toUpperCase() + storedDay.slice(1).toLowerCase();
        return currentDay === storedDayFormatted;
      });

      // Trigger notifications for each matching medication
      matchingMedications.forEach((medication) => {
        const { brand_name, generic_name, ndc, time } = medication;
        this.triggerMedicationNotification(brand_name, generic_name, ndc, time);
      });
    });

    // Close the database connection
    db.close();
  },



  getDom: function () {
    const wrapper = document.createElement("div");

    // Create a button element to reset notifications
    const resetButton = document.createElement("button");
    resetButton.innerHTML = "Reset Notifications";
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

    // Create a wrapper for notifications
    this.notificationsWrapper = document.createElement("div");
    this.notificationsWrapper.className = "medication-notifications";
    wrapper.appendChild(this.notificationsWrapper);

    return wrapper;
  },
});
