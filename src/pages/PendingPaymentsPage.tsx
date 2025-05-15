// src/pages/PendingPaymentsPage.tsx
import { type AuthUser } from 'wasp/auth';
import DefaultLayout from '../layout/DefaultLayout';
import PendingPaymentsTable from '../components/pendingPaymentsTable';

const PendingPaymentsPage: React.FC<{ user: AuthUser }> = ({ user }) => {
  return (
    <DefaultLayout user={user}>
      <div className="px-6 py-8">
        <h2 className="text-2xl font-bold mb-4">Pagamentos Pendentes</h2>
        <PendingPaymentsTable />
      </div>
    </DefaultLayout>
  );
};

export default PendingPaymentsPage;
