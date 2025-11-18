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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

  const EMOJI_LIST = [
    '😀', '😂', '😍', '🤔', '👍', '❤️', '🎉', '🔥', '👋', '😢', '🙏', '💯',
    '😊', '🥳', '😎', '😭', '🤯', '😱', '🙄', '🙌', '😮', '💀', '🚀', '👀'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isBotTyping]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (
            showEmojiPicker &&
            emojiPickerRef.current &&
            !emojiPickerRef.current.contains(event.target as Node) &&
            emojiButtonRef.current &&
            !emojiButtonRef.current.contains(event.target as Node)
        ) {
            setShowEmojiPicker(false);
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
}, [showEmojiPicker]);

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

  const handleEmojiSelect = (emoji: string) => {
    setInputValue(prev => prev + emoji);
    setShowEmojiPicker(false);
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
                 <div className="flex justify-center w-full my-2">
                    {typeof msg.text === 'string' ? (
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1.5 rounded-full">{msg.text}</span>
                    ) : (
                        msg.text
                    )}
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
      <footer className="relative bg-gray-100 p-4 border-t border-gray-200">
        {showEmojiPicker && (
            <div 
            ref={emojiPickerRef} 
            className="absolute bottom-full mb-2 left-0 md:left-auto bg-white p-3 rounded-xl shadow-lg border z-20"
            style={{ width: '300px' }}
            >
                <div className="grid grid-cols-8 gap-1">
                    {EMOJI_LIST.map(emoji => (
                        <button
                            key={emoji}
                            onClick={() => handleEmojiSelect(emoji)}
                            className="text-2xl p-1 rounded-lg hover:bg-gray-100 transition-colors"
                            title={emoji}
                            aria-label={emoji}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>
        )}
        <div className="flex items-center space-x-3">
          <button onClick={handleShowMenu} className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-full hover:bg-gray-50 flex-shrink-0">View Menu</button>
          <div className="relative flex-1">
              <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="w-full p-3 pl-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                  ref={emojiButtonRef}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-teal-600 rounded-full"
                  aria-label="Add emoji"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
              </button>
          </div>
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