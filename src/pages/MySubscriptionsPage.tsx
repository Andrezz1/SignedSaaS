import React from 'react';
import { type AuthUser } from 'wasp/auth';
import DefaultLayout from '../layout/DefaultLayout';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from 'wasp/client/operations';
import { getSubscricaoByUtilizadorId } from 'wasp/client/operations';
import LoadingSpinner from '../layout/LoadingSpinner';
import { PlusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

type LocationState = {
  userId?: number;
};

const MySubscriptionsPage = ({ user }: { user: AuthUser }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId } = (location.state as LocationState) || {};

  const { data: subscricoes = [], isLoading, error } = useQuery(
    getSubscricaoByUtilizadorId,
    { id: userId! },
    { enabled: Boolean(userId) }
  );

  // Puxa o objeto Utilizador do primeiro elemento (se existir)
  const utilizador = subscricoes[0]?.Utilizador;

  return (
    <DefaultLayout user={user}>
      {/* Botões de navegação */}
      <div className="flex justify-end mb-4 gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Voltar
        </button>
        <button
          onClick={() =>
            navigate('/ver-planos', { state: { userId } })
          }
          className="flex items-center px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Adicionar Subscrição
        </button>
      </div>

      {/* Conteúdo principal */}
      <div className="bg-white rounded-2xl shadow p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-800 mb-1">
            {utilizador
              ? `Subscrições de ${utilizador.Nome}`
              : `Subscrições do Utilizador #${userId}`}
          </h1>
          {utilizador && (
            <p className="text-base text-gray-500">
              NIF: {utilizador.NIF}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <p className="text-center text-red-500">
            Erro ao carregar subscrições.
          </p>
        ) : subscricoes.length > 0 ? (
          <ul className="space-y-4">
            {subscricoes.map((s) => (
              <li
                key={s.SubscricaoId}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md bg-gray-50"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700">
                    <p className="text-gray-600 mb-1">
                        <strong>Plano:</strong> {s.TipoSubscricao.Nome}
                    </p>
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      s.EstadoSubscricao
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {s.EstadoSubscricao ? 'Ativa' : 'Pendente'}
                  </span>
                </div>
                <p className="text-gray-600">
                  <strong>Duração:</strong>{' '}
                  {s.Duracao
                    ? `${s.Duracao.Nome} (Meses: ${s.Duracao.Meses})`
                    : '—'}
                </p>
                <p className="text-gray-600 mb-1">
                  <strong>Data de Inicio:</strong> {new Date(s.DataInicio).toLocaleDateString('pt-PT')}
                </p>
                <p className="text-gray-600 mb-1">
                  <strong>Data de Fim:</strong> {new Date(s.DataFim).toLocaleDateString('pt-PT')}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">
            Não existem subscrições para este utilizador.
          </p>
        )}
      </div>
    </DefaultLayout>
  );
};

export default MySubscriptionsPage;
