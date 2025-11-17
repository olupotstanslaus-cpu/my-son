
import { MenuItem, Message, MessageSender } from './types';

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'coffee-001',
    name: 'Espresso',
    price: 3.50,
    image: 'https://picsum.photos/id/225/200/200',
    description: 'A rich and aromatic shot of pure coffee.'
  },
  {
    id: 'coffee-002',
    name: 'Cappuccino',
    price: 4.50,
    image: 'https://picsum.photos/id/30/200/200',
    description: 'Espresso with steamed milk and a deep layer of foam.'
  },
  {
    id: 'pastry-001',
    name: 'Croissant',
    price: 3.00,
    image: 'https://picsum.photos/id/368/200/200',
    description: 'Buttery, flaky, and freshly baked.'
  },
  {
    id: 'sandwich-001',
    name: 'Chicken Club',
    price: 8.50,
    image: 'https://picsum.photos/id/1015/200/200',
    description: 'Grilled chicken, bacon, lettuce, tomato on toasted bread.'
  },
   {
    id: 'salad-001',
    name: 'Caesar Salad',
    price: 7.00,
    image: 'https://picsum.photos/id/25/200/200',
    description: 'Crisp romaine lettuce with Caesar dressing and croutons.'
  }
];

export const INITIAL_BOT_MESSAGE: Message = {
    id: 1,
    sender: MessageSender.BOT,
    text: "Welcome to Stanley's Cafe! I can help you with our menu and take your order. What would you like today?",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};
