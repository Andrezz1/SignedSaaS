import React, { useState } from 'react';
import { useNavigate, useLocation, Location } from 'react-router-dom';
import { useQuery, getDuracaoByTipoSubscricaoId } from 'wasp/client/operations';
import LoadingSpinner from '../layout/LoadingSpinner';

interface DurationFormLocationState {
  tipo: 'subscricao';
  userId: number;
  planId: number;
  planName: string;
}

interface DuracaoWithExtras {
  DuracaoId: number;
  Nome: string;
  Meses: number;
  Valor: number;
  TipoSubscricaoDuracaoId: number;
}

const DurationFormPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation() as Location & { state: DurationFormLocationState };
  const { userId, planId, planName } = location.state;

  const { data: duracoes = [], isLoading, error } = useQuery(
    getDuracaoByTipoSubscricaoId,
    { TipoSubscricaoID: planId }
  );

  const [selectedId, setSelectedId] = useState<number | null>(null);

  if (isLoading) return <LoadingSpinner />;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center text-red-500">
      Erro ao carregar durações.
    </div>
  );

  const sortedDuracoes = [...duracoes].sort(
    (a, b) => a.DuracaoId - b.DuracaoId
  );

  const handleNext = () => {
    if (selectedId == null) return;
    navigate('/payment-picker', {
      state: { userId, planId, duracaoId: selectedId, tipo: 'subscricao' }
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      {/* Badge com o nome do plano */}
      <div className="mb-4">
        <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
          Plano selecionado: <strong>{planName}</strong>
        </span>
      </div>

      <h1 className="text-3xl font-bold mb-8">
        Selecione a duração do plano
      </h1>

      {/* Grid com colunas fixas e centralizado */}
      <div
        className="grid gap-6 w-full max-w-6xl justify-center"
        style={{ gridTemplateColumns: 'repeat(auto-fit, 260px)' }}
      >
        {sortedDuracoes.map((dur: DuracaoWithExtras) => (
          <div
            key={dur.DuracaoId}
            onClick={() => setSelectedId(dur.DuracaoId)}
            className={`
              cursor-pointer bg-white p-6 rounded-2xl shadow-md
              flex flex-col justify-between h-60
              transition-all duration-200
              ${selectedId === dur.DuracaoId
                ? 'ring-4 ring-blue-500 shadow-lg'
                : 'hover:shadow-lg hover:ring-2 hover:ring-blue-200'}
            `}
          >
            {/* Nome */}
            <div>
              <div className="text-xs uppercase text-gray-400">Nome</div>
              <h3 className="text-lg font-semibold text-gray-800">
                {dur.Nome}
              </h3>
            </div>

            {/* Detalhes */}
            <div className="space-y-2 text-sm text-gray-600">
              <div><span className="font-semibold">Meses:</span> {dur.Meses}</div>
              <div><span className="font-semibold">Preço:</span> €{dur.Valor.toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Botões */}
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

export default DurationFormPage;
