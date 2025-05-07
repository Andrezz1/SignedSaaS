import { type AuthUser } from 'wasp/auth';
import DefaultLayout from '../layout/DefaultLayout';
import DoacoesTable from '../components/doacoesTable';

const HistoricoDoacoesPage = ({ user }: { user: AuthUser }) => {
  return (
    <DefaultLayout user={user}>
      <div className="w-full">
        <DoacoesTable />
      </div>
    </DefaultLayout>
  );
};

export default HistoricoDoacoesPage;
