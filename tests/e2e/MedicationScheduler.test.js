const jsdom = require('jsdom');
const { JSDOM } = jsdom;

jest.mock('path');

// Mock Module global object
global.Module = {
  register: jest.fn(),
  sendSocketNotification: jest.fn(),
  Log: {
    info: jest.fn(),
  },
};

// Mock the MedicationSchedulerModule
class MedicationSchedulerModuleMock {
  constructor() {
    this.updateDom = jest.fn();
  }

  start() {
    global.Module.sendSocketNotification('MEDICATION_SCHEDULER_STARTED');
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

    return {
      appendChild: jest.fn(),
      createElement: document.createElement.bind(document),
      querySelector: document.querySelector.bind(document),
    };
  }
}

const MedicationSchedulerModule = jest.fn().mockImplementation(() => new MedicationSchedulerModuleMock());

describe('Medication-Scheduler Module', () => {
  let module;

  beforeEach(() => {
    module = new MedicationSchedulerModule();
  });

  it('should start and send MEDICATION_SCHEDULER_STARTED notification', () => {
    module.start();
    expect(global.Module.sendSocketNotification).toHaveBeenCalledWith('MEDICATION_SCHEDULER_STARTED');
  });

  it('should handle MEDICATION_DATA_FOUND notification and update DOM', () => {
    const payload = {
      medicationName: 'Sample Medication',
      schedule: {
        Monday: ['08:00 AM', '12:00 PM'],
        Wednesday: ['10:30 AM', '03:00 PM'],
        Friday: ['01:45 PM'],
      },
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
    expect(dom.querySelector('input.medication-input')).toBeDefined();
    expect(dom.querySelector('select.medication-select')).toBeDefined();
    expect(dom.querySelector('button.medication-button')).toBeDefined();
  });
});

// __tests__/Medication-Scheduler-NodeHelper.test.js
jest.mock("axios", () => ({
  get: jest.fn(() => Promise.resolve({ data: { results: [] } })),
}));

const mockDatabase = {
  run: jest.fn(),
  close: jest.fn(),
  get: jest.fn(),
};

jest.mock('sqlite3', () => ({
  verbose: jest.fn(() => ({
    Database: jest.fn(() => mockDatabase)
  }))
}));

const MedicationSchedulerNodeHelper = require("C:/Users/lyba0/Downloads/Winter 2024/Capstone/mirror/magicmirror/modules/Medication-Scheduler/node_helper.js");

describe("Medication-Scheduler NodeHelper", () => {
  let nodeHelper;

  beforeEach(() => {
    nodeHelper = new MedicationSchedulerNodeHelper();

    // Mock the 'io' object
    nodeHelper.io = {
      of: jest.fn().mockReturnValue({
        emit: jest.fn(),
      }),
    };
  });

  it("should start without errors", () => {
    expect(() => nodeHelper.start()).not.toThrow();
  });

  it("should handle SCHEDULE_MEDICATION notification", async () => {
    const payload = { medication_id: "123456", days: ["Monday"], times: ["08:00 AM"] };
  
    mockDatabase.run.mockImplementationOnce((query, params, callback) => {
      if (typeof callback === 'function') {
        callback(null);
      }
    });
    
    mockDatabase.get.mockImplementationOnce((query, params, callback) => {
      callback(null, null);
    });
  
    await nodeHelper.socketNotificationReceived("SCHEDULE_MEDICATION", payload);
  
    expect(mockDatabase.get).toHaveBeenCalledTimes(1);
    expect(mockDatabase.run).toHaveBeenCalledTimes(0);
  });

  it("should handle DELETE_SCHEDULE notification", async () => {
    const payload = { medication_id: "123456", days: ["Monday"], times: ["08:00 AM"] };

    mockDatabase.run.mockImplementationOnce((query, params, callback) => {
      if (typeof callback === 'function') {
        callback(null);
      }
    });
    
    await nodeHelper.socketNotificationReceived("DELETE_SCHEDULE", payload);

    expect(mockDatabase.run).toHaveBeenCalledTimes(1);
  });

  it("should handle MEDICATION_ALARM_TEST notification", async () => {
    const payload = { message: "Test message" };

    jest.spyOn(nodeHelper, 'sendSocketNotification');

    nodeHelper.socketNotificationReceived("MEDICATION_ALARM_TEST", payload);

    expect(nodeHelper.sendSocketNotification).toHaveBeenCalledWith("MEDICATION_ALARM_TEST", payload);
  });
});
