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
        navigate('/teste', { replace: true })
        return
      }
      try {
        const { id } = await validarToken({ Token: token })
        localStorage.setItem('authToken', token)
        localStorage.setItem('userId', String(id))
        navigate('/test', { replace: true })
      } catch {
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
