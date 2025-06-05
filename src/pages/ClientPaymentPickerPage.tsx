import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getMetodoPagamentoCliente } from 'wasp/client/operations';
import type { MetodoPagamento } from 'wasp/entities';

const logos: Record<string, string> = {
  mbway: '/images/mbway-logo.png',
  multibanco: '/images/multibanco-logo.png',
  cartaodecredito: '/images/cartao-logo.png',
  transferenciabancaria: '/images/transferencia-logo.png',
};

interface SubscricaoState {
  tipo: 'subscricao';
  planId: number;
  userId: number;
  duracaoId: number;
}

interface DoacaoState {
  tipo: 'doacao';
  utilizadorId: number;
  valor: number;
  nota: string;
  token: string;
}

interface SubscricaoExistenteState {
  tipo: 'subscricao-existente';
  subscricaoId: number;
  userId: number;
  valor?: number;
}

type LocationState = SubscricaoState | DoacaoState | SubscricaoExistenteState;

const ClientPaymentPickerPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const locationState = state as LocationState;

  const [methods, setMethods] = useState<MetodoPagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMetodoPagamentoCliente();
        setMethods(data);
      } catch {
        setError('Erro ao carregar métodos de pagamento.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando métodos...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  const handleConfirm = () => {
    if (selectedId === null) return;

    const selectedMethod = methods.find(m => m.MetodoPagamentoId === selectedId);
    if (!selectedMethod) return;

    const key = selectedMethod.Nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '');

    const routeMap: Record<string, string> = {
      mbway: '/mbway-confirm',
      multibanco: '/multibanco-confirm',
      cartaodecredito: '/cartao-confirm',
      transferenciabancaria: '/transferencia-confirm',
    };

    const to = routeMap[key];
    if (!to) return;

    if (locationState.tipo === 'subscricao') {
      navigate(to, {
        state: {
          tipo: 'subscricao',
          planId: locationState.planId,
          userId: locationState.userId,
          duracaoId: locationState.duracaoId,
          metodoId: selectedId,
        }
      });
    }
    else if (locationState.tipo === 'doacao') {
      navigate(to, {
        state: {
          tipo: 'doacao',
          utilizadorId: locationState.utilizadorId,
          valor: locationState.valor,
          nota: locationState.nota,
          metodoId: selectedId,
          token: locationState.token,
        }
      });
    }
    else if (locationState.tipo === 'subscricao-existente') {
      navigate(to, {
        state: {
          tipo: 'subscricao-existente',
          subscricaoId: locationState.subscricaoId,
          userId: locationState.userId,
          metodoId: selectedId,
          valor: locationState.valor,
        }
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h2 className="text-2xl font-bold mb-8">Selecione o método de pagamento</h2>
        <div className="flex justify-center gap-6 flex-wrap max-w-6xl w-full">
          {methods.map(m => {
            const key = m.Nome
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/\s+/g, '');
            const logoSrc = logos[key];

            return (
              <div
                key={m.MetodoPagamentoId}
                onClick={() => setSelectedId(m.MetodoPagamentoId)}
                className={`
                  cursor-pointer bg-white p-6 rounded-2xl shadow-md
                  flex flex-col items-center transition-all
                  w-48 h-64
                  ${selectedId === m.MetodoPagamentoId
                    ? 'ring-4 ring-blue-500'
                    : 'hover:ring-2 hover:ring-blue-200'}
                `}
              >
                <div className="flex-grow flex items-center justify-center mb-4">
                  {logoSrc && <img src={logoSrc} alt={m.Nome} className="w-20 h-20 object-contain" />}
                </div>
                <span className="text-lg font-medium capitalize text-center break-words">{m.Nome}</span>
              </div>
            );
          })}
        </div>
      <div className="mt-10 flex gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 rounded-lg bg-gray-300 text-gray-800 font-semibold hover:bg-gray-400 transition"
        >
          Voltar
        </button>
        <button
          disabled={selectedId === null}
          onClick={handleConfirm}
          className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirmar
        </button>
      </div>
    </div>
  );
};

export default ClientPaymentPickerPage;
