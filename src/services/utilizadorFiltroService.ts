import { Utilizador, UtilizadorFiltro } from "wasp/entities"
import { CreateUtilizadorFiltro, DeleteUtilizadorFiltro, GetUtilizadorFiltros } from "wasp/server/operations"
import { HttpError } from 'wasp/server'
import type { JsonObject } from "@prisma/client/runtime/library"

export const getUtilizadorFiltros: GetUtilizadorFiltros<Pick<Utilizador, 'id'>, any> 
= async (args, context) => {
  if(!context.user) {
      throw new HttpError(401, "Não tem permissão")
  }

  if(!args.id) {
      throw new Error("Id não encontrado")
  }

  const utilizador = await context.entities.Utilizador.findUnique({
      where: {
          id: args.id
      },
      include: {
          UtilizadorFiltro: true,
      }
  })

  if (!utilizador) {
      throw new Error("Utilizador não encontrado")
  }

  return utilizador.UtilizadorFiltro
}

type CreateUtilizadorFiltroPayload = {
  nomeFiltro: string
  filtros: JsonObject
  utilizadorId: number
}

export const createUtilizadorFiltro: CreateUtilizadorFiltro<
  CreateUtilizadorFiltroPayload,
  UtilizadorFiltro
> = async (args, context) => {
  if (!context.user) {
    throw new Error("Não tem permissão")
  }

  const utilizador = await context.entities.Utilizador.findUnique({
    where: { id: args.utilizadorId },
  })

  if (!utilizador) {
    throw new Error("Utilizador não encontrado")
  }

  return await context.entities.UtilizadorFiltro.create({
    data: {
      nomeFiltro: args.nomeFiltro,
      filtros: args.filtros,
      UtilizadorId: args.utilizadorId,
    },
  })
}


export const deleteUtilizadorFiltro: DeleteUtilizadorFiltro<
  { utilizadorFiltroId: number },
  UtilizadorFiltro
> = async ({ utilizadorFiltroId }, context) => {
  if (!context.user) {
    throw new Error("Não tem permissão")
  }

  return await context.entities.UtilizadorFiltro.delete({
    where: { UtilizadorFiltroId: utilizadorFiltroId }
  })
}