import { type AuthUser } from 'wasp/auth';
import DefaultLayout from '../layout/DefaultLayout';
import Breadcrumb from '../layout/Breadcrumb';
import FilterUsers from '../components/filterUsers';
import UsersTable from '../components/usersTable'; 
import { useState } from 'react';

const DashboardPage = ({ user }: { user: AuthUser }) => {
  const [showFilters, setShowFilters] = useState(true); // toggle para mostrar/esconder filtros, se quiseres no futuro

  return (
    <DefaultLayout user={user}>
      <Breadcrumb pageName="Dashboard" />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filtros à esquerda */}
        {showFilters && (
          <aside className="lg:w-1/4 w-full">
            <FilterUsers applyFilters={(filters) => console.log('Filtros aplicados:', filters)} />
          </aside>
        )}

        {/* Tabela à direita */}
        <section className="flex-1">
          <UsersTable />
        </section>
      </div>
    </DefaultLayout>
  );
};

export default DashboardPage;
