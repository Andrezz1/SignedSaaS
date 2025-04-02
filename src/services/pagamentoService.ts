import { Comprovativo, Pagamento, Utilizador } from 'wasp/entities'
import axios from 'axios'
import { 
  type GetPagamento, 
  type GetPagamentoInfo,
  type GetPagamentoByUtilizadorId
} from 'wasp/server/operations'
import { HttpError } from 'wasp/server'

export const getPagamento: GetPagamento<void, Pagamento[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  return context.entities.Pagamento.findMany({
    orderBy: { PagamentoId: 'asc' },
  })
}

export const getPagamentoInfo: GetPagamentoInfo<void, Array<{ 
  pagamento: Pagamento, 
  utilizador: Utilizador 
}>> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  const pagamentos = await context.entities.Pagamento.findMany({
    include: {
      Utilizador: true,
    }
  })

  const PagamentoInfo = pagamentos.map(({ Utilizador , ...pagamento }) => ({
    pagamento,
    utilizador: Utilizador,
  }))
  
  return PagamentoInfo
}

export const getPagamentoByUtilizadorId: GetPagamentoByUtilizadorId<Pick<Utilizador, 'id'>, Pagamento[]>
= async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  if(!args.id) {
    throw new Error("UtilizadorId nao foi encontrado")
  }

  return context.entities.Pagamento.findMany({
    where: {  UtilizadorId: args.id },
  })
}

// euPago

interface MultibancoResponse {
  estado: number
  referencia: string
  entidade: string
  valor: number
  id: string
}

export async function criarReferenciaMultibanco(
  valor: number,
  id: string
): Promise<MultibancoResponse> {
  const EUPAGO_API_KEY = process.env.EUPAGO_API_KEY
  const EUPAGO_API_URL = process.env.EUPAGO_API_URL
  if (!EUPAGO_API_URL) {
    throw new Error('URL nao definido')
  }
  if (!EUPAGO_API_KEY) {
    throw new Error('Chave de API não definida.')
  }

  const data = new URLSearchParams()
  data.append('chave', EUPAGO_API_KEY)
  data.append('valor', valor.toString())
  data.append('id', id)

  try {
    const response = await axios.post<MultibancoResponse>(
      `${EUPAGO_API_URL}/multibanco/create`,
      data
    )

    if (response.data.estado !== 0) {
      throw new Error(`Erro na criação da referência: ${response.data.estado}`)
    }

    return response.data;
  } catch (error) {
    throw new Error(`Erro ao comunicar com a euPago: ${error}`)
  }
}

