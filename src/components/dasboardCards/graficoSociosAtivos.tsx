import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useQuery, getSociosPagantes, getSocios } from 'wasp/client/operations';

const GraficoSociosAtivos: React.FC = () => {
  const { data: socios, isLoading, error } = useQuery(getSocios);
  const { data: sociosPagantes} = useQuery(getSociosPagantes);

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro ao carregar dados.</div>;

  const totalSocios = socios;
  const totalSociosPagantes = sociosPagantes || 0;
  const sociosInativos = totalSocios - totalSociosPagantes;

  const data = [
    { name: 'Ativos', value: totalSociosPagantes },
    { name: 'Inativos', value: sociosInativos },
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

export default GraficoSociosAtivos;
