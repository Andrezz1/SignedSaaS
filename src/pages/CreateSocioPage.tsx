import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAction } from 'wasp/client/operations'
import { createUtilizador } from 'wasp/client/operations'
import MyPhoneInput from '../components/phoneInput'

const CreateSocioPage = () => {
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [nif, setNif] = useState('')
  const [email, setEmail] = useState('')
  const [countryCode, setCountryCode] = useState('+351')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [concelho, setConcelho] = useState('')
  const [distrito, setDistrito] = useState('')
  const [localidade, setLocalidade] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const createUserAction = useAction(createUtilizador)
  const [imagem, setImagem] = useState<string>('')

  const validateFields = () => {
    if (!nome || !dataNascimento || !nif || !email || !phoneNumber || !concelho || !distrito || !localidade) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios.')
      return false
    }
    if (!email.includes('@') || !email.includes('.')) {
      setErrorMsg('Email inválido.')
      return false
    }
    if (!/^\d{9}$/.test(nif)) {
      setErrorMsg('NIF deve ter exatamente 9 dígitos.')
      return false
    }
    if (!phoneNumber || !countryCode.startsWith('+')) {
      setErrorMsg('Telemóvel inválido.')
      return false
    }
    if (!/^\d{4}-\d{3}$/.test(localidade)) {
      setErrorMsg('Código Postal deve estar no formato XXXX-XXX.')
      return false
    }
    setErrorMsg('')
    return true
  }

  const handleCreate = async () => {
    if (!validateFields()) return
    const formattedTelemovel = `${countryCode} ${phoneNumber}`
    const payload = {
      Nome: nome,
      DataNascimento: new Date(dataNascimento),
      NIF: nif,
      Imagem: imagem,
      TipoUtilizadorId: 3,
      Morada: {
        Concelho: concelho,
        Distrito: distrito,
        CodigoPostal: { Localidade: localidade }
      },
      Contacto: {
        Email: email,
        Telemovel: formattedTelemovel
      }
    }
    try {
      await createUserAction(payload)
      navigate('/socios')
    } catch (error) {
      console.error('Erro ao criar o utilizador:', error)
      setErrorMsg('Erro ao criar o utilizador. Por favor, tente novamente.')
    }
  }

  const handleLocalidadeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 4) {
      value = value.slice(0, 4) + '-' + value.slice(4, 7)
    }
    setLocalidade(value)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
  
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      const base64 = result.includes(',') ? result.split(',')[1] : result
      setImagem(base64)
    }
    reader.readAsDataURL(file)
  }  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white w-full max-w-4xl p-10 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Criar Sócio</h2>
        {errorMsg && <p className="mb-4 text-red-500 text-sm">{errorMsg}</p>}
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="block w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
            <input
              type="date"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
              className="block w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIF</label>
            <input
              type="text"
              value={nif}
              onChange={(e) => setNif(e.target.value.replace(/\D/g, ''))}
              maxLength={9}
              placeholder="9 dígitos"
              className="block w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Utilizador</label>
            <input
              type="text"
              value="Sócio"
              disabled
              className="block w-full p-2 border rounded bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telemóvel</label>
            <MyPhoneInput
              countryCode={countryCode}
              phoneNumber={phoneNumber}
              onCountryCodeChange={setCountryCode}
              onPhoneNumberChange={setPhoneNumber}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Concelho</label>
            <input
              type="text"
              value={concelho}
              onChange={(e) => setConcelho(e.target.value)}
              className="block w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Distrito</label>
            <input
              type="text"
              value={distrito}
              onChange={(e) => setDistrito(e.target.value)}
              className="block w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
            <input
              type="text"
              value={localidade}
              onChange={handleLocalidadeChange}
              maxLength={8}
              className="block w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imagem</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-8 flex justify-end gap-4">
          <button onClick={() => navigate(-1)} className="px-4 py-2 w-28 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors">Voltar</button>
          <button onClick={handleCreate} className="px-4 py-2 w-28 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors">Criar</button>
        </div>
      </div>
    </div>
  )
}

export default CreateSocioPage
