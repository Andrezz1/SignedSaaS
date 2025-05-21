import type { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { type HandleEupagoWebhook } from 'wasp/server/api'

const prisma = new PrismaClient()

export const handleEupagoWebhook: HandleEupagoWebhook = async (req: Request, res: Response) => {
  try {
    console.log('Headers recebidos:', req.headers)

    const payload = req.body
    console.log('Payload completo recebido:', JSON.stringify(payload, null, 2))

    if (!payload) {
      console.error('Payload vazio recebido')
      return res.status(400).json({ error: 'Payload vazio' })
    }

    if (payload.test_notification) {
      console.log('Notificação de teste recebida - Webhook configurado com sucesso')
      return res.status(200).json({ message: 'Teste recebido com sucesso' })
    }

    if (!payload.referencia) {
      console.error('Campo "referencia" não encontrado no payload')
      return res.status(400).json({ error: 'Campo "referencia" é obrigatório' })
    }

    try {
      await prisma.auditPagamento.create({
        data: {
          Entidade: 'EuPago Webhook',
          Operacao: 'NOTIFICACAO',
          ParametrosRecebidos: payload,
          Resultado: 'RECEBIDO',
          IdUtilizadorResponsavel: 1, 
          MensagemErro: null
        }
      })
      console.log('Registro de auditoria criado com sucesso')
    } catch (dbError) {
      console.error('Erro ao criar registro de auditoria:', dbError)
    }

    res.status(200).json({ 
      success: true,
      message: 'Webhook recebido com sucesso',
      referencia: payload.referencia
    })

  } catch (err) {
    console.error('Erro ao processar webhook EuPago:', err)
    
    try {
      await prisma.auditPagamento.create({
        data: {
          Entidade: 'EuPago Webhook',
          Operacao: 'ERRO',
          ParametrosRecebidos: req.body || {},
          Resultado: 'FALHA',
          IdUtilizadorResponsavel: 1,
          MensagemErro: err instanceof Error ? err.message : 'Erro desconhecido'
        }
      })
    } catch (dbError) {
      console.error('Erro ao registrar falha na auditoria:', dbError)
    }

    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: err instanceof Error ? err.message : err
    })
  }
}