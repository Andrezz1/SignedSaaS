import React from 'react';
import { useState } from 'react'
import { createAccessToken } from 'wasp/client/operations'

const ClientViewPage = () => {
  const backgroundImage = '/images/background.jpg';
  const [nif, setNif] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  

   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      await createAccessToken({ Utilizador: { NIF: nif }  });
      setMessage('Foi enviado um link para o teu email!');
    } catch (err: any) {
      setMessage(err.message || 'Erro ao enviar. Verifica o NIF.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: `url('${backgroundImage}')` }}
    >
      <div className="absolute top-1/2 right-[22%] transform -translate-y-1/2 w-full max-w-md text-right text-gray-800">
        <h1 className="text-3xl font-extrabold mb-4 drop-shadow-md whitespace-nowrap">
          Consulta as tuas Subscrições e os teus Dados
        </h1>
        <p className="mb-6 text-sm text-gray-900 drop-shadow-sm whitespace-nowrap">
          Introduz o teu NIF para receberes um link no email com os teus dados.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-left">
            <label htmlFor="nif" className="block text-sm font-medium text-gray-700 drop-shadow-sm">
              Número de Identificação Fiscal (NIF)
            </label>
            <input
              type="text"
              id="nif"
              name="nif"
              placeholder="Ex:123456789"
              onChange={(e) => setNif(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-gray-300 p-3 shadow-md focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white rounded-xl py-3 font-semibold hover:bg-orange-600 transition duration-300 shadow-md disabled:opacity-50"
          >
            {loading ? 'A enviar...' : 'Enviar Link'}
          </button>
        </form>
        {message && (
          <div className="mt-4 text-sm text-gray-700">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientViewPage;
