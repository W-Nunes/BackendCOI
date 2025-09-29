import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';

// --- DADOS SIMULADOS PARA A DEMONSTRAÇÃO ---
const mockDemandsData = [
    { id: 'demand-1', title: 'Verificar necessidade de reforço escolar para aluno Pedro Souza', recipient: 'Mariana Lima (Educação)', dueDate: '15/10/2025', priority: 'media', status: 'TODO' },
    { id: 'demand-2', title: 'Atualizar software antivírus dos computadores', recipient: 'Ana Clara (TI)', dueDate: '30/09/2025', priority: 'media', status: 'IN_PROGRESS' },
    { id: 'demand-3', title: 'Finalizar o planejamento do ano letivo', recipient: 'Equipe Pedagógica', dueDate: '15/09/2025', priority: 'media', status: 'DONE', report: 'Planejamento concluído e calendário de eventos definido.', duration: '22h 5m' },
    { id: 'demand-4', title: 'Organizar festival cultural da escola', recipient: 'Carlos Souza (Educação)', dueDate: '20/11/2025', priority: 'baixa', status: 'TODO' },
    { id: 'demand-5', title: 'Preparar apresentação de resultados', recipient: 'Felipe Augusto', dueDate: '20/09/2025', priority: 'alta', status: 'DONE', report: 'Apresentação finalizada.', duration: '3h 45m' }
];

// --- COMPONENTES AUXILIARES (NÃO PRECISAM DE ALTERAÇÃO) ---
function ReportModal({ isOpen, onClose, demand, onConclude }) {
    const [reportText, setReportText] = useState('');
    if (!isOpen) return null;
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Concluir Demanda com Relatório">
            <form onSubmit={(e) => { e.preventDefault(); onConclude(reportText); }}>
                <p className="text-sm text-gray-600 mb-4 -mt-4">{demand.title}</p>
                <textarea value={reportText} onChange={(e) => setReportText(e.target.value)} rows="5" required className="w-full p-2 border border-gray-300 rounded-md"></textarea>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg font-semibold">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold">Concluir</button>
                </div>
            </form>
        </Modal>
    );
}

function AnalysisModal({ isOpen, onClose, demand }) {
    if (!isOpen) return null;
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Análise de Demanda Concluída">
            <div className="space-y-4">
                <h3 className="font-bold text-lg text-gray-800">{demand.title}</h3>
                <div><label className="text-sm font-medium text-gray-500">Duração</label><p className="font-semibold text-gray-800">{demand.duration || 'N/A'}</p></div>
                <div><label className="text-sm font-medium text-gray-500">Relatório</label><p className="text-base text-gray-700 mt-1 bg-gray-100 p-3 rounded-md">{demand.report || 'N/A'}</p></div>
                <div className="flex justify-end pt-4"><button type="button" onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold">Fechar</button></div>
            </div>
        </Modal>
    );
}

function DraggableCard({ demand }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: demand.id, data: { ...demand } });
    const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
    const priorityClasses = { alta: 'border-red-500', media: 'border-yellow-500', baixa: 'border-blue-500' };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} 
             className={`bg-white p-3 rounded-md shadow-sm border-l-4 ${priorityClasses[demand.priority]} cursor-grab overflow-hidden`}>
             <p className="font-semibold text-gray-800 text-sm mb-2">{demand.title}</p>
            <div className="text-xs text-gray-500 space-y-1">
                <p><strong>Para:</strong> {demand.recipient}</p>
                <p><strong>Prazo:</strong> {demand.dueDate}</p>
            </div>
        </div>
    );
}

function DroppableColumn({ id, title, demands, onCardClick }) {
    const { setNodeRef } = useDroppable({ id });
    return (
        <div ref={setNodeRef} className="bg-gray-100 rounded-lg p-3 flex-1 flex flex-col">
            <h3 className="font-bold text-gray-700 mb-4 px-2">{title}</h3>
            <div className="space-y-3 overflow-y-auto min-h-[100px]">
                {demands.map(demand => (
                    <div key={demand.id} onClick={() => onCardClick(demand, id)}>
                        <DraggableCard demand={demand} />
                    </div>
                ))}
            </div>
        </div>
    );
}


// --- COMPONENTE PRINCIPAL DA PÁGINA KANBAN ---
export default function KanbanPage() {
    const [demands, setDemands] = useState(mockDemandsData);
    const [activeDemand, setActiveDemand] = useState(null);
    const [isReportModalOpen, setReportModalOpen] = useState(false);
    const [isAnalysisModalOpen, setAnalysisModalOpen] = useState(false);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (over && active.data.current?.status !== over.id) {
            const demandId = active.id;
            const newStatus = over.id;
            const demandToMove = active.data.current;

            if (newStatus === 'DONE') {
                setActiveDemand(demandToMove);
                setReportModalOpen(true);
                return;
            }
            setDemands(prev => prev.map(d => d.id === demandId ? { ...d, status: newStatus } : d));
        }
    };
    
    const handleCardClick = (demand, columnId) => {
        if (columnId === 'DONE') {
            setActiveDemand(demand);
            setAnalysisModalOpen(true);
        } else if (columnId === 'IN_PROGRESS') {
            setActiveDemand(demand);
            setReportModalOpen(true);
        }
    };

    const handleConcludeDemand = (reportText) => {
        const duration = "4h 30m";
        const updatedDemand = { ...activeDemand, status: 'DONE', report: reportText, duration };
        
        setReportModalOpen(false);
        setDemands(prev => prev.map(d => d.id === activeDemand.id ? updatedDemand : d));
    };

    const todoDemands = demands.filter(d => d.status === 'TODO');
    const inProgressDemands = demands.filter(d => d.status === 'IN_PROGRESS');
    const doneDemands = demands.filter(d => d.status === 'DONE');

    return (
        <div className="p-4 sm:p-6 h-full">
            <DndContext onDragEnd={handleDragEnd}>
                <div className="flex flex-col md:flex-row gap-6 h-full">
                    <DroppableColumn id="TODO" title="A Fazer" demands={todoDemands} onCardClick={handleCardClick} />
                    <DroppableColumn id="IN_PROGRESS" title="Em Andamento" demands={inProgressDemands} onCardClick={handleCardClick} />
                    <DroppableColumn id="DONE" title="Concluído" demands={doneDemands} onCardClick={handleCardClick} />
                </div>
            </DndContext>
            {activeDemand && (
                <>
                    <ReportModal isOpen={isReportModalOpen} onClose={() => setReportModalOpen(false)} demand={activeDemand} onConclude={handleConcludeDemand} />
                    <AnalysisModal isOpen={isAnalysisModalOpen} onClose={() => setAnalysisModalOpen(false)} demand={activeDemand} />
                </>
            )}
        </div>
    );
}