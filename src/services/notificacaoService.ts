import twilio from 'twilio'
import { PrismaClient } from '@prisma/client'
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses"
import { HttpError } from 'wasp/server'

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
    console.error('Credenciais do Twilio em falta')
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

type SendEmailParams = {
    to: string
    subject: string
    body: string
  }
  
  export async function enviarEmail({ to, subject, body }: SendEmailParams): Promise<void> {
    const sesClient = new SESClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  
    const params = {
      Source: process.env.SES_EMAIL_FROM as string,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: subject,
        },
        Body: {
          Text: {
            Data: body,
          },
        },
      },
    }
  
    try {
      const command = new SendEmailCommand(params)
      await sesClient.send(command)
      console.log(`Email enviado para: ${to}`)
    } catch (error) {
        console.error(`Erro ao enviar email para ${to}:`, error)
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

    if(!utilizador.Contacto) {
      throw new Error("Nenhum contacto encontrado")
    }

    const nrTelemovel = utilizador.Contacto.Telemovel
    const email = utilizador.Contacto?.Email
    const message = `Ola ${utilizador.Nome}, a sua subscrição expira em breve (${subscricao.DataFim.toDateString()}).`
    const body = message
    const subject = `Atualização subscrição`

    if(email) {
      await enviarEmail({
        to: email,
        subject,
        body,
      })
    } else {
        await enviarSms({
          to: nrTelemovel,
          message,
        })
    }
  }
}
