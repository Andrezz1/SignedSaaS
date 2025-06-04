import React from 'react'
import ClientLayout from '../layout/ClientLayout'
import ClientSubscriptions from '../components/clientSubscriptions'

const ClientSubscriptionsPage: React.FC = () => {
  return (
    <ClientLayout>
      <ClientSubscriptions />
    </ClientLayout>
  )
}

export default ClientSubscriptionsPage