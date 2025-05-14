// src/pages/MbwayDetailsPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getPagamento } from 'wasp/client/operations';
import type { Pagamento } from 'wasp/entities';

interface LocationState {
  paymentId: number;
}

const MbwayDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { paymentId } = state as LocationState;

  const [pagamento, setPagamento] = useState<Pagamento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const all = await getPagamento();
        const found = all.find(p => p.PagamentoId === paymentId);
        if (!found) throw new Error('Pagamento não encontrado.');
        setPagamento(found);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [paymentId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      Carregando dados de pagamento…
    </div>
  );
  if (error) return (
    <div className="min-h-screen flex items-center justify-center text-red-500 bg-gray-50">
      {error}
    </div>
  );

  const detalhes = pagamento!.DadosEspecificos as {
    telemovelMbway?: string;
    estado?: string;
    dataCriacao?: string;
  } || {};

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-left">
        <h1 className="text-2xl font-bold mb-4 text-center">Detalhes do Pagamento MB WAY</h1>

        <p className="mb-2">
          <span className="font-semibold">ID Pagamento:</span> {pagamento!.PagamentoId}
        </p>
        <p className="mb-2">
          <span className="font-semibold">Valor:</span> €{pagamento!.Valor}
        </p>

        <hr className="border-t border-gray-200 my-4" />

        <h2 className="text-lg font-medium mb-2">Dados do MB WAY</h2>
        {detalhes.telemovelMbway && (
          <p className="mb-1">
            <span className="font-semibold">Telemóvel:</span> {detalhes.telemovelMbway}
          </p>
        )}
        {detalhes.estado && (
          <p className="mb-1">
            <span className="font-semibold">Estado:</span> {detalhes.estado}
          </p>
        )}
        {detalhes.dataCriacao && (
          <p className="mb-4">
            <span className="font-semibold">Criado em:</span> {new Date(detalhes.dataCriacao).toLocaleString()}
          </p>
        )}

        {pagamento!.NIFPagamento && (
          <>
            <hr className="border-t border-gray-200 my-4" />
            <p className="mb-4">
              <span className="font-semibold">NIF:</span> {pagamento!.NIFPagamento}
            </p>
          </>
        )}

        <button
          onClick={() => navigate('/dashboard')}
          className="mt-6 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Voltar ao Início
        </button>
      </div>
    </div>
  );
};

export default MbwayDetailsPage;
