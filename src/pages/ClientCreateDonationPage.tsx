import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const ClientCreateDonationPage = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const [valorDoacao, setValorDoacao] = useState('')
  const [nota, setNota] = useState('')
  const [error, setError] = useState('')

  const token = new URLSearchParams(location.search).get('token') || localStorage.getItem('authToken') || ''
  const userId = localStorage.getItem('userId') ? Number(localStorage.getItem('userId')) : null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!valorDoacao || isNaN(Number(valorDoacao)) || Number(valorDoacao) <= 0) {
      setError('Por favor, introduza um valor válido para a doação.')
      return
    }

    if (!userId || !token) {
      setError('Utilizador ou token inválido.')
      return
    }

    navigate('/client-payment-picker', {
      state: {
        tipo: 'doacao',
        valor: Number(valorDoacao),
        nota,
        utilizadorId: userId,
        token: token,
        origin: 'cliente'
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white p-10 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Fazer uma Doação</h2>

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

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition"
            >
              Continuar para Pagamento
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ClientCreateDonationPage
