import { PrismaClient } from '@prisma/client'

import { type EuPagoWebhook } from "wasp/server/api"
const prisma = new PrismaClient()

export const euPagoWebhook: EuPagoWebhook = async (req, res) => {
  const {
    referencia,
    transacao,
    valor,
    data,
    canal,
    sp,
    entidade,
    comissao,
    local,
    chave_api
  } = req.query as Record<string, string>;

  if (chave_api !== process.env.EUPAGO_API_KEY) {
    console.error("EuPago: chave_api inválida", { received: chave_api })
    return res.status(401).send("Não Autorizado")
  }

  const pagamento = await prisma.pagamento.findFirst({
    where: {
      DadosEspecificos: {
        path: ["referencia"],
        equals: referencia
      }
    }
  })

  if (!pagamento) {
    console.log("EuPago: pagamento não encontrado", { referencia })
    return res.status(404).send("Pagamento não encontrado")
  }

  if (pagamento.EstadoPagamento === "concluido") {
    return res.status(200).send("Pagamento já tinha sido processado")
  }

  const isoDate = data.replace(/^(\d{4}-\d{2}-\d{2}):/, "$1T")
  const parsedDate = new Date(isoDate + "Z")

  await prisma.pagamento.update({
    where: { PagamentoId: pagamento.PagamentoId },
    data: {
      EstadoPagamento: "concluido",
      DataPagamento: parsedDate,
      DadosEspecificos: { transacao, valor, canal, sp, entidade, comissao, local }
    }
  })

  await prisma.subscricao.updateMany({
    where: { PagamentoPagamentoId: pagamento.PagamentoId },
    data: { EstadoSubscricao: true }
  })

  const comprovativoData: any = {
    PagamentoPagamentoId: pagamento.PagamentoId,
    UtilizadorId: pagamento.UtilizadorId
  }

  const subscricao = await prisma.subscricao.findFirst({
    where: { PagamentoPagamentoId: pagamento.PagamentoId }
  })

  if(subscricao) {
    comprovativoData.SubscricaoSubscricaoId = subscricao.SubscricaoId
  }

  await prisma.comprovativo.create({
    data: comprovativoData
  })

  return res.status(200).send("OK")
}