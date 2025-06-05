import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery, getUtilizadorInfoById } from 'wasp/client/operations';
import { useClientUser } from '../components/clientUserContext';

interface HeaderProps {
  navItems: { name: string; path: string }[];
}

const ClientHeader: React.FC<HeaderProps> = ({ navItems }) => {
  const location = useLocation();
  const { userId, token, loading: userContextLoading } = useClientUser();

  const isQueryReady = !userContextLoading && userId !== null && token !== null;
  const queryArgs = { id: Number(userId), token: String(token) };

  const {
    data: profileData,
    isLoading,
    error,
  } = useQuery(getUtilizadorInfoById, queryArgs, {
    enabled: isQueryReady,
  });

  const profileImageName =
    profileData && profileData.length > 0
      ? profileData[0].utilizador.Imagem
      : '';

  const profileImageUrl = profileImageName
    ? `/uploads/${profileImageName}`
    : null;

  const username =
    profileData && profileData.length > 0
      ? profileData[0].utilizador.Nome
      : 'Cliente';

  if (userContextLoading || isLoading) {
    return (
      <header className="bg-white border-b shadow-sm px-4 py-4 flex justify-between items-center">
        <span className="text-gray-500">A carregar utilizador...</span>
      </header>
    );
  }

  if (error) {
    console.error('[ClientHeader] Erro na query:', error);
    return (
      <header className="bg-white border-b shadow-sm px-4 py-4 flex justify-between items-center">
        <span className="text-red-500">Erro ao carregar utilizador.</span>
      </header>
    );
  }

  return (
    <header className="bg-white border-b shadow-sm px-4 py-4 flex justify-between items-center">
      {/* Navegação à esquerda */}
      <nav className="space-x-6 flex items-center">
        {navItems.map((item, idx) => (
          <Link
            key={idx}
            to={item.path}
            className={`text-base md:text-lg font-semibold ${
              location.pathname === item.path
                ? 'text-orange-600 '
                : 'text-gray-700 hover:text-orange-600'
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Info do utilizador à direita */}
      <div className="flex items-center space-x-3">
        <span className="text-gray-800 font-medium text-sm md:text-base whitespace-nowrap">
          {username}
        </span>
        {profileImageUrl ? (
          <img
            src={profileImageUrl}
            alt="Foto de perfil"
            className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
          />
        ) : (
          <div className="w-10 h-10 rounded-full border-2 border-gray-300 bg-gray-200 flex items-center justify-center text-gray-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm0 14c4.418 0 8 3.582 8 8H4c0-4.418 3.582-8 8-8Z" />
            </svg>
          </div>
        )}
      </div>
    </header>
  );
};

export default ClientHeader;
