import { type AuthUser } from 'wasp/auth';
import MembrosCard from '../components/dasboardCards/totalMembrosCard';
import MembrosPagantesCard from '../components/dasboardCards/totalMembrosPayingCard';
import DoacoesCard from '../components/dasboardCards/totalDoacoesCard';
import PagamentosCard from '../components/dasboardCards/totalPagamentosCard';
import DefaultLayout from '../layout/DefaultLayout';
import GraficoMembrosAtivos from '../components/dasboardCards/graficoMembrosAtivos';

const DashboardPage = ({ user }: { user: AuthUser }) => {
  return (
    <DefaultLayout user={user}>
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
        {/* Container dos cards com largura controlada */}
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8 px-6">
          <MembrosCard />
          <MembrosPagantesCard />
          <PagamentosCard />
          <DoacoesCard />
        </div>
        {/* Linha divisória */}
        <div className="w-full border-t border-gray-300 dark:border-gray-700 my-4" />

        {/* Gráficos */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Estatísticas Visuais
          </h2>
          <GraficoMembrosAtivos />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default DashboardPage;