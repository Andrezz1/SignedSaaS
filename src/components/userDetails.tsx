import React from 'react';

const ExpandedUserDetails = ({ user }: any) => {
  const { utilizador, morada, contacto, subscricoes } = user;
  const imageUrl = utilizador.Imagem
    ? `/uploads/${utilizador.Imagem}`
    : null;

  const formatDate = (dateValue: string | Date | null) => {
    if (!dateValue) return "N/A";
    return new Date(dateValue).toLocaleDateString();
  };

  return (
    <div className="border-t border-stroke dark:border-strokedark bg-gray-50 dark:bg-gray-800 py-4 px-4">
      <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Detalhes Adicionais
      </h4>
      <dl className="grid grid-cols-4 gap-x-6 gap-y-4 text-sm">
        <div>
          <dt className="font-medium text-gray-600 dark:text-gray-300">Nº Sócio</dt>
          <dd className="text-gray-800 dark:text-white">
            {utilizador.NumSocio || "N/A"}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-gray-600 dark:text-gray-300">Data de Nascimento</dt>
          <dd className="text-gray-800 dark:text-white">
            {formatDate(utilizador.DataNascimento)}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-gray-600 dark:text-gray-300">Concelho</dt>
          <dd className="text-gray-800 dark:text-white">
            {morada?.Concelho || "N/A"}
          </dd>
        </div>

        {imageUrl && (
          <div className="col-start-4 row-span-2 flex flex-col items-center">
            <dt className="font-medium text-gray-600 dark:text-gray-300">Foto de Perfil</dt>
            <dd className="mt-2">
              <img
                src={imageUrl}
                alt="Foto de perfil"
                className="w-32 h-32 object-cover rounded-full border-2 border-gray-300"
              />
            </dd>
          </div>
        )}

        <div>
          <dt className="font-medium text-gray-600 dark:text-gray-300">Distrito</dt>
          <dd className="text-gray-800 dark:text-white">
            {morada?.Distrito || "N/A"}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-gray-600 dark:text-gray-300">Código Postal</dt>
          <dd className="text-gray-800 dark:text-white">
            {morada?.CodigoPostal?.Localidade || "N/A"}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-gray-600 dark:text-gray-300">Email</dt>
          <dd className="text-gray-800 dark:text-white">
            {contacto?.Email || "N/A"}
          </dd>
        </div>

        {subscricoes && subscricoes.length > 0 && (
          <>
            <div>
              <dt className="font-medium text-gray-600 dark:text-gray-300">
                Data de Início da Subscrição
              </dt>
              <dd className="text-gray-800 dark:text-white">
                {formatDate(subscricoes[0].DataInicio)}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-600 dark:text-gray-300">
                Data de Fim da Subscrição
              </dt>
              <dd className="text-gray-800 dark:text-white">
                {formatDate(subscricoes[0].DataFim)}
              </dd>
            </div>
          </>
        )}
      </dl>
    </div>
  );
};

export default ExpandedUserDetails;
