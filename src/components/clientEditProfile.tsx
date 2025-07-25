import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import {
  useQuery,
  useAction,
  getUtilizadorInfoById,
  updateUtilizador
} from 'wasp/client/operations';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
// import ProfilePhotoInput from '../components/profilePhotoInput';
import { useNavigate } from 'react-router-dom';
import { useClientUser } from '../components/clientUserContext';

const ClientEditProfile: React.FC = () => {
  const { userId } = useClientUser();
  const {token} = useClientUser();
  const navigate = useNavigate();

const isQueryReady = userId !== null && token !== null;

const { data, isLoading, error, refetch } = useQuery(
  getUtilizadorInfoById,
  isQueryReady ? { id: Number(userId), token } : undefined,
  {
    enabled: isQueryReady,
  }
);


  const updateUserAction = useAction(updateUtilizador);

  const [nome, setNome] = useState('');
  const [nif, setNif] = useState('');
  const [email, setEmail] = useState('');
  const [concelho, setConcelho] = useState('');
  const [distrito, setDistrito] = useState('');
  const [localidade, setLocalidade] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dob, setDob] = useState('');
  const [nifEditable, setNifEditable] = useState(true);
  const [dobEditable, setDobEditable] = useState(true);
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [newProfileImage, setNewProfileImage] = useState<string>('');
  const [cacheBuster, setCacheBuster] = useState<number>(Date.now());
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!data || data.length === 0) return;
    const u = data[0];

    setNome(u.utilizador.Nome ?? '');
    setNif(u.utilizador.NIF ?? '');
    setNifEditable(!u.utilizador.NIF);
    setEmail(u.contacto?.Email ?? '');
    setConcelho(u.morada?.Concelho ?? '');
    setDistrito(u.morada?.Distrito ?? '');
    setLocalidade((u.morada as any)?.CodigoPostal?.Localidade ?? '');

    const parts = (u.contacto?.Telemovel ?? '').split(' ');
    setCountryCode(parts[0] || '+');
    setPhoneNumber(parts[1] || '');

    if (u.utilizador.DataNascimento) {
      setDob(new Date(u.utilizador.DataNascimento).toISOString().split('T')[0]);
      setDobEditable(false);
    }

    setProfilePicture(u.utilizador.Imagem ?? '');
    setCacheBuster(Date.now());
  }, [data]);

  const handleLocalidadeChange = (e: ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 4) v = v.slice(0, 4) + '-' + v.slice(4, 7);
    if (v.length > 8) v = v.slice(0, 8);
    setLocalidade(v);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!data || data.length === 0) {
      setErrorMsg('Dados do utilizador indisponíveis.');
      return;
    }

    const u = data[0];
    const payload: any = {
      id: u.utilizador.id,
      token: token,
      Nome: nome,
      NIF: nif,
      NumMembro: u.utilizador.NumMembro ?? 0,
      Contacto: {
        Email: email,
        Telemovel: `${countryCode} ${phoneNumber}`
      },
      Morada: {
        Concelho: concelho,
        Distrito: distrito,
        CodigoPostal: { Localidade: localidade }
      }
    };

    if (dobEditable && dob) payload.DataNascimento = new Date(dob);
    if (newProfileImage) payload.Imagem = newProfileImage;

    try {
      const updated = await updateUserAction(payload);
      await refetch();

      if (updated.Imagem) {
        setProfilePicture(updated.Imagem);
        setCacheBuster(Date.now());
      }

      setNewProfileImage('');
      setSuccessMsg('Perfil atualizado com sucesso!');
      setErrorMsg('');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setErrorMsg('Erro ao atualizar o perfil. Por favor, tente novamente.');
      setSuccessMsg('');
    }
  };

  if (isLoading) return <div>A carregar dados...</div>;
  if (error) return <div>Erro: {error.message}</div>;

    return (
    <div className="py-6 px-4 md:px-8">
        <div className="max-w-7xl w-full mx-auto bg-white shadow-lg rounded-2xl px-10 py-8">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Editar Perfil</h2>
            <div>
            {newProfileImage ? (
                <img
                src={`data:image/*;base64,${newProfileImage}`}
                alt="Preview"
                className="w-28 h-28 rounded-full border-4 border-gray-300 object-cover"
                />
            ) : profilePicture ? (
                <img
                src={`/uploads/${profilePicture}?t=${cacheBuster}`}
                alt="Perfil"
                className="w-28 h-28 rounded-full border-4 border-gray-300 object-cover"
                />
            ) : (
                <div className="w-28 h-28 bg-gray-200 rounded-full border-4 border-gray-300 flex items-center justify-center text-gray-500">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm0 14c4.418 0 8 3.582 8 8H4c0-4.418 3.582-8 8-8Z" />
                </svg>
                </div>
            )}
            </div>
        </div>

        {errorMsg && <p className="mb-4 text-red-500 text-sm">{errorMsg}</p>}
        {successMsg && <p className="mb-4 text-green-500 text-sm">{successMsg}</p>}

        <form
            onSubmit={handleSave}
            className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6"
        >
            {/* Nome */}
            <div className="md:col-span-2">
            <label htmlFor="nome" className="block text-sm font-semibold text-gray-600 mb-2">
                Nome
            </label>
            <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full p-3 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            </div>

            {/* NIF */}
            <div>
            <label htmlFor="nif" className="block text-sm font-semibold text-gray-600 mb-2">
                NIF
            </label>
            <input
                id="nif"
                type="text"
                value={nif}
                onChange={(e) => setNif(e.target.value.replace(/\D/g, '').slice(0, 9))}
                disabled={!nifEditable}
                className="w-full p-3 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500"
            />
            </div>

            {/* Data de Nascimento */}
            <div>
            <label htmlFor="dob" className="block text-sm font-semibold text-gray-600 mb-2">
                Data de Nascimento
            </label>
            <input
                id="dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                disabled={!dobEditable}
                className="w-full p-3 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:text-gray-500"
            />
            </div>

            {/* Email */}
            <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-600 mb-2">
                Email
            </label>
            <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            </div>

            {/* Nº Telemóvel */}
            <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">
                Nº Telemóvel
            </label>
            <PhoneInput
                country={'pt'}
                value={`${countryCode}${phoneNumber}`}
                onChange={(value, data) => {
                const dialCode = 'dialCode' in data ? data.dialCode : '';
                const nationalNumber = value.slice(dialCode.length).replace(/\D/g, '');
                setCountryCode(`+${dialCode}`);
                setPhoneNumber(nationalNumber);
                }}
                inputProps={{
                name: 'telemovel',
                required: true,
                className: 'w-full p-3 pl-14 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200',
                }}
                containerClass="w-full"
                inputClass="!w-full !p-3 !border !border-gray-200 !bg-white !rounded-lg focus:!outline-none focus:!ring-2 focus:!ring-blue-200"
                buttonClass="!border-r !border-gray-300 !bg-white !rounded-l-lg"
                dropdownClass="!border-gray-300 !rounded-lg !shadow-lg"
            />
            </div>

            {/* Concelho */}
            <div>
            <label htmlFor="concelho" className="block text-sm font-semibold text-gray-600 mb-2">
                Concelho
            </label>
            <input
                id="concelho"
                type="text"
                value={concelho}
                onChange={(e) => setConcelho(e.target.value)}
                className="w-full p-3 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            </div>

            {/* Distrito */}
            <div>
            <label htmlFor="distrito" className="block text-sm font-semibold text-gray-600 mb-2">
                Distrito
            </label>
            <input
                id="distrito"
                type="text"
                value={distrito}
                onChange={(e) => setDistrito(e.target.value)}
                className="w-full p-3 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            </div>

            {/* Código Postal */}
            <div>
            <label htmlFor="localidade" className="block text-sm font-semibold text-gray-600 mb-2">
                Código Postal
            </label>
            <input
                id="localidade"
                type="text"
                value={localidade}
                onChange={handleLocalidadeChange}
                className="w-full p-3 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            </div>

            {/* Botões */}
            <div className="md:col-span-2 flex justify-end space-x-4 mt-4">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 font-semibold hover:from-gray-400 hover:to-gray-500 transition"
            >
                Voltar
            </button>
            <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition"
            >
                Guardar
            </button>
            </div>
        </form>
        </div>
    </div>
    );
}

export default ClientEditProfile;
