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
    } catch {
      setErrorMsg('Erro ao criar o utilizador. Por favor, tente novamente.')
    }
  }

  const handleLocalidadeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '')
    if (v.length > 4) v = v.slice(0,4) + '-' + v.slice(4,7)
    setLocalidade(v)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setImagem(result.includes(',') ? result.split(',')[1] : result)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white w-full max-w-4xl p-12 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Criar Sócio</h2>
        {errorMsg && <p className="mb-6 text-red-500 text-sm">{errorMsg}</p>}

        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
              Nome Completo
            </label>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              className="block w-full p-3 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
              Data de Nascimento
            </label>
            <input
              type="date"
              value={dataNascimento}
              onChange={e => setDataNascimento(e.target.value)}
              className="block w-full p-3 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
              NIF
            </label>
            <input
              type="text"
              value={nif}
              onChange={e => setNif(e.target.value.replace(/\D/g, ''))}
              maxLength={9}
              placeholder="9 dígitos"
              className="block w-full p-3 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="block w-full p-3 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
              Tipo de Utilizador
            </label>
            <input
              type="text"
              value="Sócio"
              disabled
              className="block w-full p-3 border border-gray-200 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
              Telemóvel
            </label>
            <MyPhoneInput
              countryCode={countryCode}
              phoneNumber={phoneNumber}
              onCountryCodeChange={setCountryCode}
              onPhoneNumberChange={setPhoneNumber}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
              Concelho
            </label>
            <input
              type="text"
              value={concelho}
              onChange={e => setConcelho(e.target.value)}
              className="block w-full p-3 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
              Distrito
            </label>
            <input
              type="text"
              value={distrito}
              onChange={e => setDistrito(e.target.value)}
              className="block w-full p-3 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
              Código Postal
            </label>
            <input
              type="text"
              value={localidade}
              onChange={handleLocalidadeChange}
              maxLength={8}
              className="block w-full p-3 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* file input agora ocupa 2 colunas */}
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
              Imagem
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full p-3 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>

        <div className="mt-10 flex justify-end gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 font-semibold hover:from-gray-400 hover:to-gray-500 transition"
          >
            Voltar
          </button>
          <button
            onClick={handleCreate}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition"
          >
            Criar
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateSocioPage
