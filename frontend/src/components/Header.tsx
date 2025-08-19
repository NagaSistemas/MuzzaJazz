import React, { useState } from 'react';
import { FaBars } from 'react-icons/fa'; // ícone do menu (FontAwesome React)

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const menuItems = [
    { label: 'Apresentação', href: '#apresentacao' },
    { label: 'Essência', href: '#essencia' },
    { label: 'Origem', href: '#origem' },
    { label: 'Manifesto', href: '#manifesto' },
    { label: 'Gastronomia', href: '#gastronomia' },
    { label: 'Ambiente', href: '#ambiente' },
    { label: 'Localização', href: '#localizacao' },
    { label: 'Reservas', href: '#reservas' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-muza-dark bg-opacity-90 backdrop-blur-sm border-b border-muza-gold">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <img
            src="/images/logo.jpg"
            alt="Muzza Jazz Logo"
            className="w-12 h-12 rounded-full object-cover mr-3"
          />
          <h1 className="text-2xl font-playfair font-bold text-muza-gold">
            MUZZA JAZZ CLUBE
          </h1>
        </div>

        {/* Menu Desktop */}
        <nav className="hidden md:block">
          <ul className="flex space-x-8">
            {menuItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-muza-cream hover:text-muza-gold transition duration-300"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Botão Mobile */}
        <button
          className="md:hidden text-muza-gold"
          onClick={toggleMobileMenu}
        >
          <FaBars className="text-2xl" />
        </button>
      </div>

      {/* Menu Mobile */}
      {isMobileMenuOpen && (
        <nav className="md:hidden bg-muza-dark bg-opacity-95 border-t border-muza-gold">
          <ul className="flex flex-col p-4 space-y-3">
            {menuItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-muza-cream hover:text-muza-gold transition duration-300"
                  onClick={() => setIsMobileMenuOpen(false)} // fecha ao clicar
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Header;
