import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTipoSubscricao, getDuracoes } from 'wasp/client/operations';
import LoadingSpinner from '../layout/LoadingSpinner';

type Duracao = {
  DuracaoId: number;
  Nome: string;
};

const CreatePlano = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [precoBaseMensal, setPrecoBaseMensal] = useState<number | ''>('');
  const [duracoes, setDuracoes] = useState<Duracao[]>([]);
  const [selectedDuracoes, setSelectedDuracoes] = useState<
    { DuracaoId: number; Desconto?: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const fetchDuracoes = async () => {
      try {
        const data = await getDuracoes();
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

  const handleDescontoChange = (duracaoId: number, desconto: number) => {
    setSelectedDuracoes((prev) =>
      prev.map((d) =>
        d.DuracaoId === duracaoId ? { ...d, Desconto: desconto } : d
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createTipoSubscricao({
        Nome: nome,
        Descricao: descricao,
        PrecoBaseMensal: Number(precoBaseMensal),
        Duracoes: selectedDuracoes,
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
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded shadow-md">
      <h1 className="text-xl font-semibold mb-6">Criar Novo Plano</h1>

      {erro && <p className="text-red-500 mb-4">{erro}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Nome</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full mt-1 border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Descrição</label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full mt-1 border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Preço Base Mensal (€)</label>
          <input
            type="number"
            value={precoBaseMensal}
            onChange={(e) => setPrecoBaseMensal(Number(e.target.value))}
            className="w-full mt-1 border rounded px-3 py-2"
            required
            step="0.01"
          />
        </div>

        <div>
          <label className="block font-medium mb-2">Durações</label>
          {duracoes.map((duracao) => {
            const isChecked = selectedDuracoes.some(
              (d) => d.DuracaoId === duracao.DuracaoId
            );
            const currentDesconto =
              selectedDuracoes.find((d) => d.DuracaoId === duracao.DuracaoId)
                ?.Desconto ?? '';

            return (
              <div key={duracao.DuracaoId} className="mb-2">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCheckboxChange(duracao.DuracaoId)}
                  />
                  <span>{duracao.Nome}</span>
                </label>
                {isChecked && (
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.01"
                    placeholder="Desconto (ex: 0.1)"
                    value={currentDesconto}
                    onChange={(e) =>
                      handleDescontoChange(
                        duracao.DuracaoId,
                        Number(e.target.value)
                      )
                    }
                    className="ml-6 mt-1 border rounded px-2 py-1 w-40"
                  />
                )}
              </div>
            );
          })}
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Criar Plano
        </button>
      </form>
    </div>
  );
};

export default CreatePlano;
