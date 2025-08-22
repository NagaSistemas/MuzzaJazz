import React from 'react';
import { FaGlassCheers, FaUsers, FaWineGlassAlt, FaMusic } from 'react-icons/fa';

const Apresentacao: React.FC = () => {
  const cards = [
    {
      icon: <FaUsers className="text-muza-gold text-4xl mb-4" />,
      title: 'Inclusão',
      description:
        'Todas e todos são bem-vindos. Celebramos a diversidade e a singularidade de cada ser que cruza nossas portas.',
    },
    {
      icon: <FaWineGlassAlt className="text-muza-gold text-4xl mb-4" />,
      title: 'Experiência',
      description:
        'Mais que um clube, uma jornada sensorial. Cada nota, cada sabor, cada momento é cuidadosamente elaborado.',
    },
    {
      icon: <FaMusic className="text-muza-gold text-4xl mb-4" />,
      title: 'Jazz Autêntico',
      description:
        'Do blues ao bebop, do swing ao fusion, honramos todas as expressões dessa arte transformadora.',
    },
  ];

  const carrosselItems = [
    {
      img: '/carrossel-1.jpg',
      text: 'Jazz autêntico em meio à natureza',
    },
    {
      img: '/carrossel-2.jpg',
      text: 'Experiências sensoriais únicas',
    },
    {
      img: '/carrossel-3.jpg',
      text: 'Harmonia entre música e gastronomia',
    },
  ];

  return (
    <section id="apresentacao" className="py-20">
      <div className="container mx-auto px-4">
        {/* Título */}
        <div className="max-w-4xl mx-auto text-center mb-16 px-4">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-muza-gold mb-6 flex items-center justify-center">
            <FaGlassCheers className="mr-3" /> APRESENTAÇÃO
          </h2>
          <div className="section-divider w-1/2 mx-auto my-6"></div>
          <p className="text-lg text-muza-cream mb-8">Jazz & Floresta & Você</p>
          <p className="text-lg text-muza-cream mb-8 italic">
            As musas inspiradoras vêm iluminando a vida de artistas ao longo dos séculos. Agora, ela te presenteia com o melhor do Jazz, em meio à floresta, pronta para inspirar sua vida. Invoque a Muzza – viver pede inspiração.
          </p>

          {/* Carrossel simples */}
          <div className="flex overflow-x-auto space-x-4 scrollbar-hide max-w-3xl mx-auto">
            {carrosselItems.map((item, index) => (
              <div key={index} className="flex-shrink-0 w-80 px-2">
                <img
                  src={item.img}
                  alt={item.text}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
                <p className="text-muza-cream">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {cards.map((card, index) => (
            <div
              key={index}
              className="bg-muza-wood bg-opacity-50 p-8 rounded-lg border border-muza-gold border-opacity-30 hover:shadow-[0_0_15px_rgba(212,175,55,0.5)] transition duration-300"
            >
              <div className="text-center mb-4">
                {card.icon}
                <h3 className="text-xl font-bold text-muza-gold mb-2">{card.title}</h3>
              </div>
              <p className="text-muza-cream text-center">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Apresentacao;
