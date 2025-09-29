import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../components/Modal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://backendcoi.onrender.com';

// Formulário ATUALIZADO com a busca de cidadãos
function ExamForm({ onClose, onExamCreated }) {
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Efeito que busca cidadãos na API enquanto o usuário digita
  useEffect(() => {
    // Se não há termo de busca ou se um cidadão já foi selecionado, limpa os resultados
    if (!searchTerm || selectedCitizen) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/citizens?search=${searchTerm}`);
        setSearchResults(response.data);
      } catch (error) {
        console.error("Erro ao buscar cidadãos:", error);
      }
    }, 300); // Pequeno delay para não fazer uma busca a cada tecla

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedCitizen]);

  const handleSelectCitizen = (citizen) => {
    setSelectedCitizen(citizen);
    setSearchTerm(citizen.name); // Preenche o input com o nome do cidadão
    setSearchResults([]); // Esconde a lista de resultados
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedCitizen) {
      alert("Por favor, selecione um cidadão da lista.");
      return;
    }
    setIsSubmitting(true);
    try {
      await axios.post(`${API_BASE_URL}/solicitacoes-exame`, { 
        patientName: selectedCitizen.name,
        citizenId: selectedCitizen.id,
        description 
      });
      onExamCreated();
      onClose();
    } catch (error) {
      console.error("Erro ao criar exame:", error);
      alert('Falha ao enviar solicitação.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <label htmlFor="patientName" className="block text-sm font-medium text-gray-700">Nome do Paciente</label>
        <input 
          type="text" 
          id="patientName" 
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setSelectedCitizen(null); // Limpa a seleção se o usuário voltar a digitar
          }}
          required 
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Comece a digitar para buscar..."
        />
        {searchResults.length > 0 && (
          <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-48 overflow-y-auto">
            {searchResults.map(citizen => (
              <div key={citizen.id} onClick={() => handleSelectCitizen(citizen)} className="p-2 hover:bg-gray-100 cursor-pointer">
                <p className="font-semibold">{citizen.name}</p>
                <p className="text-sm text-gray-500">{citizen.cpf}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Prontuário e Sintomas</label>
        <textarea id="description" rows="5" value={description} onChange={(e) => setDescription(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg font-semibold">Cancelar</button>
        <button type="submit" disabled={isSubmitting || !selectedCitizen} className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold disabled:bg-red-300">
          {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
        </button>
      </div>
    </form>
  );
}

// O resto do componente ExamsPage continua igual...
function getPriorityTag(score) {
    if (score > 15) return <span className="px-2 py-1 text-xs font-semibold text-white bg-red-600 rounded-full">Prioridade Alta</span>;
    if (score > 7) return <span className="px-2 py-1 text-xs font-semibold text-black bg-yellow-400 rounded-full">Prioridade Média</span>;
    return <span className="px-2 py-1 text-xs font-semibold text-white bg-green-600 rounded-full">Prioridade Normal</span>;
}

export default function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchExams = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/solicitacoes-exame`);
      setExams(response.data);
    } catch (error) {
      console.error("Falha ao buscar exames:", error);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  return (
    <div className="p-4 sm:p-6">
      <div className="flex-shrink-0 mb-4">
        <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold shadow">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
          Solicitar Novo Exame
        </button>
      </div>
      <main className="space-y-3">
        {exams.length > 0 ? exams.map(exam => (
          <div key={exam.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{exam.patientName}</h3>
                <p className="text-sm text-gray-600 mt-1">{exam.description}</p>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                {getPriorityTag(exam.priorityScore)}
                <p className="text-xs text-gray-500 mt-1">Score: {exam.priorityScore}</p>
                <p className="text-xs text-gray-500 mt-1">Criado em: {new Date(exam.createdAt).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </div>
        )) : <p className="text-center text-gray-500 pt-8">Nenhuma solicitação de exame encontrada.</p>}
      </main>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Solicitar Novo Exame">
        <ExamForm onClose={() => setIsModalOpen(false)} onExamCreated={fetchExams} />
      </Modal>
    </div>
  );
}