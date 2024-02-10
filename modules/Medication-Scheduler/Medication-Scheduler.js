// * Magic Mirror
//  * Module: Medication-Scheduler
//  *
//  * By Lyba Mughees
//  * MIT Licensed.
//  */

Module.register("Medication-Scheduler", {
  defaults: {
   
  },
  defaults: {
   
  },

  start: function () {
    Log.info("Medication-Scheduler module started...");
    // Fetch medication options when the module starts
    this.sendSocketNotification("GET_MEDICATIONS");
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "MEDICATION_DATA_FOUND") {
      this.medicationData = payload;
      this.updateDom();
    } else if (notification === "MEDICATION_OPTIONS") {
      // Update the medication dropdown list with options received from the backend
      this.updateMedicationOptions(payload);
    }
  },

  getStyles: function () {
    return ["medication-scheduler.css"];
  },

  getDom: function () {
    const wrapper = document.createElement("div");
    wrapper.className = "medication-scheduler";

    // Select medication dropdown list
    const medicationDropdown = document.createElement("select");
    medicationDropdown.className = "medication-select";
    medicationDropdown.addEventListener("change", () => {
      // Set the value of the NDC input field to the selected medication's NDC
      ndcInput.value = medicationDropdown.value;
    });
    wrapper.appendChild(medicationDropdown);

    // Select days
    const daysSelect = document.createElement("select");
    daysSelect.multiple = true;
    daysSelect.className = "medication-select";
    const daysOptions = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    daysOptions.forEach((day) => {
      const option = document.createElement("option");
      option.value = day;
      option.text = day;
      daysSelect.appendChild(option);
    });
    wrapper.appendChild(daysSelect);

    // Select times
    const timesSelect = document.createElement("select");
    timesSelect.multiple = true;
    timesSelect.className = "medication-select";

    // Create options for all hours and minutes
    for (let hours = 0; hours <= 23; hours++) {
      for (let minutes = 0; minutes < 60; minutes += 30) {
        const formattedTime = `${(hours < 10 ? '0' : '') + hours}:${(minutes === 0 ? '00' : minutes)}`;
        const option = document.createElement("option");
        option.value = formattedTime;
        option.text = formattedTime;
        timesSelect.appendChild(option);
      }
    }

    wrapper.appendChild(timesSelect);

    // Schedule button
    const scheduleButton = document.createElement("button");
    scheduleButton.innerText = "Schedule Medication";
    scheduleButton.className = "medication-button";
    scheduleButton.addEventListener("click", () => {
      const ndcValue = medicationDropdown.value.trim(); // Get the selected medication's NDC
      const selectedDays = Array.from(daysSelect.selectedOptions).map((option) => option.value);
      const selectedTimes = Array.from(timesSelect.selectedOptions).map((option) => option.value);

      this.sendSocketNotification("SCHEDULE_MEDICATION", { ndc: ndcValue, days: selectedDays, times: selectedTimes });

      
    });
    wrapper.appendChild(scheduleButton);

    // Delete schedule button
    const deleteButton = document.createElement("button");
    deleteButton.innerText = "Delete Schedule";
    deleteButton.className = "medication-button";
    deleteButton.addEventListener("click", () => {
      const ndcValue = medicationDropdown.value.trim(); // Get the selected medication's NDC
      const selectedDays = Array.from(daysSelect.selectedOptions).map((option) => option.value);
      const selectedTimes = Array.from(timesSelect.selectedOptions).map((option) => option.value);
      this.sendSocketNotification("DELETE_SCHEDULE", { ndc: ndcValue, days: selectedDays, times: selectedTimes });

      
    });
    wrapper.appendChild(deleteButton);

    return wrapper;
  },

  updateMedicationOptions: function (medications) {
    const medicationDropdown = document.querySelector(".medication-select");
    medications.forEach(medication => {
      const option = document.createElement("option");
      option.value = medication.ndc;
      option.text = `${medication.brand_name} (${medication.generic_name})`;
      medicationDropdown.appendChild(option);
    });
  }
});
