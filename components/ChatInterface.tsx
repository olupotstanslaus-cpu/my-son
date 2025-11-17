
import React, { useState, useRef, useEffect } from 'react';
import { Message, MessageSender, MenuItem } from '../types';
import UserIcon from './icons/UserIcon';
import BotIcon from './icons/BotIcon';
import { MENU_ITEMS } from '../constants';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isBotTyping: boolean;
}

const MenuCard: React.FC<{ item: MenuItem }> = ({ item }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-xs my-2">
        <img src={item.image} alt={item.name} className="w-full h-32 object-cover"/>
        <div className="p-4">
            <h3 className="font-bold text-lg">{item.name}</h3>
            <p className="text-gray-600 text-sm mb-2">{item.description}</p>
            <p className="text-teal-600 font-semibold">${item.price.toFixed(2)}</p>
        </div>
    </div>
);


const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isBotTyping }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isBotTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSendClick = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendClick();
    }
  };
  
  const handleShowMenu = () => {
    onSendMessage("Show me the menu");
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto bg-white shadow-2xl rounded-lg overflow-hidden">
      {/* Header */}
      <header className="bg-teal-600 text-white p-4 flex items-center shadow-md z-10">
        <BotIcon className="h-10 w-10 mr-4"/>
        <div>
          <h1 className="text-xl font-bold">Stanley's Cafe</h1>
          <p className="text-sm opacity-90">Online</p>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 p-6 overflow-y-auto bg-gray-200" style={{ backgroundImage: `url('https://i.pinimg.com/736x/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg')` }}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-end gap-3 ${msg.sender === MessageSender.USER ? 'justify-end' : 'justify-start'}`}>
              {msg.sender !== MessageSender.USER && <BotIcon className="h-8 w-8 text-gray-400" />}
              {msg.sender === MessageSender.SYSTEM ? (
                 <div className="text-center w-full my-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1.5 rounded-full">{msg.text}</span>
                 </div>
              ) : (
                <div className={`rounded-xl px-4 py-2 max-w-md shadow-sm ${msg.sender === MessageSender.USER ? 'bg-green-100 text-gray-800' : 'bg-white text-gray-800'}`}>
                    <p className="text-sm">{msg.text}</p>
                    <span className="text-xs text-gray-400 block text-right mt-1">{msg.timestamp}</span>
                </div>
              )}
               {msg.sender === MessageSender.USER && <UserIcon className="h-8 w-8 text-gray-400" />}
            </div>
          ))}
          {isBotTyping && (
            <div className="flex items-end gap-3 justify-start">
               <BotIcon className="h-8 w-8 text-gray-400"/>
              <div className="rounded-xl px-4 py-3 bg-white shadow-sm">
                <div className="flex items-center justify-center space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="bg-gray-100 p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <button onClick={handleShowMenu} className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-full hover:bg-gray-50">View Menu</button>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={handleSendClick}
            className="bg-teal-600 text-white rounded-full p-3 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-transform duration-150 transform active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ChatInterface;
