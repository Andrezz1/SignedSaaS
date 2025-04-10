import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { logout, useAuth } from "wasp/client/auth";
import "../index.css";

interface HeaderProps {
  navItems: { name: string; path: string }[];
}

function Header({ navItems }: HeaderProps) {
  const location = useLocation();
  const { data: user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header>
      {/* NAV superior */}
      <nav className="bg-gray-100/40 border-b border-gray-200 dark:bg-gray-900 w-full">
        <div className="flex items-center justify-between px-4 py-4 w-full">
          <div className="flex items-center space-x-2">
            {/* Botão hamburguer (exibido sempre em telas pequenas) */}
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

            {/* Menu horizontal (visível em telas md ou maiores) */}
            <ul className="hidden md:flex md:space-x-6">
              {navItems.map((item, index) => (
                <li key={index}>
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

          {/* Informações do usuário e logout (visíveis em telas md ou maiores) */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {/* Username à esquerda, sem quebra */}
              <p className="text-gray-900 dark:text-white font-medium whitespace-nowrap">
                {user?.Username || "Guest"}
              </p>
              {/* Ícone de usuário */}
              <div className="flex items-center justify-center w-12 h-12 bg-gray-800 text-white font-bold rounded-full transition duration-200 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600">
                <span className="sr-only">Ícone de utilizador</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm0 14c4.418 0 8 3.582 8 8H4c0-4.418 3.582-8 8-8Z" />
                </svg>
              </div>
            </div>
            {/* Botão de logout (visível em telas md ou maiores) */}
            <button
              onClick={logout}
              className="hidden md:flex items-center justify-center w-12 h-12 bg-red-400 hover:bg-red-600 text-white font-bold rounded-full transition duration-200 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
              aria-label="Terminar sessão"
            >
              <svg
                className="w-6 h-6"
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
      </nav>

      {/* Overlay para o side drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Side Drawer (menu lateral) */}
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

        {/* Links de navegação */}
        <ul className="p-4 space-y-4">
          {navItems.map((item, index) => (
            <li key={index}>
              <a
                href={item.path}
                className={`block text-lg font-semibold ${
                  location.pathname === item.path
                    ? "text-blue-600"
                    : "text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </a>
            </li>
          ))}
        </ul>

        {/* Área inferior da side bar (usuário e logout) */}
        <div className="mt-auto px-4 py-4 border-t border-gray-300 dark:border-gray-700 space-y-4">
          {/* Bloco de usuário: ícone no topo e username abaixo, alinhados à esquerda */}
          <div className="flex flex-col items-start">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-800 text-white font-bold rounded-full">
              <span className="sr-only">Ícone de utilizador</span>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm0 14c4.418 0 8 3.582 8 8H4c0-4.418 3.582-8 8-8Z" />
              </svg>
            </div>
            <p className="mt-2 text-sm text-gray-900 dark:text-white font-medium whitespace-nowrap">
              {user?.Username || "Guest"}
            </p>
          </div>

          {/* Botão de logout na side bar (apenas o ícone) */}
          <button
            onClick={() => {
              logout();
              setMobileMenuOpen(false);
            }}
            className="flex items-center justify-start space-x-2 text-red-400 hover:text-red-600 focus:outline-none"
            aria-label="Terminar sessão"
          >
            <svg
              className="w-6 h-6"
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
}

export default Header;
