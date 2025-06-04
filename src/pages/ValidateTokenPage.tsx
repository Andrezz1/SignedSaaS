import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { validarToken } from 'wasp/client/operations'
import { useClientUser } from '../components/clientUserContext'

const ValidateTokenPage = () => {
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { search } = useLocation()
  const { setUserData } = useClientUser()

  useEffect(() => {
    (async () => {
      const token = new URLSearchParams(search).get('token')
      if (!token) {
        navigate('/teste', { replace: true })
        return
      }

      try {
        const { id } = await validarToken({ Token: token })
        setUserData(id, token) 
        navigate('/test', { replace: true })
      } catch {
        alert('Token inválido ou expirado.')
        navigate('/client-view', { replace: true })
      } finally {
        setLoading(false)
      }
    })()
  }, [search, navigate, setUserData])

  if (loading) return <div>Validando token…</div>
  return null
}

export default ValidateTokenPage
