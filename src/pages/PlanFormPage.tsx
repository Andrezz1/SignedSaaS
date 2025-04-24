import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTipoSubscricao } from 'wasp/client/operations';
import type { TipoSubscricao } from 'wasp/entities';

// Página de seleção de Plano sem usar useQuery
const PlanFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [tipos, setTipos] = useState<TipoSubscricao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const data = await getTipoSubscricao();
        setTipos(data);
      } catch {
        setError('Erro ao carregar planos.');
      } finally {
        setLoading(false);
      }
    };
    fetchTipos();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando planos...</div>;
  }
  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

const handleNext = () => {
  if (selectedId === null) return;
  navigate('/payment-picker', {
    state: { planId: selectedId }
  });
};

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div
        className="grid gap-6 w-full max-w-5xl"
        style={{ gridTemplateColumns: `repeat(${tipos.length}, minmax(0, 1fr))` }}
      >
        {tipos.map((tipo) => (
          <div
            key={tipo.TipoSubscricaoID}
            onClick={() => setSelectedId(tipo.TipoSubscricaoID)}
            className={`cursor-pointer bg-white p-6 rounded-2xl shadow-md flex flex-col transition
              ${selectedId === tipo.TipoSubscricaoID ? 'ring-4 ring-blue-500' : 'hover:ring-2 hover:ring-blue-200'}`}
          >
            <h3 className="text-xl font-semibold capitalize">{tipo.Descricao}</h3>
            <p className="mt-4 text-3xl font-bold">€{tipo.Preco}</p>
          </div>
        ))}
      </div>

      <button
        disabled={!selectedId}
        onClick={handleNext}
        className="mt-8 px-8 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Próximo
      </button>
    </div>
  );
};

export default PlanFormPage;
