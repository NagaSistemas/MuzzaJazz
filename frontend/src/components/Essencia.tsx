import React from 'react';
import { FaSpa } from 'react-icons/fa';

const Essencia: React.FC = () => {
  return (
    <section id="essencia" className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center px-4">
          {/* Título */}
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-muza-gold mb-6 flex items-center justify-center">
            <FaSpa className="mr-3" /> ESSÊNCIA
          </h2>
          <div className="section-divider w-1/2 mx-auto my-6"></div>

          {/* Conteúdo */}
          <div className="relative mt-12">
            {/* Bordas decorativas */}
            <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-muza-gold border-opacity-50"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-muza-gold border-opacity-50"></div>

            {/* Caixa de texto */}
            <div className="p-8 md:p-12 bg-muza-wood bg-opacity-20 rounded-lg">
              <p className="text-xl text-muza-cream mb-6 italic">
                "A inspiração acende. Faz a alma dançar."
              </p>
              <p className="text-lg text-muza-cream mb-6">
                Nos conecta ao que é belo, livre, vibrante.
              </p>
              <p className="text-xl text-muza-gold font-bold">
                Invocamos a Muzza. E a vida entra no ritmo.
              </p>
              <p className="text-lg text-muza-cream mt-6 italic">
                Para quem ama Jazz. Para quem vai amar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Essencia;
