import { type AuthUser } from 'wasp/auth';
import DefaultLayout from '../layout/DefaultLayout';
import Breadcrumb from '../layout/Breadcrumb';
import FilterUsers from '../components/filterUsers';
import UsersTable from '../components/usersTable';
import { useState } from 'react';

const SociosPage = ({ user }: { user: AuthUser }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  return (
    <DefaultLayout user={user}>
      <Breadcrumb pageName="Dashboard" />

      <div className="flex flex-col lg:flex-row gap-6">
        {showFilters && (
          <aside className="lg:w-1/4 w-full">
            <FilterUsers applyFilters={(filters) => console.log('Filtros aplicados:', filters)} />
          </aside>
        )}

        <section className={showFilters ? 'lg:w-3/4 w-full' : 'w-full'}>
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
