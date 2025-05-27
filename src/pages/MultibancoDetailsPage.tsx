import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getPagamento, getUtilizadorInfoById } from 'wasp/client/operations';
import type { Pagamento } from 'wasp/entities';

interface SubscricaoState {
  tipo: 'subscricao';
  paymentId: number;
  planName: string;
  planDesc: string;
  duracaoNome: string;
  duracaoMeses: number;
}

interface DoacaoState {
  tipo: 'doacao';
  paymentId: number;
  utilizadorId: number;
  nota: string;
}

interface SubscricaoExistenteDetailsState {
  tipo: 'subscricao-existente';
  paymentId: number;
  subscricaoId: number;
  planName: string;
  planDesc: string;
  duracaoNome: string;
  duracaoMeses: number;
}

type LocationState =
  | SubscricaoState
  | DoacaoState
  | SubscricaoExistenteDetailsState;

const MultibancoDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const locationState = state as LocationState;

  const [pagamento, setPagamento] = useState<Pagamento | null>(null);
  const [doadorNome, setDoadorNome] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const all = await getPagamento();
        const found = all.find(p => p.PagamentoId === locationState.paymentId);
        if (!found) throw new Error('Pagamento não encontrado.');
        setPagamento(found);

        if (locationState.tipo === 'doacao') {
          const result = await getUtilizadorInfoById({ id: locationState.utilizadorId });
          const nome = result?.[0]?.utilizador?.Nome;
          setDoadorNome(nome || 'Doação Anônima');
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [locationState]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="text-sm text-gray-500">Carregando detalhes…</span>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="text-sm text-red-500">{error}</span>
      </div>
    );

  const detalhes = (pagamento!.DadosEspecificos as any) || {};

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-lg p-6 space-y-6">
        <h1 className="text-xl font-bold text-center">Detalhes do Pagamento</h1>

        {/* Subscrição nova ou existente */}
        {(locationState.tipo === 'subscricao' ||
          locationState.tipo === 'subscricao-existente') && (
          <>
            <div>
              <h2 className="text-sm font-medium text-gray-600">
                {locationState.tipo === 'subscricao'
                  ? 'Plano Subscrito'
                  : 'Plano Existente'}
              </h2>
              <div className="mt-1 text-gray-800 space-y-1 text-sm">
                <p>
                  <span className="font-semibold">Nome:</span>{' '}
                  {locationState.planName}
                </p>
                <p>
                  <span className="font-semibold">Descrição:</span>{' '}
                  {locationState.planDesc}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-medium text-gray-600">Duração</h2>
              <div className="mt-1 text-gray-800 space-y-1 text-sm">
                <p>
                  <span className="font-semibold">Tipo:</span>{' '}
                  {locationState.duracaoNome}
                </p>
                <p>
                  <span className="font-semibold">Meses:</span>{' '}
                  {locationState.duracaoMeses}
                </p>
              </div>
            </div>

            <hr className="border-gray-200" />
          </>
        )}

        {/* Doação */}
        {locationState.tipo === 'doacao' && (
          <>
            <div>
              <h2 className="text-sm font-medium text-gray-600">
                Detalhes da Doação
              </h2>
              <div className="mt-1 text-gray-800 space-y-1 text-sm">
                <p>
                  <span className="font-semibold">Doador:</span> {doadorNome}
                </p>
                <p>
                  <span className="font-semibold">Mensagem do Doador:</span>{' '}
                  {locationState.nota || 'Sem Mensagem'}
                </p>
              </div>
            </div>
            <hr className="border-gray-200" />
          </>
        )}

        {/* Dados Multibanco */}
        <div>
          <h2 className="text-sm font-medium text-gray-600">
            Detalhes Multibanco
          </h2>
          <div className="mt-1 text-gray-800 space-y-1 text-sm">
            {detalhes.entidade && (
              <p>
                <span className="font-semibold">Entidade:</span>{' '}
                {detalhes.entidade}
              </p>
            )}
            {detalhes.referencia && (
              <p>
                <span className="font-semibold">Referência:</span>{' '}
                {detalhes.referencia}
              </p>
            )}
            {detalhes.valor && (
              <p>
                <span className="font-semibold">Montante:</span> €
                {Number(detalhes.valor).toFixed(2)}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          Voltar ao Início
        </button>
      </div>
    </div>
  );
};

export default MultibancoDetailsPage;
