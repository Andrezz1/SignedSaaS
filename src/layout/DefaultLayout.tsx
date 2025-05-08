import { type AuthUser } from 'wasp/auth';
import { ReactNode, FC } from 'react';
import Header from '../components/header';

interface Props {
  user: AuthUser;
  children?: ReactNode;
}

const DefaultLayout: FC<Props> = ({ children, user }) => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Membros', path: '/membros' },
    { name: 'Doações', path: '/historico-doacoes' },
    { name: 'Planos', path: '/planos' },
  ];

  return (
    <div className='dark:bg-boxdark-2 dark:text-bodydark'>
      {/* <!-- ===== Page Wrapper Start ===== --> */}
      <div className='flex flex-col min-h-screen'>
        {/* <!-- ===== Header Start ===== --> */}
        <Header navItems={navItems} />
        {/* <!-- ===== Header End ===== --> */}

        {/* <!-- ===== Main Content Start ===== --> */}
        <main className='flex-1'>
          <div className='mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10'>
            {children}
          </div>
        </main>
        {/* <!-- ===== Main Content End ===== --> */}
      </div>
      {/* <!-- ===== Page Wrapper End ===== --> */}
    </div>
  );
};

export default DefaultLayout;
