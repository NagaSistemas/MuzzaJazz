import React from 'react';

const Localizacao: React.FC = () => {
  return (
    <section id="localizacao" className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-playfair font-bold text-muza-gold mb-6 text-center flex items-center justify-center">
          <i className="fas fa-map-marker-alt mr-3"></i>LOCALIZAÇÃO
        </h2>
        <div className="section-divider w-1/2 mx-auto my-6"></div>

        <div className="max-w-5xl mx-auto mt-12 px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Endereço */}
            <div className="location-card p-6 rounded-lg">
              <h3 className="text-xl font-bold text-muza-gold mb-4">Nosso Endereço</h3>
              <p className="text-muza-cream mb-2">
                <i className="fas fa-road text-muza-gold mr-2"></i> Rodovia GO 225, KM 02
              </p>
              <p className="text-muza-cream mb-2">
                <i className="fas fa-map-pin text-muza-gold mr-2"></i> 2 KM do Portal de Pirenópolis
              </p>
              <p className="text-muza-cream mb-6">
                <i className="fas fa-tree text-muza-gold mr-2"></i> IPEC, Goiás
              </p>

              <div className="mt-6 text-center">
                <a
                  href="https://maps.app.goo.gl/hfSYWpn6ngNRAhNfA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-muza-gold text-muza-dark font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition duration-300"
                >
                  <i className="fas fa-map-marked-alt mr-2"></i> Abrir no Maps
                </a>
              </div>
            </div>

            {/* Mapa */}
            <div className="location-card p-4 rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3826.253036102978!2d-48.9448608!3d-16.4666904!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x935ea3e1f5a3f9a9%3A0x1c1c5f5f5f5f5f5f!2sMuza%20Jazz%20Club!5e0!3m2!1sen!2sbr!4v1620000000000!5m2!1sen!2sbr"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '300px' }}
                allowFullScreen
                loading="lazy"
                className="rounded-lg"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Localizacao;
