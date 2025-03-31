import { SignupForm } from 'wasp/client/auth'

export const CreateAdminPage = () => {
  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <SignupForm 
      additionalFields={[
        {
          name: 'TipoUtilizadorId',
          label: 'Tipo Utilizador',
          type: 'input',
          validations: {
            required: 'Address is required',
          },
        },
    ]}/>
    </div>
  )
}