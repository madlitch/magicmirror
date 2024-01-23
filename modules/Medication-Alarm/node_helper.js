/* Magic Mirror
 * Node Helper: Medication-Alarm_module
 *
 * By Lyba Mughees
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
const sqlite3 = require("sqlite3").verbose();

module.exports = NodeHelper.create({
  start: function () {
    console.log("Medication Alarm helper started...");
    this.config = {}; 
    this.fetchMedicationSchedule();
  },

  fetchMedicationSchedule: function () {
    const db = new sqlite3.Database("modules/Medication-Management/medications.db");

    db.all("SELECT * FROM medication_schedule", [], (err, rows) => {
      if (err) {
        console.error("Error fetching medication schedule:", err);
        db.close();
        return;
      }

      this.config.medicationSchedule = rows;
      db.close();
    });
  },
});
