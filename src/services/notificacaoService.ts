import twilio from 'twilio'
import { PrismaClient } from '@prisma/client'
import cron from 'node-cron'

const prisma = new PrismaClient()

type SendSmsParams = {
  to: string
  message: string
}

export async function enviarSms({ to, message }: SendSmsParams): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID as string
  const authToken = process.env.TWILIO_AUTH_TOKEN as string
  const from = process.env.TWILIO_PHONE_NUMBER as string

  if (!accountSid || !authToken || !from) {
    console.error('Twilio credentials are missing in environment variables.')
    return
  }

  const client = twilio(accountSid, authToken)

  try {
    await client.messages.create({
      body: message,
      from,
      to,
    })
    console.log(`SMS enviado para: ${to}`)
  } catch (error) {
    console.error(`Erro ao enviar SMS para ${to}:`, error)
    throw error
  }
}

// a chamada desta função está no utils.ts
export async function enviarNotificacao() {
  const inicioMesFim = new Date()
  inicioMesFim.setMonth(inicioMesFim.getMonth() + 1)
  inicioMesFim.setHours(0, 0, 0, 0)

  const fimMesFim = new Date(inicioMesFim)
  fimMesFim.setHours(23, 59, 59, 999)

  const expiraSubscricao = await prisma.subscricao.findMany({
    where: {
      DataFim: {
        gte: inicioMesFim,
        lte: fimMesFim,
      },
    },
    include: {
      Utilizador: {
        include: {
          Contacto: true,
        },
      },
    },
  })

  if (expiraSubscricao.length === 0) {
    console.log('Nenhuma subscricao prestes a expirar')
  }

  for (const subscricao of expiraSubscricao) {
    const utilizador = subscricao.Utilizador
    const nrTelemovel = utilizador.Contacto?.Telemovel

    if (nrTelemovel) {
      const message = `Ola ${utilizador.Nome}, a sua subscrição expira em breve (${subscricao.DataFim.toDateString()}).`
      
      await enviarSms({
        to: nrTelemovel,
        message,
      })
    }
  }
}
