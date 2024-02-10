/* Magic Mirror
 * Module: Medication-Input
 *
 * By Lyba Mughees
 * MIT Licensed.
 */

Module.register("Medication-Input", {
    defaults: {},

    start: function () {
        Log.info("Medication-Input module started...");
        this.sendSocketNotification("MEDICATION_INTAKE_STARTED");
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "MEDICATION_DATA_FOUND" || notification === "CLOUD_SEARCH_MEDICATIONS_RESULT") {
            this.updateDom();
        }
    },

    getStyles: function () {
        return ["medication-scheduler.css"];
    },

    getDom: function () {
        const wrapper = document.createElement("div");
        wrapper.className = "medication-scheduler";

        for (let i = 1; i <= 7; i++) {
            // Medication container
            const medicationContainer = document.createElement("div");
            medicationContainer.className = "medication-container";

            // Input field for NDC/brand name/generic name
            const ndcInput = document.createElement("input");
            ndcInput.setAttribute("type", "text");
            ndcInput.setAttribute("placeholder", `Medication ${i}: Enter NDC/Brand Name/Generic Name`);
            ndcInput.className = "medication-input";

            // Add event listener for input event
            ndcInput.addEventListener("input", (event) => {
                const searchTerm = event.target.value.trim();
                if (searchTerm.length > 0) {
                    // If the input is not empty, send a socket notification to start medication search
                    this.sendSocketNotification("CLOUD_SEARCH_MEDICATIONS", { searchTerm });
                }
            });

            medicationContainer.appendChild(ndcInput);

            // Select pill box
            const boxSelect = document.createElement("select");
            boxSelect.className = "medication-select";
            const boxOptions = [`${i}`];
            boxOptions.forEach((box) => {
                const option = document.createElement("option");
                option.value = box;
                option.text = box;
                boxSelect.appendChild(option);
            });
            medicationContainer.appendChild(boxSelect);

            // Input field for Quantity
            const quantityInput = document.createElement("input");
            quantityInput.setAttribute("type", "number");
            quantityInput.setAttribute("placeholder", `Medication ${i}: Enter Quantity`);
            quantityInput.setAttribute("min", "1"); // Set the minimum value to 1
            quantityInput.className = "medication-input";
            medicationContainer.appendChild(quantityInput);

            // Schedule button
            const scheduleButton = document.createElement("button");
            scheduleButton.innerText = `Medication ${i}: Add Medication`;
            scheduleButton.className = "medication-button";
            scheduleButton.addEventListener("click", () => {
                const ndcValue = ndcInput.value.trim();
                const boxValue = boxSelect.value;
                const quantityValue = Math.max(1, +quantityInput.value); // Ensure quantity is at least 1

                // Save to patient-medications table
                this.sendSocketNotification("SAVE_PATIENT_MEDICATION", { ndc: ndcValue, box: boxValue, quantity: quantityValue });
            });
            medicationContainer.appendChild(scheduleButton);

            // Append the medication container to the wrapper
            wrapper.appendChild(medicationContainer);
        }

        return wrapper;
    },
});
