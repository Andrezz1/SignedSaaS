import React, { useEffect, useState } from 'react';
import { getTipoSubscricao } from 'wasp/client/operations';
import LoadingSpinner from '../layout/LoadingSpinner';

type Duracao = {
  DuracaoID: number;
  Nome: string;
};

type TipoSubscricaoDuracao = {
  Duracao: Duracao;
  Desconto?: number;
  ValorFinal: number;
};

type Plano = {
  TipoSubscricaoID: number;
  Nome: string;
  Descricao: string;
  PrecoBaseMensal: number;
  Duracoes: TipoSubscricaoDuracao[];
};

type Props = {
  showFilters: boolean;
  setShowFilters: (value: boolean) => void;
  appliedFilters: {
    duracoes: number[];
  };
};

const PlanosTable = ({ showFilters, setShowFilters, appliedFilters }: Props) => {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [filtered, setFiltered] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const [tempSearch, setTempSearch] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTipoSubscricao();
        const result = data.map((item: any) => ({ ...item, Duracoes: item.Duracoes || [] }));
        setPlanos(result);
        setFiltered(result);
      } catch (err) {
        console.error('Erro ao carregar planos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = planos;

    // Filtro por nome
    if (searchFilter.trim()) {
      filtered = filtered.filter((p) =>
        p.Nome.toLowerCase().includes(searchFilter.toLowerCase())
      );
    }

    // Filtro por duração
    if (appliedFilters.duracoes.length > 0) {
      filtered = filtered.filter((p) =>
        p.Duracoes.some((d) => appliedFilters.duracoes.includes(d.Duracao.DuracaoID))
      );
    }

    setFiltered(filtered);
    setCurrentPage(1);
  }, [searchFilter, appliedFilters, planos]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading) {
    return <div className="flex justify-center py-10"><LoadingSpinner /></div>;
  }

  return (
    <div className="w-full transition-all duration-300">
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        {/* Header com filtros e pesquisa */}
        <div className="flex items-center justify-between p-6 gap-3 bg-gray-100/40 dark:bg-gray-700/50">
          <div className="flex items-center gap-8">
            <span
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm font-bold text-black cursor-pointer hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 13.414V19a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              {showFilters ? "Esconder Filtros" : "Mostrar Filtros"}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-black">Por página:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                {[5, 10, 15, 20].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          <form
            className="relative w-[400px]"
            onSubmit={(e) => {
              e.preventDefault();
              setSearchFilter(tempSearch);
            }}
          >
            <input
              type="search"
              value={tempSearch}
              onChange={(e) => setTempSearch(e.target.value)}
              placeholder="Pesquisar por nome..."
              className="block w-full p-2 ps-10 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            />
            {tempSearch && (
              <button
                type="button"
                onClick={() => {
                  setTempSearch('');
                  setSearchFilter('');
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </form>
        </div>

        {/* Tabela */}
        <div className="grid grid-cols-12 border-t-4 border-stroke py-4 px-4 font-medium text-sm dark:border-strokedark md:px-6">
          <div className="col-span-2">Nome</div>
          <div className="col-span-3">Descrição</div>
          <div className="col-span-7 text-center">Detalhes</div>
        </div>

        {paginatedData.map((plano, index) => (
          <div key={index} className="grid grid-cols-12 border-t border-stroke px-4 py-6 text-sm dark:border-strokedark md:px-6">
            <div className="col-span-2 flex items-center">{plano.Nome}</div>
            <div className="col-span-3 flex items-center">{plano.Descricao || '-'}</div>
            <div className="col-span-7 flex flex-col gap-2">
              {plano.Duracoes.length > 0 ? plano.Duracoes.map((d, i) => (
                <div key={i} className="flex justify-between items-center gap-4 border border-gray-200 bg-gray-50 rounded-md px-4 py-2">
                  <div className="w-1/3">
                    <span className="text-gray-500 text-xs uppercase block">Duração</span>
                    <span className="font-medium">{d.Duracao?.Nome || '-'}</span>
                  </div>
                  <div className="w-1/3">
                    <span className="text-gray-500 text-xs uppercase block">Desconto</span>
                    <span className="font-medium">{d.Desconto !== undefined ? `${(d.Desconto * 100).toFixed(0)}%` : '0%'}</span>
                  </div>
                  <div className="w-1/3">
                    <span className="text-gray-500 text-xs uppercase block">Preço</span>
                    <span className="font-medium">{d.ValorFinal.toFixed(2)} €</span>
                  </div>
                </div>
              )) : <div className="text-sm text-gray-500">Sem durações</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Paginação */}
      <nav className="mt-4 flex justify-center">
        <ul className="inline-flex -space-x-px text-sm">
          <li>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              className="px-3 h-8 bg-white border border-gray-300 hover:bg-gray-100"
            >
              Anterior
            </button>
          </li>
          {Array.from({ length: totalPages }, (_, i) => (
            <li key={i}>
              <button
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 h-8 ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-white'} border border-gray-300`}
              >
                {i + 1}
              </button>
            </li>
          ))}
          <li>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              className="px-3 h-8 bg-white border border-gray-300 hover:bg-gray-100"
            >
              Seguinte
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default PlanosTable;
