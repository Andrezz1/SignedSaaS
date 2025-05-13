import { Comprovativo, MetodoPagamento, Pagamento, Utilizador } from 'wasp/entities'
import axios from 'axios'
import { 
  type GetPagamento, 
  type GetPagamentoInfo,
  type GetPagamentoByUtilizadorId,
  type GetMetodoPagamento,
  type ConfirmarPagamentoFisico
} from 'wasp/server/operations'
import { HttpError } from 'wasp/server'
import { registarAuditLog } from './auditService'

export const getPagamento: GetPagamento<void, Pagamento[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  return context.entities.Pagamento.findMany({
    orderBy: { PagamentoId: 'asc' },
  })
}

export const getMetodoPagamento: GetMetodoPagamento <void, MetodoPagamento[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  return context.entities.MetodoPagamento.findMany({
    orderBy: { MetodoPagamentoId: 'asc' },
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

type CreatePagamentoPayload = {
  Valor: number
  UtilizadorId: number
  MetodoPagamentoId: number
  Nota?: string
  DadosEspecificos?: any
  EstadoPagamento?: string
  NIFPagamento: string
  TelemovelMbway?: string
}

export async function createPagamento(input: CreatePagamentoPayload, prisma: any) {
  const EUPAGO_API_KEY = process.env.EUPAGO_API_KEY!
  let dadosEspecificos = input.DadosEspecificos || {}

  try {
    if (input.Valor <= 0) {
      throw new Error('Valor deve ser positivo')
    }

    if (input.MetodoPagamentoId === 4) {
      dadosEspecificos = {
        tipo: 'pagamento_fisico',
        instrucoes: 'Pagamento a ser efetuado fisicamente e verificado manualmente.'
      }

      const pagamento = await prisma.pagamento.create({
        data: {
          Valor: input.Valor,
          DadosEspecificos: dadosEspecificos,
          DataPagamento: new Date(),
          Nota: input.Nota || '',
          EstadoPagamento: input.EstadoPagamento || 'pendente',
          NIFPagamento: input.NIFPagamento,
          MetodoPagamentoId: input.MetodoPagamentoId,
          UtilizadorId: input.UtilizadorId
        }
      })

      return pagamento
    }

    if (!EUPAGO_API_KEY) throw new Error('Chave API da EuPago não configurada')

    const payload: Record<string, any> = {
      chave: EUPAGO_API_KEY,
      valor: input.Valor.toFixed(2),
      id: `user_${input.UtilizadorId}_${Date.now()}`,
      alias: input.TelemovelMbway,
      descricao: 'Pagamento de Subscrição',
      nif: input.NIFPagamento
    }

    let endpoint = ''

    if (input.MetodoPagamentoId === 1) { // MB WAY
      if (!input.TelemovelMbway) {
        throw new Error('Telemóvel é obrigatório para MB WAY')
      }
      endpoint = 'https://sandbox.eupago.pt/clientes/rest_api/mbway/create'

    } else if (input.MetodoPagamentoId === 2) { // Multibanco
      endpoint = 'https://sandbox.eupago.pt/clientes/rest_api/multibanco/create'

    } else if (input.MetodoPagamentoId === 3) { // Cartão de Crédito
      endpoint = 'https://sandbox.eupago.pt/clientes/rest_api/creditcard/create'

    } else {
      throw new Error('Método de pagamento inválido')
    }

    const response = await axios.post(
      endpoint,
      new URLSearchParams(Object.entries(payload)).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000
      }
    )

    if (response.data.estado !== 0) {
      throw new Error(`Erro EuPago [${response.data.estado}]: ${response.data.mensagem}`)
    }

    dadosEspecificos = response.data

  } catch (err: any) {
    throw new Error(err.response?.data?.mensagem || `Erro ao gerar pagamento: ${err.message}`)
  }

  try {
    const pagamento = await prisma.pagamento.create({
      data: {
        Valor: input.Valor,
        DadosEspecificos: dadosEspecificos,
        DataPagamento: new Date(),
        Nota: input.Nota || '',
        EstadoPagamento: input.EstadoPagamento || 'pendente',
        NIFPagamento: input.NIFPagamento,
        MetodoPagamentoId: input.MetodoPagamentoId,
        UtilizadorId: input.UtilizadorId
      }
    })

    return pagamento
  } catch (err) {
    throw new Error('Erro ao registrar o pagamento')
  }
}


export async function connectPagamentoASubscricao(
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

type UpdatePagamentoFisicoPayload = {
  PagamentoId: number
  EstadoPagamento: 'concluir' | 'cancelar'
  Utilizador: {
    id: number
  }
}

export const confirmarPagamentoFisico: ConfirmarPagamentoFisico<UpdatePagamentoFisicoPayload, Pagamento> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  const pagamento = await context.entities.Pagamento.findUnique({
    where: {
      PagamentoId: args.PagamentoId
    },
    include: {
      Subscricoes: true
    }
  })

  const parametrosRecebidos = args
  const idUtilizadorResponsavel = context.user.id

  if (!pagamento) {
    throw new Error("Pagamento não encontrado")
  }

  if (pagamento.MetodoPagamentoId !== 4) {
    throw new Error("O método de pagamento não é físico")
  }

  if (pagamento.EstadoPagamento !== 'pendente') {
    throw new Error("Este pagamento já foi processado")
  }

  let updatedPagamento: Pagamento

  try {
    if (args.EstadoPagamento === 'concluir') {
      updatedPagamento = await context.entities.Pagamento.update({
        where: { PagamentoId: args.PagamentoId },
        data: {
          EstadoPagamento: 'concluido'
        }
      })

      await context.entities.Subscricao.updateMany({
        where: { PagamentoPagamentoId: args.PagamentoId },
        data: { EstadoSubscricao: true }
      })

    } else if (args.EstadoPagamento === 'cancelar') {
      updatedPagamento = await context.entities.Pagamento.update({
        where: { PagamentoId: args.PagamentoId },
        data: { EstadoPagamento: 'cancelado' }
      })
    } else {
      throw new Error("Ação inválida. Deve ser 'concluir' ou 'cancelar'")
    }

    await registarAuditLog('auditPagamento',{
      entidade: 'Pagamento',
      operacao: 'UPDATE',
      idUtilizadorResponsavel,
      parametrosRecebidos,
      dadosAntes: pagamento,
      dadosDepois: updatedPagamento,
      resultado: 'SUCCESS',
      mensagemErro: ""
    })

    return updatedPagamento

  } catch (error) {
      await registarAuditLog('auditPagamento',{
        entidade: 'Pagamento',
        operacao: 'UPDATE',
        idUtilizadorResponsavel,
        parametrosRecebidos,
        dadosAntes: null,
        dadosDepois: null,
        resultado: 'FAILURE',
        mensagemErro: error instanceof Error ? error.message : JSON.stringify(error)
      })
  
      throw error
    }
}
