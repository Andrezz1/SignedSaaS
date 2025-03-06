import { Morada, CodigoPostal } from 'wasp/entities'
import { type GetMorada, type GetMoradaInfo, type CreateMorada } from 'wasp/server/operations'
import { getCodigoPostal } from './codigoPostalService'

export const getMorada: GetMorada<void, Morada[]> = async (args, context) => {
  return context.entities.Morada.findMany({
    orderBy: { MoradaId: 'asc' },
  })
}

export const getMoradaInfo: GetMoradaInfo<void, Array<{ morada: Morada, codigoPostal: CodigoPostal}>> = async (args, context) => {
  const moradas = await getMorada(args, context)
  const codigosPostais = await getCodigoPostal(args, context)

  const MoradaInfo = moradas.map(morada => {
    const codigoPostal = codigosPostais.find(cp => cp.CodigoPostalId === morada.CodigoPostalCodigoPostalId)
    return {
      morada,
      codigoPostal: codigoPostal || { CodigoPostalId: -1, Localidade: 'Unknown' },

    }
  })

  return MoradaInfo
}

type CreateMoradaPayLoad = {
  Concelho: string;               
  Distrito: string;                
  CodigoPostal: {                  
    Localidade: string;            
  };
  CodigoPostalCodigoPostalId: number;
};

export const createMorada: CreateMorada<CreateMoradaPayLoad, Morada> = async (args, context) => {

  let codigoPostal = await context.entities.CodigoPostal.findFirst({
    where: { Localidade: args.CodigoPostal.Localidade },
  });

  if (!codigoPostal) {
    codigoPostal = await context.entities.CodigoPostal.create({
      data: { Localidade: args.CodigoPostal.Localidade },
    });
  }

  const morada = await context.entities.Morada.create({
    data: {
      Concelho: args.Concelho,
      Distrito: args.Distrito,
      CodigoPostalCodigoPostalId: codigoPostal.CodigoPostalId,
    },
  });

  return morada;
};
