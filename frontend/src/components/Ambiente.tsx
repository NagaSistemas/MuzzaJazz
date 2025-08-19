import React from 'react';

interface GalleryCardProps {
  image: string;
  alt: string;
}

const GalleryCard: React.FC<GalleryCardProps> = ({ image, alt }) => (
  <div className="overflow-hidden rounded-lg hover-glow transition duration-300">
    <img
      src={image}
      alt={alt}
      className="w-full h-64 object-cover transform hover:scale-105 transition duration-500"
    />
  </div>
);

const Ambiente: React.FC = () => {
  const images = [
    { image: '/ambiente-1.jpg', alt: 'Ambiente interno do Muzza Jazz Club' },
    { image: '/ambiente-2.jpg', alt: 'Palco do Muza Jazz Club' },
    { image: '/ambiente-3.jpg', alt: 'Área externa do Muza Jazz Club' },
    { image: '/ambiente-4.jpg', alt: 'Detalhes decorativos do Muza Jazz Club' },
    { image: '/ambiente-5.jpg', alt: 'Bar do Muza Jazz Club' },
    { image: '/ambiente-6.jpg', alt: 'Vista noturna do Muza Jazz Club' },
  ];

  return (
    <section id="ambiente" className="py-20 bg-muza-dark bg-opacity-90">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-muza-gold mb-6 flex items-center justify-center">
            <i className="fas fa-camera-retro mr-3"></i>NOSSO AMBIENTE
          </h2>
          <div className="section-divider w-1/2 mx-auto my-6"></div>
          <p className="text-lg text-muza-cream mb-12">
            Conheça o espaço que une a magia do jazz com a beleza da natureza
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-5xl mx-auto">
          {images.map((img) => (
            <GalleryCard key={img.alt} image={img.image} alt={img.alt} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Ambiente;
