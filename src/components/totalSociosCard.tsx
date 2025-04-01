import React from 'react';

type TotalSociosCardProps = {
  totalSocios: number | undefined;
};

const TotalSociosCard = ({ totalSocios }: TotalSociosCardProps) => {
  return (
    <div className="w-64 rounded-lg border border-gray-200 bg-white p-6 shadow-md hover:shadow-lg transition-shadow dark:border-strokedark dark:bg-boxdark">
      <div className="flex items-center justify-center">
        {/* Círculo com gradiente e ícone maior */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12"
            viewBox="0 0 640 512"
            fill="currentColor"
          >
            <path d="M96 128a64 64 0 1 0 0-128 64 64 0 1 0 0 128zm448 0a64 64 0 1 0 0-128 64 64 0 1 0 0 128zm-224 32c-70.7 0-128 57.3-128 128v96h256v-96c0-70.7-57.3-128-128-128z" />
          </svg>
        </div>
      </div>
      <div className="mt-4 text-center">
        <h4 className="text-3xl font-bold text-gray-800 dark:text-white">
          {totalSocios}
        </h4>
        <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
          Total Sócios
        </p>
      </div>
    </div>
  );
};

export default TotalSociosCard;
