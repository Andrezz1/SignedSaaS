import React, { useState } from 'react';
import { useQuery, useAction } from 'wasp/client/operations';
import { getPagamentosPendentes, confirmarPagamentoFisico } from 'wasp/client/operations';
import type { Pagamento } from 'wasp/entities';
import LoadingSpinner from '../layout/LoadingSpinner';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-PT', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value) + ' €';

const PendingPaymentsTable: React.FC = () => {
  const [tempSearch, setTempSearch] = useState('');
  const [searchFilter, setSearchFilter] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalInfo, setModalInfo] = useState<{
    pagamentoId: number;
    acao: 'concluir' | 'cancelar';
  } | null>(null);

  const { data: pagamentos, isLoading, error, refetch } = useQuery(getPagamentosPendentes, {
    page: currentPage,
    pageSize,
    searchTerm: searchFilter
  });

  const executarAcaoPagamento = useAction(confirmarPagamentoFisico);

  type PagamentoComRelacionamentos = Pagamento & {
    Utilizador?: {
      Nome?: string;
      Contacto: {
        Telemovel?: string;
      };
    };
    MetodoPagamento?: {
      Nome: string;
    };
  };

  const rows: PagamentoComRelacionamentos[] = pagamentos?.data ?? [];
  const totalPages = pagamentos?.totalPages ?? 1;

  const handleConfirmAction = async () => {
    if (!modalInfo) return;
    try {
      await executarAcaoPagamento({
        PagamentoId: modalInfo.pagamentoId,
        EstadoPagamento: modalInfo.acao,
        Utilizador: { id: 0 }
      });
      setModalInfo(null);
      await refetch();
    } catch (error: any) {
      alert(`Erro ao ${modalInfo.acao === 'concluir' ? 'confirmar' : 'cancelar'} pagamento: ${error.message}`);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <p className="p-4 text-red-500">Erro: {String(error)}</p>;

  return (
    <div className="w-full transition-all duration-300 space-y-6">
      <div className="rounded-sm border border-stroke bg-white shadow-default">
        <div className="flex items-center justify-between p-6 gap-3 w-full bg-gray-100/40">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-black">Por página:</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-16 border border-gray-300 rounded px-2 py-1 text-sm bg-white"
            >
              {[5, 10, 15, 20].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          <form
            className="relative w-64"
            onSubmit={e => {
              e.preventDefault();
              setSearchFilter(tempSearch || undefined);
              setCurrentPage(1);
            }}
          >
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
              </svg>
            </div>
            <input
              type="search"
              placeholder="Pesquisar..."
              value={tempSearch}
              onChange={e => setTempSearch(e.target.value)}
              className="block w-full p-2 pl-10 pr-8 text-sm border border-gray-300 rounded-lg bg-gray-50"
            />
            {tempSearch && (
              <button
                type="button"
                onClick={() => {
                  setTempSearch('');
                  setSearchFilter(undefined);
                  setCurrentPage(1);
                }}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </form>
        </div>

        <div className="grid grid-cols-12 border-t-4 border-stroke py-4.5 px-4 md:px-6 font-medium">
          <div className="col-span-3">Utilizador</div>
          <div className="col-span-2">Valor</div>
          <div className="col-span-2">Método de Pagamento</div>
          <div className="col-span-2">Nº de Telemóvel</div>
          <div className="col-span-1">Estado</div>
          <div className="col-span-2 text-center">Ações</div>
        </div>

        {rows.length > 0 ? (
          rows.map((p, i) => {
            const metodo = p.MetodoPagamento?.Nome;
            const permiteAcoes = metodo === 'Dinheiro' || metodo === 'Transferência Bancária';

            return (
              <div
                key={i}
                className="grid grid-cols-12 border-t border-stroke py-4.5 px-4 md:px-6 items-center"
              >
                <div className="col-span-3 text-sm text-black">{p.Utilizador?.Nome || '–'}</div>
                <div className="col-span-2 text-sm text-black">{formatCurrency(p.Valor)}</div>
                <div className="col-span-2 text-sm text-black">{metodo || '–'}</div>
                <div className="col-span-2 text-sm text-black">{p.Utilizador?.Contacto?.Telemovel || '–'}</div>
                <div className="col-span-1 text-sm text-black">{p.EstadoPagamento}</div>
                <div className="col-span-2 flex justify-center">
                  {permiteAcoes && (
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => setModalInfo({ pagamentoId: p.PagamentoId, acao: 'cancelar' })}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 transition"
                      >
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancelar
                      </button>
                      <button
                        onClick={() => setModalInfo({ pagamentoId: p.PagamentoId, acao: 'concluir' })}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 transition"
                      >
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Confirmar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-4 text-center text-gray-500">Não há pagamentos pendentes.</div>
        )}
      </div>

      <nav aria-label="Navegação de páginas" className="mt-4 flex justify-center">
        <ul className="inline-flex -space-x-px text-sm">
          <li>
            <button
              onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
              className="flex items-center justify-center px-3 h-8 text-gray-500 border border-gray-300 rounded-l-lg hover:bg-gray-100"
            >
              Anterior
            </button>
          </li>
          {Array.from({ length: totalPages }, (_, idx) => (
            <li key={idx}>
              <button
                onClick={() => setCurrentPage(idx + 1)}
                className={`flex items-center justify-center px-3 h-8 leading-tight ${
                  currentPage === idx + 1
                    ? 'text-blue-600 border border-gray-300 bg-blue-50 hover:bg-blue-100'
                    : 'text-gray-500 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                {idx + 1}
              </button>
            </li>
          ))}
          <li>
            <button
              onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
              className="flex items-center justify-center px-3 h-8 text-gray-500 border border-gray-300 rounded-r-lg hover:bg-gray-100"
            >
              Seguinte
            </button>
          </li>
        </ul>
      </nav>

      {modalInfo && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-md max-w-sm w-full">
            <p className="text-gray-800 font-medium mb-4">
              Tem a certeza que deseja {modalInfo.acao === 'concluir' ? 'confirmar' : 'cancelar'} este pagamento?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalInfo(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm"
              >
                Fechar
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-4 py-2 text-sm font-semibold text-white rounded ${
                  modalInfo.acao === 'concluir'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingPaymentsTable;
