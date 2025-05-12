import React, { useState, useEffect } from 'react';
import { getTipoSubscricao } from 'wasp/client/operations';
import LoadingSpinner from '../layout/LoadingSpinner';

type Duracao = {
  DuracaoID: number;
  Nome: string;
  Preco: number;
};

type Plano = {
  TipoSubscricaoID: number;
  Nome: string;
  Descricao: string;
  PrecoBaseMensal: number;
  Duracoes: { Duracao: Duracao }[];
};

const PlanosTable = () => {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchPlanos = async () => {
      try {
        const data = await getTipoSubscricao();
        setPlanos(data.map((item: any) => ({ ...item, Duracoes: item.Duracoes || [] })));
      } catch {
        setError('Erro ao carregar planos.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlanos();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full transition-all duration-300">
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="p-6 bg-gray-100/40 dark:bg-gray-700/50">
          <h2 className="text-lg font-semibold text-black dark:text-white">Planos de Subscrição</h2>
        </div>

        {/* Cabeçalho da Tabela */}
        <div className="grid grid-cols-12 border-t-4 border-stroke py-4 px-4 font-medium text-sm dark:border-strokedark md:px-6">
          <div className="col-span-2">Nome</div>
          <div className="col-span-4">Descrição</div>
          <div className="col-span-3">Duração</div>
          <div className="col-span-3">Preço</div>
        </div>

        {/* Linhas da Tabela */}
        {planos.map((plano, index) => (
          <div
            key={index}
            className="grid grid-cols-12 border-t border-stroke py-4 px-4 text-sm dark:border-strokedark md:px-6"
          >
            <div className="col-span-2 text-black dark:text-white">
              {plano.Nome}
            </div>
            <div className="col-span-4 text-black dark:text-white">
              {plano.Descricao || '-'}
            </div>
            <div className="col-span-3 text-black dark:text-white space-y-1">
              {plano.Duracoes?.length > 0 ? (
                plano.Duracoes.map((d, i) => (
                  <div key={i}>{d.Duracao?.Nome || 'Sem nome'}</div>
                ))
              ) : (
                <span>Sem durações</span>
              )}
            </div>
            <div className="col-span-3 text-black dark:text-white space-y-1">
              {plano.Duracoes?.length > 0 ? (
                plano.Duracoes.map((d, i) => (
                  <div key={i}>{d.Duracao?.Preco?.toFixed(2)} €</div>
                ))
              ) : (
                <span>-</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanosTable;
