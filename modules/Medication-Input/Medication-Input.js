

/* Magic Mirror
 * Module: Medication-Input
 *
 * By Lyba Mughees
 * MIT Licensed.
 */

Module.register("Medication-Input", {
    defaults: {
        passcode: "1234", // Set your default passcode here
        locked: true,
    },

    start: function () {
        Log.info("Medication-Input module started...");
        this.sendSocketNotification("MEDICATION_INTAKE_STARTED");
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "MEDICATION_DATA_FOUND") {
            this.medicationData = payload.medicationData;
            this.sendDataToNodeHelper(); // Call function to send data to node helper
            this.updateDom();
        }
    },

    notificationReceived: function (notification, payload) {
        if (notification === "CLOUD_SEARCH_MEDICATIONS_RESULT") {
            this.populateDropdown(payload); // Populate the dropdown with the search results
            this.log(payload);
        } else if (notification === "CLOUD_UPDATE_MEDICATIONS_RESULT") {
            this.log(payload);
        }

        else if (notification === "UNLOCK_MEDICATION_INPUT") {
            this.config.locked = false;
            this.updateDom();
        } else if (notification === "LOCK_MEDICATION_INPUT") {
            this.config.locked = true;
            this.updateDom();
        }

        else if (notification === "KEYBOARD_INPUT" && payload.key === "medication-input") {
            console.log(payload.message);
            const passcodeInput = document.getElementById("passcode-value");
            
            // Ensure passcode input exists
            if (passcodeInput) {
                // Append the pressed key to the passcode input value
                passcodeInput.value += payload.message;
            }
        }



    },


    log: function (data) {
        this.sendSocketNotification("LOG", data);
    },

    populateDropdown: function (searchResults) {
        const brandSelect = document.querySelector(".brand-select");
        brandSelect.innerHTML = ""; // Clear existing options

        searchResults.forEach((medication) => {
            const option = document.createElement("option");
            option.value = medication.id;
            option.textContent = `${medication.generic_name} (${medication.brand_name})`;
            brandSelect.appendChild(option);
        });

    },

    getStyles: function () {
        return ["Medication-Input.css"];
    },



    getDom: function () {

        const wrapper = document.createElement("div");
        wrapper.className = "medication-input";


        if (this.config.locked) {

            // Display passcode input field
            const passcodeInput = document.createElement("input");
            passcodeInput.type = "password";
            passcodeInput.placeholder = "Enter passcode";
            passcodeInput.id = "passcode-value";
            passcodeInput.className = "medication-select";
            // Open the keyboard when the passcode input field is clicked
            passcodeInput.addEventListener("click", () => {
                this.openKeyboard();
            });
            wrapper.appendChild(passcodeInput);
            // Display unlock button
            const unlockButton = document.createElement("button");
            unlockButton.innerText = "Unlock";
            unlockButton.className = "medication-button";
            unlockButton.addEventListener("click", () => {
                const passcode = document.getElementById("passcode-value").value;
                if (passcode === this.config.passcode) {
                    this.config.locked = false;

                    this.sendNotification("UNLOCK_MEDICATION_SCHEDULER");
                    this.updateDom();
                }
                else {
                    alert("Incorrect passcode");
                }
            });
            wrapper.appendChild(unlockButton);
        }

        else {
            // Pill box selection
            const boxSelectContainer = document.createElement("div");
            boxSelectContainer.className = "medication-container";

            const boxSelect = document.createElement("select");
            boxSelect.className = "box-select";
            for (let i = 1; i <= 7; i++) {
                const option = document.createElement("option");
                option.value = i;
                option.textContent = `Pill Box ${i}`;
                boxSelect.appendChild(option);
            }
            boxSelectContainer.appendChild(boxSelect);
            wrapper.appendChild(boxSelectContainer);

            // Medication container
            const medicationContainer = document.createElement("div");
            medicationContainer.className = "medication-container";

            // Input field for searching brand name
            const searchInput = document.createElement("input");
            searchInput.setAttribute("type", "text");
            searchInput.setAttribute("placeholder", "Search Brand Name");
            searchInput.className = "medication-select";
            searchInput.id = "searchInput-value";
            medicationContainer.appendChild(searchInput);

            


            // Select brand name
            const brandSelect = document.createElement("select");
            brandSelect.className = "brand-select";
            const brandPlaceholderOption = document.createElement("option");
            brandPlaceholderOption.value = "";
            brandPlaceholderOption.textContent = "Select Brand Name";
            brandSelect.appendChild(brandPlaceholderOption);
            medicationContainer.appendChild(brandSelect);

           

            // Add event listener for input event on search input
            searchInput.addEventListener("input", (event) => {
                const searchTerm = event.target.value.trim();
                if (searchTerm.length > 0) {
                    // If the input is not empty, send a socket notification to start medication search
                    this.sendNotification("CLOUD_SEARCH_MEDICATIONS", searchTerm);
                }
            });

            // Input field for Quantity
            const quantityInput = document.createElement("input");
            quantityInput.setAttribute("type", "number");
            quantityInput.setAttribute("placeholder", "Enter Quantity");
            quantityInput.setAttribute("min", "1"); // Set the minimum value to 1
            quantityInput.className = "medication-select";
            medicationContainer.appendChild(quantityInput);

            // Schedule button
            const scheduleButton = document.createElement("button");
            scheduleButton.innerText = "Add Medication";
            scheduleButton.className = "medication-button";
            scheduleButton.addEventListener("click", () => {
                const brandId = brandSelect.value.trim();
                const quantityValue = Math.max(1, +quantityInput.value); // Ensure quantity is at least 1
                const selectedBox = boxSelect.value;

                // Prepare medication data object
                const medicines = {
                    medication_id: brandId,
                    box: selectedBox,
                    quantity: quantityValue,
                    generic_name: brandSelect.options[brandSelect.selectedIndex].textContent.split('(')[0].trim(), // Extract generic name from dropdown option
                    brand_name: brandSelect.options[brandSelect.selectedIndex].textContent.split('(')[1].replace(')', '').trim() // Extract brand name from dropdown option
                };

                this.sendNotification("ADD_MEDICATIONS", medicines);
                this.log(medicines);

                // Send medication data to the Node Helper
                this.sendSocketNotification("SAVE_PATIENT_MEDICATION", medicines);

                // Prepare medication data object
                const medicationData = {
                    medication_id: brandId,
                    box: selectedBox,
                    quantity: quantityValue
                };


                // Send medication data to the cloud
                this.sendNotification("CLOUD_UPDATE_MEDICATIONS", {
                    patient_id: "b6673aee-c9d8-11ee-8491-029e9cf81533",
                    cabinet_id: "b45569c2-c9d9-11ee-8491-029e9cf81533",
                    medications: [medicationData]
                });
            });


            medicationContainer.appendChild(scheduleButton);

            wrapper.appendChild(medicationContainer);

            // Lock button
            const lockButton = document.createElement("button");
            lockButton.innerText = "Lock";
            lockButton.className = "medication-button";
            lockButton.addEventListener("click", () => {
                this.config.locked = true;
                this.sendNotification("LOCK_MEDICATION_SCHEDULER");
                this.updateDom();
            });
            wrapper.appendChild(lockButton);
        }
        return wrapper;

    },
    // Function to open the keyboard
    openKeyboard: function () {
        this.sendNotification("KEYBOARD", { key: "medication-input", style: "numbers" });
    },

    

});
