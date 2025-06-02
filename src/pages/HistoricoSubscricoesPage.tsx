import { type AuthUser } from 'wasp/auth';
import DefaultLayout from '../layout/DefaultLayout';
import PagamentosSubscricoesTable from '../components/pagamentosSubscricoesTable';

const HistoricoSubscricoesPage = ({ user }: { user: AuthUser }) => {

  return (
    <DefaultLayout user={user}>
      {/* Título + botão lado a lado */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Histórico de Pagamentos de Subscrições</h2>
      </div>
  
      {/* Tabela */}
      <div className="w-full">
        <PagamentosSubscricoesTable />
      </div>
    </DefaultLayout>
  );
}
export default HistoricoSubscricoesPage;