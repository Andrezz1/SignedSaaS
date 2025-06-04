import React from 'react'
import ClientLayout from '../layout/ClientLayout'
import ClientEditProfile from '../components/clientEditProfile'

const ClientEditProfilePage: React.FC = () => {
  return (
    <ClientLayout>
      <ClientEditProfile />
    </ClientLayout>
  )
}

export default ClientEditProfilePage
