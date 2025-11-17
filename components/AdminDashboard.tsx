
import React from 'react';
import { Order, OrderStatus } from '../types';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';

interface AdminDashboardProps {
  orders: Order[];
  onApproveOrder: (orderId: string) => void;
  onRejectOrder: (orderId: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ orders, onApproveOrder, onRejectOrder }) => {
  const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING);
  const processedOrders = orders.filter(o => o.status !== OrderStatus.PENDING);

  const OrderCard: React.FC<{ order: Order }> = ({ order }) => (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6 transition-transform hover:scale-105 duration-300">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="font-bold text-xl text-gray-800">Order #{order.id.slice(0, 8)}</h3>
                <p className="text-sm text-gray-500">{new Date(order.timestamp).toLocaleString()}</p>
            </div>
            {order.status === OrderStatus.PENDING && (
                <span className="px-3 py-1 text-sm font-semibold text-yellow-800 bg-yellow-100 rounded-full">Pending</span>
            )}
            {order.status === OrderStatus.APPROVED && (
                <span className="px-3 py-1 text-sm font-semibold text-green-800 bg-green-100 rounded-full flex items-center">
                    <CheckCircleIcon className="w-4 h-4 mr-1" /> Approved
                </span>
            )}
             {order.status === OrderStatus.REJECTED && (
                <span className="px-3 py-1 text-sm font-semibold text-red-800 bg-red-100 rounded-full flex items-center">
                    <XCircleIcon className="w-4 h-4 mr-1" /> Rejected
                </span>
            )}
        </div>
        <div className="my-4 border-t border-gray-200"></div>
        <ul className="space-y-2">
            {order.items.map(item => (
                <li key={item.id} className="flex justify-between items-center text-gray-700">
                    <span>{item.quantity} x {item.name}</span>
                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                </li>
            ))}
        </ul>
        <div className="my-4 border-t border-gray-200"></div>
        <div className="flex justify-between items-center font-bold text-lg">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
        </div>
        {order.status === OrderStatus.PENDING && (
            <div className="flex justify-end space-x-3 mt-6">
                <button 
                    onClick={() => onRejectOrder(order.id)}
                    className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                >
                    <XCircleIcon className="w-5 h-5 mr-2" /> Reject
                </button>
                <button 
                    onClick={() => onApproveOrder(order.id)}
                    className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                >
                    <CheckCircleIcon className="w-5 h-5 mr-2" /> Approve
                </button>
            </div>
        )}
    </div>
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 w-full max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-teal-500 pb-2">Pending Orders</h2>
                {pendingOrders.length > 0 ? (
                    pendingOrders.map(order => <OrderCard key={order.id} order={order} />)
                ) : (
                    <div className="text-center py-10 bg-white rounded-lg shadow">
                        <p className="text-gray-500">No pending orders right now.</p>
                    </div>
                )}
            </div>
            <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">Order History</h2>
                {processedOrders.length > 0 ? (
                    processedOrders.map(order => <OrderCard key={order.id} order={order} />)
                ) : (
                    <div className="text-center py-10 bg-white rounded-lg shadow">
                        <p className="text-gray-500">No processed orders yet.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default AdminDashboard;
