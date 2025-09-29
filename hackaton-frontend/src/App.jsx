import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CitizensPage from './pages/CitizensPage';
import SportsPage from './pages/SportsPage';

// Importe as telas principais
import DepartmentScreen from './pages/DepartmentScreen';
import LoginScreen from './pages/LoginScreen';

// Importe o NOVO layout e as páginas internas
import DashboardLayout from './components/layouts/DashboardLayout';
import ExamsPage from './pages/ExamsPage';
import ContactsPage from './pages/ContactsPage';
import KanbanPage from './pages/KanbanPage';
import ReportsPage from './pages/ReportsPage';

function App() {
  return (
    <div>
      <Router>
        <Routes>
          {/* Rotas Iniciais */}
          <Route path="/" element={<Navigate to="/selecao" />} />
          <Route path="/selecao" element={<DepartmentScreen />} />
          <Route path="/login/:department" element={<LoginScreen />} />
          
          {/* Rota do Dashboard com Layout e Páginas Aninhadas */}
          <Route path="/dashboard/:department" element={<DashboardLayout />}>
            {/* A primeira rota aninhada será a padrão */}
            <Route index element={<Navigate to="contatos" replace />} /> 
            <Route path="exames" element={<ExamsPage />} />
            <Route path="cidadaos" element={<CitizensPage />} />
            <Route path="contatos" element={<ContactsPage />} />
            <Route path="encaminhamentos" element={<KanbanPage />} />
            <Route path="relatorios" element={<ReportsPage />} />
            <Route path="projetos" element={<SportsPage />} /> // NOVA ROTA
          </Route>

        </Routes>
      </Router>
    </div>
  );
}

export default App;