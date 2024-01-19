/* Magic Mirror
 * Node Helper: Medication-Management
 *
 * By Lyba Mughees
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
const axios = require("axios");

const sqlite3 = require("sqlite3").verbose();

module.exports = NodeHelper.create({
  start: function () {
    console.log("Medication-Management helper started...");
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "FETCH_MEDICATION_DATA") {
      // Fetch medication data from the API
      this.fetchMedicationData();
    }
  },

  fetchMedicationData: function () {
    const self = this;

    
    const apiUrl = "https://api.fda.gov/drug/label.json?limit=1000"; 

    axios.get(apiUrl)
      .then((response) => {
        // Process the data as needed
        // console.log(response.data); // Log the response to inspect its structure
        const medications = self.processMedicationData(response.data);

        // Save the medications to SQLite database
        self.saveMedicationsToDatabase(medications);

        
        self.sendSocketNotification("MEDICATION_DATA", medications);
      })
      .catch((error) => {
        console.error("Error fetching medication data:", error);
      });
  },

  processMedicationData: function (data) {
    // Implement the logic to extract relevant information from the API response
  
    const medications = data.results.map((result) => ({
      brand_name: result.openfda.brand_name ? result.openfda.brand_name[0] : null,
      generic_name: result.openfda.generic_name ? result.openfda.generic_name[0] : null,
      dosage_form: result.dosage_form ? result.dosage_form[0] : null,
      route: result.openfda.route ? result.openfda.route[0] : null,
      product_ndc: result.openfda.product_ndc ? result.openfda.product_ndc[0] : null,
    }));
  
    return medications;
  },
  

  saveMedicationsToDatabase: function (medications) {
    // Connect to SQLite database
    const db = new sqlite3.Database("modules/Medication-Management/medications.db");

    // Create medications table if not exists
    db.run(`CREATE TABLE IF NOT EXISTS medications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      brand_name TEXT,
      generic_name TEXT,
      dosage_form TEXT,
      route TEXT,
      product_ndc TEXT
    )`);

    // Insert medications into the table
    medications.forEach((medication) => {
      db.run(
        "INSERT INTO medications (brand_name, generic_name, dosage_form, route, product_ndc) VALUES (?, ?, ?, ?, ?)",
        [
          medication.brand_name,
          medication.generic_name,
          medication.dosage_form,
          medication.route,
          medication.product_ndc,
        ],
        function (err) {
          if (err) {
            console.error("Error inserting medication:", err);
          } else {
            //console.log("Medication inserted successfully");
          }
        }
      );
    });

    // Close the database connection
    db.close();
  },
});

