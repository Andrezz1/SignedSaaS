import { useState } from 'react';

interface BackendFilters {
  estadoSubscricao?: 'ativa' | 'expirada' | 'todas';
  faixaEtaria?: { min: number; max: number };
}

interface FilterUsersProps {
  applyFilters: (backendFilters: BackendFilters) => void;
}

interface SavedFilter {
  id: number;
  name: string;
  filters: {
    estado?: string[];
    faixa?: string[];
  };
}

const FilterUsers = ({ applyFilters }: FilterUsersProps) => {
  // Estado interno para os filtros atuais (usando "estado" e "faixa")
  const [filters, setFilters] = useState<{ 
    estado?: string[], 
    faixa?: string[]
  }>({
    estado: [],
    faixa: []
  });

  // Estado para os filtros guardados
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);

  // Estados dos dropdowns (accordion)
  const [isSavedOpen, setIsSavedOpen] = useState(true);
  const [isEstadoOpen, setIsEstadoOpen] = useState(true);
  const [isFaixaOpen, setIsFaixaOpen] = useState(true);

  // SVGs inline para os ícones do accordion
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

  // Atualiza o filtro interno para a chave "estado" ou "faixa"
  const toggleFilter = (type: "estado" | "faixa", value: string) => {
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

  // Aplica os filtros atuais: converte os valores para o formato que o backend espera
  const applyCurrentFilters = () => {
    const backendFilters: BackendFilters = {};

    // Filtro de estado: se nenhum ou ambos selecionados, "todas"
    const estado = filters.estado || [];
    if (estado.length === 0 || estado.length === 2) {
      backendFilters.estadoSubscricao = 'todas';
    } else if (estado.includes('Ativa')) {
      backendFilters.estadoSubscricao = 'ativa';
    } else if (estado.includes('Expirada')) {
      backendFilters.estadoSubscricao = 'expirada';
    }

    // Filtro de faixa etária: mapeia os rótulos para intervalos numéricos
    const ageMapping: Record<string, { min: number; max: number }> = {
      "Menor que 18": { min: 0, max: 18 },
      "18-65": { min: 18, max: 65 },
      "Maior que 65": { min: 65, max: 500 },
    };
    const faixa = filters.faixa || [];
    if (faixa.length > 0) {
      const mins = faixa.map(key => ageMapping[key].min);
      const maxs = faixa.map(key => ageMapping[key].max);
      backendFilters.faixaEtaria = {
        min: Math.min(...mins),
        max: Math.max(...maxs)
      };
    }

    applyFilters(backendFilters);
  };

  // Limpa os filtros (resetando o estado para vazio)
  const handleClearFilters = () => {
    const resetFilters = { estado: [], faixa: [] };
    setFilters(resetFilters);
    applyFilters({ estadoSubscricao: 'todas' });
  };

  // Salva os filtros atuais (como estão) nos filtros guardados
  const handleSaveFilters = () => {
    const nameInput = prompt("Digite um nome para este filtro guardado:");
    // Se o usuário cancelar ou enviar apenas espaços, não faz nada.
    if (nameInput === null || nameInput.trim() === "") {
      return;
    }
    const name = nameInput.trim();
    const newFilter: SavedFilter = {
      id: Date.now(),
      name,
      filters: { ...filters }
    };
    setSavedFilters(prev => [...prev, newFilter]);
  };
  

  // Remove um filtro salvo após confirmação
  const handleRemoveSavedFilter = (id: number) => {
    if (window.confirm("Tem certeza que deseja remover este filtro?")) {
      setSavedFilters(prev => prev.filter(f => f.id !== id));
    }
  };

  // Aplica um filtro guardado: atualiza os controles e chama applyFilters
  const handleApplySavedFilter = (saved: SavedFilter) => {
    setFilters(saved.filters);
    // Converte os filtros salvos para o formato do backend e aplica
    const backendFilters: BackendFilters = {};

    const estado = saved.filters.estado || [];
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
    const faixa = saved.filters.faixa || [];
    if (faixa.length > 0) {
      const mins = faixa.map(key => ageMapping[key].min);
      const maxs = faixa.map(key => ageMapping[key].max);
      backendFilters.faixaEtaria = {
        min: Math.min(...mins),
        max: Math.max(...maxs)
      };
    }
    applyFilters(backendFilters);
  };

  return (
    <div className="bg-gray-50 shadow p-4 rounded-md w-64 space-y-4">
      <h2 className="text-lg font-semibold">Filtros</h2>

      {/* Seção: Filtros Guardados – sempre visível como dropdown */}
      <div className="border-b border-gray-200 pb-2">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsSavedOpen(!isSavedOpen)}
        >
          <h3 className="font-medium text-sm">Guardados</h3>
          {isSavedOpen ? <ChevronDown /> : <ChevronRight />}
        </div>
        {isSavedOpen && (
          <div className="mt-2">
            {savedFilters.length === 0 ? (
              <p className="text-xs text-gray-500 italic">Nenhum filtro guardado.</p>
            ) : (
              <div className="flex flex-col gap-1">
                {savedFilters.map(sf => (
                  <div key={sf.id} className="flex items-center justify-between">
                    <button
                      onClick={() => handleApplySavedFilter(sf)}
                      className="text-xs text-gray-700 hover:underline"
                    >
                      {sf.name}
                    </button>
                    <button
                      onClick={() => handleRemoveSavedFilter(sf.id)}
                      className="text-gray-400 hover:text-red-600"
                      title="Remover este filtro"
                    >
                      <svg 
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="inline-block"
                      >
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

      {/* Seção: Estado da Subscrição */}
      <div className="border-b border-gray-200 pb-2">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsEstadoOpen(!isEstadoOpen)}
        >
          <h3 className="font-medium text-sm">Estado da Subscrição</h3>
          {isEstadoOpen ? <ChevronDown /> : <ChevronRight />}
        </div>
        {isEstadoOpen && (
          <div className="mt-2 space-y-2">
            <div className="flex items-center space-x-2">
              <input 
                id="ativa"
                type="checkbox" 
                value="Ativa" 
                checked={filters.estado?.includes('Ativa')} 
                onChange={() => toggleFilter("estado", "Ativa")} 
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <label htmlFor="ativa" className="text-sm text-gray-700 cursor-pointer">
                Ativa
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input 
                id="expirada"
                type="checkbox" 
                value="Expirada" 
                checked={filters.estado?.includes('Expirada')} 
                onChange={() => toggleFilter("estado", "Expirada")} 
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <label htmlFor="expirada" className="text-sm text-gray-700 cursor-pointer">
                Expirada
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Seção: Faixa Etária */}
      <div className="border-b border-gray-200 pb-2">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsFaixaOpen(!isFaixaOpen)}
        >
          <h3 className="font-medium text-sm">Faixa Etária</h3>
          {isFaixaOpen ? <ChevronDown /> : <ChevronRight />}
        </div>
        {isFaixaOpen && (
          <div className="mt-2 space-y-2">
            <div className="flex items-center space-x-2">
              <input 
                id="menor18"
                type="checkbox" 
                value="Menor que 18" 
                checked={filters.faixa?.includes('Menor que 18')} 
                onChange={() => toggleFilter("faixa", "Menor que 18")}
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <label htmlFor="menor18" className="text-sm text-gray-700 cursor-pointer">
                Menor que 18
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input 
                id="18-65"
                type="checkbox" 
                value="18-65" 
                checked={filters.faixa?.includes('18-65')} 
                onChange={() => toggleFilter("faixa", "18-65")}
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <label htmlFor="18-65" className="text-sm text-gray-700 cursor-pointer">
                18-65
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input 
                id="maior65"
                type="checkbox" 
                value="Maior que 65" 
                checked={filters.faixa?.includes('Maior que 65')} 
                onChange={() => toggleFilter("faixa", "Maior que 65")}
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <label htmlFor="maior65" className="text-sm text-gray-700 cursor-pointer">
                Maior que 65
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Botões de Ação */}
      <div className="space-y-2">
        <button 
          className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 text-sm font-medium"
          onClick={applyCurrentFilters}
        >
          Aplicar Filtros
        </button>
        <button 
          className="w-full bg-gray-300 text-gray-800 p-2 rounded-md hover:bg-gray-400 text-sm font-medium"
          onClick={handleClearFilters}
        >
          Limpar Filtros
        </button>
        <button 
          className="w-full bg-green-500 text-white p-2 rounded-md hover:bg-green-600 text-sm font-medium"
          onClick={handleSaveFilters}
        >
          Guardar Filtros
        </button>
      </div>
    </div>
  );
};

export default FilterUsers;
