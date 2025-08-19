import React, { useEffect, useState } from 'react';
import { FaMusic, FaCompactDisc, FaStar, FaChevronDown } from 'react-icons/fa';

const Hero: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      className="hero min-h-screen flex items-center relative overflow-hidden bg-center bg-cover"
      style={{ backgroundImage: "url('/images/logo-1.jpg')" }}
    >
      {/* Overlay (pode usar para animação de fade) */}
      <div className="absolute inset-0 bg-black bg-opacity-0 transition-all duration-500"></div>

      {/* Ícones animados */}
      <div className="absolute top-1/4 right-10 animate-sway">
        <FaMusic className="text-muza-gold text-6xl opacity-20" />
      </div>
      <div className="absolute bottom-1/3 left-10 animate-spin">
        <FaCompactDisc className="text-muza-gold text-6xl opacity-20" />
      </div>

      {/* Conteúdo central */}
      <div className="container mx-auto px-4 py-20 text-center relative z-10">
        <div
          className={`max-w-3xl mx-auto px-4 transition-opacity transition-transform ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
        >
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/images/logo.jpg"
              alt="Muzza Jazz Logo"
              className="w-24 h-24 rounded-full object-cover border-2 border-muza-gold"
            />
          </div>

          {/* Estrelas */}
          <div className="mb-6 flex justify-center space-x-2">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className="text-muza-gold text-xl md:text-2xl" />
            ))}
          </div>

          {/* Títulos e textos */}
          <h1 className="text-5xl md:text-7xl font-playfair font-bold text-muza-cream mb-6 text-shadow">
            MUZZA JAZZ CLUBE
          </h1>
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-muza-gold mb-4">
            Jazz da Floresta
          </h2>
          <p className="text-xl md:text-2xl font-raleway text-muza-gold mb-8 italic">
            Para quem ama Jazz. Para quem vai amar
          </p>
          <div className="mb-10">
            <p className="text-2xl md:text-3xl font-bold text-muza-gold">
              "Aprecie a vida" é nosso único pré-requisito
            </p>
          </div>

          {/* Botão de reserva */}
          <a
            href="https://wa.me/+5562998380208"
            className="inline-block bg-muza-gold text-muza-dark font-bold py-3 px-8 rounded-full hover:bg-opacity-90 transition duration-300 transform hover:scale-105"
          >
            FAÇA SUA RESERVA
          </a>
        </div>

        {/* Scroll Down */}
        <div className="scroll-down absolute bottom-8 left-1/2 -translate-x-1/2 text-muza-gold text-2xl animate-bounce">
          <FaChevronDown />
        </div>
      </div>
    </section>
  );
};

export default Hero;
