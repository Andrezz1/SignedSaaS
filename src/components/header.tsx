import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { useLocation } from "react-router-dom";
import { logout, useAuth } from "wasp/client/auth";
import { useQuery, getUtilizadorInfoById } from "wasp/client/operations";
import "../index.css";

interface HeaderProps {
  navItems: { name: string; path: string }[];
}

const Header: React.FC<HeaderProps> = ({ navItems }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: authUser } = useAuth();
  const userId = authUser?.id ?? "";
  const { data: profileData } = useQuery(getUtilizadorInfoById, { id: Number(userId) });
  const profileImageName =
    profileData && profileData.length > 0
      ? profileData[0].utilizador.Imagem
      : "";
  const profileImageUrl = profileImageName
    ? `/uploads/${profileImageName}`
    : null;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  return (
    <header>
      {/* NAV superior */}
      <nav className="bg-gray-100/40 border-b border-gray-200 dark:bg-gray-900 w-full">
        <div className="flex items-center justify-between px-4 py-4 w-full">
          <div className="flex items-center space-x-2">
            {/* Botão hamburguer */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden focus:outline-none p-2"
              aria-label="Abrir menu lateral"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8h16M4 16h16"
                />
              </svg>
            </button>

            {/* Menu horizontal */}
            <ul className="hidden md:flex md:space-x-6">
              {navItems.map((item, idx) => (
                <li key={idx}>
                  <a
                    href={item.path}
                    className={`text-lg md:text-xl font-bold ${
                      location.pathname === item.path
                        ? "text-blue-600"
                        : "text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                    }`}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Desktop: username + perfil com dropdown */}
          <div className="hidden md:flex items-center">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(o => !o)}
                className="flex items-center space-x-2 focus:outline-none"
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >
                <span className="text-lg font-medium text-gray-900 dark:text-white whitespace-nowrap">
                  {authUser?.Username || "Guest"}
                </span>
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt="Foto de perfil"
                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-300"
                  />
                ) : (
                  <div className="rounded-full w-12 h-12 border-2 border-gray-300 flex items-center justify-center bg-gray-200 text-gray-500">
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm0 14c4.418 0 8 3.582 8 8H4c0-4.418 3.582-8 8-8Z" />
                    </svg>
                  </div>
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded shadow-lg z-50">
                  <button
                    onClick={() => {
                      navigate('/conta');
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Minha Conta
                  </button>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-between px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <span>Terminar Sessão</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 9V5.25a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 5.25v13.5A2.25 2.25 0 006.75 21h6.75a2.25 2.25 0 002.25-2.25V15m-3-3h8.25m0 0-3-3m3 3-3 3"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay para side drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Side Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-100 dark:bg-gray-900 z-50 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col`}
      >
        {/* Cabeçalho do Drawer */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-300 dark:border-gray-700">
          <span className="text-xl font-bold dark:text-white">Menu</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="focus:outline-none p-2"
            aria-label="Fechar menu lateral"
          >
            <svg
              className="w-6 h-6 text-gray-900 dark:text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Links */}
        <ul className="p-4 space-y-4">
          {navItems.map((item, idx) => (
            <li key={idx}>
              <a
                href={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block text-lg font-semibold ${
                  location.pathname === item.path
                    ? "text-blue-600"
                    : "text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                }`}
              >
                {item.name}
              </a>
            </li>
          ))}
        </ul>

        {/* Rodapé do Drawer */}
        <div className="mt-auto px-4 py-4 border-t border-gray-300 dark:border-gray-700 space-y-4">
          <div className="flex flex-col items-start space-y-2">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt="Foto de perfil"
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
              />
            ) : (
              <div className="rounded-full w-12 h-12 border-2 border-gray-300 flex items-center justify-center bg-gray-200 text-gray-500">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm0 14c4.418 0 8 3.582 8 8H4c0-4.418 3.582-8 8-8Z" />
                </svg>
              </div>
            )}
            <p className="text-sm text-gray-900 dark:text-white font-medium whitespace-nowrap">
              {authUser?.Username || "Guest"}
            </p>
          </div>
          <button
            onClick={() => {
              logout();
              setMobileMenuOpen(false);
            }}
            className="flex items-center justify-start space-x-2 text-red-600 hover:text-red-300 focus:outline-none"
            aria-label="Terminar sessão"
          >
            <span>Terminar Sessão</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 5.25v13.5A2.25 2.25 0 006.75 21h6.75a2.25 2.25 0 002.25-2.25V15m-3-3h8.25m0 0-3-3m3 3-3 3"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
