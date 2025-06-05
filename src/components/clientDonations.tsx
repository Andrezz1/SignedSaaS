import React from 'react';
import { useClientUser } from '../components/clientUserContext';
import { useQuery, getDoacaoByUtilizadorId } from 'wasp/client/operations';
import { ArrowLeftIcon, HeartIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../layout/LoadingSpinner';

const ClientDonations: React.FC = () => {
  const { userId, token } = useClientUser();
  const navigate = useNavigate();

  const isReady = userId !== null && token !== null;

  const { data: doacoes = [], isLoading, error } = useQuery(
    getDoacaoByUtilizadorId,
    { id: userId!, token: token! },
    { enabled: isReady }
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-PT', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + ' €';

  return (
    <div className="w-full px-4 md:px-8">
      {/* Navegação topo */}
      <div className="flex justify-end mb-4 gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Voltar
        </button>

        {/* Se quiseres adicionar um botão para nova doação, ativa este */}
        <button
          onClick={() => navigate('/client-create-donation')}
          className="flex items-center px-6 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition"
        >
          <HeartIcon className="w-5 h-5 mr-2" />
          Fazer Doação
        </button>
      </div>

      {/* Cabeçalho da página */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h1 className="text-3xl font-semibold text-gray-800 mb-1">
          Minhas Doações
        </h1>
      </div>

      {/* Conteúdo */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <p className="text-center text-red-500">Erro ao carregar doações.</p>
      ) : doacoes.length > 0 ? (
        <ul className="space-y-6">
          {doacoes.map((doacao) => (
            <li
              key={doacao.DoacaoId}
              className="border border-gray-200 rounded-2xl p-6 bg-white shadow-sm hover:shadow-md transition"
            >
              <div className="space-y-2">
                <p className="text-gray-800 font-medium text-lg">
                  Valor Doado: <span className="font-semibold">{formatCurrency(doacao.ValorDoacao)}</span>
                </p>
                <p className="text-gray-600">
                  <strong>Data Doação:</strong> {new Date(doacao.DataDoacao).toLocaleDateString('pt-PT')}
                </p>
                <p className="text-gray-600">
                  <strong>Nota:</strong> {doacao.Nota?.trim() || '–'}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500">
          Ainda não tem nenhuma doação.
        </p>
      )}
    </div>
  );
};

export default ClientDonations;
