/* Magic Mirror
 * Node Helper: Medication-Input
 *
 * By Lyba Mughees
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
const sqlite3 = require("sqlite3").verbose();

module.exports = NodeHelper.create({
  start: function () {
    console.log("Medication-Input helper started...");
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "SAVE_PATIENT_MEDICATION") {
      // Handle saving medication to patient-medications table
      this.savePatientMedication(payload);
    }
  },

  savePatientMedication: function ({ ndc, box, quantity }) {
    // Connect to SQLite database
    const db = new sqlite3.Database("modules/Medication-Management/medications.db");

    // Create patient-medications table if not exists
    db.run(`CREATE TABLE IF NOT EXISTS patient_medications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ndc TEXT,
      box TEXT,
      quantity INTEGER,
      brand_name TEXT,  -- Add columns for additional medication details
      generic_name TEXT
    )`);

    // Retrieve medication details from the medications table
    db.get(
      "SELECT brand_name, generic_name FROM medications WHERE LOWER(product_ndc) = LOWER(?) OR LOWER(brand_name) = LOWER(?) OR LOWER(generic_name) = LOWER(?)",
      [ndc, ndc, ndc],
      (err, row) => {
        if (err) {
          console.error("Error retrieving medication details:", err);
        } else if (row) {
          const { brand_name, generic_name } = row;

          // Insert medication details into patient-medications table
          db.run(
            "INSERT INTO patient_medications (ndc, box, quantity, brand_name, generic_name) VALUES (?, ?, ?, ?, ?)",
            [ndc, box, quantity, brand_name, generic_name],
            (err) => {
              if (err) {
                console.error("Error inserting patient medication:", err);
              } else {
                console.log(`Patient medication for ${ndc} in ${box} with quantity ${quantity} inserted successfully`);
              }
            }
          );
        } else {
          console.error(`No medication found for NDC, brand name, or generic name: ${ndc}`);
        }
      }
    );

    // Close the database connection
    db.close();
  },
});
