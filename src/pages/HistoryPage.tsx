import React from 'react';
import { type AuthUser } from 'wasp/auth';
import DefaultLayout from '../layout/DefaultLayout';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from 'wasp/client/operations';
import { getSubscricaoByUtilizadorId } from 'wasp/client/operations';
import HistoryTable from '../components/historyTable';

type LocationState = {
  userId?: number;
};

const HistoryPage = ({ user }: { user: AuthUser }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId } = (location.state as LocationState) || {};

  const { data: subscricoes = [], isLoading, error } = useQuery(
    getSubscricaoByUtilizadorId,
    { id: userId! },
    { enabled: Boolean(userId) }
  );

  const utilizador = subscricoes[0]?.Utilizador;


  return (
    <DefaultLayout user={user}>

      {/* Cabeçalho */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <h1 className="text-3xl font-semibold text-gray-800 mb-1">
          {utilizador
            ? `Histórico de ${utilizador.Nome}`
            : `Histórico de #${userId}`}
        </h1>
        {utilizador && (
          <p className="text-base text-gray-500">NIF: {utilizador.NIF}</p>
        )}
      </div>
      {userId && <HistoryTable utilizadorId={userId} />}
    </DefaultLayout>
  );
};

export default HistoryPage;
