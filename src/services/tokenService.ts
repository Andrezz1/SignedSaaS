import crypto from 'crypto'
import { AccessToken } from 'wasp/entities'
import { type CreateAccessToken,
  type ValidarToken
} from "wasp/server/operations"
import { HttpError } from 'wasp/server'
import { enviarEmail } from './notificacaoService'

type CreateAccessTokenPayload = {
  Utilizador: {
    NIF: string
  }
}

export const createAccessToken: CreateAccessToken<CreateAccessTokenPayload, AccessToken
> = async (args, context) => {
  const utilizador = await context.entities.Utilizador.findUnique ({
    where: {
      NIF: args.Utilizador.NIF,
    },
    include: {
        Contacto: true,
    }
  })

  if (!utilizador) {
    throw new HttpError(404, "Utilizador não encontrado")
  }

  const token = crypto.randomBytes(32).toString('hex')

  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 1)

  const accessToken = await context.entities.AccessToken.create({
    data: {
      Token: token,
      ExpiresAt: expiresAt,
      UtilizadorId: utilizador.id
    }
  })

  const email = utilizador.Contacto?.Email
  const subject = `Acesso aplicação`
  const url = process.env.APP_URL
  const body = `Abra este link para aceder a página: ${url}/dashboard?token:${token}`

  if(email) {
    await enviarEmail({
      to: email,
      subject,
      body
    })
  } else {
    throw new Error ("Email não associado")
  }

  return accessToken
}

type ValidarTokenPayload = { message: string, id: number }

export const validarToken: ValidarToken<Pick<AccessToken, 'Token'>, ValidarTokenPayload
> = async(args, context) => {
  const token = await context.entities.AccessToken.findUnique({
    where: { Token: args.Token }
  })

  if(!token || token.ExpiresAt < new Date()) {
    throw new Error("Token inválido")
  }

  return { message: 'Token válido', id: token.UtilizadorId }
}
