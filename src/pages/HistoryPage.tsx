import React, { useState } from 'react';
import { type AuthUser } from 'wasp/auth';
import DefaultLayout from '../layout/DefaultLayout';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from 'wasp/client/operations';
import { getSubscricaoByUtilizadorId } from 'wasp/client/operations';
import HistoryTable from '../components/historyTable';
import FilterTipoPagamento from '../components/filterTipoPagamento';

type LocationState = {
  userId?: number;
};

type Filters = {
  tipoPagamento?: 'Subscricao' | 'Doacao';
};

const HistoryPage = ({ user }: { user: AuthUser }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId } = (location.state as LocationState) || {};

  const [showFilters, setShowFilters] = useState(true);
  const [appliedFilters, setAppliedFilters] = useState<Filters>({});

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

      <div className="flex gap-4">
        {showFilters && (
          <aside className="w-64">
            <FilterTipoPagamento applyFilters={setAppliedFilters} />
          </aside>
        )}

        <div className="flex-1">
          {userId && (
            <HistoryTable
              utilizadorId={userId}
              filters={appliedFilters}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
            />
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default HistoryPage;
