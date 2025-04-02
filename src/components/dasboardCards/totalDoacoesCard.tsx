import React from 'react';

const DoacoesCard: React.FC = () => {

  return (
    <div className="w-64 rounded-lg border border-gray-200 bg-white p-6 shadow-md hover:shadow-lg transition-shadow dark:border-strokedark dark:bg-boxdark">
      <div className="flex items-center justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            className="w-12 h-12"
            fill="currentColor"
          >
            <path d="M16 10c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6 2.69-6 6-6zm14 2c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4zM16 24c4.97 0 15 2.48 15 7.45V34H1v-2.55C1 26.48 11.03 24 16 24zm14-2c-1.3 0-2.55.1-3.72.28 2.15 1.38 3.72 3.72 3.72 6.17V34h14v-2.55C44 26.48 33.97 22 30 22z" />
          </svg>
        </div>
      </div>
      <div className="mt-4 text-center">
        <h4 className="text-3xl font-bold text-gray-800 dark:text-white">
          POR FAZER
        </h4>
        <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
          Total Doações
        </p>
      </div>
    </div>
  );
};

export default DoacoesCard;