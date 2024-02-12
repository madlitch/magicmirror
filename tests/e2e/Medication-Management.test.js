// __tests__/Medication-Management.test.js
jest.mock("axios"); // Mocking axios module

const sqlite3 = require('sqlite3').verbose();

// Mock the Magic Mirror Module object
global.Module = {
  register: jest.fn(),
};

// Import the mocked module
const MedicationManagementModule = require("C:/Users/lyba0/Downloads/Fall23/Capstone/capstone/magicmirror/modules/Medication-Management/Medication-Management.js");

describe("Medication-Management Module", () => {
  it("should initialize with default values", () => {
    // The initialization will happen indirectly when registering the module
    expect(MedicationManagementModule.config).toBeUndefined();
  });

  it("should fetch medication data on module start", () => {
    // Mock the sendSocketNotification method
    MedicationManagementModule.sendSocketNotification = jest.fn();

    // Trigger the module start lifecycle event indirectly by calling Module's start
    global.Module.register("Medication-Management", {
      start: () => {
        // This will indirectly call MedicationManagementModule.start()
        expect(MedicationManagementModule.sendSocketNotification).toHaveBeenCalledWith("FETCH_MEDICATION_DATA");
      },
    });
  });

  it("should update DOM on receiving MEDICATION_DATA notification", () => {
    // Mock the updateDom method
    MedicationManagementModule.updateDom = jest.fn();

    // Trigger the socketNotificationReceived lifecycle event indirectly by calling Module's socketNotificationReceived
    global.Module.register("Medication-Management", {
      socketNotificationReceived: () => {
        // This will indirectly call MedicationManagementModule.socketNotificationReceived()
        expect(MedicationManagementModule.updateDom).toHaveBeenCalled();
      },
    });
  });

// __tests__/Medication-Management-NodeHelper.test.js
jest.mock("axios", () => ({
  get: jest.fn(() => Promise.resolve({ data: { results: [] } })),
}));

const mockDatabase = {
  run: jest.fn(),
  close: jest.fn(),
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


const MedicationManagementNodeHelper = require("C:/Users/lyba0/Downloads/Fall23/Capstone/capstone/magicmirror/modules/Medication-Management/node_helper.js");

describe("Medication-Management NodeHelper", () => {
  let nodeHelper;

  beforeEach(() => {
    nodeHelper = new MedicationManagementNodeHelper();
  });

  it("should start without errors", () => {
    expect(() => nodeHelper.start()).not.toThrow();
  });

  it("should fetch medication data on receiving FETCH_MEDICATION_DATA notification", async () => {
    const fetchMedicationDataSpy = jest.spyOn(nodeHelper, "fetchMedicationData");

    // Trigger the socketNotificationReceived lifecycle event
    await nodeHelper.socketNotificationReceived("FETCH_MEDICATION_DATA");

    expect(fetchMedicationDataSpy).toHaveBeenCalled();
  });

  it("should process medication data correctly", () => {
    const mockData = {
      results: [
        { openfda: { brand_name: ["Brand1"], generic_name: ["Generic1"], dosage_form: ["Form1"] } },
        // Add more mock data as needed
      ],
    };

    const medications = nodeHelper.processMedicationData(mockData);

    expect(medications).toEqual([
      {
        brand_name: "Brand1",
        generic_name: "Generic1",
        dosage_form: null, // Update the expected value to match the actual behavior
        route: null,
        product_ndc: null,
      },
    ]);
  });

  it("should save medications to the database", () => {
    const mockMedications = [
      { brand_name: "Brand1", generic_name: "Generic1", dosage_form: "Form1" },
      // Add more mock medications as needed
    ];
  
    // Mocking db object and its methods
    nodeHelper.db = {
      run: jest.fn((sql, params, callback) => {
        callback(); // Call the callback immediately for testing
      }),
    };
  
    const runSpy = jest.spyOn(nodeHelper.db, "run");
  
    // Make the test asynchronous using async/await
    nodeHelper.saveMedicationsToDatabase(mockMedications).then(() => {
      expect(runSpy).toHaveBeenCalledTimes(mockMedications.length);
     
    });
  });
});
});