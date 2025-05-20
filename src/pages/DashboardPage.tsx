import { type AuthUser } from 'wasp/auth';
import MembrosCard from '../components/dasboardCards/totalMembrosCard';
import MembrosPagantesCard from '../components/dasboardCards/totalMembrosPayingCard';
import DoacoesCard from '../components/dasboardCards/totalDoacoesCard';
import PagamentosCard from '../components/dasboardCards/totalPagamentosCard';
import DefaultLayout from '../layout/DefaultLayout';
import GraficoMembrosAtivos from '../components/dasboardCards/graficoMembrosAtivos';
import PagamentosPendentesCard from '../components/dasboardCards/pagamentosPendentesCard';

const DashboardPage = ({ user }: { user: AuthUser }) => {
  return (
    <DefaultLayout user={user}>
      <div className="w-full overflow-x-auto px-6">
        {/* Container dos cards com largura controlada */}
        <div className="flex space-x-6 min-w-max">
          <MembrosCard />
          <MembrosPagantesCard />
          <PagamentosCard />
          <DoacoesCard />
          <PagamentosPendentesCard />
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