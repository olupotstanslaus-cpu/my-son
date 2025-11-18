
import React, { useState, useCallback, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import AdminDashboard from './components/AdminDashboard';
import { Message, Order, OrderStatus, MessageSender, User, UserRole, OrderItem, SystemSettings, DeliveryAgent, DeliveryAgentStatus, Employee, PayrollRecord } from './types';
import { getChatbotResponse, createOrderFromFunctionCall, GeminiResponse } from './services/geminiService';
import OrderStatusUpdate from './components/OrderStatusUpdate';
import HomePage from './components/HomePage';
import { loadDatabase, saveDatabase, CafeDatabase } from './services/database';

type View = 'HOME' | 'CUSTOMER' | 'ADMIN';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('HOME');
  const [db, setDb] = useState<CafeDatabase>(loadDatabase());

  const [messages, setMessages] = useState<Message[]>([
    {
        id: 1,
        sender: MessageSender.BOT,
        text: db.systemSettings.welcomeMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  const [isBotTyping, setIsBotTyping] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<{ role: string, parts: { text: string }[] }[]>([]);
  const [showNewOrderNotification, setShowNewOrderNotification] = useState<boolean>(false);

  // Persist DB state to localStorage on any change
  useEffect(() => {
    saveDatabase(db);
  }, [db]);
  
  // Update initial chat message if settings change
  useEffect(() => {
    if (messages.length > 0 && messages[0].id === 1) {
       setMessages(prev => [{ ...prev[0], text: db.systemSettings.welcomeMessage }, ...prev.slice(1)]);
    }
  }, [db.systemSettings.welcomeMessage]);

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
                setDb(prevDb => ({ ...prevDb, orders: [...prevDb.orders, newOrder] }));
                setShowNewOrderNotification(true);
                addMessage(<OrderStatusUpdate order={newOrder} />, MessageSender.SYSTEM);
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

  const handleApproveOrder = (orderId: string, trackingNumber: string) => {
    let updatedOrder: Order | undefined;
    setDb(prevDb => {
        const newOrders = prevDb.orders.map(o => {
            if (o.id === orderId) {
                updatedOrder = { ...o, status: OrderStatus.APPROVED, trackingNumber };
                return updatedOrder;
            }
            return o;
        });
        return { ...prevDb, orders: newOrders };
    });
  
    if (updatedOrder) {
      addMessage(<OrderStatusUpdate order={updatedOrder} />, MessageSender.SYSTEM);
    }
  };

  const handleRejectOrder = (orderId: string) => {
    let updatedOrder: Order | undefined;
    setDb(prevDb => {
        const newOrders = prevDb.orders.map(o => {
            if (o.id === orderId) {
                updatedOrder = { ...o, status: OrderStatus.REJECTED };
                return updatedOrder;
            }
            return o;
        });
        return { ...prevDb, orders: newOrders };
    });
    
    if (updatedOrder) {
        addMessage(<OrderStatusUpdate order={updatedOrder} />, MessageSender.SYSTEM);
    }
  };
  
  const handleAddUser = (name: string, role: UserRole) => {
    const newUser: User = { id: `user-${Date.now()}`, name, role };
    setDb(prevDb => ({ ...prevDb, users: [...prevDb.users, newUser] }));
  };

  const handleCreateOrder = (items: OrderItem[], trackingNumber: string) => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const newOrder: Order = {
        id: `order-${Date.now()}`,
        items,
        total,
        trackingNumber,
        status: OrderStatus.APPROVED,
        timestamp: new Date().toISOString(),
    };
    setDb(prevDb => ({ ...prevDb, orders: [newOrder, ...prevDb.orders] }));
  };

  const handleUpdateSettings = (newSettings: SystemSettings) => setDb(prevDb => ({ ...prevDb, systemSettings: newSettings }));

  const handleAddDeliveryAgent = (name: string, phone: string) => {
    const newAgent: DeliveryAgent = {
      id: `agent-${Date.now()}`, name, phone, status: DeliveryAgentStatus.OFFLINE,
    };
    setDb(prevDb => ({ ...prevDb, deliveryAgents: [...prevDb.deliveryAgents, newAgent] }));
  };

  const handleRemoveDeliveryAgent = (agentId: string) => setDb(prevDb => ({ ...prevDb, deliveryAgents: prevDb.deliveryAgents.filter(a => a.id !== agentId) }));
  const handleUpdateDeliveryAgentStatus = (agentId: string, status: DeliveryAgentStatus) => {
    setDb(prevDb => ({ ...prevDb, deliveryAgents: prevDb.deliveryAgents.map(a => a.id === agentId ? { ...a, status } : a) }));
  };
  
  const handleAddEmployee = (name: string, hourlyRate: number) => {
    const newEmployee: Employee = { id: `emp-${Date.now()}`, name, hourlyRate, currentHours: 0 };
    setDb(prevDb => ({ ...prevDb, employees: [...prevDb.employees, newEmployee] }));
  };

  const handleUpdateEmployeeHours = (employeeId: string, hours: number) => {
    setDb(prevDb => ({ ...prevDb, employees: prevDb.employees.map(e => e.id === employeeId ? { ...e, currentHours: hours } : e) }));
  };

  const handleProcessPayroll = () => {
    const records: PayrollRecord[] = db.employees.map(emp => ({
        id: `pr-${Date.now()}-${emp.id}`,
        employeeId: emp.id,
        employeeName: emp.name,
        hoursWorked: emp.currentHours,
        rate: emp.hourlyRate,
        totalPay: emp.currentHours * emp.hourlyRate,
        payPeriod: new Date().toISOString().split('T')[0],
        paidOn: new Date().toISOString(),
    }));
    setDb(prevDb => ({ 
        ...prevDb, 
        payrollHistory: [...records, ...prevDb.payrollHistory],
        employees: prevDb.employees.map(e => ({ ...e, currentHours: 0 })),
    }));
    alert(`Payroll processed for ${records.length} employees.`);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'HOME':
        return <HomePage onNavigate={(view) => setCurrentView(view as View)} />;
      case 'CUSTOMER':
        return <ChatInterface messages={messages} onSendMessage={handleSendMessage} isBotTyping={isBotTyping} />;
      case 'ADMIN':
        return <AdminDashboard 
                  orders={db.orders} 
                  users={db.users}
                  onApproveOrder={handleApproveOrder} 
                  onRejectOrder={handleRejectOrder}
                  showNewOrderNotification={showNewOrderNotification}
                  onDismissNotification={() => setShowNewOrderNotification(false)}
                  onAddUser={handleAddUser}
                  onCreateOrder={handleCreateOrder}
                  systemSettings={db.systemSettings}
                  onUpdateSettings={handleUpdateSettings}
                  deliveryAgents={db.deliveryAgents}
                  onAddDeliveryAgent={handleAddDeliveryAgent}
                  onRemoveDeliveryAgent={handleRemoveDeliveryAgent}
                  onUpdateDeliveryAgentStatus={handleUpdateDeliveryAgentStatus}
                  employees={db.employees}
                  onAddEmployee={handleAddEmployee}
                  onUpdateEmployeeHours={handleUpdateEmployeeHours}
                  onProcessPayroll={handleProcessPayroll}
                  payrollHistory={db.payrollHistory}
                />;
      default:
        return <HomePage onNavigate={(view) => setCurrentView(view as View)} />;
    }
  };

  const TopBar = () => (
    <div className="bg-violet-600 shadow-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <h1 
            className="text-2xl font-bold cursor-pointer transition-colors text-white hover:text-violet-200"
            onClick={() => setCurrentView('HOME')}
          >
            {db.systemSettings.cafeName}
          </h1>
          <nav className="flex items-center space-x-4 md:space-x-8">
            <button
              onClick={() => setCurrentView('HOME')}
              className={`font-medium transition-colors pb-1 border-b-2 ${currentView === 'HOME' ? 'text-white border-white' : 'text-violet-200 hover:text-white border-transparent'}`}
            >
              Home
            </button>
            <button
              onClick={() => alert(`About Us: ${db.systemSettings.cafeName} has been serving the community with the finest coffee since 2023! We are open ${db.systemSettings.operatingHours}.`)}
              className="text-violet-200 hover:text-white font-medium transition-colors"
            >
              About Us
            </button>
            <button
              onClick={() => alert('Contact us at: contact@stanleys.cafe')}
              className="text-violet-200 hover:text-white font-medium transition-colors"
            >
              Contact Us
            </button>
            <button
              onClick={() => setCurrentView('ADMIN')}
              className={`font-medium transition-colors pb-1 border-b-2 ${currentView === 'ADMIN' ? 'text-white border-white' : 'text-violet-200 hover:text-white border-transparent'}`}
            >
              Admin
            </button>
          </nav>
        </div>
      </div>
    </div>
  );

  return (
    <div className="font-sans antialiased text-gray-800 bg-gray-100 min-h-screen">
      <TopBar />
      <main className="p-4 md:p-6" style={{ height: 'calc(100vh - 76px)' }}>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
