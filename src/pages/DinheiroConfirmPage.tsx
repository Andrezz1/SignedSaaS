// src/pages/DinheiroConfirmPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  getTipoSubscricao,
  getMetodoPagamento,
  getDuracaoByTipoSubscricaoId,
  createSubscricaoCompleta,
  confirmarPagamentoFisico,
  useAction
} from 'wasp/client/operations';
import type { TipoSubscricao, MetodoPagamento } from 'wasp/entities';
import ConfirmModal from '../components/dinheiroVerifyModal';

const logos: Record<string,string> = {
  dinheiro: '/images/dinheiro-logo.png',
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
  ValorFinal: number;
}

const DinheiroConfirmPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { planId, metodoId, userId, duracaoId } = state as LocationState;

  const [plan, setPlan]       = useState<TipoSubscricao|null>(null);
  const [metodo, setMetodo]   = useState<MetodoPagamento|null>(null);
  const [duracao, setDuracao] = useState<DuracaoWithExtras|null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [nifPagamento, setNifPagamento] = useState('');
  const [actionError, setActionError]   = useState('');

  // para abrir o modal
  const [isModalOpen, setModalOpen]           = useState(false);
  const [createdPaymentId, setCreatedPaymentId] = useState<number|null>(null);

  const createSub          = useAction(createSubscricaoCompleta);
  const confirmPhysicalPay = useAction(confirmarPagamentoFisico);

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
        setError('Erro ao carregar os dados.');
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
    try {
      const res = await createSub({
        UtilizadorId:       userId,
        TipoSubscricaoId:   planId,
        DuracaoId:          duracaoId,
        DetalheSubscricao:  { Quantidade: 1 },
        Pagamento: {
          MetodoPagamentoId: metodoId,
          NIFPagamento:      nifPagamento,
        },
        PagamentoPagamentoId: 0
      });
      setCreatedPaymentId(res.PagamentoPagamentoId);
      setModalOpen(true);
    } catch {
      setActionError('Não foi possível criar a subscrição.');
    }
  };

  const onModalConfirm = async () => {
    if (!createdPaymentId) return;
    try {
      await confirmPhysicalPay({
        PagamentoId:     createdPaymentId,
        EstadoPagamento: 'concluir',
        Utilizador:      { id: userId }
      });
      navigate('/dashboard');
    } catch (e: any) {
      setActionError(e.message);
    }
  };

  const onModalCancel = async () => {
    if (!createdPaymentId) return;
    try {
      await confirmPhysicalPay({
        PagamentoId:     createdPaymentId,
        EstadoPagamento: 'cancelar',
        Utilizador:      { id: userId }
      });
      navigate('/dashboard');
    } catch (e: any) {
      setActionError(e.message);
    }
  };

  const goPlan     = () => navigate('/ver-planos',      { state: { userId } });
  const goDuration = () => navigate('/duration-picker',{ state: { userId, planId, planName: plan!.Nome } });
  const goMethod   = () => navigate('/payment-picker',  { state: { userId, planId, duracaoId } });

  const key     = metodo!.Nome
    .toLowerCase()
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
          onClick={goPlan}
          className="flex items-center justify-between mt-1 p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <div className="space-y-1">
            <div><span className="font-semibold">Nome:</span> {plan!.Nome}</div>
            <div><span className="font-semibold">Descrição:</span> {plan!.Descricao}</div>
          </div>
          <button className="text-sm font-medium text-blue-600 hover:underline">Alterar</button>
        </div>

        {/* Duração */}
        <hr className="border-gray-200"/>
        <label className="block font-medium mt-2">Duração</label>
        <div
          onClick={goDuration}
          className="flex items-center justify-between mt-1 p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <div className="space-y-1">
            <div><span className="font-semibold">Tipo:</span> {duracao!.Nome}</div>
            <div><span className="font-semibold">Meses:</span> {duracao!.Meses}</div>
          </div>
          <button className="text-sm font-medium text-blue-600 hover:underline">Alterar</button>
        </div>

        {/* Método de Pagamento */}
        <hr className="border-gray-200"/>
        <label className="block font-medium mt-2">Método de Pagamento</label>
        <div
          onClick={goMethod}
          className="flex items-center justify-between mt-1 p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <div className="flex items-center space-x-2">
            {logoSrc && <img src={logoSrc} alt="" className="w-8 h-8 object-contain"/>}
            <span>{metodo!.Nome}</span>
          </div>
          <button className="text-sm font-medium text-blue-600 hover:underline">Alterar</button>
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

        {/* Total a pagar */}
        <div className="mt-6 text-center">
          <span className="block text-xl font-medium text-black">Total a pagar</span>
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

      <ConfirmModal
        title="Confirmação de Pagamento"
        message="Pagamento em dinheiro recebido com sucesso?"
        isOpen={isModalOpen}
        onCancel={onModalCancel}
        onConfirm={onModalConfirm}
      />
    </div>
  );
};

export default DinheiroConfirmPage;
