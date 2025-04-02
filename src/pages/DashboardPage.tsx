import { type AuthUser } from 'wasp/auth';
import { useQuery, getUtilizadoresInfoByTipo } from 'wasp/client/operations';
import TotalSociosCard from '../components/dasboardCards/totalSociosCard';
import DefaultLayout from '../layout/DefaultLayout';

const DashboardPage = ({ user }: { user: AuthUser }) => {
  // Aqui definimos page e pageSize conforme necessário; no caso de apenas mostrar o total, pode ser suficiente 1 e um pageSize pequeno.
  const { data, isLoading, error } = useQuery(getUtilizadoresInfoByTipo, {
    page: 1,
    pageSize: 10,
    tipoUtilizadorId: 3, // Filtra para apenas os utilizadores cujo tipo é 3
  });

  return (
    <DefaultLayout user={user}>
      <div className="p-4 flex justify-center items-center min-h-screen">
        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error: {error.message}</div>
        ) : (
          // Utilizamos o total retornado da query para o card
          <TotalSociosCard totalSocios={data?.total} />
        )}
      </div>
    </DefaultLayout>
  );
};

export default DashboardPage;


