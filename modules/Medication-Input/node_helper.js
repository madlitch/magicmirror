/* Magic Mirror
 * Node Helper: Medication-Input
 *
 * By Lyba Mughees
 * MIT Licensed.
 */

// Import required modules
const NodeHelper = require("node_helper");
const sqlite3 = require("sqlite3").verbose();

module.exports = NodeHelper.create({
  start: function () {
    console.log("Medication-Input helper started...");
    this.sendSocketNotification("MEDICATION_INTAKE_STARTED");
    // Open the database connection
    this.db = new sqlite3.Database("modules/Medication-Management/medications.db");
  },

  stop: function () {
    // Close the database connection when the module is stopped
    if (this.db) {
      this.db.close();
    }
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "LOG") {
      console.log(payload);
    } else if (notification === "SAVE_PATIENT_MEDICATION") {
      console.log(payload);
      this.saveToPatientMedicationsTable(payload);
    } else if (notification === "CLOUD_SEARCH_MEDICATIONS_RESULT") {
      // Handle searching for medication in the cloud using the searchTerm
      const searchTerm = payload.searchTerm;
      this.sendSocketNotification("MEDICATION_DATA_FOUND");
      console.log("Searching for medication using searchTerm:", searchTerm);
    }
  },

  saveToPatientMedicationsTable: function (medicine) {
    const db = this.db;

    // Create patient_medications table if not exists
    db.run(`CREATE TABLE IF NOT EXISTS patient_medications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            medication_id TEXT,
            box TEXT,
            quantity TEXT,
            brand_name TEXT,
            generic_name TEXT
        )`);

    // Delete old data associated with the medication ID and box
    db.run(
      "DELETE FROM patient_medications WHERE medication_id = ? OR box = ?",
      [medicine.medication_id, medicine.box],
      (err) => {
        if (err) {
          console.error("Error deleting old data:", err);
          return;
        }

        // Insert new medication information
        db.run(
          "INSERT INTO patient_medications (medication_id, box, quantity, brand_name, generic_name) VALUES (?, ?, ?, ?, ?)",
          [medicine.medication_id, medicine.box, medicine.quantity, medicine.brand_name, medicine.generic_name],
          function(err) {
            if (err) {
              console.error("Error inserting new medication:", err);
            } else {
              console.log(`New medication inserted successfully`);
            }
          }
        );
      }
    );
  }
});