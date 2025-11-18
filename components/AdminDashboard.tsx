
import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, OrderItem, User, UserRole, SystemSettings, DeliveryAgent, DeliveryAgentStatus, Employee, PayrollRecord } from '../types';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import UserGroupIcon from './icons/UserGroupIcon';
import TruckIcon from './icons/TruckIcon';
import CogIcon from './icons/CogIcon';
import CurrencyDollarIcon from './icons/CurrencyDollarIcon';
import { MENU_ITEMS } from '../constants';

type AdminView = 'dashboard' | 'users' | 'agents' | 'payroll' | 'settings';

interface AdminDashboardProps {
  orders: Order[];
  onApproveOrder: (orderId: string, trackingNumber: string) => void;
  onRejectOrder: (orderId: string) => void;
  showNewOrderNotification: boolean;
  onDismissNotification: () => void;
  users: User[];
  onAddUser: (name: string, role: UserRole) => void;
  onCreateOrder: (items: OrderItem[], trackingNumber: string) => void;
  systemSettings: SystemSettings;
  onUpdateSettings: (settings: SystemSettings) => void;
  deliveryAgents: DeliveryAgent[];
  onAddDeliveryAgent: (name: string, phone: string) => void;
  onRemoveDeliveryAgent: (agentId: string) => void;
  onUpdateDeliveryAgentStatus: (agentId: string, status: DeliveryAgentStatus) => void;
  employees: Employee[];
  onAddEmployee: (name: string, hourlyRate: number) => void;
  onUpdateEmployeeHours: (employeeId: string, hours: number) => void;
  onProcessPayroll: () => void;
  payrollHistory: PayrollRecord[];
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  view: AdminView;
  activeView: AdminView;
  setView: (view: AdminView) => void;
}> = ({ icon, label, view, activeView, setView }) => (
  <button
    onClick={() => setView(view)}
    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
      activeView === view
        ? 'bg-teal-600 text-white'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`}
  >
    <span className="w-6 h-6 mr-3">{icon}</span>
    <span>{label}</span>
  </button>
);

const Sidebar: React.FC<{ activeView: AdminView; setView: (view: AdminView) => void }> = ({ activeView, setView }) => (
  <aside className="w-64 bg-gray-800 text-white flex-shrink-0 flex flex-col">
    <div className="p-6 text-2xl font-bold text-center border-b border-gray-700">
      Admin Panel
    </div>
    <nav className="flex-1 p-4 space-y-2">
      <NavItem icon={<ChartBarIcon />} label="Dashboard" view="dashboard" activeView={activeView} setView={setView} />
      <NavItem icon={<UserGroupIcon />} label="Users" view="users" activeView={activeView} setView={setView} />
      <NavItem icon={<TruckIcon />} label="Delivery Agents" view="agents" activeView={activeView} setView={setView} />
      <NavItem icon={<CurrencyDollarIcon />} label="Payroll" view="payroll" activeView={activeView} setView={setView} />
      <NavItem icon={<CogIcon />} label="Settings" view="settings" activeView={activeView} setView={setView} />
    </nav>
  </aside>
);

const DashboardView: React.FC<Pick<AdminDashboardProps, 'orders' | 'onApproveOrder' | 'onRejectOrder' | 'showNewOrderNotification' | 'onDismissNotification' | 'onCreateOrder'>> = ({ orders, onApproveOrder, onRejectOrder, showNewOrderNotification, onDismissNotification, onCreateOrder }) => {
    const [trackingNumbers, setTrackingNumbers] = useState<{ [key: string]: string }>({});
    const [newOrderQuantities, setNewOrderQuantities] = useState<{ [itemId: string]: number }>({});
    const [newOrderTracking, setNewOrderTracking] = useState('');
    const [activeTab, setActiveTab] = useState<'pending' | 'processed' | 'all'>('pending');

    const handleTrackingNumberChange = (orderId: string, value: string) => {
        setTrackingNumbers(prev => ({ ...prev, [orderId]: value }));
    };

    const handleCreateOrderSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const itemsForOrder: OrderItem[] = MENU_ITEMS
            .filter(item => newOrderQuantities[item.id] > 0)
            .map(item => ({ ...item, quantity: newOrderQuantities[item.id] }));
        if (itemsForOrder.length > 0 && newOrderTracking.trim()) {
            onCreateOrder(itemsForOrder, newOrderTracking);
            setNewOrderQuantities({});
            setNewOrderTracking('');
        } else {
            alert("Please add at least one item and a tracking number.");
        }
    };
    
    const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING);
    const processedOrders = orders.filter(o => o.status !== OrderStatus.PENDING).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const allOrders = [...orders].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const ordersToDisplay = activeTab === 'pending' ? pendingOrders : activeTab === 'processed' ? processedOrders : allOrders;

    return (
        <div className="p-8">
            {showNewOrderNotification && (
                <div className="bg-teal-100 border-l-4 border-teal-500 text-teal-700 p-4 rounded-md shadow-md mb-6" role="alert">
                    <div className="flex">
                        <div>
                          <p className="font-bold">New Order Received!</p>
                          <p className="text-sm">Check the "Pending Orders" section below.</p>
                        </div>
                        <button onClick={onDismissNotification} className="ml-auto self-start text-teal-500 hover:text-teal-700">&times;</button>
                    </div>
                </div>
            )}
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-teal-500 pb-2">Orders</h2>
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-4">
                            <button onClick={() => setActiveTab('pending')} className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === 'pending' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}>Pending <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{pendingOrders.length}</span></button>
                            <button onClick={() => setActiveTab('processed')} className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === 'processed' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}>Processed <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{processedOrders.length}</span></button>
                            <button onClick={() => setActiveTab('all')} className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === 'all' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}>All <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{allOrders.length}</span></button>
                        </nav>
                    </div>
                    <div className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {ordersToDisplay.length > 0 ? ordersToDisplay.map(order => <OrderCard key={order.id} order={order} onApproveOrder={onApproveOrder} onRejectOrder={onRejectOrder} trackingNumbers={trackingNumbers} onTrackingChange={handleTrackingNumberChange} />) : <p className="text-gray-500 text-center py-10">No orders.</p>}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">Create New Order</h2>
                    <form onSubmit={handleCreateOrderSubmit} className="space-y-4">
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            {MENU_ITEMS.map(item => (
                                <div key={item.id} className="flex justify-between items-center">
                                    <label htmlFor={`item-${item.id}`}>{item.name} (${item.price.toFixed(2)})</label>
                                    <input type="number" id={`item-${item.id}`} min="0" value={newOrderQuantities[item.id] || ''} onChange={(e) => setNewOrderQuantities(prev => ({...prev, [item.id]: parseInt(e.target.value, 10) || 0}))} className="w-20 px-2 py-1 border rounded-md"/>
                                </div>
                            ))}
                        </div>
                        <div>
                           <label htmlFor="new-order-tracking" className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                           <input type="text" id="new-order-tracking" value={newOrderTracking} onChange={(e) => setNewOrderTracking(e.target.value)} placeholder="Enter tracking #" required className="w-full px-3 py-2 border rounded-md"/>
                        </div>
                        <button type="submit" className="w-full bg-teal-600 text-white font-bold py-2 px-4 rounded-md hover:bg-teal-700 transition-colors">Create Order</button>
                    </form>
                 </div>
            </div>
        </div>
    );
};

const OrderCard: React.FC<{ order: Order; onApproveOrder: any; onRejectOrder: any; trackingNumbers: any; onTrackingChange: any; }> = ({ order, onApproveOrder, onRejectOrder, trackingNumbers, onTrackingChange }) => {
    const isApproveDisabled = order.status === OrderStatus.PENDING && !trackingNumbers[order.id]?.trim();
    return (
    <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="font-bold text-lg text-gray-800">Order #{order.id.slice(0, 8)}</h3>
                <p className="text-sm text-gray-500">{new Date(order.timestamp).toLocaleString()}</p>
            </div>
            {order.status === OrderStatus.PENDING && <span className="px-3 py-1 text-sm font-semibold text-yellow-800 bg-yellow-100 rounded-full">Pending</span>}
            {order.status === OrderStatus.APPROVED && <span className="px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 rounded-full flex items-center"><CheckCircleIcon className="w-4 h-4 mr-1" /> Approved</span>}
            {order.status === OrderStatus.REJECTED && <span className="px-3 py-1 text-sm font-semibold text-red-800 bg-red-100 rounded-full flex items-center"><XCircleIcon className="w-4 h-4 mr-1" /> Rejected</span>}
        </div>
        <ul className="my-4 border-t border-gray-200 pt-4 space-y-2">
            {order.items.map(item => <li key={item.id} className="flex justify-between"><span>{item.quantity} x {item.name}</span><span>${(item.price * item.quantity).toFixed(2)}</span></li>)}
        </ul>
        <div className="flex justify-between items-center font-bold text-lg border-t border-gray-200 pt-4"><span>Total</span><span>${order.total.toFixed(2)}</span></div>
        {order.trackingNumber && <p className="text-sm text-gray-500 mt-2">Tracking: {order.trackingNumber}</p>}
        {order.status === OrderStatus.PENDING && (
            <div className="mt-6">
                 <input type="text" value={trackingNumbers[order.id] || ''} onChange={(e) => onTrackingChange(order.id, e.target.value)} placeholder="Enter delivery tracking #" className="w-full px-3 py-2 border rounded-md mb-3"/>
                <div className="flex justify-end space-x-3">
                    <button onClick={() => onRejectOrder(order.id)} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"><XCircleIcon className="w-5 h-5 mr-2" /> Reject</button>
                    <button onClick={() => onApproveOrder(order.id, trackingNumbers[order.id])} disabled={isApproveDisabled} className={`flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 ${isApproveDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}><CheckCircleIcon className="w-5 h-5 mr-2" /> Approve</button>
                </div>
            </div>
        )}
    </div>
)};

const UsersView: React.FC<Pick<AdminDashboardProps, 'users' | 'onAddUser'>> = ({ users, onAddUser }) => {
    const [newUserName, setNewUserName] = useState('');
    const [newUserRole, setNewUserRole] = useState<UserRole>(UserRole.CUSTOMER);

    const handleAddUserSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newUserName.trim()) {
            onAddUser(newUserName, newUserRole);
            setNewUserName('');
            setNewUserRole(UserRole.CUSTOMER);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">User Management</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b">Existing Users</h2>
                    <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {users.map(user => (
                            <li key={user.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                                <span>{user.name}</span>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${user.role === UserRole.ADMIN ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'}`}>{user.role}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b">Add New User</h2>
                    <form onSubmit={handleAddUserSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="new-user-name" className="block text-sm font-medium text-gray-700 mb-1">User Name</label>
                            <input type="text" id="new-user-name" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="Enter name" required className="w-full px-3 py-2 border rounded-md" />
                        </div>
                        <div>
                           <label htmlFor="new-user-role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                           <select id="new-user-role" value={newUserRole} onChange={(e) => setNewUserRole(e.target.value as UserRole)} className="w-full px-3 py-2 border rounded-md">
                                <option value={UserRole.CUSTOMER}>Customer</option>
                                <option value={UserRole.ADMIN}>Admin</option>
                           </select>
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700">Add User</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const DeliveryAgentsView: React.FC<Pick<AdminDashboardProps, 'deliveryAgents' | 'onAddDeliveryAgent' | 'onRemoveDeliveryAgent' | 'onUpdateDeliveryAgentStatus'>> = ({ deliveryAgents, onAddDeliveryAgent, onRemoveDeliveryAgent, onUpdateDeliveryAgentStatus }) => {
    const [newAgentName, setNewAgentName] = useState('');
    const [newAgentPhone, setNewAgentPhone] = useState('');
    
    const handleAddAgentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newAgentName.trim() && newAgentPhone.trim()) {
            onAddDeliveryAgent(newAgentName, newAgentPhone);
            setNewAgentName('');
            setNewAgentPhone('');
        }
    };

    const statusColorMap = {
        [DeliveryAgentStatus.AVAILABLE]: 'bg-green-100 text-green-800',
        [DeliveryAgentStatus.ON_DELIVERY]: 'bg-yellow-100 text-yellow-800',
        [DeliveryAgentStatus.OFFLINE]: 'bg-gray-100 text-gray-800',
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Delivery Agents</h1>
            <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b">Add New Agent</h2>
                <form onSubmit={handleAddAgentSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label htmlFor="new-agent-name" className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
                        <input type="text" id="new-agent-name" value={newAgentName} onChange={(e) => setNewAgentName(e.target.value)} placeholder="e.g., John Doe" required className="w-full px-3 py-2 border rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="new-agent-phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input type="tel" id="new-agent-phone" value={newAgentPhone} onChange={(e) => setNewAgentPhone(e.target.value)} placeholder="e.g., 555-123-4567" required className="w-full px-3 py-2 border rounded-md" />
                    </div>
                    <button type="submit" className="w-full bg-teal-600 text-white font-bold py-2 px-4 rounded-md hover:bg-teal-700">Add Agent</button>
                </form>
            </div>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {deliveryAgents.map(agent => (
                            <tr key={agent.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{agent.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agent.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <select value={agent.status} onChange={(e) => onUpdateDeliveryAgentStatus(agent.id, e.target.value as DeliveryAgentStatus)} className={`text-sm rounded-md border-0 focus:ring-2 focus:ring-teal-500 ${statusColorMap[agent.status]}`}>
                                        {Object.values(DeliveryAgentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => onRemoveDeliveryAgent(agent.id)} className="text-red-600 hover:text-red-900">Remove</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const PayrollView: React.FC<Pick<AdminDashboardProps, 'employees' | 'onAddEmployee' | 'onUpdateEmployeeHours' | 'onProcessPayroll' | 'payrollHistory'>> = ({ employees, onAddEmployee, onUpdateEmployeeHours, onProcessPayroll, payrollHistory }) => {
    const [newEmployeeName, setNewEmployeeName] = useState('');
    const [newEmployeeRate, setNewEmployeeRate] = useState('');

    const handleAddEmployee = (e: React.FormEvent) => {
        e.preventDefault();
        const rate = parseFloat(newEmployeeRate);
        if (newEmployeeName.trim() && !isNaN(rate) && rate > 0) {
            onAddEmployee(newEmployeeName, rate);
            setNewEmployeeName('');
            setNewEmployeeRate('');
        }
    };
    
    const totalPayroll = employees.reduce((total, emp) => total + (emp.currentHours * emp.hourlyRate), 0);
    const sortedPayrollHistory = [...payrollHistory].sort((a, b) => new Date(b.paidOn).getTime() - new Date(a.paidOn).getTime());

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Payroll Management</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b">Current Pay Period</h2>
                     <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Pay</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {employees.map(emp => (
                                    <tr key={emp.id}>
                                        <td className="px-4 py-2 whitespace-nowrap">{emp.name}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">${emp.hourlyRate.toFixed(2)}/hr</td>
                                        <td className="px-4 py-2">
                                            <input 
                                                type="number" 
                                                value={emp.currentHours} 
                                                onChange={e => onUpdateEmployeeHours(emp.id, parseFloat(e.target.value) || 0)} 
                                                className="w-20 px-2 py-1 border rounded-md" 
                                                min="0"
                                            />
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap font-medium">${(emp.hourlyRate * emp.currentHours).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50">
                                <tr>
                                    <td colSpan={3} className="px-4 py-2 text-right font-bold">Total:</td>
                                    <td className="px-4 py-2 font-bold">${totalPayroll.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <button onClick={onProcessPayroll} className="w-full mt-4 bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700">Process Payroll</button>
                </div>
                 <div>
                    <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">Add Employee</h2>
                        <form onSubmit={handleAddEmployee} className="space-y-3">
                            <input type="text" value={newEmployeeName} onChange={e => setNewEmployeeName(e.target.value)} placeholder="Name" required className="w-full px-3 py-2 border rounded-md" />
                            <input type="number" value={newEmployeeRate} onChange={e => setNewEmployeeRate(e.target.value)} placeholder="Hourly Rate" required className="w-full px-3 py-2 border rounded-md" min="0" step="0.01" />
                            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700">Add</button>
                        </form>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">Payroll History</h2>
                        <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {sortedPayrollHistory.map(record => (
                                <li key={record.id} className="text-sm p-2 bg-gray-50 rounded">
                                    <p className="font-medium">{record.employeeName} - ${record.totalPay.toFixed(2)}</p>
                                    <p className="text-xs text-gray-500">Paid on {new Date(record.paidOn).toLocaleDateString()}</p>
                                </li>
                            ))}
                            {payrollHistory.length === 0 && <p className="text-xs text-gray-400">No history yet.</p>}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SettingsView: React.FC<Pick<AdminDashboardProps, 'systemSettings' | 'onUpdateSettings'>> = ({ systemSettings, onUpdateSettings }) => {
    const [localSettings, setLocalSettings] = useState<SystemSettings>(systemSettings);

    useEffect(() => { setLocalSettings(systemSettings); }, [systemSettings]);
    
    const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setLocalSettings(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    const handleSettingsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateSettings(localSettings);
        alert("Settings saved!");
    };
    
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
             <div className="max-w-xl mx-auto">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b">System Settings</h2>
                    <form onSubmit={handleSettingsSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="cafeName" className="block text-sm font-medium text-gray-700 mb-1">Cafe Name</label>
                            <input type="text" name="cafeName" id="cafeName" value={localSettings.cafeName} onChange={handleSettingsChange} className="w-full px-3 py-2 border rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="welcomeMessage" className="block text-sm font-medium text-gray-700 mb-1">Welcome Message</label>
                            <textarea name="welcomeMessage" id="welcomeMessage" value={localSettings.welcomeMessage} onChange={handleSettingsChange} rows={3} className="w-full px-3 py-2 border rounded-md"></textarea>
                        </div>
                        <div>
                            <label htmlFor="operatingHours" className="block text-sm font-medium text-gray-700 mb-1">Operating Hours</label>
                            <input type="text" name="operatingHours" id="operatingHours" value={localSettings.operatingHours} onChange={handleSettingsChange} className="w-full px-3 py-2 border rounded-md" />
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700">Save Settings</button>
                    </form>
                </div>
             </div>
        </div>
    );
};


const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
  const [view, setView] = useState<AdminView>('dashboard');

  const renderView = () => {
    switch(view) {
        case 'dashboard': return <DashboardView {...props} />;
        case 'users': return <UsersView {...props} />;
        case 'agents': return <DeliveryAgentsView {...props} />;
        case 'payroll': return <PayrollView {...props} />;
        case 'settings': return <SettingsView {...props} />;
        default: return <DashboardView {...props} />;
    }
  }

  return (
    <div className="flex h-full w-full bg-gray-50 rounded-lg shadow-2xl overflow-hidden">
      <Sidebar activeView={view} setView={setView} />
      <main className="flex-1 overflow-y-auto">
        {renderView()}
      </main>
    </div>
  );
};

export default AdminDashboard;