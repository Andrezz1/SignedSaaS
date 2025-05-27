import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getMetodoPagamento } from 'wasp/client/operations';
import type { MetodoPagamento } from 'wasp/entities';

const logos: Record<string, string> = {
  mbway: '/images/mbway-logo.png',
  multibanco: '/images/multibanco-logo.png',
  cartaodecredito: '/images/cartao-logo.png',
  dinheiro: '/images/dinheiro-logo.png',
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
}

interface SubscricaoExistenteState {
  tipo: 'subscricao-existente';
  subscricaoId: number;
  userId: number;
  valor?: number;
  planName: string
  planDesc: string
  duracaoNome: string
  duracaoMeses: number
}

type LocationState = SubscricaoState | DoacaoState | SubscricaoExistenteState;

const PaymentPickerPage: React.FC = () => {
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
        const data = await getMetodoPagamento();
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
      dinheiro: '/dinheiro-confirm',
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
          planName: locationState.planName,
          planDesc: locationState.planDesc,
          duracaoNome: locationState.duracaoNome,
          duracaoMeses: locationState.duracaoMeses,
        }
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h2 className="text-2xl font-bold mb-8">Selecione o método de pagamento</h2>
      <div
        className="grid gap-6 w-full max-w-5xl"
        style={{ gridTemplateColumns: `repeat(${methods.length}, minmax(200px, 1fr))` }}
      >
        {methods.map(m => {
          const key = m.Nome
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '');
          const logoSrc = logos[key];
          const isTransfer = key === 'transferenciabancaria';
          const imgSize = isTransfer ? 'w-32 h-32' : 'w-20 h-20';

          return (
            <div
              key={m.MetodoPagamentoId}
              onClick={() => setSelectedId(m.MetodoPagamentoId)}
              className={`
                cursor-pointer bg-white p-6 rounded-2xl shadow-md
                flex flex-col items-center transition-all max-w-xs
                ${selectedId === m.MetodoPagamentoId
                  ? 'ring-4 ring-blue-500'
                  : 'hover:ring-2 hover:ring-blue-200'}
              `}
            >
              <div className="h-32 mb-4 flex items-center justify-center">
                {logoSrc && <img src={logoSrc} alt={m.Nome} className={`${imgSize} object-contain`} />}
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

export default PaymentPickerPage;
