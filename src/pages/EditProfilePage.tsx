import React, { useState, useEffect } from 'react';
import { useAuth } from 'wasp/client/auth';
import {
  useQuery,
  useAction,
  getUtilizadorInfoById,
  updateUtilizador
} from 'wasp/client/operations';
import DefaultLayout from '../layout/DefaultLayout';

const EditProfile: React.FC = () => {
  // Obter usuário autenticado e garantir que ele existe
  const { data: authUser } = useAuth();
  if (!authUser) {
    return <div>Carregando utilizador...</div>;
  }
  const userId = authUser.id;

  // Buscar dados do utilizador a partir do id
  const { data, isLoading, error } = useQuery(getUtilizadorInfoById, { id: userId });
  // Criar a action para update
  const updateUserAction = useAction(updateUtilizador);

  // Estados dos campos do formulário
  const [nome, setNome] = useState('');
  const [nif, setNif] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [concelho, setConcelho] = useState('');
  const [distrito, setDistrito] = useState('');
  const [localidade, setLocalidade] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Preenche os estados quando os dados estiverem disponíveis
  useEffect(() => {
    if (data && data.length > 0) {
      const userInfo = data[0];
      setNome(userInfo.utilizador.Nome ?? '');
      setNif(userInfo.utilizador.NIF ?? '');
      setEmail(userInfo.contacto?.Email ?? '');
      setPhone(userInfo.contacto?.Telemovel ?? '');
      setConcelho(userInfo.morada?.Concelho ?? '');
      setDistrito(userInfo.morada?.Distrito ?? '');
      setLocalidade(userInfo.codigoPostal?.Localidade ?? '');
    }
  }, [data]);

  // Função para salvar os dados atualizados
  const handleSave = async () => {
    if (!data || data.length === 0) return;
    const userInfo = data[0];

    const payload = {
      id: userInfo.utilizador.id,
      Nome: nome,
      NIF: nif,
      NumSocio: userInfo.utilizador.NumSocio ?? 0,
      Contacto: { Email: email, Telemovel: phone },
      Morada: {
        Concelho: concelho,
        Distrito: distrito,
        CodigoPostal: { Localidade: localidade }
      }
    };

    try {
      await updateUserAction(payload);
      console.log('Perfil atualizado com sucesso!');
      // Aqui você pode redirecionar ou notificar o usuário sobre o sucesso da operação.
    } catch (err: any) {
      console.error('Erro ao atualizar o utilizador:', err);
      setErrorMsg('Erro ao atualizar o perfil. Por favor, tente novamente.');
    }
  };

  // Função para cancelar (pode ser utilizada para redirecionar ou simplesmente resetar os campos)
  const handleCancel = () => {
    console.log('Cancel clicked');
    // Aqui você pode, por exemplo, redirecionar para outra página.
  };

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;

  return (
    <DefaultLayout user={authUser}>
      <div className="p-8">
        <h2 className="text-3xl font-semibold mb-6">Editar Perfil</h2>
        {errorMsg && <p className="mb-4 text-red-500 text-sm">{errorMsg}</p>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">NIF</label>
            <input
              type="text"
              value={nif}
              onChange={(e) => setNif(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Telemóvel</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Concelho</label>
            <input
              type="text"
              value={concelho}
              onChange={(e) => setConcelho(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Distrito</label>
            <input
              type="text"
              value={distrito}
              onChange={(e) => setDistrito(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Código Postal</label>
            <input
              type="text"
              value={localidade}
              onChange={(e) => setLocalidade(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default EditProfile;
