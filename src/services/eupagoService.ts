import axios from 'axios'

const EUPAGO_API_KEY = process.env.EUPAGO_API_KEY

const EUPAGO_ENDPOINTS = {
  multibanco: 'https://sandbox.eupago.pt/clientes/rest_api/multibanco/create',
  mbway: 'https://sandbox.eupago.pt/clientes/rest_api/mbway/create',
  cc: 'https://sandbox.eupago.pt/clientes/rest_api/cartao_credito/create'
}

type Metodo = 'multibanco' | 'mbway' | 'cc'

export const iniciarPagamentoComEuPago = async ({
  valor,
  nif,
  telefone,
  email,
  metodo
}: {
  valor: number
  nif: string
  telefone?: string
  email?: string
  metodo: Metodo
}) => {
  const payload: Record<string, any> = {
    chave: EUPAGO_API_KEY,
    valor,
    nif,
    descricao: 'Pagamento de Subscrição'
  }

  if (metodo === 'mbway') {
    if (!telefone) throw new Error('Telefone é obrigatório para MB WAY')
    payload.telemovel = telefone
  }

  if (metodo === 'cc') {
    if (!email) throw new Error('Email é obrigatório para Cartão de Crédito')
    payload.email = email
  }

  const url = EUPAGO_ENDPOINTS[metodo]
  const response = await axios.post(url, new URLSearchParams(payload))

  if (response.data.estado !== 0) {
    throw new Error('Erro na criação do pagamento EuPago: ' + response.data.mensagem)
  }

  return response.data
}
