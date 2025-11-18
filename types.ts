// Fix: Import React to use React.ReactNode type.
import React from 'react';

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export enum MessageSender {
  USER = 'USER',
  BOT = 'BOT',
  SYSTEM = 'SYSTEM',
}

export interface Message {
  id: number;
  text: string | React.ReactNode;
  sender: MessageSender;
  timestamp: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

export interface OrderItem extends MenuItem {
  quantity: number;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  timestamp: string;
  trackingNumber?: string;
}

export interface SystemSettings {
  cafeName: string;
  welcomeMessage: string;
  operatingHours: string;
}

export enum DeliveryAgentStatus {
  AVAILABLE = 'Available',
  ON_DELIVERY = 'On Delivery',
  OFFLINE = 'Offline',
}

export interface DeliveryAgent {
  id: string;
  name: string;
  phone: string;
  status: DeliveryAgentStatus;
}

export interface Employee {
  id: string;
  name: string;
  hourlyRate: number;
  currentHours: number;
}

export enum PayrollStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  hoursWorked: number;
  rate: number;
  totalPay: number;
  payPeriod: string; // e.g., "2024-07-15 - 2024-07-21"
  paidOn: string;
}

export interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  products: string[];
}