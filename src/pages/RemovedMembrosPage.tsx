import { type AuthUser } from 'wasp/auth';
import DefaultLayout from '../layout/DefaultLayout';
import DisabledUsersTable from '../components/removedUsersTable';

const RemovedMembrosPage = ({ user }: { user: AuthUser }) => {
  return (
    <DefaultLayout user={user}>
      <div className="w-full">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
          Sócios Desabilitados
        </h2>
        <DisabledUsersTable />
      </div>
    </DefaultLayout>
  );
};

export default RemovedMembrosPage;