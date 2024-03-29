/* Magic Mirror
 * Node Helper: Medication-Alarm_module
 *
 * By Lyba Mughees
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
const schedule = require("node-schedule");
const sqlite3 = require("sqlite3").verbose();


module.exports = NodeHelper.create({
  start: function () {
    console.log("Medication-Alarm helper started...");

    // Schedule the function to check and trigger notifications at specific times
    this.scheduleMedicationCheck();
  },


  convertDayToNumber: function (dayName) {
    // Map day names to numerical values used by node-schedule
    const dayMap = {
      'Sunday': 0,
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6,
    };
    return dayMap[dayName];
  },

  scheduleMedicationCheck: function () {

    console.log("Medication scheduled")

    // Schedule the check every minute (adjust as needed)
    schedule.scheduleJob('*/1 * * * *', () => {
      // Check and trigger medication notifications at specific times
      this.checkAndTriggerMedicationNotifications();
    });
  },

  checkAndTriggerMedicationNotifications: function () {
    console.log("Medication scheduled");

    // Perform database query to retrieve medications for the current day and time
    const currentDate = new Date();
    const currentDay = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = currentDate.getHours().toString().padStart(2, '0') + ':' + currentDate.getMinutes().toString().padStart(2, '0');



    console.log("Current Date:", currentDay);
    console.log("Current Time:", currentTime);


    const medicationsForCurrentTimeQuery = `
        SELECT medication_id, brand_name, generic_name, day, time
        FROM medication_schedule
        WHERE time = ?
    `;

    const db = new sqlite3.Database("modules/Medication-Management/medications.db");

    db.all(medicationsForCurrentTimeQuery, [currentTime], (err, rows) => {
      if (err) {
        console.error("Error retrieving medications:", err);
        return;
      }

      console.log("Medications retrieved from the database:", rows);

      // Filter medications based on the current day
      const matchingMedications = rows.filter((medication) => {
        const storedDay = medication.day;
        // Convert stored day to a format compatible with toLocaleDateString
        const storedDayFormatted = storedDay.charAt(0).toUpperCase() + storedDay.slice(1).toLowerCase();
        return currentDay === storedDayFormatted;
      });

      console.log("Matching Medications:", matchingMedications);

      // Trigger notifications for each matching medication
      matchingMedications.forEach((medication) => {
        const { brand_name, generic_name, medication_id, time } = medication;

        // Log the payload before sending the notification
        console.log("Sending MEDICATION_ALARM_TEST notification with payload:", {
          title: 'Medication Notification',
          message: `It's time to take ${brand_name || generic_name || medication_id} at ${time}`,
        });


        // Trigger medication notification and alarm
        this.triggerMedicationNotification(brand_name, generic_name, medication_id, time);
      });
    });

    // Close the database connection
    db.close();
  },


  triggerMedicationNotification: function (brandName, genericName, medication_id, time) {
    // Log the payload before sending the notification
    console.log("Sending MEDICATION_ALARM_TEST notification with payload:", {
      title: 'Medication Notification',
      message: `It's time to take ${brandName || genericName} at ${time}`,
      medication_id: medication_id, // Include medication ID in the payload
      time: new Date().toString() // Include current time in the payload
    });

    // Send MEDICATION_ALARM_TEST notification to the Medication-Alarm module
    this.sendSocketNotification("MEDICATION_ALARM_TEST", {
      title: 'Medication Notification',
      message: `It's time to take ${brandName || genericName} at ${time}`,
      medication_id: medication_id, // Include medication ID in the payload
      time: new Date().toString() // Include current time in the payload
    });
  },


});