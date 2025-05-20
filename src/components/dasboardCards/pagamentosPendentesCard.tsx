import React from 'react';
import { useQuery, getTotalPagamentosPendentes } from 'wasp/client/operations';
import { Link } from 'react-router-dom';
import { FileClock } from 'lucide-react';

const PagamentosPendentesCard: React.FC = () => {
  const { data, isLoading, error } = useQuery(getTotalPagamentosPendentes, {
    page: 1,
    pageSize: 1
  });

  return (
    <div className="w-64 rounded-lg border border-gray-200 bg-white p-6 shadow-md hover:shadow-lg transition-shadow dark:border-strokedark dark:bg-boxdark">
      {/* Título */}
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Pagamentos Pendentes
      </h3>

      {/* Ícone */}
      <div className="flex items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 text-white">
          <FileClock className="w-8 h-8" />
        </div>
      </div>

      {/* Valor central */}
      <div className="mt-4 text-center">
        <h4 className="text-3xl font-bold text-gray-800 dark:text-white">
          {data}
        </h4>
      </div>

      {/* Link */}
      <div className="mt-6 text-center">
        <Link
          to="/pending-payments"
          className="inline-flex items-center text-gray-500 hover:text-gray-400 text-sm font-medium"
        >
          Ver Pagamentos Pendentes
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
        </Link>
      </div>
    </div>
  );
};

export default PagamentosPendentesCard;
