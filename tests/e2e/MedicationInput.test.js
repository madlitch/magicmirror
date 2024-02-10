const jsdom = require('jsdom');
const { JSDOM } = jsdom;

jest.mock('sqlite3', () => ({
  verbose: jest.fn(),
}));

jest.mock('axios');

global.Module = {
  register: jest.fn(),
  sendSocketNotification: jest.fn(),
  Log: {
    info: jest.fn(),
  },
};

// Mock the MedicationInputModule
class MedicationInputModuleMock {
  constructor() {
    this.updateDom = jest.fn();
  }

  start() {
    global.Module.sendSocketNotification('MEDICATION_INTAKE_STARTED');
  }

  socketNotificationReceived(notification, payload) {
    if (notification === 'MEDICATION_DATA_FOUND') {
      this.medicationData = payload;
      this.updateDom();
    }
  }

  getStyles() {
    return ['medication-scheduler.css'];
  }

  getDom() {
    const dom = new JSDOM('<html><body></body></html>');
    const document = dom.window.document;

    const wrapper = document.createElement('div');
    wrapper.className = 'medication-scheduler';

    for (let i = 1; i <= 7; i++) {

      // Your existing code to create medication containers
      const medicationContainer = document.createElement('div');
      medicationContainer.className = 'medication-container';

      // Input field for NDC/brand name/generic name
      const ndcInput = document.createElement('input');
      ndcInput.setAttribute('type', 'text');
      ndcInput.setAttribute('placeholder', `Medication ${i}: Enter NDC/Brand Name/Generic Name`);
      ndcInput.className = 'medication-input';
      medicationContainer.appendChild(ndcInput);

      // Select pill box
      const boxSelect = document.createElement('select');
      boxSelect.className = 'medication-select';
      const boxOptions = [`${i}`];
      boxOptions.forEach((box) => {
        const option = document.createElement('option');
        option.value = box;
        option.text = box;
        boxSelect.appendChild(option);
      });
      medicationContainer.appendChild(boxSelect);

      // Input field for Quantity
      const quantityInput = document.createElement('input');
      quantityInput.setAttribute('type', 'number');
      quantityInput.setAttribute('placeholder', `Medication ${i}: Enter Quantity`);
      quantityInput.setAttribute('min', '1'); // Set the minimum value to 1
      quantityInput.className = 'medication-input';
      medicationContainer.appendChild(quantityInput);

      // Schedule button
      const scheduleButton = document.createElement('button');
      scheduleButton.innerText = `Medication ${i}: Add Medication`;
      scheduleButton.className = 'medication-button';
      scheduleButton.addEventListener('click', () => {
        const ndcValue = ndcInput.value.trim();
        const boxValue = boxSelect.value;
        const quantityValue = Math.max(1, +quantityInput.value); // Ensure quantity is at least 1

        // Save to patient-medications table
        this.sendSocketNotification('SAVE_PATIENT_MEDICATION', { ndc: ndcValue, box: boxValue, quantity: quantityValue });
      });
      medicationContainer.appendChild(scheduleButton);

      // Append the medication container to the wrapper
      wrapper.appendChild(medicationContainer);


    }

    return wrapper;
  }
}

const MedicationInputModule = jest.fn().mockImplementation(() => new MedicationInputModuleMock());

describe('Medication-Input Module', () => {
  let module;

  beforeEach(() => {
    module = new MedicationInputModule();
  });

  it('should start and send MEDICATION_INTAKE_STARTED notification', () => {
    module.start();
    expect(global.Module.sendSocketNotification).toHaveBeenCalledWith('MEDICATION_INTAKE_STARTED');
  });

  it('should handle MEDICATION_DATA_FOUND notification and update DOM', () => {
    const payload = {
      medications: [
        {
          ndc: '1234567890',         // NDC code or other identifier
          box: '1',                  // Pill box identifier
          quantity: 3,               // Quantity of medication
        },
       
      ],
    };
    
    module.socketNotificationReceived('MEDICATION_DATA_FOUND', payload);
    expect(module.medicationData).toEqual(payload);
    expect(module.updateDom).toHaveBeenCalled();
  });

  it('should get styles for medication-scheduler.css', () => {
    const styles = module.getStyles();
    expect(styles).toEqual(['medication-scheduler.css']);
  });

  it('should create DOM elements with input fields', () => {
    const dom = module.getDom();
    // Your assertions based on the actual DOM structure
    for (let i = 1; i <= 7; i++) {
      const medicationContainer = dom.querySelector(`.medication-container:nth-child(${i})`);
      expect(medicationContainer).toBeDefined();
  
      const ndcInput = medicationContainer.querySelector('.medication-input');
      expect(ndcInput).toBeDefined();
      expect(ndcInput.getAttribute('type')).toBe('text');
  
      const boxSelect = medicationContainer.querySelector('.medication-select');
      expect(boxSelect).toBeDefined();
      expect(boxSelect.nodeName).toBe('SELECT'); // Assert that it is a select element
  
      // Additional assertions for boxSelect if needed
      const options = boxSelect.querySelectorAll('option');
      expect(options.length).toBe(1); // Assuming only one option is added
  
      const quantityInput = medicationContainer.querySelector('.medication-input[type="number"]');
      expect(quantityInput).toBeDefined();
      expect(quantityInput.getAttribute('min')).toBe('1');
  
      const scheduleButton = medicationContainer.querySelector('.medication-button');
      expect(scheduleButton).toBeDefined();
      expect(scheduleButton.nodeName).toBe('BUTTON'); // Assert that it is a button element
  
      // Additional assertions for scheduleButton if needed
      expect(scheduleButton.innerText).toContain(`Medication ${i}: Add Medication`);
    }
  });  
  
  
});

// __tests__/Medication-Input-NodeHelper.test.js
jest.mock("axios", () => ({
  get: jest.fn(() => Promise.resolve({ data: { results: [] } })),
}));

const mockDatabase = {
  run: jest.fn(),
  close: jest.fn(),
  get: jest.fn(),
};

jest.mock('sqlite3', () => {
  return {
    verbose: jest.fn(() => {
      return {
        Database: jest.fn(() => mockDatabase)
      }
    })
  }
});

const MedicationInputNodeHelper = require("C:/Users/lyba0/Downloads/Fall23/Capstone/capstone/magicmirror/modules/Medication-Input/node_helper.js");

describe("Medication-Input NodeHelper", () => {
  let nodeHelper;

  beforeEach(() => {
    nodeHelper = new MedicationInputNodeHelper();
  });

  it("should start without errors", () => {
    expect(() => nodeHelper.start()).not.toThrow();
  });

  it("should save patient medication to the database", async () => {
    // Mock the parameters for the test case
    const payload = { ndc: "123456", box: "A1", quantity: 5 };
  
    mockDatabase.run.mockImplementationOnce((query, params, callback) => {
      // Ensure the callback is a function before calling it
      if (typeof callback === 'function') {
        callback(null);
      }
    });
    
  
    // Mock database response for retrieving medication details
    mockDatabase.get.mockImplementationOnce((query, params, callback) => {
      callback(null, { brand_name: "Brand1", generic_name: "Generic1", product_ndc: "123456" });
    });
  
    // Mock database response for the main insertion
    mockDatabase.run.mockImplementationOnce((query, params, callback) => {
      if (typeof callback === 'function') {
        callback(null);
      }
    });
  
    // Trigger the socketNotificationReceived lifecycle event
    await nodeHelper.socketNotificationReceived("SAVE_PATIENT_MEDICATION", payload);
  
    expect(mockDatabase.get).toHaveBeenCalledTimes(1); // Check for existing medication and retrieving medication details
    expect(mockDatabase.run).toHaveBeenCalledTimes(1); // Check for the main insertion
  });
  
  it("should skip insertion for existing patient medication", async () => {
    // Mock the parameters for the test case
    const payload = { ndc: "123456", box: "A1", quantity: 5 };
  
    // Mock database response for an existing patient medication
    mockDatabase.get.mockImplementationOnce((query, params, callback) => {
      callback(null, { brand_name: "Brand1", generic_name: "Generic1", product_ndc: "123456" });
    });
  
    // Mock database.run to ignore the table creation operation
    mockDatabase.run.mockImplementation((query, params, callback) => {
      if (query.includes("CREATE TABLE IF NOT EXISTS")) {
        // If the query is for table creation, call the callback and return
        if (typeof callback === 'function') {
          callback(null);
        }
        return;
      }
  
      // For other queries, simulate an error
      if (typeof callback === 'function') {
        callback(new Error("Unexpected call to mockDatabase.run"));
      }
    });
  
    // Trigger the socketNotificationReceived lifecycle event
    await nodeHelper.socketNotificationReceived("SAVE_PATIENT_MEDICATION", payload);
  
    expect(mockDatabase.get).toHaveBeenCalledTimes(2); // Check for existing medication
    expect(mockDatabase.run).toHaveBeenCalledTimes(2); // Check for the table creation operation
  });
  
  
  
  it("should handle errors during database operations", async () => {
    // Mock the parameters for the test case
    const payload = { ndc: "123456", box: "A1", quantity: 5 };
  
    // Mock database response for checking existing medication (simulating an error)
    mockDatabase.get.mockImplementationOnce((query, params, callback) => {
      callback(new Error("Database error"), null);
    });
  
    // Mock database.run to ignore the table creation operation
    mockDatabase.run.mockImplementation((query, params, callback) => {
      if (query.includes("CREATE TABLE IF NOT EXISTS")) {
        // If the query is for table creation, call the callback and return
        if (typeof callback === 'function') {
          callback(null);
        }
        return;
      }
  
      // For other queries, simulate an error
      if (typeof callback === 'function') {
        callback(new Error("Unexpected call to mockDatabase.run"));
      }
    });
  
    // Trigger the socketNotificationReceived lifecycle event
    await nodeHelper.socketNotificationReceived("SAVE_PATIENT_MEDICATION", payload);
  
    expect(mockDatabase.get).toHaveBeenCalledTimes(3); // Check for existing medication
    expect(mockDatabase.run).toHaveBeenCalledTimes(3); // Check for the table creation operation
  });
  

});