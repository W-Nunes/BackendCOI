import React from 'react';
import { useNavigate } from 'react-router-dom';

// Dados dos botões
const departments = [
  { name: 'Educação', slug: 'educacao', color: 'blue' },
  { name: 'Esporte', slug: 'esporte', color: 'green' },
  { name: 'Assistência Social', slug: 'assistencia-social', color: 'purple' },
  { name: 'Saúde', slug: 'saude', color: 'red' },
];

// CORREÇÃO: Mapeamento de cores para classes completas do Tailwind
// Agora o Tailwind consegue "ver" os nomes completos das classes e gerar o CSS.
const colorClasses = {
  blue: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
  green: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
  purple: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500',
  red: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
};

export default function DepartmentScreen() {
  const navigate = useNavigate();

  const handleSelectDepartment = (slug) => {
    navigate(`/login/${slug}`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg text-center">
        <div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">Comunicador Interno</h2>
          <p className="mt-2 text-sm text-gray-600">Selecione sua secretaria para continuar</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {departments.map((dept) => (
            <button
              key={dept.slug}
              onClick={() => handleSelectDepartment(dept.slug)}
              // Usamos o mapeamento de classes aqui
              className={`w-full flex items-center justify-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-transform hover:scale-105 ${colorClasses[dept.color]}`}
            >
              {dept.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}