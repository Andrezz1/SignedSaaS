import React, { useEffect, useState } from 'react';

interface FilterTipoPagamentoProps {
  applyFilters: (filters: { tipoPagamento?: 'Subscricao' | 'Doacao' }) => void;
}

const FilterTipoPagamento = ({ applyFilters }: FilterTipoPagamentoProps) => {
  const [selectedTipo, setSelectedTipo] = useState<'Subscricao' | 'Doacao' | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    applyFilters({ tipoPagamento: selectedTipo ?? undefined });
  }, [selectedTipo, applyFilters]);

  const toggleTipo = (tipo: 'Subscricao' | 'Doacao') =>
    setSelectedTipo((prev) => (prev === tipo ? null : tipo));

  const clearFilters = () => setSelectedTipo(null);

  return (
    <div className="bg-white shadow-md rounded-lg p-5 w-64 border border-gray-200">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Filtros</h2>

      <div className="border-t border-gray-200 pt-3 mb-3">
        <div
          className="flex justify-between items-center cursor-pointer mb-1"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <h3 className="text-sm font-medium text-gray-700">Tipo de Pagamento</h3>
          <svg
            className={`w-4 h-4 transform transition-transform duration-200 ${
              isOpen ? 'rotate-90' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>

        {isOpen && (
          <div className="space-y-2 mt-2">
            {['Subscricao', 'Doacao'].map((tipo) => (
              <label
                key={tipo}
                htmlFor={`tipo-${tipo}`}
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
              >
                <input
                  type="checkbox"
                  id={`tipo-${tipo}`}
                  checked={selectedTipo === tipo}
                  onChange={() => toggleTipo(tipo as 'Subscricao' | 'Doacao')}
                  className="text-blue-600 rounded focus:ring-0"
                />
                <span className="text-sm text-gray-700">
                  {tipo === 'Subscricao' ? 'Subscrição' : 'Doação'}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-4">
        <button
          onClick={clearFilters}
          className="w-full py-2 text-sm rounded-md bg-red-500 hover:bg-red-600 text-white font-semibold transition"
        >
          Limpar Filtros
        </button>
      </div>
    </div>
  );
};

export default FilterTipoPagamento;
