import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { validarToken } from 'wasp/client/operations'

const ValidateTokenPage = () => {
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { search } = useLocation()

  useEffect(() => {
    (async () => {
      const token = new URLSearchParams(search).get('token')
      if (!token) {
        console.warn('[ValidateTokenPage] Nenhum token encontrado na URL.')
        navigate('/client-view', { replace: true })
        return
      }

      try {
        const { id } = await validarToken({ Token: token })
        console.log('[ValidateTokenPage] Token válido. ID:', id)
        
        localStorage.setItem('userId', String(id))
        localStorage.setItem('authToken', token)
        console.log('[ValidateTokenPage] Token e ID gravados no localStorage:', token)

        window.location.href = '/client-subscriptions'
      } catch (err) {
        console.error('[ValidateTokenPage] Token inválido ou expirado.', err)
        alert('Token inválido ou expirado.')
        navigate('/client-view', { replace: true })
      } finally {
        setLoading(false)
      }
    })()
  }, [search, navigate])

  if (loading) return <div>Validando token…</div>
  return null
}

export default ValidateTokenPage
