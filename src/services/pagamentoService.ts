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

type CriarPagamentoInput = {
  Valor: number
  UtilizadorId: number
  MetodoPagamentoId: number
  DadosEspecificos?: any
  EstadoPagamento?: string
  NIFPagamento: string
  TelemovelMbway?: string
}

export async function criarPagamento(input: CriarPagamentoInput, prisma: any) {
  let dadosEspecificos = input.DadosEspecificos || {}
  const EUPAGO_API_KEY = process.env.EUPAGO_API_KEY!

  try {
    if (input.MetodoPagamentoId === 1) {
      // MB WAY
      const response = await axios.post('https://clientes.eupago.pt/clientes/rest_mpway_create', {
        chave: EUPAGO_API_KEY,
        valor: input.Valor,
        id: `user_${input.UtilizadorId}_${Date.now()}`,
        alias: input.TelemovelMbway
      })
      dadosEspecificos = response.data
    } else if (input.MetodoPagamentoId === 2) {
      // Multibanco
      const response = await axios.post('https://sandbox.eupago.pt/clientes/rest_mbt_create', {
        chave: EUPAGO_API_KEY,
        valor: input.Valor,
        id: `user_${input.UtilizadorId}_${Date.now()}`
      })
      dadosEspecificos = response.data
    } else if (input.MetodoPagamentoId === 3) {
      // Cartão de crédito (redirecionamento)
      const response = await axios.post('https://clientes.eupago.pt/clientes/rest_cc_create', {
        chave: EUPAGO_API_KEY,
        valor: input.Valor,
        id: `user_${input.UtilizadorId}_${Date.now()}`
      })
      dadosEspecificos = response.data
    }
  } catch (err) {
    console.error('Erro ao contactar a EuPago:', err)
    throw new Error('Erro ao gerar dados de pagamento com a EuPago.')
  }

  const pagamento = await prisma.pagamento.create({
    data: {
      Valor: input.Valor,
      DadosEspecificos: dadosEspecificos,
      DataPagamento: new Date(),
      EstadoPagamento: input.EstadoPagamento || 'pendente',
      NIFPagamento: input.NIFPagamento,
      MetodoPagamentoId: input.MetodoPagamentoId,
      UtilizadorId: input.UtilizadorId
    }
  })

  return pagamento
}


export async function ligarPagamentoASubscricao(
  subscricaoId: number,
  pagamentoId: number,
  context: any
) {
  const subscricaoAtualizada = await context.entities.Subscricao.update({
    where: { SubscricaoId: subscricaoId },
    data: {
      PagamentoPagamentoId: pagamentoId
    },
    include: {
      Pagamento: true,
      Detalhes: true,
      TipoSubscricao: true
    }
  })

  return subscricaoAtualizada
}

// // euPago

// interface MultibancoResponse {
//   estado: number
//   referencia: string
//   entidade: string
//   valor: number
//   id: string
// }

// export async function criarReferenciaMultibanco(
//   valor: number,
//   id: string
// ): Promise<MultibancoResponse> {
//   const EUPAGO_API_KEY = process.env.EUPAGO_API_KEY
//   const EUPAGO_API_URL = process.env.EUPAGO_API_URL
//   if (!EUPAGO_API_URL) {
//     throw new Error('URL nao definido')
//   }
//   if (!EUPAGO_API_KEY) {
//     throw new Error('Chave de API não definida.')
//   }

//   const data = new URLSearchParams()
//   data.append('chave', EUPAGO_API_KEY)
//   data.append('valor', valor.toString())
//   data.append('id', id)

//   try {
//     const response = await axios.post<MultibancoResponse>(
//       `${EUPAGO_API_URL}/multibanco/create`,
//       data
//     )

//     if (response.data.estado !== 0) {
//       throw new Error(`Erro na criação da referência: ${response.data.estado}`)
//     }

//     return response.data;
//   } catch (error) {
//     throw new Error(`Erro ao comunicar com a euPago: ${error}`)
//   }
// }
