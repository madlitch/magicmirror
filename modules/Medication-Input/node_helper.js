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

    saveToPatientMedicationsTable: function (medicine) {
        // Connect to SQLite database
        const db = new sqlite3.Database("modules/Medication-Management/medications.db");
    
        // Check if the medication ID or box number already exists in the database
        db.get(
            "SELECT * FROM patient_medications WHERE medication_id = ? OR box = ?",
            [medicine.medication_id, medicine.box],
            (err, row) => {
                if (err) {
                    console.error("Error checking for duplicate medication:", err);
                } else if (row) {
                    console.log("Medication ID or box number already exists in the database");
                } else {
                    // Insert medication details into patient-medications table
                    db.run(
                        "INSERT INTO patient_medications (medication_id, box, quantity, brand_name, generic_name) VALUES (?, ?, ?, ?, ?)",
                        [medicine.medication_id, medicine.box, medicine.quantity, medicine.brand_name, medicine.generic_name],
                        function(err) {
                            if (err) {
                                console.error("Error inserting patient medication:", err);
                            } else {
                                console.log(`Patient medication inserted successfully`);
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
