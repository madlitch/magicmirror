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
        if (notification === "LOG") {
            console.log(payload);
        }

        else if (notification === "SAVE_PATIENT_MEDICATION") {
            this.log(payload);
            this.saveToPatientMedicationsTable(payload);
            // Handle saving medication to patient-medications table
            //this.saveToPatientMedicationsTable(payload.medicines);
        }
        
        

        else if (notification === "CLOUD_SEARCH_MEDICATIONS_RESULT") {
            // Handle searching for medication in the cloud using the searchTerm
            const searchTerm = payload.searchTerm;
            this.sendSocketNotification("MEDICATION_DATA_FOUND");
            console.log("Searching for medication using searchTerm:", searchTerm);
        }

        else if (notification === "ADD_MEDICATIONS") {
            // Handle received medication data here
            console.log("Received medication data:", payload);
            const medications = this.processMedications(payload);
            this.sendSocketNotification("SAVE_PATIENT_MEDICATION", { medicines: medications });
        }
    },

    processMedications: function (data) {
        const medications = data.map((medication) => ({
            medication_id: medication.medication_id,
            box: medication.box,
            quantity: medication.quantity,
            brand_name: medication.brand_name,
            generic_name: medication.generic_name
        }));
        return medications;
    },

    saveToPatientMedicationsTable: function (medicines) {
        // Connect to SQLite database
        const db = new sqlite3.Database("modules/Medication-Management/medications.db");
    
        db.run(`CREATE TABLE IF NOT EXISTS patient_medications (
            medication_id TEXT,
            box TEXT,
            quantity INTEGER,
            brand_name TEXT,
            generic_name TEXT
        )`);
    
        // Loop through each medication in the medicines array and insert into the database
        medicines.forEach((medicationData) => {
            // Insert medication details into patient-medications table
            db.run(
                "INSERT INTO patient_medications (medication_id, box, quantity, brand_name, generic_name) VALUES (?, ?, ?, ?, ?)",
                [medicationData.medication_id, medicationData.box, medicationData.quantity, medicationData.brand_name, medicationData.generic_name],
                function(err) {
                    if (err) {
                        console.error("Error inserting patient medication:", err);
                    } else {
                        console.log(`Patient medication inserted successfully`);
                    }
                }
            );
        });
    
        // Close the database connection
        db.close();
    },
});
