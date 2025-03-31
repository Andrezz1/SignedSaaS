import { type AuthUser } from 'wasp/auth';
import DefaultLayout from '../layout/DefaultLayout';
import FilterUsers from '../components/filterUsers';
import UsersTable from '../components/usersTable';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SociosPage = ({ user }: { user: AuthUser }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const navigate = useNavigate();

  const handleAddUser = () => {
    navigate('/create-socio'); 
  };

  return (
    <DefaultLayout user={user}>
      <div className="flex flex-col lg:flex-row gap-6">
        {showFilters && (
          <aside className="lg:w-1/4 w-full">
            <FilterUsers
              applyFilters={(filters) => console.log('Filtros aplicados:', filters)}
            />
          </aside>
        )}

        <section className={showFilters ? 'lg:w-3/4 w-full' : 'w-full'}>
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

          <UsersTable
            searchFilter={searchFilter}
            setSearchFilter={setSearchFilter}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
          />
        </section>
      </div>
    </DefaultLayout>
  );
};

export default SociosPage;
