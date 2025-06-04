import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTipoSubscricao, getDuracao } from 'wasp/client/operations';
import LoadingSpinner from '../layout/LoadingSpinner';

type Duracao = {
  DuracaoId: number;
  Nome: string;
};

const CreatePlanoPage = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [duracoes, setDuracoes] = useState<Duracao[]>([]);
  const [selectedDuracoes, setSelectedDuracoes] = useState<
    { DuracaoId: number; Valor?: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const fetchDuracoes = async () => {
      try {
        const data = await getDuracao();
        setDuracoes(data);
      } catch {
        setErro('Erro ao carregar durações');
      } finally {
        setLoading(false);
      }
    };

    fetchDuracoes();
  }, []);

  const handleCheckboxChange = (duracaoId: number) => {
    setSelectedDuracoes((prev) => {
      const exists = prev.find((d) => d.DuracaoId === duracaoId);
      if (exists) {
        return prev.filter((d) => d.DuracaoId !== duracaoId);
      } else {
        return [...prev, { DuracaoId: duracaoId }];
      }
    });
  };

 const handleValorChange = (duracaoId: number, valor: number) => {
  setSelectedDuracoes((prev) =>
    prev.map((d) =>
      d.DuracaoId === duracaoId ? { ...d, Valor: valor } : d
    )
  );
};


  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const duracoesParaEnviar = selectedDuracoes
    .filter((d) => d.Valor !== undefined)
    .map((d) => ({
      DuracaoId: d.DuracaoId,
      Valor: d.Valor!,
    }));

  try {
    await createTipoSubscricao({
      Nome: nome,
      Descricao: descricao,
      Duracoes: duracoesParaEnviar,
    });

    navigate('/planos');
  } catch (err: any) {
    setErro('Erro ao criar plano: ' + (err.message || ''));
  }
};


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white w-full max-w-4xl p-12 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Criar Novo Plano</h2>

        {erro && <p className="mb-6 text-red-500 text-sm">{erro}</p>}

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-x-8 gap-y-6">
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
              Nome
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="block w-full p-3 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
              Descrição
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
              className="block w-full p-3 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
              Durações
            </label>
            <div className="grid grid-cols-4 gap-4">
              {duracoes.map((duracao) => {
                const isSelected = selectedDuracoes.some(
                  (d) => d.DuracaoId === duracao.DuracaoId
                );
                const currentValor =
                  selectedDuracoes.find((d) => d.DuracaoId === duracao.DuracaoId)
                    ?.Valor ?? '';
                return (
                  <div
                    key={duracao.DuracaoId}
                    onClick={() => handleCheckboxChange(duracao.DuracaoId)}
                    className={`cursor-pointer border rounded-lg p-4 transition-all duration-200 shadow-sm ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-800">
                        {duracao.Nome}
                      </span>
                      <div
                        className={`h-4 w-4 rounded-full border ${
                          isSelected
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-gray-400'
                        }`}
                      />
                    </div>

                    {isSelected && (
                      <div className="mt-2">
                        <label className="block text-xs text-gray-600 mb-1">
                          Valor (€)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            value={currentValor}
                            onChange={(e) =>
                              handleValorChange(duracao.DuracaoId, Number(e.target.value))
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="w-full p-2 pr-8 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 no-spinner"
                          />
                          <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 pointer-events-none">
                            €
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="col-span-2 mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 font-semibold hover:from-gray-400 hover:to-gray-500 transition"
            >
              Voltar
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition"
            >
              Criar Plano
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePlanoPage;
