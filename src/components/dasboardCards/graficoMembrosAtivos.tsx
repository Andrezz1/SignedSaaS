import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useQuery, getMembrosPagantes, getMembros } from 'wasp/client/operations';

const GraficoMembrosAtivos: React.FC = () => {
  const { data: membros, isLoading, error } = useQuery(getMembros);
  const { data: membrosPagantes} = useQuery(getMembrosPagantes);

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro ao carregar dados.</div>;

  const totalMembros = membros;
  const totalMembrosPagantes = membrosPagantes || 0;
  const membrosInativos = totalMembros - totalMembrosPagantes;

  const data = [
    { name: 'Ativos', value: totalMembrosPagantes },
    { name: 'Inativos', value: membrosInativos },
  ];

  const COLORS = ['#10B981', '#EF4444'];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md dark:bg-boxdark">
      <h3 className="text-lg text-center font-semibold text-gray-800 dark:text-white mb-4">
        Sócios Ativos vs Inativos
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            fill="#8884d8"
            paddingAngle={3}
            dataKey="value"
            label={({ name, percent }) =>
              `${name} (${(percent * 100).toFixed(0)}%)`
            }
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoMembrosAtivos;
