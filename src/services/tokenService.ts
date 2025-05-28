import crypto from 'crypto'
import { AccessToken } from 'wasp/entities'
import { CreateAccessToken } from "wasp/server/operations"
import { HttpError } from 'wasp/server'

type CreateAccessTokenPayload = {
  Utilizador: {
    NIF: string
  }
}

export const createAccessToken: CreateAccessToken<CreateAccessTokenPayload, AccessToken
> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }
  
  const utilizador = await context.entities.Utilizador.findUnique ({
    where: {
      NIF: args.Utilizador.NIF
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

  return accessToken
}
  