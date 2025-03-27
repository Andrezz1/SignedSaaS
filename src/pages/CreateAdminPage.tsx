import { Link } from 'react-router-dom'
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
      <br />
      <span>
        I already have an account (<Link to="/login">go to login</Link>).
      </span>
    </div>
  )
}