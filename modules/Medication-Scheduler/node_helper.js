/* Magic Mirror
 * Node Helper: Medication-Scheduler
 *
 * By Lyba Mughees
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
const schedule = require("node-schedule");
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
    }
  },

  scheduleMedication: function ({ ndc, days, times }) {
    // Connect to SQLite database
    const db = new sqlite3.Database("modules/Medication-Management/medications.db");

    // Retrieve brand name, generic name, and NDC from medications table based on the entered NDC (case-insensitive)
    db.get(
      "SELECT brand_name, generic_name, product_ndc FROM medications WHERE LOWER(product_ndc) = LOWER(?) OR LOWER(brand_name) = LOWER(?) OR LOWER(generic_name) = LOWER(?)",
      [ndc, ndc, ndc],
      (err, row) => {
        if (err) {
          console.error("Error retrieving medication details:", err);
        } else {
          if (row) {
            const { brand_name, generic_name, product_ndc } = row;

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
                db.get(existingScheduleQuery, [product_ndc, day, time], (err, existingRow) => {
                  if (err) {
                    console.error("Error checking for existing schedule:", err);
                  } else if (!existingRow) {
                    // If schedule does not exist, insert it
                    db.run(
                      "INSERT INTO medication_schedule (ndc, brand_name, generic_name, day, time) VALUES (?, ?, ?, ?, ?)",
                      [product_ndc, brand_name, generic_name, day, time],
                      (err) => {
                        if (err) {
                          console.error("Error inserting schedule:", err);
                        } else {
                          console.log(`Schedule for ${product_ndc} on ${day} at ${time} inserted successfully`);
                        }
                      }
                    );
                  } else {
                    console.log(`Schedule for ${product_ndc} on ${day} at ${time} already exists`);
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

    // Implement scheduling logic here using node-schedule
    // const job = schedule.scheduleJob({ hour: 8, minute: 0, dayOfWeek: days }, function () {
    //   console.log(`Take medication ${ndc} at ${times}`);
    // });
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
