/* Magic Mirror
 * Node Helper: Medication-Input
 *
 * By Lyba Mughees
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
const sqlite3 = require("sqlite3").verbose();
const axios = require("axios");

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

    checkMedicationInCloud: function (ndc) {
        return new Promise((resolve, reject) => {
            // Send request to cloud to check if medication exists
            const url = `http://0.0.0.0:8081/api/search_medication/${ndc}`;
            axios.get(url)
                .then(response => {
                    resolve(response.data); // Resolve with medication data if found
                })
                .catch(error => {
                    reject(error); // Reject with error if request fails
                });
        });
    },

    savePatientMedication: function ({ ndc, box, quantity }) {
        // Check if the medication exists in the cloud
        this.checkMedicationInCloud(ndc)
            .then(medicationData => {
                if (medicationData) {
                    // Medication exists in the cloud, proceed with saving to patient-medications table
                    this.saveToPatientMedicationsTable(ndc, box, quantity, medicationData);
                } else {
                    console.error(`Medication with NDC ${ndc} does not exist in the cloud.`);
                }
            })
            .catch(error => {
                console.error("Error checking medication in the cloud:", error);
            });
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
        db.run(
            "INSERT INTO patient_medications (ndc, box, quantity, brand_name, generic_name) VALUES (?, ?, ?, ?, ?)",
            [medicationData.product_ndc, box, quantity, medicationData.brand_name, medicationData.generic_name],
            (err) => {
                if (err) {
                    console.error("Error inserting patient medication:", err);
                } else {
                    console.log(`Patient medication for ${medicationData.product_ndc} in ${box} with quantity ${quantity} inserted successfully`);
                }
            }
        );

        // Close the database connection
        db.close();
    },
});