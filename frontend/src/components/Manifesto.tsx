import React from 'react';
import { FaQuoteLeft } from 'react-icons/fa';

const Manifesto: React.FC = () => {
  return (
    <section id="manifesto" className="py-20 bg-muza-wood bg-opacity-10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center px-4">
          {/* Título */}
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-muza-gold mb-6 flex items-center justify-center">
            <FaQuoteLeft className="mr-3" /> MANIFESTO
          </h2>
          <div className="section-divider w-1/2 mx-auto my-6"></div>

          {/* Conteúdo */}
          <div className="relative mt-12">
            <div className="p-8 md:p-12 bg-muza-wood bg-opacity-20 rounded-lg">
              <p className="text-lg text-muza-cream mb-6 italic">
                "A inspiração transforma."
              </p>
              <p className="text-lg text-muza-cream mb-6">
                Ela nos faz parar para admirar a beleza da vida e da música.
              </p>
              <p className="text-xl text-muza-gold font-bold">
                Viva. Ame. Sinta o Jazz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Manifesto;
