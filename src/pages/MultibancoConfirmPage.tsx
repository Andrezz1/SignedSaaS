import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  getTipoSubscricao,
  getMetodoPagamento,
  getDuracaoByTipoSubscricaoId,
  createSubscricaoCompleta,
  createDoacaoCompleta,
  createPagamentoSubscricaoExistente,
  getUtilizadorInfoById,
  getSubscricaoById,
  useAction
} from 'wasp/client/operations';
import type { TipoSubscricao, MetodoPagamento } from 'wasp/entities';

const logos: Record<string, string> = {
  multibanco: '/images/multibanco-logo.png',
};

interface SubscricaoState {
  tipo: 'subscricao';
  planId: number;
  metodoId: number;
  userId: number;
  duracaoId: number;
  origin?: 'admin' | 'cliente';
}

interface DoacaoState {
  tipo: 'doacao';
  metodoId: number;
  utilizadorId: number;
  valor: number;
  nota: string;
  token: string;
  origin?: 'admin' | 'cliente';
}

interface SubscricaoExistenteState {
  tipo: 'subscricao-existente';
  subscricaoId: number;
  metodoId: number;
  userId: number;
  valor?: number;
  origin?: 'admin' | 'cliente';
}

type LocationState = SubscricaoState | DoacaoState | SubscricaoExistenteState;

interface DuracaoWithExtras {
  DuracaoId: number;
  Nome: string;
  Meses: number;
  Valor: number;
}

const MultibancoConfirmPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const locationState = state as LocationState;

  const [plan, setPlan] = useState<TipoSubscricao | null>(null);
  const [metodo, setMetodo] = useState<MetodoPagamento | null>(null);
  const [duracao, setDuracao] = useState<DuracaoWithExtras | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nifPagamento, setNifPagamento] = useState('');
  const [notaPagamento, setNotaPagamento] = useState('');
  const [notaExtra, setNotaExtra] = useState('');
  const [actionError, setActionError] = useState('');
  const [doadorNome, setDoadorNome] = useState('');


  const createSub = useAction(createSubscricaoCompleta);
  const createDoacao = useAction(createDoacaoCompleta);
  const createExisting = useAction(createPagamentoSubscricaoExistente);

  useEffect(() => {
  (async () => {
    try {
      const metodos = await getMetodoPagamento();
      setMetodo(
        metodos.find(m => m.MetodoPagamentoId === locationState.metodoId)!
      );

      if (locationState.tipo === 'subscricao') {
        const [tipos, duracoes] = await Promise.all([
          getTipoSubscricao(),
          getDuracaoByTipoSubscricaoId({
            TipoSubscricaoID: locationState.planId
          })
        ]);
        setPlan(
          tipos.find(t => t.TipoSubscricaoID === locationState.planId)!
        );
        setDuracao(
          duracoes.find(d => d.DuracaoId === locationState.duracaoId)!
        );

      } else if (locationState.tipo === 'subscricao-existente') {
        const [subs] = await getSubscricaoById({
          SubscricaoId: locationState.subscricaoId
        });
        setPlan(subs.TipoSubscricao);
        setDuracao({
          DuracaoId:  subs.Duracao.DuracaoId,
          Nome:       subs.Duracao.Nome,
          Meses:      subs.Duracao.Meses,
          Valor:      subs.Duracao.Valor,
        });

      } else {
        setNotaExtra(locationState.nota ?? '');
        const res = await getUtilizadorInfoById({
          id: locationState.utilizadorId
        });
        setDoadorNome(res?.[0]?.utilizador?.Nome ?? 'Doação Anônima');
      }

    } catch {
      setError('Erro ao carregar os dados.');
    } finally {
      setLoading(false);
    }
  })();
}, [locationState]);


  const handleContinue = async () => {
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
            Nota: notaPagamento
          },
          PagamentoPagamentoId: 0
        });

        navigate('/multibanco-details', {
          state: { 
            tipo: 'subscricao',
            paymentId: res.PagamentoPagamentoId,
            planName: plan!.Nome,
            planDesc: plan!.Descricao,
            duracaoNome: duracao!.Nome,
            duracaoMeses: duracao!.Meses
          }
        });

      } else if (locationState.tipo === 'doacao') {
        const res = await createDoacao({
          UtilizadorId: locationState.utilizadorId,
          ValorDoacao: locationState.valor,
          NotaPagamento: notaPagamento,
          NotaDoacao: notaExtra,
          MetodoPagamentoId: locationState.metodoId,
          NIFPagamento: nifPagamento,
          token: locationState.token,
        });

        navigate('/multibanco-details', {
          state: { 
            tipo: 'doacao',
            paymentId: res.pagamento.PagamentoId,
            utilizadorId: locationState.utilizadorId,
            nota: notaExtra,
            origin: locationState.origin
          }
        });
      } else if (locationState.tipo === 'subscricao-existente') {
        const res = await createExisting({
          SubscricaoId: locationState.subscricaoId,
          UtilizadorId: locationState.userId,
          MetodoPagamentoId: locationState.metodoId,
          NIFPagamento: nifPagamento,
          Nota: notaPagamento,
          EstadoPagamento: 'pendente',
          DadosEspecificos: {},
          Valor: 0,
        });
        const paymentId = 
          (res as any).PagamentoPagamentoId ?? (res as any).PagamentoId;
        navigate('/multibanco-details', {
          state: { 
            tipo: 'subscricao-existente',
            paymentId,
            subscricaoId: locationState.subscricaoId,
            userId: locationState.userId,
          }
        });
      }
    } catch {
      setActionError('Não foi possível concluir o pagamento.');
    }
  };

  const goEditPlano = () =>
    navigate('/ver-planos', { state: { userId: locationState.tipo === 'subscricao' ? locationState.userId : undefined } });

  const goEditDuracao = () =>
    navigate('/duration-picker', {
      state: {
        userId: locationState.tipo === 'subscricao' ? locationState.userId : undefined,
        planId: locationState.tipo === 'subscricao' ? locationState.planId : undefined,
        planName: plan?.Nome
      }
    });

  const goEditMetodo = () => {
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
    }else if (locationState.tipo === 'subscricao-existente') {
      navigate('/payment-picker', {
        state: {
          tipo: 'subscricao-existente',
          subscricaoId: locationState.subscricaoId,
          userId: locationState.userId,
          valor: locationState.valor,
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

  const key = metodo?.Nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
  const logoSrc = logos[key || ''] || '';
  

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-sm">Carregando…</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500 text-sm">{error}</div>;

      let total = 0;
  if (locationState.tipo === 'doacao') {
    total = locationState.valor;
  } else if (locationState.tipo === 'subscricao') {
    total = duracao?.Valor ?? 0;
  } else {
    total = locationState.valor ?? 0;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-lg p-6 space-y-4 text-sm">
        <h1 className="text-lg font-semibold text-center">Confirmar Pagamento</h1>

        {locationState.tipo === 'subscricao' && plan && duracao && (
          <>
            <hr className="border-gray-200"/>
            <label className="block font-medium mt-2">Plano Subscrito</label>
            <div onClick={goEditPlano} className="p-3 border border-gray-300 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 flex justify-between items-center">
              <div>
                <div><span className="font-semibold">Nome:</span> {plan.Nome}</div>
                <div><span className="font-semibold">Descrição:</span> {plan.Descricao}</div>
              </div>
              <span className="text-blue-600 font-medium hover:underline text-sm">Alterar</span>
            </div>
            <label className="block font-medium mt-2">Duração</label>
            <div onClick={goEditDuracao} className="p-3 border border-gray-300 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 flex justify-between items-center">
              <div>
                <div><span className="font-semibold">Tipo:</span> {duracao.Nome}</div>
                <div><span className="font-semibold">Meses:</span> {duracao.Meses}</div>
              </div>
              <span className="text-blue-600 font-medium hover:underline text-sm">Alterar</span>
            </div>
          </>
        )}

        {locationState.tipo === 'subscricao-existente' && plan && duracao && (
          <>
            <hr className="border-gray-200" />
            <label className="block font-medium mt-2">Plano Existente</label>
            <div className="p-3 border rounded-lg bg-gray-50">
              <p><strong>Nome:</strong> {plan?.Nome}</p>
              <p><strong>Descrição:</strong> {plan?.Descricao}</p>
            </div>
            <label className="block font-medium mt-2">Duração</label>
            <div className="p-3 border rounded-lg bg-gray-50">
              <p><strong>Tipo:</strong> {duracao?.Nome}</p>
              <p><strong>Meses:</strong> {duracao?.Meses}</p>
            </div>
          </>
        )}

        {locationState.tipo === 'doacao' && (
          <>
            <hr className="border-gray-200"/>
            <label className="block font-medium mt-2">Detalhes da Doação</label>
            <div onClick={goEditDoacao} className="p-3 border border-gray-300 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 flex justify-between items-center">
              <div>
                <div><span className="font-semibold">Doador:</span> {doadorNome}</div>
                <div><span className="font-semibold">Mensagem do Doador:</span> {locationState.nota || 'Sem Mensagem'}</div>
              </div>
              <span className="text-blue-600 text-sm font-medium hover:underline">Alterar</span>
            </div>
          </>
        )}

        {/* Método de Pagamento */}
        <hr className="border-gray-200"/>
        <label className="block font-medium mt-2">Método de Pagamento</label>
        <div onClick={goEditMetodo} className="flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100">
          <div className="flex items-center space-x-2">
            {logoSrc && <img src={logoSrc} alt="" className="w-8 h-8 object-contain"/>}
            <span>{metodo?.Nome}</span>
          </div>
          <span className="text-blue-600 text-sm font-medium hover:underline">Alterar</span>
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
          <span className="block text-xl font-medium text-black">
            Total a pagar
          </span>
          <span className="block text-3xl font-bold text-gray-700">
            €{total.toFixed(2)}
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

export default MultibancoConfirmPage;
