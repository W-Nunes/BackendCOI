import React from 'react';
import { useParams, useNavigate, NavLink, Outlet } from 'react-router-dom';

export default function DashboardLayout() {
    
  const { department } = useParams();
  const navigate = useNavigate();

  // Converte o slug para um nome amigável para o título
  const departmentName = department
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
    
  const handleLogout = () => {
    navigate('/selecao');
  };

  // Define as abas com base no departamento
  const isHealth = department === 'saude';
  const isSocial = department === 'assistencia-social'; // NOVA LINHA
  const isSports = department === 'esporte'; // NOVA LINHA
  const navColor = isHealth ? 'red' : isSocial ? 'purple' : 'blue'; // LÓGICA ATUALIZADA

  // Estilo para o link da aba ativa
  const activeLinkStyle = {
    color: navColor === 'red' ? '#DC2626' : '#2563EB', // red-600 or blue-600
    borderColor: navColor === 'red' ? '#DC2626' : '#2563EB',
  };

  return (
    <div className="w-full h-screen max-w-6xl mx-auto flex flex-col bg-gray-50 shadow-2xl rounded-2xl overflow-hidden">
      <header className="p-4 border-b border-gray-200 flex-shrink-0 bg-white z-10">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Painel de {departmentName}</h1>
          <button onClick={handleLogout} className="p-2 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600" title="Sair">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
        <div className="mt-4 border-b border-gray-200">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {isHealth && (
              <NavLink 
                to={`/dashboard/${department}/exames`} 
                className="whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm text-gray-500 border-transparent hover:text-gray-700"
                style={({ isActive }) => isActive ? activeLinkStyle : undefined}
              >
                Solicitações de Exame
              </NavLink>
            )}
            <NavLink 
              to={`/dashboard/${department}/contatos`} 
              className="whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm text-gray-500 border-transparent hover:text-gray-700"
              style={({ isActive }) => isActive ? activeLinkStyle : undefined}
            >
              Contatos
            </NavLink>
            <NavLink 
              to={`/dashboard/${department}/encaminhamentos`}
              className="whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm text-gray-500 border-transparent hover:text-gray-700"
              style={({ isActive }) => isActive ? activeLinkStyle : undefined}
            >
              Encaminhamentos
            </NavLink>
             <NavLink 
              to={`/dashboard/${department}/relatorios`} 
              className="whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm text-gray-500 border-transparent hover:text-gray-700"
              style={({ isActive }) => isActive ? activeLinkStyle : undefined}
            >
              Relatórios
            </NavLink>
                {isSocial && ( // NOVA ABA
                    <NavLink 
                        to={`/dashboard/${department}/cidadaos`} 
                        className="whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm text-gray-500 border-transparent hover:text-gray-700"
                        style={({ isActive }) => isActive ? activeLinkStyle : undefined}
                    >
                        Cidadãos
                    </NavLink>
            )}

            {isSports && ( // NOVA ABA
              <NavLink to={`/dashboard/${department}/projetos`} style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm text-gray-500">
                Projetos Esportivos
              </NavLink>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-grow relative overflow-y-auto">
        {/* O Outlet é o espaço onde as páginas (Exames, Contatos, etc.) serão renderizadas */}
        <Outlet />
      </main>
    </div>
  );
}