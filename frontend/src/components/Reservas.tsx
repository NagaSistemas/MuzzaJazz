import React from 'react';

const Reservas: React.FC = () => {
  return (
    <section id="reservas" className="py-20 bg-muza-dark">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-playfair font-bold text-muza-gold mb-6 text-center flex items-center justify-center">
          <i className="fas fa-ticket-alt mr-3"></i>RESERVAS & ENTRADA
        </h2>
        <div className="section-divider w-1/2 mx-auto my-6"></div>

        <div className="max-w-3xl mx-auto mt-12 px-4">
          <div className="reservation-card p-8 rounded-lg">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Entrada e Reservas */}
              <div>
                <h3 className="text-xl font-bold text-muza-gold mb-4">Entrada</h3>
                <p className="text-3xl font-bold text-muza-cream mb-2">Preço sob consulta</p>
                <p className="text-muza-cream mb-6">via WhatsApp</p>

                <h3 className="text-xl font-bold text-muza-gold mb-4 mt-8">Reservas</h3>
                <p className="text-muza-cream mb-2">Consulte valores e disponibilidade</p>
                <p className="text-muza-cream italic">WhatsApp: (62) 99838-0208</p>
              </div>

              {/* Botão de Reserva */}
              <div>
                <h3 className="text-xl font-bold text-muza-gold mb-4">Faça sua reserva</h3>
                <p className="text-muza-cream mb-6">
                  Todas as reservas são feitas exclusivamente via WhatsApp. Clique no botão abaixo para iniciar sua reserva.
                </p>
                <a
                  href="https://wa.me/+5562998380208"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition duration-300"
                >
                  <i className="fab fa-whatsapp text-xl mr-2"></i> RESERVA VIA WHATSAPP
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reservas;
