import React, { useState } from 'react';
import { updateUtilizador, useAction } from 'wasp/client/operations';

const EditUserContainer = ({ user, onClose }: any) => {
  const { utilizador, morada, contacto } = user;
  
  const [nome, setNome] = useState(utilizador.Nome || '');
  const [tipoUtilizadorId, setTipoUtilizadorId] = useState(utilizador.TipoUtilizadorTipoUtilizadorId || '');
  const [email, setEmail] = useState(contacto?.Email || '');
  const [telemovel, setTelemovel] = useState(contacto?.Telemovel || '');
  const [concelho, setConcelho] = useState(morada?.Concelho || '');
  const [distrito, setDistrito] = useState(morada?.Distrito || '');
  const [localidade, setLocalidade] = useState(morada?.CodigoPostal?.Localidade || '');

  const updateUserAction = useAction(updateUtilizador);

  const handleSave = async () => {
    const payload = {
      id: utilizador.id,
      Nome: nome,
      NumSocio: user.utilizador.NumSocio,
      TipoUtilizadorId: tipoUtilizadorId,
      Contacto: { Email: email, Telemovel: telemovel },
      Morada: { Concelho: concelho, Distrito: distrito, CodigoPostal: { Localidade: localidade } }
    };
    try {
      await updateUserAction(payload);
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar o utilizador:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-md max-w-lg w-full">
        <h2 className="text-lg font-semibold mb-4">Editar Utilizador</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome:</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="mt-1 block w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">NIF (não editável):</label>
            <input
              type="text"
              value={utilizador.NIF || ''}
              disabled
              className="mt-1 block w-full p-2 border rounded bg-gray-100 text-gray-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de Utilizador:</label>
            <input
              type="text"
              value={tipoUtilizadorId}
              onChange={(e) => setTipoUtilizadorId(e.target.value)}
              className="mt-1 block w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Telemóvel:</label>
            <input
              type="text"
              value={telemovel}
              onChange={(e) => setTelemovel(e.target.value)}
              className="mt-1 block w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Concelho:</label>
            <input
              type="text"
              value={concelho}
              onChange={(e) => setConcelho(e.target.value)}
              className="mt-1 block w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Distrito:</label>
            <input
              type="text"
              value={distrito}
              onChange={(e) => setDistrito(e.target.value)}
              className="mt-1 block w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Localidade:</label>
            <input
              type="text"
              value={localidade}
              onChange={(e) => setLocalidade(e.target.value)}
              className="mt-1 block w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
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
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserContainer;
