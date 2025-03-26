import { getUtilizadorInfoByUtilizadorId, useQuery } from 'wasp/client/operations';
import LoadingSpinner from '../layout/LoadingSpinner';

interface ExpandedUserDetailsProps {
  userId: number;
}

const ExpandedUserDetails = ({ userId }: ExpandedUserDetailsProps) => {
  const { data, isLoading, error } = useQuery(getUtilizadorInfoByUtilizadorId, { id: userId });

  if (isLoading) return <div className="p-4">Carregando detalhes...</div>;
  if (error) return <div className="p-4 text-red-500">Erro ao carregar detalhes</div>;

  const details: any = data[0];

  return (
    <div className="grid grid-cols-12 border-t border-stroke py-4 px-4 bg-gray-50">
      <div className="col-span-12">
        <p className="text-sm text-black dark:text-white font-medium">Detalhes Adicionais:</p>
        <p className="text-sm text-black dark:text-white">Nº Sócio: {details.NumSocio}</p>
        <p className="text-sm text-black dark:text-white">
          Data de Nascimento:{" "}
          {details.DataNascimento ? new Date(details.DataNascimento).toLocaleDateString() : "N/A"}
        </p>
        <p className="text-sm text-black dark:text-white">
          Concelho: {details.Morada?.Concelho || "N/A"}
        </p>
        <p className="text-sm text-black dark:text-white">
          Distrito: {details.Morada?.Distrito || "N/A"}
        </p>
        <p className="text-sm text-black dark:text-white">
          Email: {details.Contacto?.Email || "N/A"}
        </p>
        {details.Subscricoes && details.Subscricoes.length > 0 && (
          <>
            <p className="text-sm text-black dark:text-white">
              Data de Início da Subscrição:{" "}
              {details.Subscricoes[0].DataInicio
                ? new Date(details.Subscricoes[0].DataInicio).toLocaleDateString()
                : "N/A"}
            </p>
            <p className="text-sm text-black dark:text-white">
              Data de Fim da Subscrição:{" "}
              {details.Subscricoes[0].DataFim
                ? new Date(details.Subscricoes[0].DataFim).toLocaleDateString()
                : "N/A"}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ExpandedUserDetails;
