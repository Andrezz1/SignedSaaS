import React from "react";
import { useLocation } from "react-router-dom";
import { logout, useAuth} from "wasp/client/auth";
import "../index.css";

interface HeaderProps {
  navItems: { name: string; path: string }[];
}

function Header({ navItems }: HeaderProps) {
  const location = useLocation();
  const { data:user } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 dark:bg-gray-900 w-full">
      <div className="flex items-center justify-between px-4 py-4 w-full">
        <div className="flex items-center space-x-6">
          <ul className="flex space-x-6 md:space-x-18">
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
        <div className="flex items-center ml-auto space-x-4">
          <p className="text-gray-900 dark:text-white font-medium">
            {user?.Username || "Guest"}
          </p>
          <div className="flex items-center justify-center w-12 h-12 bg-gray-800 text-white font-bold rounded-full transition duration-200 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600">
            <span className="sr-only">Ícone de utilizador</span>
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm0 14c4.418 0 8 3.582 8 8H4c0-4.418 3.582-8 8-8Z" />
            </svg>
          </div>
          <button
            onClick={logout}
            className="flex items-center justify-center w-12 h-12 bg-red-400 hover:bg-red-600 text-white font-bold rounded-full transition duration-200 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
          >
            <span className="sr-only">Terminar sessão</span>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
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
  );
}

export default Header;
