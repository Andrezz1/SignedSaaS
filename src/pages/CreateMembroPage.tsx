import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAction } from 'wasp/client/operations'
import { createUtilizador } from 'wasp/client/operations'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import ProfilePhotoInput from '../components/profilePhotoInput'

const CreateMembroPage = () => {
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
      navigate('/membros')
    } catch {
      setErrorMsg('Erro ao criar o utilizador. Por favor, tente novamente.')
    }
  }

  const handleLocalidadeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '')
    if (v.length > 4) v = v.slice(0,4) + '-' + v.slice(4,7)
    setLocalidade(v)
  }

  const handleImageSelect = (base64: string) => {
    setImagem(base64)
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nº Telemóvel
            </label>
            <PhoneInput
              country={'pt'}
              value={`${countryCode}${phoneNumber}`}
              onChange={(value, data) => {
                const dialCode = 'dialCode' in data ? data.dialCode : '';
                const nationalNumber = value.slice(dialCode.length).replace(/\D/g, '');
                setCountryCode(`+${dialCode}`);
                setPhoneNumber(nationalNumber);
              }}
              inputProps={{
                name: 'telemovel',
                required: true,
                className: 'block w-full p-3 pl-14 border border-gray-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200',
              }}
              containerClass="w-full"
              inputClass="!w-full !p-3 !border !border-gray-200 !bg-white !rounded-lg focus:!outline-none focus:!ring-2 focus:!ring-blue-200"
              buttonClass="!border-r !border-gray-300 !bg-white !rounded-l-lg"
              dropdownClass="!border-gray-300 !rounded-lg !shadow-lg"
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

          {/* Componente ProfilePhotoInput substituindo o file input */}
          <ProfilePhotoInput 
            onFileSelect={handleImageSelect}
            label="Imagem (Opcional)"
          />
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

export default CreateMembroPage