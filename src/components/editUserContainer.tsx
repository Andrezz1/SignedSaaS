import React, { useState } from 'react';
import {
  updateUtilizador,
  getTipoUtilizador,
  useQuery,
  useAction
} from 'wasp/client/operations';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

// Componente para edição de dados do utilizador
const EditUserContainer = ({ user, onClose }: any) => {
  const { utilizador, morada, contacto } = user;
  
  // Procura os tipos de utilizador disponíveis
  const { data: tiposUtilizador = [] } = useQuery(getTipoUtilizador);

  // Estados para os campos do formulário
  const [nome, setNome] = useState(utilizador.Nome || '');
  const [tipoUtilizadorId, setTipoUtilizadorId] = useState(utilizador.TipoUtilizadorTipoUtilizadorId || '');
  const [email, setEmail] = useState(contacto?.Email || '');
  const [countryCode, setCountryCode] = useState(contacto?.Telemovel ? contacto.Telemovel.split(' ')[0] : '');
  const [phoneNumber, setPhoneNumber] = useState(contacto?.Telemovel ? contacto.Telemovel.split(' ')[1] || '' : '');
  const [concelho, setConcelho] = useState(morada?.Concelho || '');
  const [distrito, setDistrito] = useState(morada?.Distrito || '');
  const [localidade, setLocalidade] = useState(morada?.CodigoPostal?.Localidade || '');
  const [errorMsg, setErrorMsg] = useState('');

  // Mutation para atualizar utilizador
  const updateUserAction = useAction(updateUtilizador);

  // Obtém a descrição do tipo de utilizador
  const tipoUtilizador = tiposUtilizador.find(
    (t: any) => t.TipoUtilizadorId === tipoUtilizadorId
  );
  const tipoDescricao = tipoUtilizador ? tipoUtilizador.Descricao : '';

  // Valida os campos antes de enviar
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

  // Envia os dados atualizados para o servidor
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

  // Formata o campo de Código Postal
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

        {errorMsg && (
          <p className="mb-4 text-red-500 text-sm">{errorMsg}</p>
        )}

        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          {/* Campo Nome */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="block w-full p-3 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Campo Tipo de Utilizador (readonly) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Utilizador
            </label>
            <input
              type="text"
              value={tipoDescricao}
              disabled
              className="block w-full p-3 border border-gray-200 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Campo Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full p-3 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Campo Telemóvel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className: 'block w-full p-3 pl-14 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200',
              }}
              containerClass="w-full"
              inputClass="!w-full !p-3 !border !border-gray-200 !bg-white !rounded-lg focus:!outline-none focus:!ring-2 focus:!ring-blue-200"
              buttonClass="!border-r !border-gray-300 !bg-white !rounded-l-lg"
              dropdownClass="!border-gray-300 !rounded-lg !shadow-lg"
            />
          </div>

          {/* Campos de Morada */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Concelho
            </label>
            <input
              type="text"
              value={concelho}
              onChange={(e) => setConcelho(e.target.value)}
              className="block w-full p-3 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Distrito
            </label>
            <input
              type="text"
              value={distrito}
              onChange={(e) => setDistrito(e.target.value)}
              className="block w-full p-3 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código Postal
            </label>
            <input
              type="text"
              value={localidade}
              onChange={handleLocalidadeChange}
              className="block w-full p-3 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              maxLength={8}
            />
          </div>
        </div>

        {/* Botões de ação */}
        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 font-semibold hover:from-gray-400 hover:to-gray-500 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserContainer;