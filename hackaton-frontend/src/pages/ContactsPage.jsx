import React, { useState, useMemo } from 'react';
import DemandModal from '../components/DemandModal';
import ChatView from '../components/ChatView';

// Dados mockados do seu protótipo original para agilidade
const contactsData = [
    { id: 1, name: 'Felipe Augusto', position: 'Secretário da Saúde', schedule: 'seg a sex | 07h - 17h', avatar: '⭐', avatarBg: 'bg-red-100' },
    { id: 2, name: 'Eduardo Romano', position: 'Enfermeiro Responsável', schedule: 'seg a sex | 13h - 20h', avatar: '😊', avatarBg: 'bg-red-100' },
    { id: 3, name: 'Mariana Lima', position: 'Diretora Pedagógica', schedule: 'seg a sex | 08h - 18h', avatar: '📚', avatarBg: 'bg-blue-100' },
    { id: 4, name: 'Carlos Souza', position: 'Coordenador de Projetos', schedule: 'seg a sex | 09h - 17h', avatar: '🧑‍🏫', avatarBg: 'bg-blue-100' },
    { id: 5, name: 'Ricardo Alves', position: 'Técnico Desportivo', schedule: 'ter a sab | 10h - 19h', avatar: '🏀', avatarBg: 'bg-green-100' },
    { id: 6, name: 'Beatriz Costa', position: 'Gerente de Eventos', schedule: 'seg a sex | 09h - 18h', avatar: '🏆', avatarBg: 'bg-green-100' },
    { id: 7, name: 'Júlia Martins', position: 'Assistente Social', schedule: 'seg a sex | 08h - 17h', avatar: '🤝', avatarBg: 'bg-purple-100' },
    { id: 8, name: 'Ana Clara', position: 'Técnico de Suporte TI', schedule: 'seg a sex | 09h - 18h', avatar: '👩‍💻', avatarBg: 'bg-indigo-100' }
];

export default function ContactsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [activeChat, setActiveChat] = useState(null);

  const filteredContacts = useMemo(() => 
    contactsData.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.position.toLowerCase().includes(searchTerm.toLowerCase())
    ), [searchTerm]);

  const handleOpenDemandModal = (contact) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
  };

  const handleChat = (contact) => {
    setActiveChat(contact);
  };

  // --- LÓGICA ADICIONADA ---
  // Se um chat está ativo, mostramos a tela de chat e paramos a execução aqui.
  if (activeChat) {
    return <ChatView contact={activeChat} onClose={() => setActiveChat(null)} />;
  }

  // Se nenhum chat estiver ativo, o código continua e mostra a lista de contatos.
  return (
    // Usamos um fragmento <> para agrupar os elementos sem adicionar um <div> extra
    <>
      <div className="p-4 sm:p-6 h-full flex flex-col">
        <div className="flex-shrink-0 mb-4">
          <input 
            type="text"
            placeholder="Buscar por nome ou cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        
        <main className="flex-grow overflow-y-auto space-y-3 pr-2">
          {filteredContacts.map(contact => (
            <div key={contact.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full ${contact.avatarBg} flex items-center justify-center text-3xl flex-shrink-0`}>{contact.avatar}</div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{contact.name}</h3>
                  <p className="text-sm text-gray-600">{contact.position}</p>
                  <p className="text-xs text-gray-500 mt-1">{contact.schedule}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => handleChat(contact)} className="bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300">Chat</button>
                <button onClick={() => handleOpenDemandModal(contact)} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700">Enviar Demanda</button>
              </div>
            </div>
          ))}
        </main>
      </div>

      {selectedContact && (
        <DemandModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          contact={selectedContact}
        />
      )}
    </>
  );
}