import React from 'react';
import { FaSeedling } from 'react-icons/fa';

const Origem: React.FC = () => {
  return (
    <section id="origem" className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center px-4">
          {/* Título */}
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-muza-gold mb-6 flex items-center justify-center">
            <FaSeedling className="mr-3" /> ORIGEM E ESSÊNCIA
          </h2>
          <div className="section-divider w-1/2 mx-auto my-6"></div>

          {/* Conteúdo */}
          <div className="relative mt-12">
            {/* Bordas decorativas */}
            <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-muza-gold border-opacity-50"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-muza-gold border-opacity-50"></div>

            {/* Caixa de texto */}
            <div className="p-8 md:p-12 bg-muza-wood bg-opacity-20 rounded-lg">
              <p className="text-lg text-muza-cream mb-6 italic">
                "Tudo começa com inspiração."
              </p>
              <p className="text-lg text-muza-cream mb-6">
                <span className="text-muza-gold font-bold">
                  A música transforma e eleva.
                </span>
              </p>
              <p className="text-xl text-muza-gold font-bold">Sinta o Jazz.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Origem;
