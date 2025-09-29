import React from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- DADOS SIMULADOS PARA A DEMONSTRAÇÃO ---
const demandsCompletedData = [
  { month: 'Junho', concluidas: 22, media: 25 },
  { month: 'Julho', concluidas: 35, media: 28 },
  { month: 'Agosto', concluidas: 42, media: 30 },
  { month: 'Setembro', concluidas: 31, media: 32 },
];

const teamPerformanceData = [
  { name: 'Eduardo Romano', tasks: 12 },
  { name: 'Júlia Martins', tasks: 9 },
  { name: 'Ana Clara', tasks: 8 },
  { name: 'Outros', tasks: 13 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const keyMetrics = {
    totalCompleted: 130,
    averageTime: '2d 8h',
    onTimeRate: '92%',
    topPerformer: 'Eduardo Romano'
};

// --- COMPONENTE DA PÁGINA ---
export default function ReportsPage() {
  return (
    <div className="p-4 sm:p-6 bg-gray-100 h-full overflow-y-auto">
      <div className="space-y-6">

        {/* 1. Filtros e Métricas Principais */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h2 className="text-xl font-bold text-gray-800">Relatório de Desempenho</h2>
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <div>
                <label htmlFor="report-start-date" className="block text-sm font-medium text-gray-700">Período de</label>
                <input type="date" id="report-start-date" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
                <label htmlFor="report-end-date" className="block text-sm font-medium text-gray-700">Até</label>
                <input type="date" id="report-end-date" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">Filtrar</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border"><h3 className="text-gray-500">Demandas Concluídas</h3><p className="text-3xl font-bold mt-2">{keyMetrics.totalCompleted}</p></div>
            <div className="bg-white p-4 rounded-lg shadow-sm border"><h3 className="text-gray-500">Tempo Médio Resolução</h3><p className="text-3xl font-bold mt-2">{keyMetrics.averageTime}</p></div>
            <div className="bg-white p-4 rounded-lg shadow-sm border"><h3 className="text-gray-500">Taxa de Conclusão no Prazo</h3><p className="text-3xl font-bold mt-2 text-green-600">{keyMetrics.onTimeRate}</p></div>
            <div className="bg-white p-4 rounded-lg shadow-sm border"><h3 className="text-gray-500">Funcionário Destaque</h3><p className="text-3xl font-bold mt-2 text-blue-600 truncate">{keyMetrics.topPerformer}</p></div>
        </div>

        {/* 2. Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="font-bold text-gray-800 mb-4">Demandas Concluídas por Mês</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={demandsCompletedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="concluidas" fill="#8884d8" name="Concluídas" />
                <Bar dataKey="media" fill="#82ca9d" name="Média do Mês Anterior" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="font-bold text-gray-800 mb-4">Distribuição de Tarefas (Equipe)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={teamPerformanceData} dataKey="tasks" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                  {teamPerformanceData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}