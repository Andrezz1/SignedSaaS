import React, { useState, useEffect } from 'react';
import {
  getUtilizadorFiltros,
  createUtilizadorFiltro,
  deleteUtilizadorFiltro,
  useAction,
  useQuery,
} from 'wasp/client/operations';

interface BackendFilters {
  estadoSubscricao?: 'ativa' | 'expirada' | 'todas';
  faixaEtaria?: { min: number; max: number };
}

interface FilterUsersProps {
  applyFilters: (backendFilters: BackendFilters) => void;
  utilizadorId: number;
  initialFilters?: BackendFilters;
}

interface SavedFilter {
  UtilizadorFiltroId: number;
  nomeFiltro: string;
  filtros: {
    estado?: string[];
    faixa?: string[];
  };
}

const FilterUsers = ({ applyFilters, utilizadorId, initialFilters }: FilterUsersProps) => {
  const [filters, setFilters] = useState<{ estado?: string[]; faixa?: string[] }>({ estado: [], faixa: [] });
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [isSavedOpen, setIsSavedOpen] = useState(true);
  const [isEstadoOpen, setIsEstadoOpen] = useState(true);
  const [isFaixaOpen, setIsFaixaOpen] = useState(true);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [filterIdToRemove, setFilterIdToRemove] = useState<number | null>(null);
  const [filterNameInput, setFilterNameInput] = useState('');

  const ChevronIcon = ({ open }: { open: boolean }) => (
    <svg className={`w-4 h-4 transform transition-transform ${open ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );

  const toggleFilter = (type: 'estado' | 'faixa', value: string) => {
    setFilters((prev) => {
      const current = prev[type] || [];
      return {
        ...prev,
        [type]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
      };
    });
  };

  useEffect(() => {
    if (initialFilters) {
      const newFilters: { estado?: string[]; faixa?: string[] } = {};
      if (initialFilters.estadoSubscricao === 'ativa') newFilters.estado = ['Ativa'];
      else if (initialFilters.estadoSubscricao === 'expirada') newFilters.estado = ['Expirada'];
      setFilters(newFilters);
    }
  }, [initialFilters]);

  const { data: loadedFilters, refetch: refetchSavedFilters } = useQuery(getUtilizadorFiltros, {
    id: utilizadorId,
  });

  useEffect(() => {
    if (loadedFilters) setSavedFilters(loadedFilters);
  }, [loadedFilters]);

  const createFilter = useAction(createUtilizadorFiltro);
  const deleteFilter = useAction(deleteUtilizadorFiltro);

  const applyCurrentFilters = () => {
    const backend: BackendFilters = {};
    const estado = filters.estado || [];
    if (estado.length === 0 || estado.length === 2) backend.estadoSubscricao = 'todas';
    else backend.estadoSubscricao = estado.includes('Ativa') ? 'ativa' : 'expirada';

    const mapping: Record<string, { min: number; max: number }> = {
      'Menor que 18': { min: 0, max: 18 },
      '18-65': { min: 18, max: 65 },
      'Maior que 65': { min: 65, max: 500 },
    };
    const faixa = filters.faixa || [];
    if (faixa.length) {
      const mins = faixa.map((k) => mapping[k].min);
      const maxs = faixa.map((k) => mapping[k].max);
      backend.faixaEtaria = { min: Math.min(...mins), max: Math.max(...maxs) };
    }

    applyFilters(backend);
  };

  useEffect(() => {
    applyCurrentFilters();
  }, [filters]);

  const handleClearFilters = () => {
    setFilters({ estado: [], faixa: [] });
    applyFilters({ estadoSubscricao: 'todas' });
  };

  const handleConfirmSave = async () => {
    if (!filterNameInput.trim()) return;
    await createFilter({ nomeFiltro: filterNameInput.trim(), filtros: filters, utilizadorId });
    refetchSavedFilters();
    setShowSaveModal(false);
    setFilterNameInput('');
  };

  const handleConfirmRemove = async () => {
    if (filterIdToRemove == null) return;
    await deleteFilter({ utilizadorFiltroId: filterIdToRemove });
    refetchSavedFilters();
    setShowRemoveModal(false);
    setFilterIdToRemove(null);
  };

  return (
    <>
      <div className="bg-white shadow-md rounded-lg p-5 w-64 border border-gray-200 text-gray-800">
        <h2 className="text-lg font-bold mb-4">Filtros</h2>

        <div className="border-t border-gray-200 pt-3 mb-3">
          <div className="flex justify-between items-center cursor-pointer mb-1" onClick={() => setIsSavedOpen((o) => !o)}>
            <h3 className="text-sm font-medium text-gray-700">Filtros Guardados</h3>
            <ChevronIcon open={isSavedOpen} />
          </div>
          {isSavedOpen && (
            <div className="space-y-1 mt-2">
              {savedFilters.length === 0 ? (
                <p className="text-sm text-gray-400 italic">Nenhum filtro guardado.</p>
              ) : (
                savedFilters.map((sf) => (
                  <div key={sf.UtilizadorFiltroId} className="flex justify-between items-center px-2 py-1">
                    <button onClick={() => setFilters(sf.filtros)} className="text-sm text-gray-800 hover:underline">
                      {sf.nomeFiltro}
                    </button>
                    <button
                      onClick={() => {
                        setFilterIdToRemove(sf.UtilizadorFiltroId);
                        setShowRemoveModal(true);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-3 mb-3">
          <div className="flex justify-between items-center cursor-pointer mb-1" onClick={() => setIsEstadoOpen((o) => !o)}>
            <h3 className="text-sm font-medium text-gray-700">Estado da Subscrição</h3>
            <ChevronIcon open={isEstadoOpen} />
          </div>
          {isEstadoOpen && (
            <div className="space-y-2 mt-2">
              {['Ativa', 'Expirada'].map((val) => (
                <label key={val} htmlFor={val} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                  <input
                    type="checkbox"
                    id={val}
                    checked={filters.estado?.includes(val)}
                    onChange={() => toggleFilter('estado', val)}
                    className="text-blue-600 rounded focus:ring-0"
                  />
                  <span className="text-sm text-gray-700">{val}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-3 mb-3">
          <div className="flex justify-between items-center cursor-pointer mb-1" onClick={() => setIsFaixaOpen((o) => !o)}>
            <h3 className="text-sm font-medium text-gray-700">Faixa Etária</h3>
            <ChevronIcon open={isFaixaOpen} />
          </div>
          {isFaixaOpen && (
            <div className="space-y-2 mt-2">
              {['Menor que 18', '18-65', 'Maior que 65'].map((val) => (
                <label key={val} htmlFor={val} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                  <input
                    type="checkbox"
                    id={val}
                    checked={filters.faixa?.includes(val)}
                    onChange={() => toggleFilter('faixa', val)}
                    className="text-blue-600 rounded focus:ring-0"
                  />
                  <span className="text-sm text-gray-700">{val}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-4 space-y-2">
          <button
            onClick={handleClearFilters}
            className="w-full py-2 text-sm rounded-md bg-red-500 hover:bg-red-600 text-white font-semibold transition"
          >
            Limpar Filtros
          </button>
          <button
            onClick={() => setShowSaveModal(true)}
            className="w-full py-2 text-sm rounded-md bg-blue-500 hover:bg-blue-600 text-white font-semibold transition"
          >
            Guardar Filtros
          </button>
        </div>
      </div>

      {/* — Remove Confirmation Modal — */}
      {showRemoveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md max-w-sm w-full">
            <p className="text-lg text-gray-800 font-medium">
              Tem certeza que deseja remover este filtro?
            </p>
            <div className="mt-4 flex justify-end gap-4">
              <button
                onClick={() => setShowRemoveModal(false)}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 font-semibold hover:from-gray-400 hover:to-gray-500 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmRemove}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 transition"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* — Save Name Modal — */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md max-w-sm w-full">
            <p className="text-lg text-gray-800 font-medium">
              Escolhe um nome para este filtro:
            </p>
            <input
              type="text"
              value={filterNameInput}
              onChange={e => setFilterNameInput(e.target.value)}
              className="block w-full p-3 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Nome do filtro..."
            />
            <div className="mt-4 flex justify-end gap-4">
              <button
                onClick={() => { setShowSaveModal(false); setFilterNameInput(""); }}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 font-semibold hover:from-gray-400 hover:to-gray-500 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmSave}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FilterUsers;
