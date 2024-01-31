// * Magic Mirror
//  * Module: Medication-Scheduler
//  *
//  * By Lyba Mughees
//  * MIT Licensed.
//  */

Module.register("Medication-Input", {
  defaults: {},

  start: function () {
    Log.info("Medication-Input module started...");
    this.sendSocketNotification("MEDICATION_INTAKE_STARTED");
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "MEDICATION_DATA_FOUND") {
      this.medicationData = payload;
      this.updateDom();
    }
  },

  getStyles: function () {
    return ["medication-scheduler.css"];
  },

  getDom: function () {
    const wrapper = document.createElement("div");
    wrapper.className = "medication-scheduler";

    // Input field for NDC/brand name/generic name
    const ndcInput = document.createElement("input");
    ndcInput.setAttribute("type", "text");
    ndcInput.setAttribute("placeholder", "Enter NDC/Brand Name/Generic Name");
    ndcInput.className = "medication-input";
    wrapper.appendChild(ndcInput);

    // Select pill box
    const boxSelect = document.createElement("select");
    boxSelect.className = "medication-select";
    const boxOptions = ["Box 1", "Box 2", "Box 3", "Box 4", "Box 5", "Box 6", "Box 7"];
    boxOptions.forEach((box) => {
      const option = document.createElement("option");
      option.value = box;
      option.text = box;
      boxSelect.appendChild(option);
    });
    wrapper.appendChild(boxSelect);

    // Input field for Quantity
    const quantityInput = document.createElement("input");
    quantityInput.setAttribute("type", "number");
    quantityInput.setAttribute("placeholder", "Enter Quantity");
    quantityInput.setAttribute("min", "1"); // Set the minimum value to 1
    quantityInput.className = "medication-input";
    wrapper.appendChild(quantityInput);

    // Schedule button
    const scheduleButton = document.createElement("button");
    scheduleButton.innerText = "Schedule Medication";
    scheduleButton.className = "medication-button";
    scheduleButton.addEventListener("click", () => {
      const ndcValue = ndcInput.value.trim();
      const boxValue = boxSelect.value;
      const quantityValue = Math.max(1, +quantityInput.value); // Ensure quantity is at least 1

      this.sendSocketNotification("SCHEDULE_MEDICATION", { ndc: ndcValue, box: boxValue, quantity: quantityValue });

      // Save to patient-medications table
      this.sendSocketNotification("SAVE_PATIENT_MEDICATION", { ndc: ndcValue, box: boxValue, quantity: quantityValue });
    });
    wrapper.appendChild(scheduleButton);

    return wrapper;
  },
});
