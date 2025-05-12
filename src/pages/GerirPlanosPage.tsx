import { type AuthUser } from 'wasp/auth';
import DefaultLayout from '../layout/DefaultLayout';
import PlanosTable from '../components/planosTable';
import { PlusIcon } from 'lucide-react';
import { useNavigate} from 'react-router-dom';

const GerirPlanosPage = ({ user }: { user: AuthUser }) => {
  const navigate = useNavigate();

  const handleAddPlan = () => {
    navigate('/create-plano');
  };

  return (
    <DefaultLayout user={user}>
      {/* Título + botão lado a lado */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Lista de Planos Disponíveis</h2>
        <button
          onClick={handleAddPlan}
          className="flex items-center px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Adicionar Plano
        </button>
      </div>
  
      {/* Tabela */}
      <div className="w-full">
        <PlanosTable />
      </div>
    </DefaultLayout>
  );
}
export default GerirPlanosPage;