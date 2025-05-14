import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getTipoSubscricao } from 'wasp/client/operations';
import type { TipoSubscricao } from 'wasp/entities';

const PlanFormPage: React.FC = () => {
  const navigate = useNavigate();
  const [tipos, setTipos] = useState<TipoSubscricao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { state } = useLocation() as { state: { userId: number } };
  const userId = state?.userId; 

  useEffect(() => {
    (async () => {
      try {
        const data = await getTipoSubscricao();
        setTipos(data);
      } catch {
        setError('Erro ao carregar planos.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      Carregando planos...
    </div>
  );
  if (error) return (
    <div className="min-h-screen flex items-center justify-center text-red-500">
      {error}
    </div>
  );

  const handleNext = () => {
    if (selectedId == null) return;
    const planName = tipos.find(t => t.TipoSubscricaoID === selectedId)?.Nome || '';
    navigate('/duration-picker', {
       state: { 
        planId: selectedId,
        userId,
        planName
       } 
      });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-8">
        Selecione o plano que deseja subscrever
      </h1>

      <div
        className="grid gap-6 w-full max-w-6xl"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}
      >
        {tipos.map((tipo) => (
          <div
            key={tipo.TipoSubscricaoID}
            onClick={() => setSelectedId(tipo.TipoSubscricaoID)}
            className={`
              cursor-pointer bg-white p-6 rounded-2xl shadow-md
              flex flex-col justify-between h-48
              transition-all duration-200
              ${selectedId === tipo.TipoSubscricaoID
                ? 'ring-4 ring-blue-500 shadow-lg'
                : 'hover:shadow-lg hover:ring-2 hover:ring-blue-200'}
            `}
          >
            {/* Bloco do Nome */}
            <div>
              <div className="text-xs uppercase text-gray-400">
                Nome do Plano
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                {tipo.Nome}
              </h3>
            </div>

            {/* Bloco da Descrição */}
            <div>
              <div className="text-xs uppercase text-gray-400">
                Descrição
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {tipo.Descricao}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 font-semibold hover:from-gray-400 hover:to-gray-500 transition"
        >
          Voltar
        </button>
        <button
          disabled={selectedId == null}
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
