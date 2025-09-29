import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../components/Modal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://backendcoi.onrender.com';

// Formulário para criar/editar cidadão
function CitizenForm({ onClose, onCitizenCreated }) {
  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const citizenData = Object.fromEntries(formData.entries());
    try {
      await axios.post(`${API_BASE_URL}/citizens`, citizenData);
      onCitizenCreated();
      onClose();
    } catch (error) {
      // LÓGICA MELHORADA DE ERRO
      if (error.response && error.response.data && error.response.data.error) {
        // Mostra a mensagem de erro específica vinda do backend (ex: "CPF já cadastrado")
        alert(error.response.data.error);
      } else {
        // Mensagem genérica se o erro for outro
        alert("Ocorreu um erro ao salvar.");
      }
      console.error("Erro ao salvar cidadão:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">Nome Completo</label>
        <input type="text" name="name" id="name" required className="mt-1 block w-full border border-gray-300 rounded-md p-2"/>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="cpf" className="block text-sm font-medium">CPF</label>
          <input type="text" name="cpf" id="cpf" required className="mt-1 block w-full border border-gray-300 rounded-md p-2"/>
        </div>
        <div>
          <label htmlFor="rg" className="block text-sm font-medium">RG</label>
          <input type="text" name="rg" id="rg" className="mt-1 block w-full border border-gray-300 rounded-md p-2"/>
        </div>
      </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="birthCity" className="block text-sm font-medium">Cidade de Nascimento</label>
          <input type="text" name="birthCity" id="birthCity" className="mt-1 block w-full border border-gray-300 rounded-md p-2"/>
        </div>
        <div>
          <label htmlFor="birthDate" className="block text-sm font-medium">Data de Nascimento</label>
          <input type="date" name="birthDate" id="birthDate" required className="mt-1 block w-full border border-gray-300 rounded-md p-2"/>
        </div>
      </div>
      <div>
        <label htmlFor="birthHealthUnit" className="block text-sm font-medium">Unidade de Saúde de Nascimento</label>
        <input type="text" name="birthHealthUnit" id="birthHealthUnit" className="mt-1 block w-full border border-gray-300 rounded-md p-2"/>
      </div>
       <div>
        <label htmlFor="motherName" className="block text-sm font-medium">Nome da Mãe</label>
        <input type="text" name="motherName" id="motherName" required className="mt-1 block w-full border border-gray-300 rounded-md p-2"/>
      </div>
       <div>
        <label htmlFor="fatherName" className="block text-sm font-medium">Nome do Pai</label>
        <input type="text" name="fatherName" id="fatherName" className="mt-1 block w-full border border-gray-300 rounded-md p-2"/>
      </div>
      <div>
        <label htmlFor="address" className="block text-sm font-medium">Endereço</label>
        <input type="text" name="address" id="address" required className="mt-1 block w-full border border-gray-300 rounded-md p-2"/>
      </div>
      <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white py-4">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg font-semibold">Cancelar</button>
        <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold">Salvar Cidadão</button>
      </div>
    </form>
  );
}


export default function CitizensPage() {
  const [citizens, setCitizens] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCitizens = async () => {
    const response = await axios.get(`${API_BASE_URL}/citizens`);
    setCitizens(response.data);
  };

  useEffect(() => {
    fetchCitizens();
  }, []);

  return (
    <div className="p-4 sm:p-6">
      <div className="flex-shrink-0 mb-4">
        <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold shadow">
          Cadastrar Novo Cidadão
        </button>
      </div>
      <main className="bg-white p-4 rounded-lg shadow-sm border">
        <h2 class="text-lg font-bold mb-4">Cidadãos Cadastrados</h2>
        <div className="space-y-3">
          {citizens.map(citizen => (
            <div key={citizen.id} className="p-3 border-b grid grid-cols-3 gap-4">
              <span className="font-semibold">{citizen.name}</span>
              <span className="text-gray-600">{citizen.cpf}</span>
              <span className="text-gray-600">{new Date(citizen.birthDate).toLocaleDateString('pt-BR')}</span>
            </div>
          ))}
        </div>
      </main>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Cadastrar Novo Cidadão">
        <CitizenForm onClose={() => setIsModalOpen(false)} onCitizenCreated={fetchCitizens} />
      </Modal>
    </div>
  );
}