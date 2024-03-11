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
    
        // Create patient_medications table if not exists
        db.run(`CREATE TABLE IF NOT EXISTS patient_medications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            medication_id TEXT,
            box TEXT,
            quantity TEXT,
            brand_name TEXT,
            generic_name TEXT
        )`);
    
        // Check if the medication ID already exists in the database
        db.get(
            "SELECT * FROM patient_medications WHERE medication_id = ?",
            [medicine.medication_id],
            (err, row) => {
                if (err) {
                    console.error("Error checking for duplicate medication:", err);
                    // Close the database connection
                    db.close();
                    return;
                }
                
                if (row) {
                    // Medication ID already exists, now check if the box is available
                    db.get(
                        "SELECT * FROM patient_medications WHERE box = ? AND medication_id = ?",
                        [medicine.box, medicine.medication_id],
                        (err, boxRow) => {
                            if (err) {
                                console.error("Error checking for duplicate box:", err);
                                // Close the database connection
                                db.close();
                                return;
                            }
                            
                            if (boxRow) {
                                // Box number already in use by the same medication ID, update quantity
                                const newQuantity = parseInt(boxRow.quantity) + parseInt(medicine.quantity);
                                db.run(
                                    "UPDATE patient_medications SET quantity = ? WHERE box = ? AND medication_id = ?",
                                    [newQuantity.toString(), medicine.box, medicine.medication_id],
                                    function(err) {
                                        if (err) {
                                            console.error("Error updating patient medication quantity:", err);
                                        } else {
                                            console.log(`Patient medication quantity updated successfully`);
                                        }
                                        // Close the database connection
                                        db.close();
                                    }
                                );
                            } else {
                                // Update medication details in patient-medications table
                                db.run(
                                    "UPDATE patient_medications SET box = ?, quantity = ? WHERE medication_id = ?",
                                    [medicine.box, medicine.quantity, medicine.medication_id],
                                    function(err) {
                                        if (err) {
                                            console.error("Error updating patient medication:", err);
                                        } else {
                                            console.log(`Patient medication updated successfully`);
                                        }
                                        // Close the database connection
                                        db.close();
                                    }
                                );
                            }
                        }
                    );
                } else {
                    // Medication ID does not exist, insert new medication
                    db.run(
                        "INSERT INTO patient_medications (medication_id, box, quantity, brand_name, generic_name) VALUES (?, ?, ?, ?, ?)",
                        [medicine.medication_id, medicine.box, medicine.quantity, medicine.brand_name, medicine.generic_name],
                        function(err) {
                            if (err) {
                                console.error("Error inserting patient medication:", err);
                            } else {
                                console.log(`Patient medication inserted successfully`);
                            }
                            // Close the database connection
                            db.close();
                        }
                    );
                }
            }
        );
    },
    
    
    
    
});