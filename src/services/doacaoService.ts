import { Doacao, Utilizador } from 'wasp/entities'
import { 
  type GetDoacao, 
  type GetDoacaoInfo, 
  type GetDoacaoByUtilizadorId 
} from 'wasp/server/operations'
import { HttpError } from 'wasp/server'

export const getDoacao: GetDoacao<void, Doacao[]> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  return context.entities.Doacao.findMany({
    orderBy: { DoacaoId: 'asc' },
  })
}

/*
export const getDoacaoInfo: GetDoacaoInfo<void, Array<{ 
  doacao: Doacao, 
  utilizador: Utilizador 
}>> = async (_args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  const doacoes = await context.entities.Doacao.findMany({
    include: {
      Utilizador: true,
    }
  })

  const DoacaoInfo = doacoes.map (({ Utilizador, ...doacao }) => ({
    doacao,
    utilizador: Utilizador,
  }))

  return DoacaoInfo
}
*/

export const getDoacaoInfo: GetDoacaoInfo<
  {
    page: number;
    pageSize: number;
    searchTerm?: string;
  },
  {
    data: Array<{
      doacao: {
        DoacaoId: number;
        ValorDoacao: number;
        DataDoacao: Date;
        Nota: string;
      };
      utilizador: {
        Nome: string;
        NIF: string;
        Email: string | null;
      };
    }>;
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }
> = async ({ page, pageSize, searchTerm }, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Não tem permissão');
  }

  const skip = (page - 1) * pageSize;
  const take = pageSize;

  const where: any = {};
  if (searchTerm) {
    where.OR = [
      { Nota: { contains: searchTerm, mode: 'insensitive' } },
      { Utilizador: { Nome: { contains: searchTerm, mode: 'insensitive' } } },
      { Utilizador: { NIF: { contains: searchTerm, mode: 'insensitive' } } },
    ];
  }

  const [doacoes, total] = await Promise.all([
    context.entities.Doacao.findMany({
      where,
      include: {
        Utilizador: {
          include: {
            Contacto: true,
          },
        },
      },
      orderBy: {
        DoacaoId: 'desc',
      },
      skip,
      take,
    }),
    context.entities.Doacao.count({ where }),
  ]);

  const data = doacoes.map(({ Utilizador, ...doacao }) => ({
    doacao: {
      DoacaoId: doacao.DoacaoId,
      ValorDoacao: doacao.ValorDoacao,
      DataDoacao: doacao.DataDoacao,
      Nota: doacao.Nota,
    },
    utilizador: {
      Nome: Utilizador.Nome || '',
      NIF: Utilizador.NIF || '',
      Email: Utilizador.Contacto?.Email || null,
    },
  }));

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
};

export const getDoacaoByUtilizadorId: GetDoacaoByUtilizadorId<Pick<Utilizador, 'id'>, Doacao[]>
= async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, "Não tem permissão")
  }

  if(!args.id) {
    throw new Error("UtilizadorId nao foi encontrado")
  }

  return context.entities.Doacao.findMany({
    where: { UtilizadorId: args.id },
  })
}
