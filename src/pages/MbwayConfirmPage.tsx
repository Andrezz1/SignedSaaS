import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  getTipoSubscricao,
  getMetodoPagamento,
  getDuracaoByTipoSubscricaoId,
  createSubscricaoCompleta,
  createDoacaoCompleta,
  getUtilizadorInfoById,
  useAction
} from 'wasp/client/operations';
import type { TipoSubscricao, MetodoPagamento } from 'wasp/entities';
import PhoneInput from 'react-phone-input-2';

const logos: Record<string, string> = {
  mbway: '/images/mbway-logo.png',
};

interface SubscricaoState {
  tipo: 'subscricao';
  planId: number;
  metodoId: number;
  userId: number;
  duracaoId: number;
}

interface DoacaoState {
  tipo: 'doacao';
  metodoId: number;
  utilizadorId: number;
  valor: number;
  nota: string;
}

type LocationState = SubscricaoState | DoacaoState;

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
  const locationState = state as LocationState;

  const [plan, setPlan] = useState<TipoSubscricao | null>(null);
  const [metodo, setMetodo] = useState<MetodoPagamento | null>(null);
  const [duracao, setDuracao] = useState<DuracaoWithExtras | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nifPagamento, setNifPagamento] = useState('');
  const [telemovel, setTelemovel] = useState('');
  const [telemovelLimpo, setTelemovelLimpo] = useState('');
  const [actionError, setActionError] = useState('');
  const [notaPagamento, setNotaPagamento] = useState('');
  const [notaExtra, setNotaExtra] = useState('');
  const [doadorNome, setDoadorNome] = useState('');

  const createSub = useAction(createSubscricaoCompleta);
  const createDoacao = useAction(createDoacaoCompleta);

  useEffect(() => {
    (async () => {
      try {
        const metodos = await getMetodoPagamento();
        setMetodo(metodos.find(m => m.MetodoPagamentoId === locationState.metodoId) || null);

        if (locationState.tipo === 'subscricao') {
          const [tipos, duracoes] = await Promise.all([
            getTipoSubscricao(),
            getDuracaoByTipoSubscricaoId({ TipoSubscricaoID: locationState.planId })
          ]);
          setPlan(tipos.find(t => t.TipoSubscricaoID === locationState.planId) || null);
          setDuracao(duracoes.find(d => d.DuracaoId === locationState.duracaoId) || null);
        }

        if (locationState.tipo === 'doacao') {
          setNotaExtra(locationState.nota || '');
        
          const result = await getUtilizadorInfoById({ id: locationState.utilizadorId });
          const nome = result?.[0]?.utilizador?.Nome;
          setDoadorNome(nome || 'Desconhecido');
        }
      } catch {
        setError('Erro ao carregar dados.');
      } finally {
        setLoading(false);
      }
    })();
  }, [locationState]);

  const handleContinue = async () => {
    if (!telemovel) {
      setActionError('Insira o número de telemóvel.');
      return;
    }

    try {
      if (locationState.tipo === 'subscricao') {
        const res = await createSub({
          UtilizadorId: locationState.userId,
          TipoSubscricaoId: locationState.planId,
          DuracaoId: locationState.duracaoId,
          DetalheSubscricao: { Quantidade: 1 },
          Pagamento: {
            MetodoPagamentoId: locationState.metodoId,
            NIFPagamento: nifPagamento,
            DadosEspecificos: { telemovelMbway: telemovelLimpo },
            Nota: notaExtra
          },
          PagamentoPagamentoId: 0
        });

        navigate('/mbway-details', { state: { paymentId: res.PagamentoPagamentoId } });

      } else if (locationState.tipo === 'doacao') {
        const res = await createDoacao({
          UtilizadorId: locationState.utilizadorId,
          ValorDoacao: locationState.valor,
          NotaPagamento: notaPagamento,
          NotaDoacao: notaExtra,
          MetodoPagamentoId: locationState.metodoId,
          NIFPagamento: nifPagamento,
          TelemovelMbway: telemovelLimpo
        });

        navigate('/mbway-details', { state: { paymentId: res.pagamento.PagamentoId } });
      }
    } catch {
      setActionError('Não foi possível concluir o pagamento.');
    }
  };

  const key = metodo?.Nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
  const logoSrc = logos[key || ''] || '';

  const goVerPlanos = () =>
    navigate('/ver-planos', { state: { userId: locationState.tipo === 'subscricao' ? locationState.userId : undefined } });

  const goDurationPicker = () =>
    navigate('/duration-picker', {
      state: {
        userId: locationState.tipo === 'subscricao' ? locationState.userId : undefined,
        planId: locationState.tipo === 'subscricao' ? locationState.planId : undefined,
        planName: plan?.Nome
      }
    });

  const goPaymentPicker = () => {
    if (locationState.tipo === 'subscricao') {
      navigate('/payment-picker', {
        state: {
          tipo: 'subscricao',
          planId: locationState.planId,
          userId: locationState.userId,
          duracaoId: locationState.duracaoId
        }
      });
    } else if (locationState.tipo === 'doacao') {
      navigate('/payment-picker', {
        state: {
          tipo: 'doacao',
          utilizadorId: locationState.utilizadorId,
          valor: locationState.valor,
          nota: locationState.nota
        }
      });
    }
  };

  const goEditDoacao = () =>
    navigate('/create-doacao', {
      state: {
        utilizadorId: locationState.tipo === 'doacao' ? locationState.utilizadorId : undefined,
        valor: locationState.tipo === 'doacao' ? locationState.valor : undefined,
        nota: locationState.tipo === 'doacao' ? locationState.nota : undefined
      }
    });

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-sm">Carregando…</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500 text-sm">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-lg p-6 space-y-4 text-sm">
        <h1 className="text-lg font-semibold text-center">Confirmar Pagamento</h1>

        {/* Subscrição */}
        {locationState.tipo === 'subscricao' && plan && duracao && (
          <>
            <hr className="border-gray-200"/>
            <label className="block font-medium mt-2">Plano Subscrito</label>
            <div onClick={goVerPlanos} className="p-3 border border-gray-300 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 flex justify-between items-center">
              <div>
                <div><span className="font-semibold">Nome:</span> {plan.Nome}</div>
                <div><span className="font-semibold">Descrição:</span> {plan.Descricao}</div>
              </div>
              <span className="text-blue-600 font-medium hover:underline text-sm">Alterar</span>
            </div>

            <label className="block font-medium mt-2">Duração</label>
            <div onClick={goDurationPicker} className="p-3 border border-gray-300 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 flex justify-between items-center">
              <div>
                <div><span className="font-semibold">Tipo:</span> {duracao.Nome}</div>
                <div><span className="font-semibold">Meses:</span> {duracao.Meses}</div>
              </div>
              <span className="text-blue-600 font-medium hover:underline text-sm">Alterar</span>
            </div>
          </>
        )}

        {/* Doação */}
        {locationState.tipo === 'doacao' && (
          <>
            <hr className="border-gray-200"/>
            <label className="block font-medium mt-2">Detalhes da Doação</label>
            <div onClick={goEditDoacao} className="p-3 border border-gray-300 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 flex justify-between items-center">
              <div>
                <div><span className="font-semibold">Doador:</span> {doadorNome}</div>
                <div><span className="font-semibold">Mensagem do Doador:</span> {locationState.nota || 'Sem Mensagem'}</div>
              </div>
              <span className="text-blue-600 font-medium hover:underline text-sm">Alterar</span>
            </div>
          </>
        )}

        {/* Método de Pagamento */}
        <hr className="border-gray-200"/>
        <label className="block font-medium mt-2">Método de Pagamento</label>
        <div onClick={goPaymentPicker} className="flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100">
          <div className="flex items-center space-x-2">
            {logoSrc && <img src={logoSrc} alt="" className="w-8 h-8 object-contain"/>}
            <span>{metodo?.Nome}</span>
          </div>
          <span className="text-blue-600 font-medium hover:underline text-sm">Alterar</span>
        </div>

        {/* NIF */}
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
            setTelemovelLimpo(value.slice(dial.length).replace(/\D/g, ''));
          }}
          containerClass="w-full mt-1"
          inputClass="w-full h-[42px] px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200"
          buttonClass="border-r border-gray-300 bg-white rounded-l-lg"
          dropdownClass="border-gray-300 rounded-lg shadow-lg"
          inputStyle={{ paddingLeft: '46px', height: '42px', width: '100%' }}
          buttonStyle={{ height: '42px', borderRadius: '0.5rem 0 0 0.5rem' }}
        />

           {/* Nota */}
           <label htmlFor="nota" className="block font-medium mt-2">Nota (opcional)</label>
        <textarea
          id="nota"
          value={notaPagamento}
          onChange={e => setNotaPagamento(e.target.value)}
          placeholder="Deixe aqui uma observação..."
          className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200"
          rows={3}
        />

        {/* Total */}
        <div className="mt-6 text-center">
          <span className="block text-xl font-medium text-black">Total a pagar</span>
          <span className="block text-3xl font-bold text-gray-700">
            €
            {locationState.tipo === 'subscricao'
              ? duracao?.ValorFinal.toFixed(2)
              : locationState.valor.toFixed(2)}
          </span>
        </div>

        {/* Botão */}
        <button
          onClick={handleContinue}
          className="w-full mt-2 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Continuar
        </button>
        {actionError && <p className="mt-2 text-red-600 text-center text-sm">{actionError}</p>}
      </div>
    </div>
  );
};

export default MbwayConfirmPage;
