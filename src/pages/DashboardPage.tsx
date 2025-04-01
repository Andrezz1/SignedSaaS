/*import { type AuthUser } from 'wasp/auth';
import { useQuery, getUtilizadores } from 'wasp/client/operations';
import TotalSociosCard from '../components/totalSociosCard';
import DefaultLayout from '../layout/DefaultLayout';

const DashboardPage = ({ user }: { user: AuthUser }) => {
  const { data, isLoading, error } = useQuery(getUtilizadores);

  return (
    <DefaultLayout user={user}>
      <div className="p-4 flex justify-center items-center min-h-screen">
        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error: {error.message}</div>
        ) : (
          <TotalSociosCard totalSocios={data?.totalSocios} />
        )}
      </div>
    </DefaultLayout>
  );
};

export default DashboardPage;
*/
