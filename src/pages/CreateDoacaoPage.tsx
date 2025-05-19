import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAction, useQuery } from 'wasp/client/operations'
import { createDoacaoCompleta, getUtilizadoresInfoByTipo } from 'wasp/client/operations'

const CreateDoacaoPage = () => {
  const navigate = useNavigate()
  const createDoacaoAction = useAction(createDoacaoCompleta)

  const [valorDoacao, setValorDoacao] = useState('')
  const [nota, setNota] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<{ id: number, nome: string } | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [error, setError] = useState('')
  const wrapperRef = useRef(null)

  const { data: utilizadoresData, isLoading } = useQuery(getUtilizadoresInfoByTipo, {
    page: 1,
    pageSize: 5,
    searchTerm: searchTerm.trim(),
    filters: { estadoSubscricao: 'todas' }
  })

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !(wrapperRef.current as any).contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!valorDoacao || isNaN(Number(valorDoacao)) || Number(valorDoacao) <= 0) {
      setError('Por favor, introduza um valor válido para a doação.')
      return
    }

    if (!selectedUser) {
      setError('Por favor, selecione um utilizador.')
      return
    }

    try {
      await createDoacaoAction({
        ValorDoacao: Number(valorDoacao),
        Nota: nota,
        UtilizadorId: selectedUser.id,
        MetodoPagamentoId: 1,
        NIFPagamento: ''
      })
      navigate('/historico-doacoes')
    } catch (err) {
      setError('Erro ao criar doação. Por favor, tente novamente.')
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-xl">
        <h2 className="text-3xl font-bold text-black mb-6 text-center">Criar Doação</h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="valor" className="block text-sm font-medium text-gray-700">
              Valor da Doação (€)
            </label>
            <input
              id="valor"
              type="number"
              step="0.01"
              min="0"
              value={valorDoacao}
              onChange={(e) => setValorDoacao(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="nota" className="block text-sm font-medium text-gray-700">
              Nota (opcional)
            </label>
            <textarea
              id="nota"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div ref={wrapperRef}>
            <label htmlFor="utilizador" className="block text-sm font-medium text-gray-700">
              Selecionar Utilizador
            </label>
            <input
              type="text"
              id="utilizador"
              placeholder="Escreva o nome ou NIF..."
              value={selectedUser ? `${selectedUser.nome}` : searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setSelectedUser(null)
                setShowDropdown(true)
              }}
              onFocus={() => setShowDropdown(true)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {showDropdown && (utilizadoresData?.data ?? []).length > 0 && (
              <ul className="border border-gray-300 rounded-md mt-1 max-h-48 overflow-auto bg-white shadow-lg z-10 relative">
                {utilizadoresData?.data?.map(({ utilizador }) => (
                  <li
                    key={utilizador.id}
                    onClick={() => {
                      setSelectedUser({ id: utilizador.id, nome: `${utilizador.Nome} (${utilizador.NIF})` })
                      setSearchTerm('')
                      setShowDropdown(false)
                    }}
                    className="px-4 py-2 cursor-pointer hover:bg-blue-100"
                  >
                    <div className="font-medium text-gray-800">Nome: <span className="font-normal">{utilizador.Nome}</span></div>
                    <div className="text-gray-600">NIF: <span className="font-normal">{utilizador.NIF}</span></div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-end space-x-4">
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
              Criar Doação
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateDoacaoPage
