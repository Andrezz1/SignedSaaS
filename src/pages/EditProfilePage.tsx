import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useAuth } from 'wasp/client/auth';
import {
  useQuery,
  useAction,
  getUtilizadorInfoById,
  updateUtilizador
} from 'wasp/client/operations';
import DefaultLayout from '../layout/DefaultLayout';
import MyPhoneInput from '../components/phoneInput';
import { useNavigate } from 'react-router-dom';

const EditProfile: React.FC = () => {
  const { data: authUser } = useAuth();
  if (!authUser) {
    return <div>Carregando utilizador...</div>;
  }
  const userId = authUser.id;

  const { data, isLoading, error, refetch } = useQuery(getUtilizadorInfoById, { id: userId });
  const updateUserAction = useAction(updateUtilizador);

  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [nif, setNif] = useState('');
  const [email, setEmail] = useState('');
  const [concelho, setConcelho] = useState('');
  const [distrito, setDistrito] = useState('');
  const [localidade, setLocalidade] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [nifEditable, setNifEditable] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  const [dob, setDob] = useState(''); // Armazena a data no formato "yyyy-MM-dd"
  const [dobEditable, setDobEditable] = useState(true); // Controla se é editável

  const [profilePicture, setProfilePicture] = useState<string>('');

  useEffect(() => {
    if (data && data.length > 0) {
      const userInfo = data[0];
      setNome(userInfo.utilizador.Nome ?? '');
      setNif(userInfo.utilizador.NIF ?? '');
      setNifEditable(userInfo.utilizador.NIF ? false : true);

      setEmail(userInfo.contacto?.Email ?? '');
      setConcelho(userInfo.morada?.Concelho ?? '');
      setDistrito(userInfo.morada?.Distrito ?? '');
      setLocalidade((userInfo.morada as any)?.CodigoPostal?.Localidade ?? '');

      const telemovel = userInfo.contacto?.Telemovel ?? '';
      const parts = telemovel.split(' ');
      setCountryCode(parts[0] || '+');
      setPhoneNumber(parts[1] || '');

      if (userInfo.utilizador.DataNascimento) {
        const dateStr = new Date(userInfo.utilizador.DataNascimento)
          .toISOString()
          .split('T')[0];
        setDob(dateStr);
        setDobEditable(false);
      } else {
        setDob('');
        setDobEditable(true);
      }

      setProfilePicture(userInfo.utilizador.Imagem ?? '');
    }
  }, [data]);

  // // Handler para alteração da foto
  // const handleProfilePictureChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files[0]) {
  //     const file = e.target.files[0];
  //     setProfilePicture(URL.createObjectURL(file));
  //   }
  // };

  const handleLocalidadeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) {
      value = value.slice(0, 4) + '-' + value.slice(4, 7);
    }
    if (value.length > 8) {
      value = value.slice(0, 8);
    }
    setLocalidade(value);
  };

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!data || data.length === 0) return;
    const userInfo = data[0];

    const payload: any = {
      id: userInfo.utilizador.id,
      Nome: nome,
      NIF: nif,
      NumSocio: userInfo.utilizador.NumSocio ?? 0,
      Contacto: { Email: email, Telemovel: `${countryCode} ${phoneNumber}` },
      Morada: {
        Concelho: concelho,
        Distrito: distrito,
        CodigoPostal: { Localidade: localidade }
      }
    };

    if (dobEditable && dob) {
      payload.DataNascimento = new Date(dob);
    }

    try {
      await updateUserAction(payload);
      setSuccessMsg('Perfil atualizado com sucesso!');
      setErrorMsg('');
      refetch();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      console.error('Erro ao atualizar o utilizador:', err);
      setErrorMsg('Erro ao atualizar o perfil. Por favor, tente novamente.');
      setSuccessMsg('');
    }
  };

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;

  return (
    <DefaultLayout user={authUser}>
      <div className="p-8">
        <div className="max-w-3xl mx-auto bg-white p-8 shadow-lg rounded-2xl">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Editar Perfil</h2>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="rounded-full w-24 h-24 border-4 border-gray-300 flex items-center justify-center bg-gray-200 text-gray-500">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm0 14c-4.418 0-8 3.582-8 8h16c0-4.418-3.582-8-8-8Z" />
                </svg>
              </div>
              <button
                type="button"
                onClick={() => {}}
                className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                Update Profile Picture
              </button>
            </div>
          </div>
          {errorMsg && <p className="mb-4 text-red-500 text-sm">{errorMsg}</p>}
          {successMsg && <p className="mb-4 text-green-500 text-sm">{successMsg}</p>}
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="nome" className="block mb-1 text-sm font-medium text-gray-700">
                Nome
              </label>
              <input
                type="text"
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="block w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="nif" className="block mb-1 text-sm font-medium text-gray-700">
                NIF
              </label>
              <input
                type="text"
                id="nif"
                value={nif}
                onChange={(e) => setNif(e.target.value.replace(/\D/g, '').slice(0, 9))}
                disabled={!nifEditable}
                className={`block w-full border border-gray-300 rounded px-3 py-2 ${
                  !nifEditable ? 'bg-gray-100' : 'bg-white'
                }`}
              />
            </div>
            <div>
              <label htmlFor="dob" className="block mb-1 text-sm font-medium text-gray-700">
                Data de Nascimento
              </label>
              <input
                type="date"
                id="dob"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                disabled={!dobEditable}
                className={`block w-full text-sm border border-gray-300 rounded-lg p-2.5 ${
                  !dobEditable ? 'bg-gray-100' : 'bg-white'
                }`}
              />
            </div>
            <div>
              <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nº Telemóvel
              </label>
              <MyPhoneInput
                countryCode={countryCode}
                phoneNumber={phoneNumber}
                onCountryCodeChange={setCountryCode}
                onPhoneNumberChange={setPhoneNumber}
              />
            </div>
            <div>
              <label htmlFor="concelho" className="block mb-1 text-sm font-medium text-gray-700">
                Concelho
              </label>
              <input
                type="text"
                id="concelho"
                value={concelho}
                onChange={(e) => setConcelho(e.target.value)}
                className="block w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="distrito" className="block mb-1 text-sm font-medium text-gray-700">
                Distrito
              </label>
              <input
                type="text"
                id="distrito"
                value={distrito}
                onChange={(e) => setDistrito(e.target.value)}
                className="block w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label htmlFor="localidade" className="block mb-1 text-sm font-medium text-gray-700">
                Código Postal
              </label>
              <input
                type="text"
                id="localidade"
                value={localidade}
                onChange={handleLocalidadeChange}
                className="block w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div className="md:col-span-2 flex justify-end mt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors mr-3"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default EditProfile;
