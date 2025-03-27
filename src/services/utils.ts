import twilio from 'twilio'
import { PrismaClient } from '@prisma/client'
import cron from 'node-cron'

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

const prisma = new PrismaClient()

type SendSmsParams = {
  accountSid: string
  authToken: string
  from: string
  to: string
  message: string
}

export async function sendSms({ accountSid, authToken, from, to, message }: SendSmsParams): Promise<void> {
  const client = twilio(accountSid, authToken)

  try {
    await client.messages.create({
      body: message,
      from,
      to,
    })
    console.log(`SMS enviadopara:${to}`)
  } catch (error) {
    console.error('Erro ao enviar SMS:', error)
    throw error
  }
}

export async function notifyExpiringSubscriptions() {
  const mesFim = new Date()
  mesFim.setMonth(mesFim.getMonth() + 1)

  const expiraSubscricao = await prisma.subscricao.findMany({
    where: {
      DataFim: {
        lte: mesFim,
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
    return
  }

  for (const subscricao of expiraSubscricao) {
    const utilizador = subscricao.Utilizador
    const nrTelemovel = utilizador.Contacto?.Telemovel

    if (nrTelemovel) {
      const message = `Ola ${utilizador.Nome}, a sua subscrição expira em breve (${subscricao.DataFim.toDateString()}).`
      
      await sendSms({
        accountSid: 'AC9d32a745fc94d94bcd1248337ed8dcfb',
        authToken: '49ed2a547cecf3578fe085e9e67d6d9c',
        from: '+12543543854',
        to: "+" + nrTelemovel,
        message,
      })
    }
  }
}

cron.schedule('0 0 * * *', async () => {
  console.log('A procurar subscricoes...')
  await notifyExpiringSubscriptions().catch(console.error)
})
