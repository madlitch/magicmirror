/* Magic Mirror
 * Node Helper: Medication-Scheduler
 *
 * By Lyba Mughees
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
const sqlite3 = require("sqlite3").verbose();
let db;

module.exports = NodeHelper.create({
  start: function () {
    console.log("Medication-Scheduler helper started...");
    db = new sqlite3.Database("modules/Medication-Management/medications.db");
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "SCHEDULE_MEDICATION") {
      // Handle medication scheduling here
      this.scheduleMedication(payload);
    } else if (notification === "DELETE_SCHEDULE") {
      // Handle schedule deletion here
      this.deleteSchedule(payload);
    } else if (notification === "MEDICATION_ALARM_TEST") {
      // Send a test notification to the Medication-Alarm module
      this.sendSocketNotification(notification, payload);
    } else if (notification === "GET_MEDICATIONS") {
      // Retrieve medication options from the database and send them to the frontend
      this.searchMedication();
    }

    else if (notification === "LOG") {
      console.log(payload);
    }
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

  connectToDatabase: function () {
    // Mock the database connection here
    return mockDatabase; // Assuming mockDatabase is defined globally
  },


  scheduleMedication: function ({ medication_id, days, times }) {
    // Connect to SQLite database
    //const db = new sqlite3.Database("modules/Medication-Management/medications.db");

    // Create medication_schedule table if not exists
    db.run(`CREATE TABLE IF NOT EXISTS medication_schedule (
                                                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                             medication_id TEXT,
                                                             brand_name TEXT,
                                                             generic_name TEXT,
                                                             day TEXT,
                                                             time TEXT
            )`);

    // Retrieve brand name and generic name from medications table based on the entered medication ID
    db.get(
      "SELECT brand_name, generic_name FROM patient_medications WHERE medication_id = ?",
      [medication_id],
      (err, row) => {
        if (err) {
          console.error("Error retrieving medication details:", err);
        } else {
          if (row) {
            const { brand_name, generic_name } = row;



            // Check if the schedule already exists
            const existingScheduleQuery =
              "SELECT 1 FROM medication_schedule WHERE medication_id = ? AND day = ? AND time = ?";
            days.forEach((day) => {
              times.forEach((time) => {
                db.get(existingScheduleQuery, [medication_id, day, time], (err, existingRow) => {
                  if (err) {
                    console.error("Error checking for existing schedule:", err);
                  } else if (!existingRow) {
                    // If schedule does not exist, insert it
                    db.run(
                      "INSERT INTO medication_schedule (medication_id, brand_name, generic_name, day, time) VALUES (?, ?, ?, ?, ?)",
                      [medication_id, brand_name, generic_name, day, time],
                      (err) => {
                        if (err) {
                          console.error("Error inserting schedule:", err);
                        } else {
                          console.log(`Schedule for medication ${brand_name} on ${day} at ${time} inserted successfully`);
                        }
                      }
                    );
                  } else {
                    console.log(`Schedule for medication ${brand_name} on ${day} at ${time} already exists`);
                  }
                });
              });
            });

          } else {
            console.error(`No medication found for ID: ${medication_id}`);
          }
        }
      }
    );

  },

  deleteSchedule: function ({ medication_id, days, times }) {
    // Connect to SQLite database
    //const db = new sqlite3.Database("modules/Medication-Management/medications.db");

    // Delete schedules for the specified medication ID, day, and time
    db.run(
      "DELETE FROM medication_schedule WHERE medication_id = ? AND day IN (?) AND time IN (?)",
      [medication_id, days.join(','), times.join(',')],
      (err) => {
        if (err) {
          console.error("Error deleting schedules:", err);
        } else {
          console.log(`Schedules for medication ${medication_id} on ${days} at ${times} deleted successfully`);
        }
      }
    );


  },

  searchMedication: function () {
    // Connect to SQLite database
    //const db = new sqlite3.Database("modules/Medication-Management/medications.db");

    // Search for medications
    db.all(
      "SELECT * FROM patient_medications",
      (err, rows) => {
        if (err) {
          console.error("Error searching for medications:", err);
        } else {
          // Send the search results back to the frontend
          this.sendSocketNotification("MEDICATION_OPTIONS", rows);
        }
      }
    );


  }
});