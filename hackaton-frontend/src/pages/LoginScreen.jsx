import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function LoginScreen() {
  const navigate = useNavigate();
  const { department } = useParams(); // Pega o slug do departamento da URL, ex: "saude"

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Converte o slug da URL para um nome amigável
  const departmentName = department
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());

  const handleLogin = (event) => {
    event.preventDefault();
    // Por enquanto, qualquer login nos leva para o dashboard
    // No futuro, aqui faremos a chamada para a API de autenticação
    console.log('Tentando logar em', department, 'com usuário', username);
    navigate(`/dashboard/${department}`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">Login</h2>
          <p className="mt-2 text-sm text-gray-600">
            Acesso para: <span className="font-semibold">{departmentName}</span>
          </p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Usuário</label>
            <input 
              id="username" 
              type="text" 
              required 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
            <input 
              id="password" 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div className="flex items-center justify-between gap-4 pt-2">
            <button type="button" onClick={() => navigate('/selecao')} className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Voltar
            </button>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}