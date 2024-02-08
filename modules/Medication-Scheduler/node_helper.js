/* Magic Mirror
 * Node Helper: Medication-Scheduler
 *
 * By Lyba Mughees
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
//const schedule = require("node-schedule");
const sqlite3 = require("sqlite3").verbose();

module.exports = NodeHelper.create({
  start: function () {
    console.log("Medication-Scheduler helper started...");
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
  

  scheduleMedication: function ({ ndc, days, times }) {
    // Connect to SQLite database
    const db = new sqlite3.Database("modules/Medication-Management/medications.db");
  
    // Retrieve brand name, generic name, and NDC from medications table based on the entered NDC (case-insensitive)
    db.get(
      "SELECT brand_name, generic_name, ndc FROM patient_medications WHERE LOWER(ndc) = LOWER(?) OR LOWER(brand_name) = LOWER(?) OR LOWER(generic_name) = LOWER(?)",
      [ndc, ndc, ndc],
      (err, row) => {
        if (err) {
          console.error("Error retrieving medication details:", err);
        } else {
          if (row) {
            const { brand_name, generic_name, ndc } = row;
  
            // Create medication_schedule table if not exists
            db.run(`CREATE TABLE IF NOT EXISTS medication_schedule (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              ndc TEXT,
              brand_name TEXT,
              generic_name TEXT,
              day TEXT,
              time TEXT
            )`);
  
            // Check if the schedule already exists
            const existingScheduleQuery =
              "SELECT 1 FROM medication_schedule WHERE ndc = ? AND day = ? AND time = ?";
            days.forEach((day) => {
              times.forEach((time) => {
                db.get(existingScheduleQuery, [ndc, day, time], (err, existingRow) => {
                  // Use an arrow function here to maintain the correct 'this' context
                  if (err) {
                    console.error("Error checking for existing schedule:", err);
                  } else if (!existingRow) {
                    // If schedule does not exist, insert it
                    db.run(
                      "INSERT INTO medication_schedule (ndc, brand_name, generic_name, day, time) VALUES (?, ?, ?, ?, ?)",
                      [ndc, brand_name, generic_name, day, time],
                      (err) => {
                        if (err) {
                          console.error("Error inserting schedule:", err);
                        } else {
                          console.log(`Schedule for ${ndc} on ${day} at ${time} inserted successfully`);
                        }
                      }
                    );
                  } else {
                    console.log(`Schedule for ${ndc} on ${day} at ${time} already exists`);
                  }
                });
              });
            });

          } else {
            console.error(`No medication found for NDC, brand name, or generic name: ${ndc}`);
          }
        }
      }
    );

    // Close the database connection
    db.close();
  },

  deleteSchedule: function ({ ndc, days, times }) {
    // Connect to SQLite database
    const db = new sqlite3.Database("modules/Medication-Management/medications.db");
  
    // Delete schedules for the specified ndc, brand, generic, day, and time
    db.run(
      "DELETE FROM medication_schedule WHERE (LOWER(ndc) = LOWER(?) OR LOWER(brand_name) = LOWER(?) OR LOWER(generic_name) = LOWER(?)) AND day IN (?) AND time IN (?)",
      [ndc, ndc, ndc, days.join(','), times.join(',')],
      (err) => {
        if (err) {
          console.error("Error deleting schedules:", err);
        } else {
          console.log(`Schedules for ${ndc} on ${days} at ${times} deleted successfully`);
        }
      }
    );
  
    // Close the database connection
    db.close();
  },
  


});