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

    // Your existing code to create medication containers
    const medicationContainer = document.createElement('div');
    medicationContainer.className = 'medication-container';

    // Input field for searching brand name
    const searchInput = document.createElement('input');
    searchInput.setAttribute('type', 'text');
    searchInput.setAttribute('placeholder', 'Search Brand Name');
    searchInput.className = 'medication-input';
    medicationContainer.appendChild(searchInput);

    // Select brand name
    const brandSelect = document.createElement('select');
    brandSelect.className = 'brand-select';
    const brandPlaceholderOption = document.createElement('option');
    brandPlaceholderOption.value = '';
    brandPlaceholderOption.textContent = 'Select Brand Name';
    brandSelect.appendChild(brandPlaceholderOption);
    medicationContainer.appendChild(brandSelect);

    // Input field for Quantity
    const quantityInput = document.createElement('input');
    quantityInput.setAttribute('type', 'number');
    quantityInput.setAttribute('placeholder', 'Enter Quantity');
    quantityInput.setAttribute('min', '1'); // Set the minimum value to 1
    quantityInput.className = 'medication-input';
    medicationContainer.appendChild(quantityInput);

    // Schedule button
    const scheduleButton = document.createElement('button');
    scheduleButton.innerText = 'Add Medication';
    scheduleButton.className = 'medication-button';
    scheduleButton.addEventListener('click', () => {
      const brandId = brandSelect.value.trim();
      const quantityValue = Math.max(1, +quantityInput.value); // Ensure quantity is at least 1

      // Save to patient-medications table
      this.sendSocketNotification('SAVE_PATIENT_MEDICATION', { medication_id: brandId, quantity: quantityValue });
    });
    medicationContainer.appendChild(scheduleButton);

    // Append the medication container to the wrapper
    wrapper.appendChild(medicationContainer);

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
    const payload = { medications: [{ medication_id: '1234567890', quantity: 3 }] };
    
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
    const searchInput = dom.querySelector('.medication-input');
    expect(searchInput).toBeDefined();
    expect(searchInput.getAttribute('type')).toBe('text');

    const brandSelect = dom.querySelector('.brand-select');
    expect(brandSelect).toBeDefined();
    expect(brandSelect.nodeName).toBe('SELECT'); // Assert that it is a select element

    const quantityInput = dom.querySelector('.medication-input[type="number"]');
    expect(quantityInput).toBeDefined();
    expect(quantityInput.getAttribute('min')).toBe('1');

    const scheduleButton = dom.querySelector('.medication-button');
    expect(scheduleButton).toBeDefined();
    expect(scheduleButton.nodeName).toBe('BUTTON'); // Assert that it is a button element
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

const MedicationInputNodeHelper = require("C:/Users/lyba0/Downloads/Winter 2024/Capstone/mirror/magicmirror/modules/Medication-Input/node_helper.js");

describe("Medication-Input NodeHelper", () => {
  let nodeHelper;

  beforeEach(() => {
    nodeHelper = new MedicationInputNodeHelper();
  });

  it("should start without errors", () => {
    expect(() => nodeHelper.start());
});


  it("should save patient medication to the database", async () => {
    // Mock the parameters for the test case
    const payload = { medication_id: "123456", quantity: 5 };
  
    mockDatabase.run.mockImplementationOnce((query, params, callback) => {
      // Ensure the callback is a function before calling it
      if (typeof callback === 'function') {
        callback(null);
      }
    });
    
  
    // Mock database response for retrieving medication details
    mockDatabase.get.mockImplementationOnce((query, params, callback) => {
      callback(null, { brand_name: "Brand1", generic_name: "Generic1", medication_id: "123456" });
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
    expect(mockDatabase.run).toHaveBeenCalledTimes(0); // Check for the main insertion
  });
  
});
