import { Contacto, Morada, TipoUtilizador, Utilizador, Subscricao } from 'wasp/entities'
import { type GetUtilizadores, type GetUtilizadorByNIF, type GetUtilizadoresInfo, type CreateUtilizador } from 'wasp/server/operations'
import { getTipoUtilizador } from './tipoUtilizadorService'
import { getMorada } from './moradaService'
import { getContacto } from './contactoService'
import { getSubscricao } from './subscricaoService'

export const getUtilizadores: GetUtilizadores<void, Utilizador[]> = async (args, context) => {
  return context.entities.Utilizador.findMany({
    orderBy: { UtilizadorId: 'asc' },
  })
}

export const getUtilizadorByNIF: GetUtilizadorByNIF<Pick<Utilizador, 'NIF'>, Utilizador[]
> = async (args, context) => {
  if(!args.NIF) return []

  return context.entities.Utilizador.findMany({
    where: { NIF: args.NIF}
  })
}

export const getUtilizadoresInfo: GetUtilizadoresInfo<void, Array<{ 
  utilizador: Utilizador, 
  tipoUtilizador: TipoUtilizador,
  morada: Morada, 
  contacto: Contacto,
  subscricoes: Subscricao[]
}>> = async (args, context) => {
  
  const utilizadores = await getUtilizadores(args, context)
  const tipoUtilizadores = await getTipoUtilizador(args, context)
  const moradas = await getMorada(args, context)
  const contactos = await getContacto(args, context)
  const subscricoes = await getSubscricao(args, context)

  const UtilizadoresInfo = utilizadores.map(utilizador => {
    const tipoUtilizador = tipoUtilizadores.find(tu => tu.TipoUtilizadorId === utilizador.TipoUtilizadorTipoUtilizadorId)
    const morada = moradas.find(m => m.MoradaId === utilizador.MoradaMoradaId)
    const contacto = contactos.find(c => c.ContactoId === utilizador.ContactoContactoId)
    const subscricao = subscricoes.filter(s => s.UtilizadorUtilizadorId === utilizador.UtilizadorId)

    return {
      utilizador,
      tipoUtilizador: tipoUtilizador || { TipoUtilizadorId: -1, Descricao: 'Unknown' },
      morada: morada || { MoradaId: -1, Concelho: 'Unknown', Distrito: 'Unknown', CodigoPostalCodigoPostalId: -1 },
      contacto: contacto || { ContactoId: -1, Email: 'Unknown', Telemovel: 'Unknown' },
      subscricoes: subscricao || []
    }
  })
  
  return UtilizadoresInfo
}

export type CreateUtilizadorPayload = {
  Nome: string
  DataNascimento: Date
  NIF: string
  PalavraPasse: string
  TipoUtilizadorId: number
  Morada: {
    Concelho: string
    Distrito: string
    CodigoPostal: {
      Localidade: string
    }
  }
  Contacto: {
    Email: string
    Telemovel: string
  }
}

export const createUtilizador: CreateUtilizador<CreateUtilizadorPayload, Utilizador> = async (
  args,
  context
) => {
  
  const contacto = await context.entities.Contacto.create({
    data: {
      Email: args.Contacto.Email,
      Telemovel: args.Contacto.Telemovel,
    },
  })

  let codigoPostal = await context.entities.CodigoPostal.findFirst({
    where: { Localidade: args.Morada.CodigoPostal.Localidade },
  })

  if (!codigoPostal) {
    codigoPostal = await context.entities.CodigoPostal.create({
      data: { Localidade: args.Morada.CodigoPostal.Localidade },
    })
  }

  const morada = await context.entities.Morada.create({
    data: {
      Concelho: args.Morada.Concelho,
      Distrito: args.Morada.Distrito,
      CodigoPostalCodigoPostalId: codigoPostal.CodigoPostalId,
    },
  })

  const utilizador = await context.entities.Utilizador.create({
    data: {
      Nome: args.Nome,
      DataNascimento: new Date(args.DataNascimento),
      NIF: args.NIF,
      PalavraPasse: args.PalavraPasse,
      MoradaMoradaId: morada.MoradaId,
      ContactoContactoId: contacto.ContactoId,
      TipoUtilizadorTipoUtilizadorId: args.TipoUtilizadorId
    }
  })

  return utilizador
}
