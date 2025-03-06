import { Contacto, Morada, TipoUtilizador, Utilizador } from 'wasp/entities'
import { type GetUtilizadores, type GetUtilizadoresInfo } from 'wasp/server/operations'
import { getTipoUtilizador } from './tipoUtilizadorService'
import { getMorada } from './moradaService'
import { getContacto } from './contactoService'

export const getUtilizadores: GetUtilizadores<void, Utilizador[]> = async (args, context) => {
  return context.entities.Utilizador.findMany({
    orderBy: { UtilizadorId: 'asc' },
  })
}

export const getUtilizadoresInfo: GetUtilizadoresInfo<void, Array<{ utilizador: Utilizador, tipoUtilizador: TipoUtilizador, morada: Morada, contacto: Contacto}>> = async (args, context) => {
  const utilizadores = await getUtilizadores(args, context)
  const tipoUtilizadores = await getTipoUtilizador(args, context)
  const moradas = await getMorada(args, context)
  const contactos = await getContacto(args, context)

  const UtilizadoresInfo = utilizadores.map(utilizador => {
    const tipoUtilizador = tipoUtilizadores.find(tu => tu.TipoUtilizadorId === utilizador.TipoUtilizadorTipoUtilizadorId)
    const morada = moradas.find(m => m.MoradaId === utilizador.MoradaMoradaId)
    const contacto = contactos.find(c => c.ContactoId === utilizador.ContactoContactoId)
    return {
      utilizador,
      tipoUtilizador: tipoUtilizador || { TipoUtilizadorId: -1, Descricao: 'Unknown' },
      morada: morada || { MoradaId: -1, Concelho: 'Unknown', Distrito: 'Unknown', CodigoPostalCodigoPostalId: -1 },
      contacto: contacto || { ContactoId: -1, Email: 'Unknown', Telemovel: 'Unknown' },
    }
  })
  
  return UtilizadoresInfo
}
