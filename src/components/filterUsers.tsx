import React, { useState, useEffect } from 'react';
import { 
  getUtilizadorFiltros,
  createUtilizadorFiltro, 
  deleteUtilizadorFiltro,
  useAction,
  useQuery
} from 'wasp/client/operations';

interface BackendFilters {
  estadoSubscricao?: 'ativa' | 'expirada' | 'todas';
  faixaEtaria?: { min: number; max: number };
}

interface FilterUsersProps {
  applyFilters: (backendFilters: BackendFilters) => void;
  utilizadorId: number;
}

interface SavedFilter {
  UtilizadorFiltroId: number;
  nomeFiltro: string;
  filtros: {
    estado?: string[];
    faixa?: string[];
  };
}

const FilterUsers = ({ applyFilters, utilizadorId }: FilterUsersProps) => {
  const [filters, setFilters] = useState<{ estado?: string[]; faixa?: string[] }>({
    estado: [],
    faixa: []
  });
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [isSavedOpen, setIsSavedOpen] = useState(true);
  const [isEstadoOpen, setIsEstadoOpen] = useState(true);
  const [isFaixaOpen, setIsFaixaOpen] = useState(true);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [filterIdToRemove, setFilterIdToRemove] = useState<number | null>(null);
  const [filterNameInput, setFilterNameInput] = useState("");

  const ChevronRight = () => (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block">
      <path d="M7 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  const ChevronDown = () => (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block">
      <path d="M5 7l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const toggleFilter = (type: "estado" | "faixa", value: string) => {
    setFilters(prev => {
      const current = prev[type] || [];
      return {
        ...prev,
        [type]: current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value],
      };
    });
  };

  // Load saved filters
  const { data: loadedFilters, refetch: refetchSavedFilters } = useQuery(
    getUtilizadorFiltros, { id: utilizadorId }
  );
  useEffect(() => {
    if (loadedFilters) setSavedFilters(loadedFilters);
  }, [loadedFilters]);

  const createFilter = useAction(createUtilizadorFiltro);
  const deleteFilter = useAction(deleteUtilizadorFiltro);

  // Build + apply backend filters
  const applyCurrentFilters = () => {
    const backend: BackendFilters = {};
    // estadoSubscricao
    const estado = filters.estado || [];
    if (estado.length === 0 || estado.length === 2) {
      backend.estadoSubscricao = 'todas';
    } else if (estado.includes('Ativa')) {
      backend.estadoSubscricao = 'ativa';
    } else {
      backend.estadoSubscricao = 'expirada';
    }
    // faixaEtaria
    const mapping: Record<string, {min:number;max:number}> = {
      "Menor que 18": { min:0,    max:18 },
      "18-65":        { min:18,   max:65 },
      "Maior que 65": { min:65,   max:500 }
    };
    const faixa = filters.faixa || [];
    if (faixa.length) {
      const mins = faixa.map(k => mapping[k].min);
      const maxs = faixa.map(k => mapping[k].max);
      backend.faixaEtaria = { min: Math.min(...mins), max: Math.max(...maxs) };
    }
    applyFilters(backend);
  };

  // auto‐apply on any change
  useEffect(() => {
    applyCurrentFilters();
  }, [filters]);

  const handleClearFilters = () => {
    setFilters({ estado: [], faixa: [] });
    applyFilters({ estadoSubscricao: 'todas' });
  };

  const handleConfirmSave = async () => {
    if (!filterNameInput.trim()) return;
    await createFilter({
      nomeFiltro: filterNameInput.trim(),
      filtros:   filters,
      utilizadorId
    });
    refetchSavedFilters();
    setShowSaveModal(false);
    setFilterNameInput("");
  };

  const handleConfirmRemove = async () => {
    if (filterIdToRemove == null) return;
    await deleteFilter({ utilizadorFiltroId: filterIdToRemove });
    refetchSavedFilters();
    setShowRemoveModal(false);
    setFilterIdToRemove(null);
  };

  const handleApplySavedFilter = (sf: SavedFilter) => {
    setFilters(sf.filtros);
    // auto‐apply triggers in useEffect
  };

  return (
    <>
      <div className="bg-gray-50 shadow p-4 rounded-md w-64 space-y-4">
        <h2 className="text-lg font-semibold">Filtros</h2>

        {/* — Saved Filters — */}
        <div className="border-b border-gray-200 pb-2">
          <div className="flex justify-between items-center cursor-pointer"
               onClick={() => setIsSavedOpen(o => !o)}>
            <h3 className="font-medium text-sm">Filtros Guardados</h3>
            {isSavedOpen ? <ChevronDown/> : <ChevronRight/>}
          </div>
          {isSavedOpen && (
            <div className="mt-2">
              {savedFilters.length === 0
                ? <p className="text-xs text-gray-500 italic">Nenhum filtro guardado.</p>
                : savedFilters.map(sf => (
                    <div key={sf.UtilizadorFiltroId}
                         className="flex justify-between items-center px-4 py-3">
                      <button
                        onClick={() => handleApplySavedFilter(sf)}
                        className="text-sm text-gray-800 hover:underline">
                        {sf.nomeFiltro}
                      </button>
                      <button
                        onClick={() => { setFilterIdToRemove(sf.UtilizadorFiltroId); setShowRemoveModal(true); }}
                        className="text-red-400 hover:text-red-600"
                        title="Remover este filtro">
                        <svg width="16" height="16" viewBox="0 0 24 24"
                             strokeWidth="2" stroke="currentColor" fill="none"
                             strokeLinecap="round" strokeLinejoin="round"
                             className="inline-block">
                          <line x1="18" y1="6"  x2="6" y2="18"/>
                          <line x1="6"  y1="6"  x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  ))
              }
            </div>
          )}
        </div>

        {/* — Estado da Subscrição — */}
        <div className="border-b border-gray-200 pb-2">
          <div className="flex justify-between items-center cursor-pointer"
               onClick={() => setIsEstadoOpen(o => !o)}>
            <h3 className="font-medium text-sm">Estado da Subscrição</h3>
            {isEstadoOpen ? <ChevronDown/> : <ChevronRight/>}
          </div>
          {isEstadoOpen && (
            <div className="mt-2 space-y-2">
              {['Ativa','Expirada'].map(val => (
                <div key={val} className="flex items-center space-x-2">
                  <input
                    id={val}
                    type="checkbox"
                    value={val}
                    checked={filters.estado?.includes(val)}
                    onChange={() => toggleFilter("estado", val)}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <label htmlFor={val} className="text-sm text-gray-700 cursor-pointer">
                    {val}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* — Faixa Etária — */}
        <div className="border-b border-gray-200 pb-2">
          <div className="flex justify-between items-center cursor-pointer"
               onClick={() => setIsFaixaOpen(o => !o)}>
            <h3 className="font-medium text-sm">Faixa Etária</h3>
            {isFaixaOpen ? <ChevronDown/> : <ChevronRight/>}
          </div>
          {isFaixaOpen && (
            <div className="mt-2 space-y-2">
              {["Menor que 18","18-65","Maior que 65"].map(val => (
                <div key={val} className="flex items-center space-x-2">
                  <input
                    id={val}
                    type="checkbox"
                    value={val}
                    checked={filters.faixa?.includes(val)}
                    onChange={() => toggleFilter("faixa", val)}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <label htmlFor={val} className="text-sm text-gray-700 cursor-pointer">
                    {val}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* — Clear + Save Buttons — */}
        <div className="space-y-2">
          <button
            onClick={handleClearFilters}
            className="w-full px-4 py-1 text-sm rounded-lg bg-gradient-to-r from-red-500 to-red-600 
                       text-white font-semibold hover:from-red-600 hover:to-red-700 transition"
          >
            Limpar Filtros
          </button>
          <button
            onClick={() => setShowSaveModal(true)}
            className="w-full px-4 py-1 text-sm rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 
                       text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition"
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
