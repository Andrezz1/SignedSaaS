import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';

const PagamentosCard: React.FC = () => {
  const totalPagamentos = 0;

  return (
    <div className="w-64 rounded-lg border border-gray-200 bg-white p-6 shadow-md hover:shadow-lg transition-shadow dark:border-strokedark dark:bg-boxdark">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Total de Pagamentos
      </h3>

      <div className="flex items-center justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <Wallet className="w-8 h-8" />
        </div>
      </div>

      <div className="mt-4 text-center">
        <h4 className="text-3xl font-bold text-gray-800 dark:text-white">
          {totalPagamentos}
        </h4>
      </div>

      <div className="mt-6 text-center">
        <Link 
          to="/pagamentos" 
          className="inline-flex items-center text-gray-500 hover:text-gray-400 text-sm font-medium"
        >
          Ver lista de pagamentos
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

export default PagamentosCard;
