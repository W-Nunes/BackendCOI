import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://backendcoi.onrender.com';
const socket = io(API_BASE_URL);

// O ID do usuário logado - para a demo, vamos fixar como "admin"
const CURRENT_USER_ID = 'admin'; 

export default function ChatView({ contact, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messageContainerRef = useRef(null);

  // Cria um nome de "sala" único e ordenado para a conversa entre dois usuários
  const roomName = [CURRENT_USER_ID, contact.id].sort().join('--');

  useEffect(() => {
    // 1. Entra na sala de chat
    socket.emit('join_room', roomName);
    
    // 2. Pede o histórico de mensagens
    socket.emit('request_history', roomName);

    // 3. Ouve por novas mensagens
    socket.on('receive_message', (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });
    
    // 4. Carrega o histórico
    socket.on('load_history', (history) => {
        setMessages(history);
    });

    // Limpeza: sai dos listeners ao fechar o chat
    return () => {
      socket.off('receive_message');
      socket.off('load_history');
    };
  }, [roomName]);

  // Efeito para rolar para a última mensagem
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);


  const handleSendMessage = (event) => {
    event.preventDefault();
    if (newMessage.trim() === '') return;

    const messageData = {
      senderId: CURRENT_USER_ID,
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    // Envia a mensagem para o servidor
    socket.emit('send_message', { roomName, message: messageData });
    setNewMessage('');
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-white z-20">
      <header className="flex items-center p-4 border-b border-gray-200 flex-shrink-0">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 mr-2">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0 ${contact.avatarBg}`}>{contact.avatar}</div>
        <div className="ml-4">
          <h2 className="font-semibold text-lg text-gray-800">{contact.name}</h2>
          <p className="text-sm text-gray-500">{contact.position}</p>
        </div>
      </header>
      
      <div ref={messageContainerRef} className="flex-grow p-6 overflow-y-auto bg-gray-100">
        {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 mb-4 ${msg.senderId === CURRENT_USER_ID ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${msg.senderId === CURRENT_USER_ID ? 'bg-blue-500' : 'bg-gray-400'}`}>
                    {msg.senderId === CURRENT_USER_ID ? 'A' : contact.name.charAt(0)}
                </div>
                <div>
                    <div className={`p-3 rounded-lg shadow-sm max-w-md ${msg.senderId === CURRENT_USER_ID ? 'bg-blue-500 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none'}`}>
                        <p className="text-sm">{msg.text}</p>
                    </div>
                    <span className={`text-xs text-gray-500 mt-1 flex ${msg.senderId === CURRENT_USER_ID ? 'justify-end' : ''}`}>{msg.timestamp}</span>
                </div>
            </div>
        ))}
      </div>
      
      <footer className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} type="text" placeholder="Digite sua mensagem..." className="flex-grow px-4 py-2 border rounded-full"/>
          <button type="submit" className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </form>
      </footer>
    </div>
  );
}