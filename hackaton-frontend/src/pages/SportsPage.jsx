import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Modal from '../components/Modal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://backendcoi.onrender.com';

// --- COMPONENTES DE MODAL ---
function ProjectForm({ onClose, onProjectCreated }) {
    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const projectData = Object.fromEntries(formData.entries());
        try {
            await axios.post(`${API_BASE_URL}/sport-projects`, projectData);
            onProjectCreated();
            onClose();
        } catch (error) { alert("Erro ao salvar projeto."); }
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-sm font-medium">Nome do Projeto/Aula</label><input type="text" name="name" required className="mt-1 block w-full border border-gray-300 rounded-md p-2"/></div>
            <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium">Idade Mínima</label><input type="number" name="minAge" required className="mt-1 block w-full border border-gray-300 rounded-md p-2"/></div>
                <div><label className="block text-sm font-medium">Idade Máxima</label><input type="number" name="maxAge" required className="mt-1 block w-full border border-gray-300 rounded-md p-2"/></div>
            </div>
            <div><label className="block text-sm font-medium">Descrição</label><textarea name="description" rows="3" className="mt-1 block w-full border border-gray-300 rounded-md p-2"></textarea></div>
            <div className="flex justify-end gap-3 pt-4"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Cancelar</button><button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">Salvar Projeto</button></div>
        </form>
    );
}

function EnrollCitizenModal({ project, onClose }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [citizens, setCitizens] = useState([]);
    
    const eligibleCitizens = useMemo(() => {
        return citizens.filter(citizen => {
            const age = new Date().getFullYear() - new Date(citizen.birthDate).getFullYear();
            return age >= project.minAge && age <= project.maxAge;
        });
    }, [citizens, project]);

    useEffect(() => {
        if (!searchTerm) { setCitizens([]); return; }
        const fetchCitizens = async () => {
            const { data } = await axios.get(`${API_BASE_URL}/citizens?search=${searchTerm}`);
            setCitizens(data);
        };
        const timer = setTimeout(fetchCitizens, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleEnroll = async (citizenId) => {
        try {
            await axios.post(`${API_BASE_URL}/enrollments`, { citizenId, sportProjectId: project.id });
            alert("Cidadão matriculado com sucesso!");
            onClose(); // Idealmente, atualizaríamos a contagem na tela principal
        } catch (error) {
            alert(error.response?.data?.error || "Erro ao matricular.");
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`Matricular em ${project.name}`}>
            <div className="space-y-4"><input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar cidadão por nome..." className="w-full p-2 border rounded-md"/>
                <div className="max-h-64 overflow-y-auto">
                    {eligibleCitizens.length > 0 ? eligibleCitizens.map(citizen => (
                        <div key={citizen.id} className="p-2 border-b flex justify-between items-center">
                            <span>{citizen.name}</span>
                            <button onClick={() => handleEnroll(citizen.id)} className="px-3 py-1 bg-green-500 text-white text-sm rounded">Matricular</button>
                        </div>
                    )) : <p className="text-sm text-gray-500 text-center py-4">Nenhum cidadão elegível encontrado.</p>}
                </div>
            </div>
        </Modal>
    );
}

// --- COMPONENTE PRINCIPAL DA PÁGINA ---
export default function SportsPage() {
    const [projects, setProjects] = useState([]);
    const [isProjectModalOpen, setProjectModalOpen] = useState(false);
    const [activeProject, setActiveProject] = useState(null);

    const fetchProjects = async () => {
        const { data } = await axios.get(`${API_BASE_URL}/sport-projects`);
        setProjects(data);
    };

    useEffect(() => { fetchProjects(); }, []);

    return (
        <div className="p-4 sm:p-6">
            <div className="flex-shrink-0 mb-4"><button onClick={() => setProjectModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow">Criar Novo Projeto/Aula</button></div>
            <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                    <div key={project.id} className="bg-white p-4 rounded-lg shadow-sm border">
                        <h3 className="font-bold text-lg text-gray-900">{project.name}</h3>
                        <p className="text-sm text-gray-500 my-2">Faixa Etária: {project.minAge} a {project.maxAge} anos</p>
                        <p className="text-sm text-gray-600">{project.description}</p>
                        <div className="mt-4 pt-4 border-t flex justify-between items-center">
                            <span className="text-sm font-semibold">{project._count.enrollments} matriculados</span>
                            <button onClick={() => setActiveProject(project)} className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700">Vincular Cidadão</button>
                        </div>
                    </div>
                ))}
            </main>
            {isProjectModalOpen && <Modal isOpen={isProjectModalOpen} onClose={() => setProjectModalOpen(false)} title="Criar Novo Projeto"><ProjectForm onClose={() => setProjectModalOpen(false)} onProjectCreated={fetchProjects} /></Modal>}
            {activeProject && <EnrollCitizenModal project={activeProject} onClose={() => setActiveProject(null)} />}
        </div>
    );
}