import { prisma } from 'wasp/server'

interface AuditLogInput {
  entidade: string
  operacao: 'CREATE' | 'UPDATE' | 'DELETE'
  dataHora?: Date
  idUtilizadorResponsavel: number
  parametrosRecebidos: any
  dadosAntes: any | null
  dadosDepois: any | null
  resultado: 'SUCCESS' | 'FAILURE'
  mensagemErro: string
}

export async function registarAuditLog(
  tabela: 'auditUtilizador' | 'auditTipoSubscricao' | 'auditPagamento',
  data: AuditLogInput
) {
  try {
    await (prisma as any)[tabela].create({
      data: {
        Entidade: data.entidade,
        Operacao: data.operacao,
        DataHora: data.dataHora || new Date(),
        IdUtilizadorResponsavel: data.idUtilizadorResponsavel,
        ParametrosRecebidos: data.parametrosRecebidos,
        DadosAntes: data.dadosAntes,
        DadosDepois: data.dadosDepois,
        Resultado: data.resultado,
        MensagemErro: data.mensagemErro
      }
    })
  } catch (error) {
    console.error(`Erro ao gravar log na tabela ${tabela}:`, (error as Error).message)
  }
}
