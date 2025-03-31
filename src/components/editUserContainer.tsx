import React, { useState } from 'react';
import {
  updateUtilizador,
  getTipoUtilizador,
  useQuery,
  useAction
} from 'wasp/client/operations';
import MyPhoneInput from '../components/phoneInput';

const EditUserContainer = ({ user, onClose }: any) => {
  const { utilizador, morada, contacto } = user;
  const { data: tiposUtilizador = [] } = useQuery(getTipoUtilizador);

  const [nome, setNome] = useState(utilizador.Nome || '');
  const [tipoUtilizadorId, setTipoUtilizadorId] = useState(utilizador.TipoUtilizadorTipoUtilizadorId || '');
  const [email, setEmail] = useState(contacto?.Email || '');
  const [countryCode, setCountryCode] = useState(
    contacto?.Telemovel ? contacto.Telemovel.split(' ')[0] : '+351'
  );
  const [phoneNumber, setPhoneNumber] = useState(
    contacto?.Telemovel ? contacto.Telemovel.split(' ')[1] || '' : ''
  );
  const [concelho, setConcelho] = useState(morada?.Concelho || '');
  const [distrito, setDistrito] = useState(morada?.Distrito || '');
  const [localidade, setLocalidade] = useState(morada?.CodigoPostal?.Localidade || '');
  const [errorMsg, setErrorMsg] = useState('');

  const updateUserAction = useAction(updateUtilizador);

  const validateFields = () => {
    if (!phoneNumber || !countryCode.startsWith('+')) {
      setErrorMsg('Telemóvel inválido.');
      return false;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setErrorMsg('Email inválido.');
      return false;
    }
    if (!/^\d{4}-\d{3}$/.test(localidade)) {
      setErrorMsg('Código Postal deve estar no formato XXXX-XXX.');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  const handleSave = async () => {
    if (!validateFields()) return;
    const formattedTelemovel = `${countryCode} ${phoneNumber}`;
    const payload = {
      id: utilizador.id,
      Nome: nome,
      NumSocio: utilizador.NumSocio,
      TipoUtilizadorId: tipoUtilizadorId,
      Contacto: { Email: email, Telemovel: formattedTelemovel },
      Morada: {
        Concelho: concelho,
        Distrito: distrito,
        CodigoPostal: { Localidade: localidade }
      }
    };
    try {
      await updateUserAction(payload);
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar o utilizador:', error);
      setErrorMsg('Erro ao atualizar o utilizador. Por favor, tente novamente.');
    }
  };

  const handleLocalidadeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) {
      value = value.slice(0, 4) + '-' + value.slice(4, 7);
    }
    setLocalidade(value);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white w-[850px] max-h-[85vh] overflow-y-auto p-10 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Editar Utilizador</h2>
        {errorMsg && <p className="mb-4 text-red-500 text-sm">{errorMsg}</p>}

        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          {/* Nome Completo ocupando as 2 colunas */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="block w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Tipo de Utilizador (col 1) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Utilizador
            </label>
            <select
              value={tipoUtilizadorId}
              onChange={(e) => setTipoUtilizadorId(parseInt(e.target.value))}
              className="block w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {tiposUtilizador.map((tipo: any) => (
                <option key={tipo.TipoUtilizadorId} value={tipo.TipoUtilizadorId}>
                  {tipo.Descricao}
                </option>
              ))}
            </select>
          </div>

          {/* Email (col 2) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Telemóvel (col 1) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telemóvel
            </label>
            <MyPhoneInput
              countryCode={countryCode}
              phoneNumber={phoneNumber}
              onCountryCodeChange={setCountryCode}
              onPhoneNumberChange={setPhoneNumber}
            />
          </div>

          {/* Concelho (col 2) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Concelho
            </label>
            <input
              type="text"
              value={concelho}
              onChange={(e) => setConcelho(e.target.value)}
              className="block w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Distrito (col 1) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Distrito
            </label>
            <input
              type="text"
              value={distrito}
              onChange={(e) => setDistrito(e.target.value)}
              className="block w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Código Postal (col 2) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código Postal
            </label>
            <input
              type="text"
              value={localidade}
              onChange={handleLocalidadeChange}
              className="block w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              maxLength={8}
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={onClose}
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
    </div>
  );
};

export default EditUserContainer;
