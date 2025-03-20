import { useState } from 'react';

interface FilterUsersProps {
  applyFilters: (filters: any) => void;
}

const FilterUsers = ({ applyFilters }: FilterUsersProps) => {
  const [filters, setFilters] = useState<{ stock?: string[], category?: string[], priceRange?: [number, number] }>({
    stock: [],
    category: [],
    priceRange: [0, 1000]
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

  return (
    <div className="bg-gray-100 p-4 rounded-md w-64">
      <h2 className="text-lg font-semibold mb-4">Filtros</h2>
      
      {/* Stock Filter */}
      <div className="mb-4">
        <h3 className="font-medium">Stock</h3>
        <div className="flex flex-col gap-2">
          <label>
            <input 
              type="checkbox" 
              value="in-stock" 
              checked={filters.stock?.includes('in-stock')} 
              onChange={() => toggleFilter("stock", "in-stock")} 
            /> Em Stock
          </label>
          <label>
            <input 
              type="checkbox" 
              value="out-of-stock" 
              checked={filters.stock?.includes('out-of-stock')} 
              onChange={() => toggleFilter("stock", "out-of-stock")} 
            /> Sem Stock
          </label>
        </div>
      </div>
      
      {/* Category Filter */}
      <div className="mb-4">
        <h3 className="font-medium">Categoria</h3>
        <div className="flex flex-col gap-2">
          <label>
            <input 
              type="checkbox" 
              value="motherboards" 
              checked={filters.category?.includes('motherboards')} 
              onChange={() => toggleFilter("category", "motherboards")} 
            /> Motherboards
          </label>
          <label>
            <input 
              type="checkbox" 
              value="ram" 
              checked={filters.category?.includes('ram')} 
              onChange={() => toggleFilter("category", "ram")} 
            /> Memórias RAM
          </label>
          <label>
            <input 
              type="checkbox" 
              value="gpu" 
              checked={filters.category?.includes('gpu')} 
              onChange={() => toggleFilter("category", "gpu")} 
            /> Placas Gráficas
          </label>
        </div>
      </div>
      
      {/* Price Range Filter */}
      <div className="mb-4">
        <h3 className="font-medium">Preço</h3>
        <input 
          type="range" 
          min="0" 
          max="1000" 
          value={filters.priceRange?.[0]} 
          onChange={(e) => setFilters({ ...filters, priceRange: [Number(e.target.value), filters.priceRange?.[1] || 1000] })}
        />
        <input 
          type="range" 
          min="0" 
          max="1000" 
          value={filters.priceRange?.[1]} 
          onChange={(e) => setFilters({ ...filters, priceRange: [filters.priceRange?.[0] || 0, Number(e.target.value)] })}
        />
        <div className="flex justify-between text-sm">
          <span>{filters.priceRange?.[0]}€</span>
          <span>{filters.priceRange?.[1]}€</span>
        </div>
      </div>
      
      {/* Apply Filters Automatically */}
      <button 
        className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
        onClick={() => applyFilters(filters)}
      >
        Aplicar Filtros
      </button>
    </div>
  );
};

export default FilterUsers;
