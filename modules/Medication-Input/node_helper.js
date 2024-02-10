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
        this.sendSocketNotification("MEDICATION_INTAKE_STARTED");
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "SAVE_PATIENT_MEDICATION") {
            // Handle saving medication to patient-medications table
            this.saveToPatientMedicationsTable(payload);
        }
    },

    saveToPatientMedicationsTable: function (ndc, box, quantity, medicationData) {
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

        // Insert medication details into patient-medications table
        medicationData.forEach(med => {
            db.run(
                "INSERT INTO patient_medications (ndc, box, quantity, brand_name, generic_name) VALUES (?, ?, ?, ?, ?)",
                [med.product_ndc, box, quantity, med.brand_name, med.generic_name],
                (err) => {
                    if (err) {
                        console.error("Error inserting patient medication:", err);
                    } else {
                        console.log(`Patient medication for ${med.product_ndc} in ${box} with quantity ${quantity} inserted successfully`);
                        // Send notification to the cloud module
                        this.sendSocketNotification("CLOUD_UPDATE_MEDICATIONS", {
                            ndc: med.product_ndc,
                            box: box,
                            quantity: quantity,
                            brand_name: med.brand_name,
                            generic_name: med.generic_name
                        });
                    }
                }
            );
        });

        // Close the database connection
        db.close();
    },
});
