import React from 'react';
import { Order, OrderStatus } from '../types';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';

const OrderStatusUpdate: React.FC<{ order: Order }> = ({ order }) => {
  const getStatusInfo = () => {
    switch (order.status) {
      case OrderStatus.PENDING:
        return {
          icon: <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center animate-pulse"><div className="w-2 h-2 bg-white rounded-full"></div></div>,
          title: `Order #${order.id.slice(0, 8)} Placed`,
          message: "We've received your order and it's waiting for admin approval.",
          bgColor: 'bg-yellow-50 border border-yellow-200',
          textColor: 'text-yellow-800',
        };
      case OrderStatus.APPROVED:
        return {
          icon: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
          title: `Order #${order.id.slice(0, 8)} Approved!`,
          message: `Great news! Your order is being prepared for delivery.${order.trackingNumber ? ` Tracking: ${order.trackingNumber}` : ''}`,
          bgColor: 'bg-green-50 border border-green-200',
          textColor: 'text-green-800',
        };
      case OrderStatus.REJECTED:
        return {
          icon: <XCircleIcon className="w-6 h-6 text-red-500" />,
          title: `Order #${order.id.slice(0, 8)} Rejected`,
          message: "We're sorry, but your order was rejected. Please contact support for more details.",
          bgColor: 'bg-red-50 border border-red-200',
          textColor: 'text-red-800',
        };
      default:
        return null;
    }
  };

  const statusInfo = getStatusInfo();

  if (!statusInfo) return null;

  return (
    <div className={`p-4 rounded-lg w-full max-w-md ${statusInfo.bgColor}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          {statusInfo.icon}
        </div>
        <div className="flex-1">
          <p className={`font-bold text-sm ${statusInfo.textColor}`}>{statusInfo.title}</p>
          <p className={`text-sm ${statusInfo.textColor} opacity-90`}>{statusInfo.message}</p>
          <div className="mt-3 pt-3 border-t border-gray-200">
             <ul className="text-xs space-y-1">
                {order.items.map(item => (
                    <li key={item.id} className="flex justify-between">
                        <span className={`${statusInfo.textColor} opacity-80`}>{item.quantity} x {item.name}</span>
                        <span className={`${statusInfo.textColor} opacity-80 font-medium`}>${(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                ))}
             </ul>
             <div className="flex justify-between font-bold text-xs mt-2 pt-2 border-t border-gray-200">
                <span className={statusInfo.textColor}>Total</span>
                <span className={statusInfo.textColor}>${order.total.toFixed(2)}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusUpdate;