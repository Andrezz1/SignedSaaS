import { ReactNode, FC } from 'react';
import ClientHeader from '../components/clientHeader';
import { ClientUserProvider } from '../components/clientUserContext';

interface Props {
  children?: ReactNode;
}

const ClientLayout: FC<Props> = ({ children }) => {
  const navItems = [
    { name: 'Minhas Subscrições', path: '/client-subscriptions' },
    { name: 'Minhas Doações', path: '/client-donations' },
    { name: 'Conta', path: '/client-edit-profile' },
  ];

  return (
    <ClientUserProvider>
      <div className="bg-white text-gray-900 min-h-screen flex flex-col">
        <ClientHeader navItems={navItems} />
        <main className="flex-1 px-4 py-6 w-full">
          {children}
        </main>
      </div>
    </ClientUserProvider>
  );
};

export default ClientLayout;
