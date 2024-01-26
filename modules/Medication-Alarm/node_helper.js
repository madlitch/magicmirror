/* Magic Mirror
 * Node Helper: Medication-Alarm_module
 *
 * By Lyba Mughees
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
const schedule = require("node-schedule");
const sqlite3 = require("sqlite3").verbose();
const notifier = require('node-notifier');

module.exports = NodeHelper.create({
  start: function () {
    console.log("Medication-Alarm helper started...");
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
                  // Use an arrow function here to maintain the correct 'this' context
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

                          // Convert day name to numerical value
                          const dayNumber = this.convertDayToNumber(day);

                          // Implement scheduling logic here using node-schedule
                          const [hours, minutes] = time.split(':').map(Number);

                          // Use a variable to capture the correct 'this' context
                          const self = this;

                          const job = schedule.scheduleJob({ hour: hours, minute: minutes, dayOfWeek: dayNumber }, function () {
                            console.log(`Take medication ${ndc} at ${time}`);

                            // Directly trigger the notification to the Medication-Alarm module
                            self.sendSocketNotification("MEDICATION_ALARM_TEST", {
                              title: 'Test Notification',
                              message: `It's time to take ${brand_name || generic_name} (${product_ndc})`,
                            });

                            // Add any additional logic you need for medication reminders
                          });
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
  },


});
