import React from 'react';
import { FaUtensils, FaPizzaSlice, FaWineGlassAlt } from 'react-icons/fa';

interface CardProps {
  image: string;
  title: string;
  description?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ image, title, description, onClick }) => (
  <div
    className="overflow-hidden rounded-lg hover-glow transition duration-300 cursor-pointer"
    onClick={onClick}
  >
    <img
      src={image}
      alt={title}
      className="w-full h-64 object-cover transform hover:scale-105 transition duration-500"
    />
    <p className="text-center text-muza-cream mt-2">{title}</p>
    {description && <p className="text-center text-muza-cream">{description}</p>}
  </div>
);

const Gastronomia: React.FC = () => {
  const openModal = (image: string, title: string) => {
    console.log(`Abrir modal para ${title} (${image})`);
    // Aqui você pode integrar seu modal
  };

  return (
    <section id="gastronomia" className="py-20 bg-muza-dark bg-opacity-90">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-muza-gold mb-6 flex items-center justify-center">
            <FaUtensils className="mr-3" /> JAZZ DA FLORESTA
          </h2>
          <div className="section-divider w-1/2 mx-auto my-6"></div>
          <p className="text-lg text-muza-cream mb-12">
            Nosso prato principal que harmoniza com a essência do nosso jazz
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-12 overflow-hidden rounded-lg hover-glow transition duration-300">
          <img
            src="images/prato-1.jpg"
            alt="Prato Jazz da Floresta"
            className="w-full h-96 object-cover transform hover:scale-105 transition duration-500"
          />
        </div>

        {/* Pizzas Artesanais */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="bg-muza-wood bg-opacity-50 p-8 rounded-lg border border-muza-gold border-opacity-30 hover-glow transition duration-300 mb-8">
            <div className="text-center mb-8">
              <FaPizzaSlice className="text-muza-gold text-4xl mb-4 mx-auto" />
              <h3 className="text-xl font-bold text-muza-gold mb-2">PIZZAS ARTESANAIS</h3>
              <p className="text-muza-cream text-center mb-6">
                Massa artesanal de fermentação lenta, com ingredientes fresquinhos e molho caseiro
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
              {[
                { image: '/nina.jpeg', title: 'Nina Simone' },
                { image: '/leny.jpeg', title: 'Leny Andrade' },
                { image: '/ella.jpeg', title: 'Ella Fitzgerald' },
                { image: '/elis.jpeg', title: 'Elis Regina' },
                { image: '/betty.jpeg', title: 'Betty Davis' },
                { image: '/bessie.jpeg', title: 'Bessie Smith' },
              ].map((item) => (
                <Card
                  key={item.title}
                  image={item.image}
                  title={item.title}
                  onClick={() => openModal(item.image, item.title)}
                />
              ))}
            </div>
          </div>

          {/* Pratos de Entrada */}
          <div className="bg-muza-wood bg-opacity-50 p-8 rounded-lg border border-muza-gold border-opacity-30 hover-glow transition duration-300 mb-8">
            <div className="text-center mb-8">
              <FaUtensils className="text-muza-gold text-4xl mb-4 mx-auto" />
              <h3 className="text-xl font-bold text-muza-gold mb-2">PRATOS DE ENTRADA</h3>
              <p className="text-muza-cream text-center mb-6">
                Deliciosas entradas para começar sua experiência musical
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[
                { image: '/intro.jpeg', title: 'Intro' },
                { image: '/groove.jpeg', title: 'Groove' },
                { image: '/ensaio.jpeg', title: 'Ensaio' },
                { image: '/vamp.jpeg', title: 'Vamp' },
              ].map((item) => (
                <Card
                  key={item.title}
                  image={item.image}
                  title={item.title}
                  onClick={() => openModal(item.image, item.title)}
                />
              ))}
            </div>
          </div>

          {/* Bebidas Selecionadas */}
          <div className="bg-muza-wood bg-opacity-50 p-8 rounded-lg border border-muza-gold border-opacity-30 hover-glow transition duration-300">
            <div className="text-center mb-8">
              <FaWineGlassAlt className="text-muza-gold text-4xl mb-4 mx-auto" />
              <h3 className="text-xl font-bold text-muza-gold mb-2">BEBIDAS SELECIONADAS</h3>
              <p className="text-muza-cream text-center mb-6">
                Nossa seleção premium de bebidas para acompanhar sua experiência musical
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { image: '/cervejas.jpeg', title: 'Cervejas' },
                { image: '/tintos.jpeg', title: 'Vinhos Tintos' },
                { image: '/espumantes.jpg', title: 'Espumantes' },
                { image: '/brancos.jpg', title: 'Vinhos Brancos' },
                { image: '/rose.jpg', title: 'Vinhos Rosé' },
                { image: '/destilados.jpeg', title: 'Destilados' },
              ].map((item) => (
                <Card
                  key={item.title}
                  image={item.image}
                  title={item.title}
                  onClick={() => openModal(item.image, item.title)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Gastronomia;
