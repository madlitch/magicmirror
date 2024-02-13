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
            this.saveToPatientMedicationsTable(payload.ndc, payload.box, payload.quantity, payload.medicationData);
        }

        else if (notification === "CLOUD_SEARCH_MEDICATIONS_RESULT") {
            // Handle searching for medication in the cloud using the searchTerm
            const searchTerm = payload.searchTerm;
            sendSocketNotification("MEDICATION_DATA_FOUND")
            console.log("Searching for medication using searchTerm:", searchTerm);
        }
    },

    saveToPatientMedicationsTable: function (id, ndc, box, quantity, medicationData) {
        // Build the medications array
        const medications = [{
            medication_id: medicationData.id,
            box: box,
            quantity: quantity
        }];

        // Build the payload
        const payload = {
            patient_id: "b6673aee-c9d8-11ee-8491-029e9cf81533", // Replace with actual patient_id
            cabinet_id: "b45569c2-c9d9-11ee-8491-029e9cf81533", // Replace with actual cabinet_id
            medications: medications
        };

        // Send notification to the cloud module
        this.sendSocketNotification("CLOUD_UPDATE_MEDICATIONS", payload);

        // Connect to SQLite database
        const db = new sqlite3.Database("modules/Medication-Management/medications.db");

        db.run(`CREATE TABLE IF NOT EXISTS patient_medications (
            id TEXT,
            ndc TEXT,
            box TEXT,
            quantity INTEGER,
            brand_name TEXT,
            generic_name TEXT
        )`);

        // Insert medication details into patient-medications table
        medicationData.forEach(med => {
            db.run(
                "INSERT INTO patient_medications (id, ndc, box, quantity, brand_name, generic_name) VALUES (?, ?, ?, ?, ?, ?)",
                [med.id, med.ndc, box, quantity, med.brand_name, med.generic_name],
                (err) => {
                    if (err) {
                        console.error("Error inserting patient medication:", err);
                    } else {
                        console.log(`Patient medication for ${med.ndc} in ${box} with quantity ${quantity} inserted successfully`);
                    }
                }
            );
        });

        // Close the database connection
        db.close();
    },
});
