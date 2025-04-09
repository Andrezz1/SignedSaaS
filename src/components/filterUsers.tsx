import { useState, useEffect } from 'react';
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

  const toggleFilter = (type: "estado" | "faixa", value: string) => {
    setFilters((prev) => {
      const currentValues = prev[type] || [];
      return {
        ...prev,
        [type]: currentValues.includes(value)
          ? currentValues.filter(item => item !== value)
          : [...currentValues, value],
      };
    });
  };

  const { data: loadedFilters, refetch: refetchSavedFilters } = useQuery(getUtilizadorFiltros, { id: utilizadorId });
  useEffect(() => {
    if (loadedFilters) {
      setSavedFilters(loadedFilters);
    }
  }, [loadedFilters]);

  const createFilterMutation = useAction(createUtilizadorFiltro);
  const deleteFilterMutation = useAction(deleteUtilizadorFiltro);

  const applyCurrentFilters = () => {
    const backendFilters: BackendFilters = {};
    const estado = filters.estado || [];
    if (estado.length === 0 || estado.length === 2) {
      backendFilters.estadoSubscricao = 'todas';
    } else if (estado.includes('Ativa')) {
      backendFilters.estadoSubscricao = 'ativa';
    } else if (estado.includes('Expirada')) {
      backendFilters.estadoSubscricao = 'expirada';
    }
    const ageMapping: Record<string, { min: number; max: number }> = {
      "Menor que 18": { min: 0, max: 18 },
      "18-65": { min: 18, max: 65 },
      "Maior que 65": { min: 65, max: 500 },
    };
    const faixa = filters.faixa || [];
    if (faixa.length > 0) {
      const mins = faixa.map((key: string) => ageMapping[key].min);
      const maxs = faixa.map((key: string) => ageMapping[key].max);
      backendFilters.faixaEtaria = { min: Math.min(...mins), max: Math.max(...maxs) };
    }
    applyFilters(backendFilters);
  };

  const handleClearFilters = () => {
    const reset = { estado: [], faixa: [] };
    setFilters(reset);
    applyFilters({ estadoSubscricao: 'todas' });
  };

  const handleSaveFilters = async () => {
    setShowSaveModal(true);
  };

  const handleConfirmSave = async () => {
    if (filterNameInput.trim() === "") return;
    const name = filterNameInput.trim();
    try {
      await createFilterMutation({
        nomeFiltro: name,
        filtros: filters,
        utilizadorId: utilizadorId,
      });
      refetchSavedFilters();
      setShowSaveModal(false);
      setFilterNameInput("");
    } catch (error) {
      console.error("Erro ao salvar filtro:", error);
    }
  };

  const handleConfirmRemove = async () => {
    if (filterIdToRemove === null) return;
    try {
      await deleteFilterMutation({ utilizadorFiltroId: filterIdToRemove });
      refetchSavedFilters();
    } catch (error) {
      console.error("Erro ao remover filtro:", error);
    }
    setShowRemoveModal(false);
    setFilterIdToRemove(null);
  };

  const handleApplySavedFilter = (saved: SavedFilter) => {
    setFilters(saved.filtros);
    const backendFilters: BackendFilters = {};
    const estado = saved.filtros.estado || [];
    if (estado.length === 0 || estado.length === 2) {
      backendFilters.estadoSubscricao = 'todas';
    } else if (estado.includes('Ativa')) {
      backendFilters.estadoSubscricao = 'ativa';
    } else if (estado.includes('Expirada')) {
      backendFilters.estadoSubscricao = 'expirada';
    }
    const ageMapping: Record<string, { min: number; max: number }> = {
      "Menor que 18": { min: 0, max: 18 },
      "18-65": { min: 18, max: 65 },
      "Maior que 65": { min: 65, max: 500 },
    };
    const faixa = saved.filtros.faixa || [];
    if (faixa.length > 0) {
      const mins = faixa.map((key: string) => ageMapping[key].min);
      const maxs = faixa.map((key: string) => ageMapping[key].max);
      backendFilters.faixaEtaria = { min: Math.min(...mins), max: Math.max(...maxs) };
    }
    applyFilters(backendFilters);
  };

  return (
    <>
      <div className="bg-gray-50 shadow p-4 rounded-md w-64 space-y-4">
        <h2 className="text-lg font-semibold">Filtros</h2>
        <div className="border-b border-gray-200 pb-2">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsSavedOpen(!isSavedOpen)}>
            <h3 className="font-medium text-sm">Filtros Guardados</h3>
            {isSavedOpen ? <ChevronDown /> : <ChevronRight />}
          </div>
          {isSavedOpen && (
            <div className="mt-2">
              {savedFilters.length === 0 ? (
                <p className="text-xs text-gray-500 italic">Nenhum filtro guardado.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {savedFilters.map(sf => (
                    <div key={sf.UtilizadorFiltroId} className="flex items-center justify-between px-4 py-3 ">
                      <button onClick={() => handleApplySavedFilter(sf)} className="text-sm text-gray-800 hover:underline">
                        {sf.nomeFiltro}
                      </button>
                      <button
                        onClick={() => { setFilterIdToRemove(sf.UtilizadorFiltroId); setShowRemoveModal(true); }}
                        className="text-red-400 hover:text-red-600"
                        title="Remover este filtro"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" className="inline-block">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="border-b border-gray-200 pb-2">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsEstadoOpen(!isEstadoOpen)}>
            <h3 className="font-medium text-sm">Estado da Subscrição</h3>
            {isEstadoOpen ? <ChevronDown /> : <ChevronRight />}
          </div>
          {isEstadoOpen && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center space-x-2">
                <input id="ativa" type="checkbox" value="Ativa" checked={filters.estado?.includes('Ativa')} onChange={() => toggleFilter("estado", "Ativa")} className="form-checkbox h-4 w-4 text-blue-600" />
                <label htmlFor="ativa" className="text-sm text-gray-700 cursor-pointer">Ativa</label>
              </div>
              <div className="flex items-center space-x-2">
                <input id="expirada" type="checkbox" value="Expirada" checked={filters.estado?.includes('Expirada')} onChange={() => toggleFilter("estado", "Expirada")} className="form-checkbox h-4 w-4 text-blue-600" />
                <label htmlFor="expirada" className="text-sm text-gray-700 cursor-pointer">Expirada</label>
              </div>
            </div>
          )}
        </div>
        <div className="border-b border-gray-200 pb-2">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsFaixaOpen(!isFaixaOpen)}>
            <h3 className="font-medium text-sm">Faixa Etária</h3>
            {isFaixaOpen ? <ChevronDown /> : <ChevronRight />}
          </div>
          {isFaixaOpen && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center space-x-2">
                <input id="menor18" type="checkbox" value="Menor que 18" checked={filters.faixa?.includes('Menor que 18')} onChange={() => toggleFilter("faixa", "Menor que 18")} className="form-checkbox h-4 w-4 text-blue-600" />
                <label htmlFor="menor18" className="text-sm text-gray-700 cursor-pointer">Menor que 18</label>
              </div>
              <div className="flex items-center space-x-2">
                <input id="18-65" type="checkbox" value="18-65" checked={filters.faixa?.includes('18-65')} onChange={() => toggleFilter("faixa", "18-65")} className="form-checkbox h-4 w-4 text-blue-600" />
                <label htmlFor="18-65" className="text-sm text-gray-700 cursor-pointer">18-65</label>
              </div>
              <div className="flex items-center space-x-2">
                <input id="maior65" type="checkbox" value="Maior que 65" checked={filters.faixa?.includes('Maior que 65')} onChange={() => toggleFilter("faixa", "Maior que 65")} className="form-checkbox h-4 w-4 text-blue-600" />
                <label htmlFor="maior65" className="text-sm text-gray-700 cursor-pointer">Maior que 65</label>
              </div>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <button className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 text-sm font-medium" onClick={applyCurrentFilters}>
            Aplicar Filtros
          </button>
          <button className="w-full bg-gray-300 text-gray-800 p-2 rounded-md hover:bg-gray-400 text-sm font-medium" onClick={handleClearFilters}>
            Limpar Filtros
          </button>
          <button className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 text-sm font-medium" onClick={() => setShowSaveModal(true)}>
            Guardar Filtros
          </button>
        </div>
      </div>
      {showRemoveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md max-w-sm w-full">
            <p className="text-lg text-gray-800 font-medium">
              Tem certeza que deseja remover este filtro?
            </p>
            <div className="mt-4 flex justify-end gap-4">
              <button onClick={() => setShowRemoveModal(false)} className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors">
                Cancelar
              </button>
              <button onClick={handleConfirmRemove} className="px-4 py-2 rounded bg-red-400 text-white hover:bg-red-500 transition-colors">
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md max-w-sm w-full">
            <p className="text-lg text-gray-800 font-medium">
              Escolhe um nome para este filtro:
            </p>
            <input
              type="text"
              value={filterNameInput}
              onChange={(e) => setFilterNameInput(e.target.value)}
              className="w-full border rounded px-3 py-2 mt-4 text-sm"
              placeholder="Nome do filtro..."
            />
            <div className="mt-4 flex justify-end gap-4">
              <button
                onClick={() => { setShowSaveModal(false); setFilterNameInput(""); }}
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmSave}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
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
