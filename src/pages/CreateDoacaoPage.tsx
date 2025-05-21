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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !(wrapperRef.current as any).contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!valorDoacao || isNaN(Number(valorDoacao)) || Number(valorDoacao) <= 0) {
      setError('Por favor, introduza um valor válido para a doação.')
      return
    }

    if (!selectedUser) {
      setError('Por favor, selecione um utilizador.')
      return
    }

    navigate('/payment-picker', {
      state: {
        tipo: 'doacao',
        valor: Number(valorDoacao),
        nota,
        utilizadorId: selectedUser.id
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white p-10 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Criar Doação</h2>

        {error && <p className="text-red-500 text-center mb-6">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-1">
              Valor da Doação (€)
            </label>
            <input
              id="valor"
              type="text"
              inputMode="decimal"
              value={valorDoacao}
              onChange={(e) => setValorDoacao(e.target.value)}
              placeholder="Ex: 10.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
            />
          </div>

          <div>
            <label htmlFor="nota" className="block text-sm font-medium text-gray-700 mb-1">
              Nota (opcional)
            </label>
            <textarea
              id="nota"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              rows={4}
              placeholder="Ex: Esta doação é para apoio alimentar..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
            />
          </div>

          <div ref={wrapperRef} className="relative">
            <label htmlFor="utilizador" className="block text-sm font-medium text-gray-700 mb-1">
              Selecionar Utilizador
            </label>
            <input
              type="text"
              id="utilizador"
              placeholder="Escreva o nome ou NIF..."
              value={selectedUser ? selectedUser.nome : searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setSelectedUser(null)
                setShowDropdown(true)
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
            />
            {showDropdown && (utilizadoresData?.data ?? []).length > 0 && (
              <ul className="absolute z-50 bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-64 overflow-y-auto w-full">
                {utilizadoresData?.data.map(({ utilizador }) => (
                  <li
                    key={utilizador.id}
                    onClick={() => {
                      setSelectedUser({ id: utilizador.id, nome: `${utilizador.Nome} (${utilizador.NIF})` })
                      setSearchTerm('')
                      setShowDropdown(false)
                    }}
                    className="px-4 py-2 hover:bg-blue-100 cursor-pointer text-sm"
                  >
                    <p className="font-semibold text-gray-800">{utilizador.Nome}</p>
                    <p className="text-gray-600 text-xs">NIF: {utilizador.NIF}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md text-sm font-medium transition"
            >
              Voltar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition"
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
