// Visualizador de Mapas de Mesas
const API_BASE_URL = 'https://muzzajazz-production.up.railway.app/api';

async function carregarMapas() {
    try {
        const response = await fetch(`${API_BASE_URL}/mapas`);
        if (response.ok) {
            const data = await response.json();
            return data.mapas || {};
        }
    } catch (error) {
        console.error('Erro ao carregar mapas:', error);
    }
    return {};
}

function abrirMapa(area) {
    carregarMapas().then(mapas => {
        const mapaUrl = area === 'interna' ? mapas.mapaInterno : mapas.mapaExterno;
        
        if (!mapaUrl) {
            alert('Mapa não disponível no momento');
            return;
        }

        // Criar modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="relative max-w-6xl w-full">
                <button onclick="this.closest('.fixed').remove()" class="absolute -top-12 right-0 text-white hover:text-muza-gold text-4xl transition duration-300">
                    <i class="fas fa-times"></i>
                </button>
                <img src="${mapaUrl}" alt="Mapa de Mesas" class="w-full h-auto rounded-lg shadow-2xl">
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        // Fechar ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                document.body.style.overflow = '';
            }
        });
    });
}

// Adicionar botões de visualização de mapa
document.addEventListener('DOMContentLoaded', () => {
    const areaInterna = document.querySelector('input[name="area"][value="interna"]');
    const areaExterna = document.querySelector('input[name="area"][value="externa"]');
    
    if (areaInterna) {
        const btnMapa = document.createElement('button');
        btnMapa.type = 'button';
        btnMapa.className = 'text-muza-gold hover:text-muza-cream text-sm mt-2';
        btnMapa.innerHTML = '<i class="fas fa-map mr-1"></i>Ver Mapa de Mesas';
        btnMapa.onclick = () => abrirMapa('interna');
        areaInterna.closest('label').appendChild(btnMapa);
    }
    
    if (areaExterna) {
        const btnMapa = document.createElement('button');
        btnMapa.type = 'button';
        btnMapa.className = 'text-muza-gold hover:text-muza-cream text-sm mt-2';
        btnMapa.innerHTML = '<i class="fas fa-map mr-1"></i>Ver Mapa de Mesas';
        btnMapa.onclick = () => abrirMapa('externa');
        areaExterna.closest('label').appendChild(btnMapa);
    }
});
