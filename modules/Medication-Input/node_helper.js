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

    db.run(`CREATE TABLE IF NOT EXISTS patient_medications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ndc TEXT,
        box TEXT,
        quantity INTEGER,
        brand_name TEXT,
        generic_name TEXT
    )`);

    // Check if there is already a medication in the target box
    db.get(
        "SELECT 1 FROM patient_medications WHERE LOWER(box) = LOWER(?) LIMIT 1",
        [box],
        (err, existingBoxRow) => {
            if (err) {
                console.error("Error checking for existing medication in the box:", err);
            } else if (existingBoxRow) {
                console.log(`Patient medication box ${box} already contains data. Skipping insertion.`);
            } else {
                // If the box is empty, proceed with the insertion
                // Check if the medication with the given ndc already exists in patient_medications
                db.get(
                    "SELECT 1 FROM patient_medications WHERE LOWER(ndc) = LOWER(?) OR LOWER(brand_name) = LOWER(?) OR LOWER(generic_name) = LOWER(?) LIMIT 1",
                    [ndc, ndc, ndc],
                    (err, existingRow) => {
                        if (err) {
                            console.error("Error checking for existing medication:", err);
                        } else if (!existingRow) {
                            // If medication does not exist, insert it
                            db.get(
                                "SELECT brand_name, generic_name, product_ndc FROM medications WHERE LOWER(product_ndc) = LOWER(?) OR LOWER(brand_name) = LOWER(?) OR LOWER(generic_name) = LOWER(?)",
                                [ndc, ndc, ndc],
                                (err, row) => {
                                    if (err) {
                                        console.error("Error retrieving medication details:", err);
                                    } else if (row) {
                                        const { brand_name, generic_name, product_ndc } = row;

                                        // Insert medication details into patient-medications table
                                        db.run(
                                            "INSERT INTO patient_medications (ndc, box, quantity, brand_name, generic_name) VALUES (?, ?, ?, ?, ?)",
                                            [product_ndc, box, quantity, brand_name, generic_name],
                                            (err) => {
                                                if (err) {
                                                    console.error("Error inserting patient medication:", err);
                                                } else {
                                                    console.log(`Patient medication for ${product_ndc} in ${box} with quantity ${quantity} inserted successfully`);
                                                }
                                            }
                                        );
                                    } else {
                                        console.error(`No medication found for NDC, brand name, or generic name: ${ndc}`);
                                    }
                                }
                            );
                        } else {
                            console.log(`Patient medication with NDC ${ndc} already exists. Skipping insertion.`);
                        }
                    }
                );
            }
        }
    );

    // Close the database connection
    db.close();
},
});
