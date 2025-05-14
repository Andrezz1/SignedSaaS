import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  getTipoSubscricao,
  getMetodoPagamento,
  getDuracaoByTipoSubscricaoId,
  createSubscricaoCompleta,
  useAction
} from 'wasp/client/operations';
import type { TipoSubscricao, MetodoPagamento } from 'wasp/entities';
import PhoneInput from 'react-phone-input-2';

const logos: Record<string,string> = {
  mbway: '/images/mbway-logo.png',
};

interface LocationState {
  planId: number;
  metodoId: number;
  userId: number;
  duracaoId: number;
}

interface DuracaoWithExtras {
  DuracaoId: number;
  Nome: string;
  Meses: number;
  Desconto: number;
  ValorFinal: number;
}

const MbwayConfirmPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { planId, metodoId, userId, duracaoId } = state as LocationState;

  const [plan, setPlan]       = useState<TipoSubscricao|null>(null);
  const [metodo, setMetodo]   = useState<MetodoPagamento|null>(null);
  const [duracao, setDuracao] = useState<DuracaoWithExtras|null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [nifPagamento, setNifPagamento]       = useState('');
  const [telemovel, setTelemovel]             = useState('');
  const [telemovelLimpo, setTelemovelLimpo]   = useState('');
  const [actionError, setActionError]         = useState('');

  const createSub = useAction(createSubscricaoCompleta);

  useEffect(() => {
    (async () => {
      try {
        const [tipos, metodos, duracoes] = await Promise.all([
          getTipoSubscricao(),
          getMetodoPagamento(),
          getDuracaoByTipoSubscricaoId({ TipoSubscricaoID: planId })
        ]);
        setPlan(   tipos.find(t => t.TipoSubscricaoID === planId)!);
        setMetodo( metodos.find(m => m.MetodoPagamentoId === metodoId)!);
        setDuracao(duracoes.find(d => d.DuracaoId === duracaoId)!);
      } catch {
        setError('Erro ao carregar dados.');
      } finally {
        setLoading(false);
      }
    })();
  }, [planId, metodoId, duracaoId]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-sm">
      Carregando…
    </div>
  );
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500 text-sm">
      {error}
    </div>
  );

  const handleContinue = async () => {
    if (!telemovel) {
      setActionError('Insira o número de telemóvel.');
      return;
    }
    try {
      const res = await createSub({
        UtilizadorId:       userId,
        TipoSubscricaoId:   planId,
        DuracaoId:          duracaoId,
        DetalheSubscricao:  { Quantidade: 1 },
        Pagamento: {
          MetodoPagamentoId: metodoId,
          NIFPagamento:      nifPagamento,
          DadosEspecificos:  { telemovelMbway: telemovelLimpo },
        },
        PagamentoPagamentoId: 0
      });
      navigate('/mbway-details', { state: { paymentId: res.PagamentoPagamentoId } });
    } catch {
      setActionError('Não foi possível criar a subscrição.');
    }
  };

  const goVerPlanos     = () => navigate('/ver-planos',       { state: { userId } });
  const goDurationPicker = () => navigate('/duration-picker',{ state: { userId, planId, planName: plan!.Nome } });
  const goPaymentPicker   = () => navigate('/payment-picker',{ state: { userId, planId, duracaoId } });

  const key     = metodo!.Nome.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/\s+/g,'');
  const logoSrc = logos[key];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-lg p-6 space-y-4 text-sm">
        <h1 className="text-lg font-semibold text-center">Confirmar Pagamento</h1>

        {/* Plano Subscrito */}
        <hr className="border-gray-200"/>
        <label className="block font-medium mt-2">Plano Subscrito</label>
        <div
          onClick={goVerPlanos }
          className="flex items-center justify-between mt-1 p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <div className="space-y-1">
            <div><span className="font-semibold">Nome:</span> {plan!.Nome}</div>
            <div><span className="font-semibold">Descrição:</span> {plan!.Descricao}</div>
          </div>
          <button className="text-sm font-medium text-blue-600 hover:underline">
            Alterar
          </button>
        </div>

        {/* Duração */}
        <hr className="border-gray-200"/>
        <label className="block font-medium mt-2">Duração</label>
        <div
          onClick={goDurationPicker}
          className="flex items-center justify-between mt-1 p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <div className="space-y-1">
            <div><span className="font-semibold">Tipo:</span> {duracao!.Nome}</div>
            <div><span className="font-semibold">Meses:</span> {duracao!.Meses}</div>
          </div>
          <button className="text-sm font-medium text-blue-600 hover:underline">
            Alterar
          </button>
        </div>

        {/* Método de Pagamento */}
        <hr className="border-gray-200"/>
        <label className="block font-medium mt-2">Método de Pagamento</label>
        <div
          onClick={goPaymentPicker}
          className="flex items-center justify-between mt-1 p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <div className="flex items-center space-x-2">
            {logoSrc && <img src={logoSrc} alt="" className="w-8 h-8 object-contain"/>}
            <span>{metodo!.Nome}</span>
          </div>
          <button className="text-sm font-medium text-blue-600 hover:underline">
            Alterar
          </button>
        </div>

        {/* NIF */}
        <hr className="border-gray-200"/>
        <label htmlFor="nifPagamento" className="block font-medium mt-2">NIF (opcional)</label>
        <input
          id="nifPagamento"
          type="text"
          value={nifPagamento}
          onChange={e => setNifPagamento(e.target.value.replace(/\D/g, ''))}
          placeholder="Insira o NIF"
          className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200"
        />

        {/* Telemóvel */}
        <label htmlFor="telemovel" className="block font-medium mt-2">Telemóvel <span className="text-red-500">*</span></label>
        <PhoneInput
          country={'pt'}
          value={telemovel}
          onChange={(value, data) => {
            setTelemovel(value);
            const dial = 'dialCode' in data ? data.dialCode : '';
            setTelemovelLimpo(value.slice(dial.length).replace(/\D/g,''));
          }}
          containerClass="w-full mt-1"
          inputClass="w-full h-[42px] px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200"
          buttonClass="border-r border-gray-300 bg-white rounded-l-lg"
          dropdownClass="border-gray-300 rounded-lg shadow-lg"
          inputStyle={{ paddingLeft: '46px', height: '42px', width: '100%' }}
          buttonStyle={{ height: '42px', borderRadius: '0.5rem 0 0 0.5rem' }}
        />

        {/* Valor total */}
        <div className="mt-6 text-center">
          <span className="block text-xl font-medium text-black">
            Total a pagar
          </span>
          <span className="block text-3xl font-bold text-gray-700">
            €{duracao!.ValorFinal.toFixed(2)}
          </span>
        </div>

        {/* Botão Continuar */}
        <button
          onClick={handleContinue}
          className="w-full mt-2 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Continuar
        </button>
        {actionError && (
          <p className="mt-2 text-red-600 text-center text-sm">{actionError}</p>
        )}
      </div>
    </div>
  );
};

export default MbwayConfirmPage;
