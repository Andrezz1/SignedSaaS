import React from 'react';
import { useQuery, getMembrosPagantes } from 'wasp/client/operations';
import { useNavigate } from 'react-router-dom';

const MembrosPagantesCard: React.FC = () => {
  const { data, isLoading, error } = useQuery(getMembrosPagantes, {});
  const navigate = useNavigate();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Navega para a página de membros com filtro pré-selecionado
  const handleVerMembrosPagantes = () => {
    navigate('/membros', {
      state: {
        appliedFilters: {
          estadoSubscricao: 'ativa'
        }
      }
    });
  };

  return (
    <div className="w-64 rounded-lg border border-gray-200 bg-white p-6 shadow-md hover:shadow-lg transition-shadow dark:border-strokedark dark:bg-boxdark">
      {/* Título no topo */}
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Total Membros Pagantes
      </h3>

      {/* Ícone e número central */}
      <div className="flex items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="w-10 h-10"
            fill="currentColor"
          >
            <path d="M16 10c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6 2.69-6 6-6zm14 2c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4zM16 24c4.97 0 15 2.48 15 7.45V34H1v-2.55C1 26.48 11.03 24 16 24zm14-2c-1.3 0-2.55.1-3.72.28 2.15 1.38 3.72 3.72 3.72 6.17V34h14v-2.55C44 26.48 33.97 22 30 22z" />
          </svg>
        </div>
      </div>

      {/* Número de membros pagantes */}
      <div className="mt-4 text-center">
        <h4 className="text-3xl font-bold text-gray-800 dark:text-white">
          {data}
        </h4>
      </div>

      {/* Link para ver membros no rodapé */}
      <div className="mt-6 text-center">
        <button 
          onClick={handleVerMembrosPagantes}
          className="inline-flex items-center text-gray-500 hover:text-gray-400 text-sm font-medium cursor-pointer"
        >
          Ver Membros pagantes
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 ml-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5l7 7-7 7" 
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MembrosPagantesCard;