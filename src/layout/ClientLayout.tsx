import { ReactNode, FC } from 'react';
import ClientHeader from '../components/clientHeader';
import { ClientUserProvider } from '../components/clientUserContext';

interface Props {
  children?: ReactNode;
}

const ClientLayout: FC<Props> = ({ children }) => {
  const navItems = [
    { name: 'Dashboard', path: '/client-dashboard' },
    { name: 'Minhas Subscrições', path: '/client-subscriptions' },
    { name: 'Conta', path: '/client-edit-profile' },
  ];

  return (
    <ClientUserProvider>
      <div className="bg-white text-gray-900 min-h-screen flex flex-col">
        <ClientHeader navItems={navItems} />
        <main className="flex-1 px-4 py-6 max-w-5xl mx-auto">
          {children}
        </main>
      </div>
    </ClientUserProvider>
  );
};

export default ClientLayout;
