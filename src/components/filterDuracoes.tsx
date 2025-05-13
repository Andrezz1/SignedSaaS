import React, { useEffect, useState } from 'react';
import { getDuracao } from 'wasp/client/operations';

interface Duracao {
  DuracaoId: number;
  Nome: string;
}

interface FilterDuracoesProps {
  applyFilters: (filters: { duracaoNome?: string }) => void;
}

const FilterDuracoes = ({ applyFilters }: FilterDuracoesProps) => {
  const [duracoes, setDuracoes] = useState<Duracao[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const fetchDuracoes = async () => {
      try {
        const data = await getDuracao();
        setDuracoes(data);
      } catch (error) {
        console.error('Erro ao buscar durações:', error);
      }
    };

    fetchDuracoes();
  }, []);

  useEffect(() => {
    if (selectedId === null) {
      applyFilters({ duracaoNome: undefined });
    } else {
      const selectedDuracao = duracoes.find(d => d.DuracaoId === selectedId);
      if (selectedDuracao) {
        applyFilters({ duracaoNome: selectedDuracao.Nome });
      }
    }
  }, [selectedId, duracoes]);

  const toggleCheckbox = (id: number) => {
    setSelectedId(prev => (prev === id ? null : id));
  };

  const clearFilters = () => {
    setSelectedId(null);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-5 w-64 border border-gray-200">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Filtros</h2>

      <div className="border-t border-gray-200 pt-3 mb-3">
        <div
          className="flex justify-between items-center cursor-pointer mb-1"
          onClick={() => setIsOpen(prev => !prev)}
        >
          <h3 className="text-sm font-medium text-gray-700">Duração</h3>
          <svg
            className={`w-4 h-4 transition-transform transform ${isOpen ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>

        {isOpen && (
          <div className="space-y-2 mt-2">
            {duracoes.length === 0 ? (
              <p className="text-sm text-gray-400 italic">A carregar...</p>
            ) : (
              duracoes.map((d) => (
                <label
                  key={d.DuracaoId}
                  htmlFor={`dur-${d.DuracaoId}`}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
                >
                  <input
                    type="checkbox"
                    id={`dur-${d.DuracaoId}`}
                    checked={selectedId === d.DuracaoId}
                    onChange={() => toggleCheckbox(d.DuracaoId)}
                    className="text-blue-600 rounded focus:ring-0"
                  />
                  <span className="text-sm text-gray-700">{d.Nome}</span>
                </label>
              ))
            )}
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

export default FilterDuracoes;
