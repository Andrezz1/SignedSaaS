// src/pages/PlanFormPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTipoSubscricao } from 'wasp/client/operations';
import type { TipoSubscricao } from 'wasp/entities';

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        Carregando planos...
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

  const handleNext = () => {
    if (selectedId === null) return;
    navigate('/payment-picker', {
      state: { planId: selectedId },
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      {/* Título principal */}
      <h1 className="text-3xl font-bold mb-8">
        Selecione o plano que deseja subscrever
      </h1>

      {/* Grid de cards */}
      <div
        className="grid gap-6 w-full max-w-5xl"
        style={{ gridTemplateColumns: `repeat(${tipos.length}, minmax(0, 1fr))` }}
      >
        {tipos.map((tipo) => (
          <div
            key={tipo.TipoSubscricaoID}
            onClick={() => setSelectedId(tipo.TipoSubscricaoID)}
            className={`
              cursor-pointer bg-white p-6 rounded-2xl shadow-md
              flex flex-col items-center justify-center text-center
              transition
              ${selectedId === tipo.TipoSubscricaoID
                ? 'ring-4 ring-blue-500'
                : 'hover:ring-2 hover:ring-blue-200'}
            `}
          >
            <h3 className="text-xl font-semibold capitalize">
              {tipo.Descricao}
            </h3>
            <p className="mt-4 text-3xl font-bold">€{tipo.Preco}</p>
          </div>
        ))}
      </div>

      {/* Botões Voltar e Próximo no centro */}
      <div className="mt-10 flex items-center justify-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 font-semibold hover:from-gray-400 hover:to-gray-500 transition"
        >
          Voltar
        </button>
        <button
          disabled={!selectedId}
          onClick={handleNext}
          className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Próximo
        </button>
      </div>
    </div>
  );
};

export default PlanFormPage;
