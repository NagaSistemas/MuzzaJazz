import Ambiente from "./components/Ambiente";
import Apresentacao from "./components/apresentacao";
import Essencia from "./components/Essencia";
import Footer from "./components/Footer";
import Gastronomia from "./components/Gastronomia";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Manifesto from "./components/Manifesto";
import Origem from "./components/Origem";
import Localizacao from "./components/Localizacao";
import Reservas from "./components/Reservas";

export function App() {
  return <div className="w-full min-h-screen bg-black text-white font-sans">
      <Header />
      <main>
        <Hero/>
        <Apresentacao />
        <Essencia />
        <Origem />
        <Manifesto />
        <Gastronomia />
        <Ambiente />
        <Localizacao />
        <Reservas />
      </main>
      <Footer />
    </div>;
}