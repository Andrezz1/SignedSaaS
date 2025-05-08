import { type AuthUser } from 'wasp/auth';
import { NoSymbolIcon, PlusIcon } from '@heroicons/react/24/outline';
import DefaultLayout from '../layout/DefaultLayout';
import FilterUsers from '../components/filterUsers';
import UsersTable from '../components/usersTable';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const MembrosPage = ({ user }: { user: AuthUser }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica se há filtros no state da navegação
    if (location.state?.appliedFilters) {
      setAppliedFilters(location.state.appliedFilters);
      // Não mostra os filtros que vierem pré-selecionados
      setShowFilters(false);
    }
  }, [location.state]);

  const handleAddUser = () => {
    navigate('/create-membro');
  };

  const handleDisabledUsers = () => {
    navigate('/membros-desabilitados');
  };

  return (
    <DefaultLayout user={user}>
      {/* Botões alinhados à direita */}
      <div className="flex justify-end mb-4 gap-4">
        {/* Botão "Membros Desativados" com ícone de proibido */}
        <button
          onClick={handleDisabledUsers}
          className="flex items-center px-6 py-2 rounded-lg bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 font-semibold hover:from-gray-400 hover:to-gray-500 transition"
        >
          <NoSymbolIcon className="w-5 h-5 mr-2" />
          Membros Desabilitados
        </button>

        {/* Botão "Adicionar Membro" (com ícone +) */}
        <button
          onClick={handleAddUser}
          className="flex items-center px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Adicionar Membro
        </button>
      </div>

      {/* Tabela e filtros */}
      <div className="flex gap-4">
        {showFilters && (
          <aside className="w-64">
            <FilterUsers 
              applyFilters={setAppliedFilters} 
              utilizadorId={user.id}
              initialFilters={location.state?.appliedFilters} // Passa os filtros iniciais
            />
          </aside>
        )}
        <div className="flex-1">
          <UsersTable
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            appliedFilters={appliedFilters}
          />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default MembrosPage;