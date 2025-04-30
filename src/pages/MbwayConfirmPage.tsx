// src/pages/MbwayConfirmPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  getTipoSubscricao,
  getMetodoPagamento,
  createSubscricaoCompleta,
  useAction
} from 'wasp/client/operations';
import type { TipoSubscricao, MetodoPagamento } from 'wasp/entities';
import PhoneInput from 'react-phone-input-2';

const logos: Record<string, string> = {
  mbway: '/images/mbway-logo.png',
};

interface LocationState {
  planId: number;
  metodoId: number;
}

const MbwayConfirmPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { planId, metodoId } = state as LocationState;

  const [plan, setPlan] = useState<TipoSubscricao | null>(null);
  const [metodo, setMetodo] = useState<MetodoPagamento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nifPagamento, setNifPagamento] = useState<string>('');
  const [telemovel, setTelemovel] = useState<string>('');
  const [telemovelLimpo, setTelemovelLimpo] = useState<string>('');
  const [actionError, setActionError] = useState<string>('');

  const createSub = useAction(createSubscricaoCompleta);

  useEffect(() => {
    (async () => {
      try {
        const [tipos, metodos] = await Promise.all([
          getTipoSubscricao(),
          getMetodoPagamento()
        ]);
        const foundPlan = tipos.find(t => t.TipoSubscricaoID === planId);
        const foundMetodo = metodos.find(m => m.MetodoPagamentoId === metodoId);
        if (!foundPlan || !foundMetodo) {
          setError('Plano ou método de pagamento inválido.');
        } else {
          setPlan(foundPlan);
          setMetodo(foundMetodo);
        }
      } catch {
        setError('Erro ao carregar dados de confirmação.');
      } finally {
        setLoading(false);
      }
    })();
  }, [planId, metodoId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Carregando confirmação…</div>;
  }
  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500 bg-gray-50">{error}</div>;
  }

  const handleContinue = async () => {
    if (!telemovel) {
      setActionError('Por favor, insira o número de telemóvel.');
      return;
    }
    
    try {
      const result = await createSub({
        DataInicio: new Date(),
        DataFim: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        UtilizadorId: 1, // <-- Placeholder
        TipoSubscricaoId: planId,
        DetalheSubscricao: { Quantidade: 1 },
        Pagamento: {
          MetodoPagamentoId: metodoId,
          NIFPagamento: nifPagamento,
          DadosEspecificos: {
            telemovelMbway: telemovelLimpo,
          },
        },
        PagamentoPagamentoId: 0
      });

      const paymentId = result.PagamentoPagamentoId;
      navigate('/mbway-details', { state: { paymentId } });
    } catch (e: any) {
      setActionError('Não foi possível criar a subscrição. ' + e.message);
    }
  };

  const handleChangeMethod = () => navigate('/payment-picker', { state: { planId } });
  const handleChangePlan = () => navigate('/planos');

  const methodKey = metodo!.Nome.toLowerCase().replace(/\s+/g, '');
  const logoSrc = logos[methodKey];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Confirmar Pagamento</h1>

        {/* Plano Subscrito */}
        <hr className="border-t border-gray-200 mb-4" />
        <label className="block text-sm font-medium text-gray-700 mb-2">Plano Subscrito</label>
        <div onClick={handleChangePlan} className="cursor-pointer mb-6 p-4 border border-gray-300 rounded-lg flex items-center justify-between hover:bg-gray-100 transition">
          <div className="flex flex-col">
            <span className="text-base text-gray-900">
              <span className="font-semibold">Descrição:</span> {plan!.Descricao}
            </span>
            <span className="mt-1 text-base text-gray-900">
              <span className="font-semibold">Valor:</span> €{plan!.Preco}
            </span>
          </div>
          <span className="text-sm text-blue-600 font-medium">Alterar Plano</span>
        </div>

        {/* Método de Pagamento */}
        <hr className="border-t border-gray-200 mb-4" />
        <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pagamento</label>
        <div onClick={handleChangeMethod} className="cursor-pointer mb-6 p-4 border border-gray-300 rounded-lg flex items-center justify-between hover:bg-gray-100 transition">
          <div className="flex items-center">
            {logoSrc && <img src={logoSrc} alt={metodo!.Nome} className="w-10 h-10 mr-3 object-contain" />}
            <span className="text-base font-medium text-gray-900">{metodo!.Nome}</span>
          </div>
          <span className="text-sm text-blue-600 font-medium">Alterar Método</span>
        </div>

        {/* Campo NIF (opcional) */}
        <hr className="border-t border-gray-200 mb-4" />
        <label htmlFor="nifPagamento" className="block text-sm font-medium text-gray-700 mb-2">NIF de Faturação (opcional)</label>
        <input
          id="nifPagamento"
          type="text"
          value={nifPagamento}
          onChange={e => setNifPagamento(e.target.value.replace(/\D/g, ''))}
          placeholder="Insira o NIF"
          className="w-full mb-6 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
        />

        {/* Campo Telemóvel (obrigatório) */}
        <label htmlFor="telemovel" className="block text-sm font-medium text-gray-700 mb-2">Número de Telemóvel (obrigatório)</label>
        <div className="mb-6">
          <PhoneInput
            country={'pt'}
            value={telemovel}
            onChange={(value, data) => {
              setTelemovel(value); // visível no input
            
              const dialCode = 'dialCode' in data ? data.dialCode : '';
              const nationalNumber = value.slice(dialCode.length);
              const cleanedNumber = nationalNumber.replace(/\D/g, '');
              setTelemovelLimpo(cleanedNumber); // valor sem dial code para enviar
            }}
            inputProps={{
              name: 'telemovel',
              id: 'telemovel',
              required: true
            }}
            containerClass="w-full"
            inputClass="w-full h-[42px] px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            buttonClass="border-r border-gray-300 bg-white rounded-l-lg"
            dropdownClass="border-gray-300 rounded-lg shadow-lg"
            inputStyle={{
              paddingLeft: '46px',
              height: '42px',
              width: '100%',
            }}
            buttonStyle={{
              height: '42px',
              borderRadius: '0.5rem 0 0 0.5rem'
            }}
          />
        </div>       
        
        {/* Botão Continuar */}
        <hr className="border-t border-gray-200 mb-6" />
        <button
          onClick={handleContinue}
          className="w-full py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
        >
          Continuar
        </button>

        {/* Erro da ação, se existir */}
        {actionError && (
          <p className="mt-4 text-sm text-red-600 text-center">{actionError}</p>
        )}
      </div>
    </div>
  );
};

export default MbwayConfirmPage;
