import { type AuthUser } from 'wasp/auth';
import SociosCard from '../components/dasboardCards/totalSociosCard';
import SociosPagantesCard from '../components/dasboardCards/totalSociosPayingCard';
import DoacoesCard from '../components/dasboardCards/totalDoacoesCard';
import PagamentosCard from '../components/dasboardCards/totalPagamentosCard';
import DefaultLayout from '../layout/DefaultLayout';

const DashboardPage = ({ user }: { user: AuthUser }) => {
  return (
    <DefaultLayout user={user}>
      <div className="p-4 flex justify-center items-center min-h-screen">
        <SociosCard/>
        <SociosPagantesCard/>
        <PagamentosCard/>
        <DoacoesCard/>
      </div>
    </DefaultLayout>
  );
};

export default DashboardPage;
