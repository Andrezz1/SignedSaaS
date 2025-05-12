import React, { useEffect, useState } from 'react';
import { getDuracao } from 'wasp/client/operations';

interface Duracao {
  DuracaoID: number;
  Nome: string;
}

interface FilterDuracoesProps {
  applyFilters: (filters: { duracoes: number[] }) => void;
  appliedFilters: { duracoes: number[] };
}

const FilterDuracoes = ({ applyFilters, appliedFilters }: FilterDuracoesProps) => {
  const [duracoes, setDuracoes] = useState<Duracao[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const fetchDuracoes = async () => {
      try {
        const data = await getDuracao();
        setDuracoes(data.map(d => ({ ...d, DuracaoID: d.DuracaoId })));
      } catch (error) {
        console.error('Erro ao buscar durações:', error);
      }
    };

    fetchDuracoes();
  }, []);

  useEffect(() => {
    setSelected(appliedFilters.duracoes || []);
  }, [appliedFilters]);

  useEffect(() => {
    applyFilters({ duracoes: selected });
  }, [selected]);

  const toggleCheckbox = (id: number) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-gray-50 shadow p-4 rounded-md w-64 space-y-4">
      <h2 className="text-lg font-semibold">Filtros</h2>

      <div className="border-b border-gray-200 pb-2">
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setIsOpen(o => !o)}
        >
          <h3 className="font-medium text-sm">Duração</h3>
          {isOpen ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 7l5 5 5-5" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 5l5 5-5 5" />
            </svg>
          )}
        </div>
        {isOpen && (
          <div className="mt-2 space-y-2">
            {duracoes.map((d) => (
              <div key={d.DuracaoID} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`dur-${d.DuracaoID}`}
                  checked={selected.includes(d.DuracaoID)}
                  onChange={() => toggleCheckbox(d.DuracaoID)}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <label htmlFor={`dur-${d.DuracaoID}`} className="text-sm text-gray-700">
                  {d.Nome}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => setSelected([])}
        className="w-full px-4 py-1 text-sm rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 transition"
      >
        Limpar Filtros
      </button>
    </div>
  );
};

export default FilterDuracoes;
