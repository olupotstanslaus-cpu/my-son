
import React, { useState, useCallback } from 'react';
import ChatInterface from './components/ChatInterface';
import AdminDashboard from './components/AdminDashboard';
import { UserRole, Message, Order, OrderStatus, MessageSender } from './types';
import { INITIAL_BOT_MESSAGE } from './constants';
import { getChatbotResponse, createOrderFromFunctionCall, GeminiResponse } from './services/geminiService';

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [messages, setMessages] = useState<Message[]>([INITIAL_BOT_MESSAGE]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isBotTyping, setIsBotTyping] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<{ role: string, parts: { text: string }[] }[]>([]);

  const addMessage = (text: string | React.ReactNode, sender: MessageSender) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        text,
        sender,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleSendMessage = useCallback(async (text: string) => {
    addMessage(text, MessageSender.USER);
    setIsBotTyping(true);
    
    const currentChatHistory = [...chatHistory, { role: 'user', parts: [{ text }] }];

    const geminiResponse: GeminiResponse = await getChatbotResponse(text, chatHistory);
    
    let newHistory = [...currentChatHistory];
    
    if (geminiResponse.functionCall) {
        if (geminiResponse.functionCall.name === 'place_order') {
            try {
                const newOrderData = createOrderFromFunctionCall(geminiResponse.functionCall.args.items);
                const newOrder: Order = {
                    ...newOrderData,
                    id: `order-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    status: OrderStatus.PENDING,
                };
                setOrders(prev => [...prev, newOrder]);
                const orderText = `Order #${newOrder.id.slice(0, 8)} has been placed! You'll be notified once the admin approves it for delivery.`;
                addMessage(orderText, MessageSender.SYSTEM);
                newHistory.push({ role: 'model', parts: [{text: `Order placed successfully. System will notify user.`}] });
            } catch (error) {
                console.error(error);
                addMessage("I'm sorry, there was an error processing your order items. Please try again.", MessageSender.BOT);
                newHistory.push({ role: 'model', parts: [{ text: "Error processing order." }] });
            }
        }
    } else if (geminiResponse.text) {
        addMessage(geminiResponse.text, MessageSender.BOT);
        newHistory.push({ role: 'model', parts: [{ text: geminiResponse.text }] });
    }

    setChatHistory(newHistory);
    setIsBotTyping(false);
  }, [chatHistory]);

  const updateOrderStatus = (orderId: string, status: OrderStatus, message: string) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status } : o))
    );
    addMessage(message, MessageSender.SYSTEM);
  };
  
  const handleApproveOrder = (orderId: string) => {
    updateOrderStatus(orderId, OrderStatus.APPROVED, `Great news! Your order #${orderId.slice(0, 8)} has been approved and is being prepared for delivery.`);
  };

  const handleRejectOrder = (orderId: string) => {
    updateOrderStatus(orderId, OrderStatus.REJECTED, `We're sorry, your order #${orderId.slice(0, 8)} was rejected. Please contact us for details.`);
  };

  const renderContent = () => {
    switch (userRole) {
      case UserRole.CUSTOMER:
        return <ChatInterface messages={messages} onSendMessage={handleSendMessage} isBotTyping={isBotTyping} />;
      case UserRole.ADMIN:
        return <AdminDashboard orders={orders} onApproveOrder={handleApproveOrder} onRejectOrder={handleRejectOrder} />;
      default:
        return null;
    }
  };

  return (
    <div className="font-sans antialiased text-gray-800 bg-gray-100 min-h-screen">
      <div className="bg-white shadow-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3">
                <h1 className="text-2xl font-bold text-teal-600">Stanley's Cafe Order System</h1>
                <div className="flex items-center space-x-2 bg-gray-200 rounded-full p-1">
                <button
                    onClick={() => setUserRole(UserRole.CUSTOMER)}
                    className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${userRole === UserRole.CUSTOMER ? 'bg-white text-teal-600 shadow' : 'text-gray-600'}`}
                >
                    Customer View
                </button>
                <button
                    onClick={() => setUserRole(UserRole.ADMIN)}
                    className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${userRole === UserRole.ADMIN ? 'bg-white text-teal-600 shadow' : 'text-gray-600'}`}
                >
                    Admin View
                </button>
                </div>
            </div>
        </div>
      </div>
      <main className="p-4 md:p-6" style={{ height: 'calc(100vh - 68px)' }}>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
