import { useState } from 'react';

interface FilterUsersProps {
  applyFilters: (filters: any) => void;
}

const FilterUsers = ({ applyFilters }: FilterUsersProps) => {
  const [filters, setFilters] = useState<{ 
    stock?: string[], 
    category?: string[], 
    priceRange?: [number, number] 
  }>({
    stock: [],
    category: [],
    priceRange: [0, 110]
  });

  const toggleFilter = (type: "stock" | "category", value: string) => {
    setFilters((prevFilters) => {
      const currentValues = prevFilters[type] || [];
      return {
        ...prevFilters,
        [type]: currentValues.includes(value)
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value],
      };
    });
  };

  // Estados para controlar a abertura dos dropdowns
  const [isSubscricaoOpen, setIsSubscricaoOpen] = useState(true);
  const [isFaixaEtariaOpen, setIsFaixaEtariaOpen] = useState(true);
  const [isSliderOpen, setIsSliderOpen] = useState(true);

  // SVGs inline para os ícones (seta para direita e para baixo)
  const ChevronRight = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block"
    >
      <path
        d="M7 5l5 5-5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const ChevronDown = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block"
    >
      <path
        d="M5 7l5 5 5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <div className="bg-gray-50 shadow p-4 rounded-md w-64 space-y-4">
      <h2 className="text-lg font-semibold">Filtros</h2>

      {/* Dropdown para Estado da Subscrição */}
      <div className="border-b border-gray-200 pb-2">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsSubscricaoOpen(!isSubscricaoOpen)}
        >
          <h3 className="font-medium text-sm">Estado da Subscrição</h3>
          {isSubscricaoOpen ? <ChevronDown /> : <ChevronRight />}
        </div>
        {isSubscricaoOpen && (
          <div className="mt-2 space-y-2">
            <label className="flex items-center space-x-2 text-sm text-gray-700">
              <input 
                type="checkbox" 
                value="in-stock" 
                checked={filters.stock?.includes('in-stock')} 
                onChange={() => toggleFilter("stock", "in-stock")} 
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <span>Ativa</span>
            </label>
            <label className="flex items-center space-x-2 text-sm text-gray-700">
              <input 
                type="checkbox" 
                value="out-of-stock" 
                checked={filters.stock?.includes('out-of-stock')} 
                onChange={() => toggleFilter("stock", "out-of-stock")} 
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <span>Expirada</span>
            </label>
            <label className="flex items-center space-x-2 text-sm text-gray-700">
              <input 
                type="checkbox" 
                value="pending" 
                checked={filters.stock?.includes('pending')} 
                onChange={() => toggleFilter("stock", "pending")} 
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <span>Sem Subscrição</span>
            </label>
          </div>
        )}
      </div>

      {/* Dropdown para Faixa Etária (Checkboxes) */}
      <div className="border-b border-gray-200 pb-2">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsFaixaEtariaOpen(!isFaixaEtariaOpen)}
        >
          <h3 className="font-medium text-sm">Faixa Etária</h3>
          {isFaixaEtariaOpen ? <ChevronDown /> : <ChevronRight />}
        </div>
        {isFaixaEtariaOpen && (
          <div className="mt-2 space-y-2">
            <label className="inline-flex items-center space-x-2 text-sm text-gray-700">
              <input 
                type="checkbox" 
                value="motherboards" 
                checked={filters.category?.includes('motherboards')} 
                onChange={() => toggleFilter("category", "motherboards")}
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <span>Menor que 18 anos</span>
            </label>
            <label className="inline-flex items-center space-x-2 text-sm text-gray-700">
              <input 
                type="checkbox" 
                value="ram" 
                checked={filters.category?.includes('ram')} 
                onChange={() => toggleFilter("category", "ram")}
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <span>18-65 anos</span>
            </label>
            <label className="inline-flex items-center space-x-2 text-sm text-gray-700">
              <input 
                type="checkbox" 
                value="gpu" 
                checked={filters.category?.includes('gpu')} 
                onChange={() => toggleFilter("category", "gpu")}
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <span>Maior que 65 anos</span>
            </label>
          </div>
        )}
      </div>

      {/* Dropdown para Faixa Etária (Slider) */}
      <div className="border-b border-gray-200 pb-2">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsSliderOpen(!isSliderOpen)}
        >
          <h3 className="font-medium text-sm">Faixa Etária (slider)</h3>
          {isSliderOpen ? <ChevronDown /> : <ChevronRight />}
        </div>
        {isSliderOpen && (
          <div className="mt-2">
            <input 
              type="range" 
              min="0" 
              max="110" 
              value={filters.priceRange?.[0]} 
              onChange={(e) => 
                setFilters({ 
                  ...filters, 
                  priceRange: [
                    Number(e.target.value), 
                    filters.priceRange?.[1] || 110
                  ]
                })
              }
              className="w-full focus:outline-none"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>{filters.priceRange?.[0]} anos</span>
              <span>{filters.priceRange?.[1]} anos</span>
            </div>
          </div>
        )}
      </div>

      {/* Botão para aplicar filtros */}
      <button 
        className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 text-sm font-medium"
        onClick={() => applyFilters(filters)}
      >
        Aplicar Filtros
      </button>
    </div>
  );
};

export default FilterUsers;
