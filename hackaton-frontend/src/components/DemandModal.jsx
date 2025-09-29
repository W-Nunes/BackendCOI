import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://backendcoi.onrender.com';

// Função para calcular dias úteis, como no seu protótipo
function calculateBusinessDays(startDate, daysToAdd) {
    let count = 0;
    const curDate = new Date(startDate.getTime());
    while (count < daysToAdd) {
        curDate.setDate(curDate.getDate() + 1);
        const dayOfWeek = curDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { count++; }
    }
    return curDate;
}

export default function DemandModal({ isOpen, onClose, contact }) {
  // Estados para todos os campos do formulário
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [address, setAddress] = useState('');
  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState('baixa');
  const [dueDate, setDueDate] = useState('');
  const [attachments, setAttachments] = useState([]); // NOVO: Estado para os anexos
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null); // NOVO: Referência para o input de arquivo

  // Efeito para calcular a data de resolução automaticamente
  useEffect(() => {
    if (!startDate) return;
    const dateObj = new Date(startDate + 'T00:00:00');
    
    // LÓGICA DE PRAZO ATUALIZADA
    let daysToAdd = 0;
    if (priority === 'alta') daysToAdd = 3;
    else if (priority === 'media') daysToAdd = 7;
    else if (priority === 'baixa') daysToAdd = 15;

    if (daysToAdd > 0) {
      const newDueDate = calculateBusinessDays(dateObj, daysToAdd);
      setDueDate(newDueDate.toLocaleDateString('pt-BR'));
    }
  }, [startDate, priority]);
  
  const handleClose = () => {
      // Limpa o formulário ao fechar
      setName('');
      setStartDate(new Date().toISOString().split('T')[0]);
      setAddress('');
      setReason('');
      setPriority('baixa');
      setAttachments([]);
      onClose();
  }

  const handleFileChange = (event) => {
      setAttachments(Array.from(event.target.files));
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    const demandDetails = {
        title: reason,
        recipient: contact.name,
        startDate,
        dueDate,
        address,
        priority,
        // Apenas para simulação, enviaríamos os arquivos de outra forma
        attachmentsInfo: attachments.map(f => ({ name: f.name, size: f.size }))
    };
    
    try {
        await axios.post(`${API_BASE_URL}/demands`, demandDetails);
        alert(`Demanda para ${contact.name} enviada com sucesso!`);
        handleClose();
    } catch (error) {
        console.error("Erro ao enviar demanda:", error);
        alert("Falha ao enviar demanda.");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Enviar Demanda">
      <p className="text-sm text-gray-600 mb-4 -mt-4">
        Para: <span className="font-semibold">{contact.name}</span>
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="demand-name" className="block text-sm font-medium text-gray-700">Nome (Opcional)</label>
                <input type="text" id="demand-name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
                <label htmlFor="demand-date" className="block text-sm font-medium text-gray-700">Data de Início</label>
                <input type="date" id="demand-date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
        </div>
        <div>
            <label htmlFor="demand-address" className="block text-sm font-medium text-gray-700">Endereço (Opcional)</label>
            <input type="text" id="demand-address" value={address} onChange={e => setAddress(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
        </div>
        <div>
            <label htmlFor="demand-reason" className="block text-sm font-medium text-gray-700">Razão / Motivo</label>
            <textarea id="demand-reason" rows="3" value={reason} onChange={e => setReason(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label htmlFor="demand-priority" className="block text-sm font-medium text-gray-700">Prioridade</label>
                <select id="demand-priority" value={priority} onChange={e => setPriority(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md">
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-500">Data Estimada para Resolução</label>
                <div className="mt-1 text-sm font-semibold text-gray-800 bg-gray-100 px-3 py-2 rounded-md h-10 flex items-center">{dueDate}</div>
            </div>
        </div>
        {/* NOVO CAMPO DE ANEXOS */}
        <div>
            <label className="block text-sm font-medium text-gray-700">Anexos</label>
            <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} />
            <button type="button" onClick={() => fileInputRef.current.click()} className="mt-1 w-full flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-gray-400 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                Adicionar arquivos
            </button>
            <div className="mt-2 text-xs text-gray-600 space-y-1">
                {attachments.map((file, index) => <div key={index} className="truncate">{file.name}</div>)}
            </div>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={handleClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold">Cancelar</button>
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-blue-300">
            {isSubmitting ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}