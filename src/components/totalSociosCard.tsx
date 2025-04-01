import React from 'react';

type TotalSociosCardProps = {
  totalSocios: number | undefined;
};

const TotalSociosCard = ({ totalSocios }: TotalSociosCardProps) => {
  return (
    <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
        <svg
          className="fill-primary dark:fill-white"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17 3a3 3 0 110 6 3 3 0 010-6zm0 6a4 4 0 100-8 4 4 0 000 8zm-10 0a3 3 0 110-6 3 3 0 010 6zm0 2a4 4 0 100-8 4 4 0 000 8zm10 2a5 5 0 015 5v1H12v-1a5 5 0 015-5zm-10 0a5 5 0 00-5 5v1h6v-1a5 5 0 00-5-5z" />
        </svg>
      </div>
      <div className="mt-4">
        <h4 className="text-title-md font-bold text-black dark:text-white">
          {totalSocios}
        </h4>
        <span className="text-sm font-medium">Total Sócios</span>
      </div>
    </div>
  );
};

export default TotalSociosCard;
