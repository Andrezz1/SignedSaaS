import { type AuthUser } from 'wasp/auth';
import DefaultLayout from '../layout/DefaultLayout';
import DisabledUsersTable from '../components/removedUsersTable';

const RemovedSociosPage = ({ user }: { user: AuthUser }) => {
  return (
    <DefaultLayout user={user}>
      <div className="w-full">
        <DisabledUsersTable />
      </div>
    </DefaultLayout>
  );
};

export default RemovedSociosPage;