import React from 'react';

const Footer: React.FC = () => {
  return (
    <>
      <footer className="py-12 bg-muza-wood bg-opacity-30 border-t border-muza-gold border-opacity-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0">
                <div className="flex items-center">
                  <img src="/logo.jpg" alt="Muzza Jazz Logo" className="w-10 h-10 rounded-full object-cover mr-3" />
                  <h2 className="text-xl font-playfair font-bold text-muza-gold">MUZZA JAZZ</h2>
                </div>
                <p className="text-muza-cream mt-2 italic">Para quem ama Jazz. Para quem vai amar.</p>
              </div>

              <div className="flex space-x-6">
                <a href="#" className="text-muza-cream hover:text-muza-gold transition duration-300">
                  <i className="fab fa-instagram text-2xl"></i>
                </a>
                <a href="#" className="text-muza-cream hover:text-muza-gold transition duration-300">
                  <i className="fab fa-facebook text-2xl"></i>
                </a>
                <a href="#" className="text-muza-cream hover:text-muza-gold transition duration-300">
                  <i className="fab fa-whatsapp text-2xl"></i>
                </a>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-muza-gold border-opacity-20 text-center">
              <p className="text-muza-cream">
                &copy; 2023 Muzza Jazz Club. Todos os direitos reservados.
              </p>
              <p className="text-muza-cream mt-2 italic">
                Lá reunem artistas renomados do mundo inteiro
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating reservation button */}
      <div className="fixed bottom-6 right-6 z-40">
        <a
          href="#reservas"
          className="w-16 h-16 rounded-full bg-muza-gold flex items-center justify-center shadow-lg hover:scale-110 transition duration-300 group relative"
        >
          <i className="fas fa-ticket-alt text-muza-dark text-2xl"></i>
          <span className="absolute -left-2 transform -translate-x-full bg-muza-gold text-muza-dark font-bold py-1 px-3 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md">
            Reservas
          </span>
        </a>
      </div>
    </>
  );
};

export default Footer;
