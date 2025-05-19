import React from 'react';
import { useQuery } from 'wasp/client/operations';
import { getSubscricaoByUtilizadorId } from 'wasp/client/operations';
import LoadingSpinner from '../layout/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';

interface SubscriptionModalProps {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  userId,
  isOpen,
  onClose
}) => {
  const navigate = useNavigate();
  const { data: subscricoes = [], isLoading, error } = useQuery(
    getSubscricaoByUtilizadorId,
    { id: userId },
    { enabled: isOpen }
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
                 bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full
                   p-6 sm:p-8 mx-4 sm:mx-0 overflow-y-auto max-h-[80vh]
                   transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Subscrições do Utilizador
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <p className="text-center text-red-500">Erro ao carregar subscrições.</p>
        ) : subscricoes.length > 0 ? (
          <ul className="space-y-4">
            {subscricoes.map(s => (
              <li
                key={s.SubscricaoId}
                className="border border-gray-200 rounded-lg p-4
                           hover:shadow-md transition-shadow bg-gray-50"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700">
                    ID: {s.SubscricaoId}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full
                      ${s.EstadoSubscricao
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                      }`}
                  >
                    {s.EstadoSubscricao ? 'Ativa' : 'Pendente'}
                  </span>
                </div>
                <p className="text-gray-600 mb-1">
                  <span className="font-semibold">Plano:</span>{' '}
                  {s.TipoSubscricao.Nome}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Duração:</span>{' '}
                  {s.Duracao
                    ? `${s.Duracao.Nome} (${s.Duracao.Meses} meses)`
                    : '—'}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">
            Não existem subscrições para este utilizador.
          </p>
        )}

        <div className="mt-6 flex w-full justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg
                       hover:bg-gray-300 transition"
          >
            Fechar
          </button>
          <button
            onClick={() => navigate(`/ver-planos`, { state: { userId } })}
            className="inline-flex items-center whitespace-nowrap
            px-4 py-2 bg-blue-600 text-white rounded-lg
            hover:bg-blue-700 transition"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Adicionar Nova Subscrição
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
