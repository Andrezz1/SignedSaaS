import { useState } from "react";
import "../index.css";

interface HeaderProps {
  navItems: { name: string; path: string }[];
}

function Header({ navItems }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 dark:bg-gray-900 w-full">
      <div className="flex items-center justify-between px-4 py-4 w-full">
        
        {/* Links TOTALMENTE alinhados à esquerda */}
        <div className="flex items-center space-x-6">
          <ul className="flex space-x-6 md:space-x-18">
            {navItems.map((item, index) => (
              <li key={index}>
                <a
                  href="#"
                  className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 text-lg md:text-xl font-bold"
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Ícone de utilizador TOTALMENTE alinhado à direita */}
        <div className="flex items-center ml-auto">
          <button
            type="button"
            className="flex items-center justify-center w-12 h-12 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-full transition duration-200 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span className="sr-only">Abrir menu do utilizador</span>
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm0 14c4.418 0 8 3.582 8 8H4c0-4.418 3.582-8 8-8Z"></path>
            </svg>
          </button>

          {/* Dropdown do utilizador */}
          {dropdownOpen && (
            <div className="absolute top-12 right-4 z-50 bg-white dark:bg-gray-700 rounded-lg shadow-lg w-48">
              <div className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                <p className="font-medium">Bonnie Green</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">name@flowbite.com</p>
              </div>
              <ul className="py-2">
                <li>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200">
                    Configurações
                  </a>
                </li>
                <li>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200">
                    Sair
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Header;
