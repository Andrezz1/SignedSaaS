import React from 'react'
import ClientLayout from '../layout/ClientLayout'
import ClientDonations from '../components/clientDonations'

const ClientDonationsPage: React.FC = () => {
  return (
    <ClientLayout>
      <ClientDonations />
    </ClientLayout>
  )
}

export default ClientDonationsPage
