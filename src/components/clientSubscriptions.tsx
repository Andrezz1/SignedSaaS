import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientUser } from '../components/clientUserContext';
import { useQuery, getSubscricaoByUtilizadorId } from 'wasp/client/operations';
import { ArrowRightIcon, PlusIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../layout/LoadingSpinner';

const ClientSubscriptions: React.FC = () => {
  const { userId, token } = useClientUser();
  const navigate = useNavigate();

  const isReady = userId !== null && token !== null;

  const { data: subscricoes = [], isLoading, error } = useQuery(
    getSubscricaoByUtilizadorId,
    { id: userId!, token: token! },
    { enabled: isReady }
  );

  const utilizador = subscricoes[0]?.Utilizador;
  const visibleSubscricoes = subscricoes.filter((s) => s.estado !== 'Expirada');

  return (
    <div className="w-full px-4 md:px-8">
      {/* Navegação */}
      <div className="flex justify-end mb-4 gap-4">
        <button
          onClick={() => navigate('/ver-planos', { state: { userId } })}
          className="flex items-center px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Adicionar Subscrição
        </button>
      </div>

      {/* Cabeçalho */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h1 className="text-3xl font-semibold text-gray-800 mb-1">
          {utilizador
            ? `Minhas Subscrições `
            : 'Minhas Subscrições'}
        </h1>
      </div>

      {/* Lista de subscrições */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <p className="text-center text-red-500">Erro ao carregar subscrições.</p>
      ) : visibleSubscricoes.length > 0 ? (
        <ul className="space-y-6">
          {visibleSubscricoes.map((s) => (
            <li
              key={s.SubscricaoId}
              className="relative border border-gray-200 rounded-2xl p-6 bg-white shadow-sm hover:shadow-md transition"
            >
              {/* Badge de estado */}
              <span
                className={`absolute top-4 right-4 px-2 py-1 text-xs font-semibold rounded-full ${
                  s.estado === 'Ativa'
                    ? 'bg-green-100 text-green-800'
                    : s.estado === 'Pendente'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {s.estado}
              </span>

              {/* Conteúdo da subscrição */}
              <div className="space-y-2">
                <p className="text-gray-800 font-medium">
                  <strong>Plano:</strong> {s.TipoSubscricao.Nome}
                </p>
                <p className="text-gray-600">
                  <strong>Duração:</strong>{' '}
                  {s.Duracao
                    ? `${s.Duracao.Nome} (Meses: ${s.Duracao.Meses})`
                    : '—'}
                </p>
                <p className="text-gray-600">
                  <strong>Data de Início:</strong>{' '}
                  {new Date(s.DataInicio).toLocaleDateString('pt-PT')}
                </p>
                <p className="text-gray-600">
                  <strong>Data de Fim:</strong>{' '}
                  {new Date(s.DataFim).toLocaleDateString('pt-PT')}
                </p>
              </div>

              {/* Link de pagamento */}
              {s.estado === 'Por pagar' && (
                <p
                  onClick={() =>
                    navigate('/payment-picker', {
                      state: {
                        tipo: 'subscricao-existente',
                        subscricaoId: s.SubscricaoId,
                        userId: s.UtilizadorId,
                        valor: s.TipoSubscricao.PrecoBaseMensal * (s.Duracao?.Meses ?? 1),
                      },
                    })
                  }
                  className="absolute bottom-4 right-4 flex items-center text-base font-bold text-black underline hover:text-gray-600 cursor-pointer"
                >
                  Realizar Pagamento
                  <ArrowRightIcon className="w-4 h-4 ml-1" />
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500">
          Ainda não tens nenhuma subscrição.
        </p>
      )}
    </div>
  );
};

export default ClientSubscriptions;
