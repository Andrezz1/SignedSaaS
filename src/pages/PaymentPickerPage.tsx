// src/pages/PaymentPickerPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getMetodoPagamento } from 'wasp/client/operations';
import type { MetodoPagamento } from 'wasp/entities';

// Mapeamento dos nomes (lowercase, sem espaços) para o ficheiro
const logos: Record<string, string> = {
  mbway: '/images/mbway-logo.png',
  multibanco: '/images/multibanco-logo.png',
};

interface LocationState {
  planId: number;
}

const PaymentPickerPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { planId } = state as LocationState;

  const [methods, setMethods] = useState<MetodoPagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const data = await getMetodoPagamento();
        setMethods(data);
      } catch {
        setError('Erro ao carregar métodos de pagamento.');
      } finally {
        setLoading(false);
      }
    };
    fetchMethods();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Carregando métodos...
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

  const handleConfirm = () => {
    if (selectedId === null) return;
  
    const selectedMethod = methods.find(m => m.MetodoPagamentoId === selectedId);
    if (!selectedMethod) return;
  
    const methodKey = selectedMethod.Nome.toLowerCase().replace(/\s+/g, '');
  
    if (methodKey === 'mbway') {
      navigate('/mbway-confirm', {
        state: { planId, metodoId: selectedId },
      });
    } else {
      navigate('/multibanco-confirm', {
        state: { planId, metodoId: selectedId },
      });
    }
  };

  // altura fixa para o slot de ícone em todos
  const iconContainerHeight = 'h-32';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h2 className="text-2xl font-bold mb-6">Selecione o método de pagamento</h2>

      <div
        className="grid gap-6 w-full max-w-4xl"
        style={{ gridTemplateColumns: `repeat(${methods.length}, minmax(0, 1fr))` }}
      >
        {methods.map((m) => {
          const key = m.Nome.toLowerCase().replace(/\s+/g, '');
          const logoSrc = logos[key];  // só mostra img se existir

          // Define tamanho do <img> segundo o método
          const imgSizeClass = key === 'mbway'
            ? 'w-24 h-24'
            : 'w-16 h-16';

          return (
            <div
              key={m.MetodoPagamentoId}
              onClick={() => setSelectedId(m.MetodoPagamentoId)}
              className={`
                cursor-pointer bg-white p-6 rounded-2xl shadow-md
                flex flex-col items-center transition
                ${selectedId === m.MetodoPagamentoId
                  ? 'ring-4 ring-blue-500'
                  : 'hover:ring-2 hover:ring-blue-200'}
              `}
            >
              {logoSrc && (
                <div className={`${iconContainerHeight} mb-4 flex items-center justify-center`}>
                  <img
                    src={logoSrc}
                    alt={m.Nome}
                    className={`${imgSizeClass} object-contain`}
                  />
                </div>
              )}
              <span className="text-lg font-medium capitalize">{m.Nome}</span>
            </div>
          );
        })}
      </div>

      {/* Botões Voltar e Confirmar */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 font-semibold hover:from-gray-400 hover:to-gray-500 transition"
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
