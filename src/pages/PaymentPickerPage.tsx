// pages/PaymentPickerPage.tsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface LocationState {
  planId: number;
}

const PaymentPickerPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { planId } = state as LocationState;

  // Agora já sabes qual o plano selecionado:
  console.log('Plano escolhido:', planId);

  const handleConfirm = () => {
    // exemplo: criar subscrição + pagamento com planId
    // createSubscription({ tipoSubscricaoId: planId, ... })
    // depois:
    navigate('/planos/confirmation');
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Escolha o método de pagamento</h2>
      <p>Você escolheu o plano #{planId}</p>
      {/* aqui vens os botões de cartão, MB Way, etc */}
      <button
        onClick={handleConfirm}
        className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg"
      >
        Confirmar e Pagar
      </button>
    </div>
  );
};

export default PaymentPickerPage;
