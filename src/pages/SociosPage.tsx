import { type AuthUser } from 'wasp/auth';
import DefaultLayout from '../layout/DefaultLayout';
import FilterUsers from '../components/filterUsers';
import UsersTable from '../components/usersTable';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SociosPage = ({ user }: { user: AuthUser }) => {
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const handleAddUser = () => {
    navigate('/create-socio');
  };

  return (
    <DefaultLayout user={user}>
      {/* Botão "Adicionar Sócio" no topo */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleAddUser}
          className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded shadow"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          <span className="ml-2">Adicionar Sócio</span>
        </button>
      </div>

      {/* Layout de duas colunas (filtros + tabela) */}
      <div className="flex gap-4">
        {/* Se showFilters estiver true, exibe o <aside> com os filtros */}
        {showFilters && (
          <aside className="w-64">
            <FilterUsers
              applyFilters={(filters) => console.log('Filtros aplicados:', filters)}
            />
          </aside>
        )}

        {/* A tabela ocupa o restante do espaço */}
        <div className="flex-1">
          <UsersTable
            showFilters={showFilters}
            setShowFilters={setShowFilters}
          />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default SociosPage;
