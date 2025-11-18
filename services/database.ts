
import {
  User,
  Order,
  SystemSettings,
  DeliveryAgent,
  Employee,
  PayrollRecord,
  UserRole,
  DeliveryAgentStatus,
  Vendor,
} from '../types';

// Define the structure of our database
export interface CafeDatabase {
  users: User[];
  orders: Order[];
  systemSettings: SystemSettings;
  deliveryAgents: DeliveryAgent[];
  employees: Employee[];
  payrollHistory: PayrollRecord[];
  vendors: Vendor[];
}

const DB_KEY = 'cafe_database';

// Default initial state for the database
const getDefaultDatabase = (): CafeDatabase => ({
  users: [
    { id: 'user-1', name: 'Alice Admin', role: UserRole.ADMIN },
    { id: 'user-2', name: 'Bob Customer', role: UserRole.CUSTOMER },
  ],
  orders: [],
  systemSettings: {
    cafeName: "Stanley's Cafe",
    welcomeMessage: "Welcome to Stanley's Cafe! I can help you with our menu and take your order. What would you like today?",
    operatingHours: "9 AM - 8 PM Daily",
  },
  deliveryAgents: [
     { id: 'agent-1', name: 'John Fleet', phone: '555-1234', status: DeliveryAgentStatus.AVAILABLE },
     { id: 'agent-2', name: 'Maria Go', phone: '555-5678', status: DeliveryAgentStatus.ON_DELIVERY },
  ],
  employees: [
      { id: 'emp-1', name: 'Charlie Barista', hourlyRate: 18.50, currentHours: 0 },
      { id: 'emp-2', name: 'Dana Chef', hourlyRate: 22.00, currentHours: 0 },
  ],
  payrollHistory: [],
  vendors: [
    { id: 'vendor-1', name: 'Artisan Coffee Roasters', contactPerson: 'Dave Roast', phone: '555-2633', email: 'dave@artisan.com', products: ['Coffee Beans', 'Espresso Machines'] },
    { id: 'vendor-2', name: 'Farm Fresh Dairy', contactPerson: 'Molly Milk', phone: '555-6455', email: 'molly@farmfresh.com', products: ['Milk', 'Cream', 'Butter'] },
    { id: 'vendor-3', name: 'Bakery Delights', contactPerson: 'Peter Pastry', phone: '555-2253', email: 'peter@bakerydelights.com', products: ['Croissants', 'Muffins', 'Bread'] },
  ],
});

// Load the database from localStorage
export const loadDatabase = (): CafeDatabase => {
  try {
    const storedDb = localStorage.getItem(DB_KEY);
    if (storedDb) {
      // Deep merge with default to handle schema changes over time
      const parsedDb = JSON.parse(storedDb);
      const defaultDb = getDefaultDatabase();
      return {
          ...defaultDb,
          ...parsedDb,
          // ensure nested objects are also merged
          systemSettings: { ...defaultDb.systemSettings, ...parsedDb.systemSettings }
      };
    }
  } catch (error) {
    console.error("Failed to load database from localStorage:", error);
  }
  return getDefaultDatabase();
};

// Save the database to localStorage
export const saveDatabase = (db: CafeDatabase): void => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    // Fix: Corrected syntax for the catch block.
  } catch (error) {
    console.error("Failed to save database to localStorage:", error);
  }
};