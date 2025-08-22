// Dashboard funcional sem duplicar config Tailwind

// Configuração Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAisXNMFt23xrvLcvcMZq7vvL0Z-r7Q2ZI",
    authDomain: "muzza-2fb33.firebaseapp.com",
    projectId: "muzza-2fb33",
    storageBucket: "muzza-2fb33.firebasestorage.app",
    messagingSenderId: "248232132119",
    appId: "1:248232132119:web:ec1073096b6d7891af6652",
    measurementId: "G-BY70K38260"
};

// Inicializar Firebase
let db = null;

// Firebase via backend API - sem necessidade de SDK no frontend
console.log('Sistema usando backend Firebase API');

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    if (localStorage.getItem('muzza_admin_logged') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // Elementos do DOM
    const logoutBtn = document.getElementById('logoutBtn');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeMobileMenu = document.getElementById('closeMobileMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    const sections = document.querySelectorAll('.section');

    // Logout
    function handleLogout() {
        if (confirm('Tem certeza que deseja sair?')) {
            localStorage.removeItem('muzza_admin_logged');
            localStorage.removeItem('muzza_admin_user');
            window.location.href = 'login.html';
        }
    }
    
    logoutBtn.addEventListener('click', handleLogout);
    
    // Logout mobile
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', handleLogout);
    }

    // Menu mobile
    mobileMenuBtn.addEventListener('click', function() {
        mobileMenu.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    });

    closeMobileMenu.addEventListener('click', function() {
        mobileMenu.classList.add('hidden');
        document.body.style.overflow = '';
    });

    // Navegação entre seções
    function showSection(sectionId) {
        sections.forEach(section => {
            section.classList.add('hidden');
            section.classList.remove('active');
        });

        const targetSection = document.getElementById(sectionId + 'Section');
        if (targetSection) {
            targetSection.classList.remove('hidden');
            targetSection.classList.add('active');
        }

        navLinks.forEach(link => {
            link.classList.remove('active', 'text-muza-gold');
            link.classList.add('text-muza-cream');
        });

        const activeLink = document.querySelector(`[href="#${sectionId}"]`);
        if (activeLink && activeLink.classList.contains('nav-link')) {
            activeLink.classList.add('active', 'text-muza-gold');
            activeLink.classList.remove('text-muza-cream');
        }

        mobileMenu.classList.add('hidden');
        document.body.style.overflow = '';
    }

    // Event listeners para navegação
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('href').substring(1);
            showSection(sectionId);
            
            if (sectionId === 'reservas') {
                carregarReservas();
                setTimeout(inicializarFiltros, 100);
            }
        });
    });

    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('href').substring(1);
            showSection(sectionId);
            
            if (sectionId === 'reservas') {
                carregarReservas();
                setTimeout(inicializarFiltros, 100);
            }
        });
    });

    // Gerenciamento de Reservas
    let reservas = [];
    let reservasFiltradas = [];
    let paginaAtual = 1;
    const itensPorPagina = 10;

    // Função para inicializar filtros
    function inicializarFiltros() {
        const filtroData = document.getElementById('filtroData');
        const filtroArea = document.getElementById('filtroArea');
        const filtroStatus = document.getElementById('filtroStatus');
        const buscaReserva = document.getElementById('buscaReserva');

        // Event listeners para filtros
        if (filtroData) filtroData.addEventListener('change', filtrarReservas);
        if (filtroArea) filtroArea.addEventListener('change', filtrarReservas);
        if (filtroStatus) filtroStatus.addEventListener('change', filtrarReservas);
        if (buscaReserva) buscaReserva.addEventListener('input', filtrarReservas);
    }

    // Função para filtrar reservas
    function filtrarReservas() {
        const filtroData = document.getElementById('filtroData');
        const filtroArea = document.getElementById('filtroArea');
        const filtroStatus = document.getElementById('filtroStatus');
        const buscaReserva = document.getElementById('buscaReserva');
        
        const dataFiltro = filtroData?.value || '';
        const areaFiltro = filtroArea?.value || '';
        const statusFiltro = filtroStatus?.value || '';
        const buscaTexto = buscaReserva?.value.toLowerCase() || '';

        reservasFiltradas = reservas.filter(reserva => {
            const matchData = !dataFiltro || verificarFiltroData(reserva.data, dataFiltro);
            const matchArea = !areaFiltro || reserva.area === areaFiltro;
            const matchStatus = !statusFiltro || reserva.status === statusFiltro;
            const matchBusca = !buscaTexto || 
                reserva.nome.toLowerCase().includes(buscaTexto) ||
                reserva.whatsapp.includes(buscaTexto);

            return matchData && matchArea && matchStatus && matchBusca;
        });

        paginaAtual = 1; // Reset para primeira página
        renderizarReservas(reservasFiltradas);
        atualizarPaginacao(reservasFiltradas.length);
    }

    // Verificar filtro de data
    function verificarFiltroData(dataReserva, filtro) {
        const hoje = new Date();
        const amanha = new Date(hoje);
        amanha.setDate(hoje.getDate() + 1);
        
        const dataRes = new Date(dataReserva);
        
        switch(filtro) {
            case 'hoje':
                return dataRes.toDateString() === hoje.toDateString();
            case 'amanha':
                return dataRes.toDateString() === amanha.toDateString();
            case 'semana':
                const fimSemana = new Date(hoje);
                fimSemana.setDate(hoje.getDate() + 7);
                return dataRes >= hoje && dataRes <= fimSemana;
            default:
                return true;
        }
    }

    // Renderizar lista de reservas
    function renderizarReservas(reservasList = reservasFiltradas.length > 0 ? reservasFiltradas : reservas) {
        const listaReservas = document.getElementById('listaReservas');
        const estadoVazio = document.getElementById('estadoVazio');
        
        if (!listaReservas) return;

        if (reservasList.length === 0) {
            if (estadoVazio) estadoVazio.classList.remove('hidden');
            listaReservas.innerHTML = '';
            return;
        }

        if (estadoVazio) estadoVazio.classList.add('hidden');
        
        const inicio = (paginaAtual - 1) * itensPorPagina;
        const fim = inicio + itensPorPagina;
        const reservasPagina = reservasList.slice(inicio, fim);

        listaReservas.innerHTML = reservasPagina.map(reserva => `
            <div class="hover:bg-muza-gold hover:bg-opacity-10 transition duration-300">
                <!-- Desktop Layout -->
                <div class="hidden md:block px-6 py-4">
                    <div class="grid grid-cols-8 gap-4 items-center">
                        <div>
                            <p class="font-bold text-muza-cream font-raleway">${reserva.nome}</p>
                            <p class="text-muza-cream text-sm opacity-80">${reserva.whatsapp}</p>
                        </div>
                        <div>
                            <p class="text-muza-cream font-bold">${formatarData(reserva.data)}</p>
                        </div>
                        <div>
                            <span class="inline-block px-2 py-1 rounded text-xs font-bold ${getAreaColor(reserva.area)}">
                                ${reserva.area === 'interna' ? 'INTERNA' : 'EXTERNA'}
                            </span>
                        </div>
                        <div>
                            <p class="text-muza-cream">${reserva.adultos} ${reserva.adultos === 1 ? 'adulto' : 'adultos'}</p>
                            ${reserva.criancas > 0 ? `<p class="text-muza-cream text-sm opacity-80">${reserva.criancas} ${reserva.criancas === 1 ? 'criança' : 'crianças'}</p>` : ''}
                        </div>
                        <div>
                            <p class="text-muza-gold font-bold text-lg">R$ ${reserva.valor}</p>
                        </div>
                        <div>
                            <span class="inline-block px-2 py-1 rounded text-xs font-bold ${getStatusColor(reserva.status)}">
                                ${getStatusText(reserva.status)}
                            </span>
                        </div>
                        <div>
                            <button onclick="abrirModalReserva('${reserva.id}')" class="bg-muza-burgundy hover:bg-red-800 text-white px-2 py-1 rounded text-xs transition duration-300" title="Ver Detalhes">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="abrirWhatsApp('${reserva.whatsapp}', '${reserva.nome}')" class="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs transition duration-300" title="WhatsApp">
                                <i class="fab fa-whatsapp"></i>
                            </button>
                            <button onclick="apagarReserva('${reserva.id}')" class="${podeApagarReserva(reserva) ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-400 cursor-not-allowed'} text-white px-2 py-1 rounded text-xs transition duration-300" title="${podeApagarReserva(reserva) ? 'Apagar' : 'Disponível após 1 dia da reserva'}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Mobile Layout -->
                <div class="md:hidden bg-muza-wood bg-opacity-30 rounded-lg p-4 mb-4 border border-muza-gold border-opacity-20">
                    <!-- Cliente -->
                    <div class="mb-4">
                        <div class="flex items-center mb-2">
                            <i class="fas fa-user text-muza-gold mr-2"></i>
                            <span class="text-muza-gold text-xs font-bold uppercase tracking-wide">Cliente</span>
                        </div>
                        <h3 class="font-bold text-muza-cream font-raleway text-lg">${reserva.nome}</h3>
                        <p class="text-muza-cream text-sm opacity-80">${reserva.whatsapp}</p>
                    </div>
                    
                    <!-- Data/Hora -->
                    <div class="mb-4">
                        <div class="flex items-center mb-2">
                            <i class="fas fa-calendar text-muza-gold mr-2"></i>
                            <span class="text-muza-gold text-xs font-bold uppercase tracking-wide">Data/Hora</span>
                        </div>
                        <p class="text-muza-cream font-bold">${formatarData(reserva.data)}</p>
                    </div>
                    
                    <!-- Área -->
                    <div class="mb-4">
                        <div class="flex items-center mb-2">
                            <i class="fas fa-map-marker-alt text-muza-gold mr-2"></i>
                            <span class="text-muza-gold text-xs font-bold uppercase tracking-wide">Área</span>
                        </div>
                        <span class="inline-block px-3 py-1 rounded text-sm font-bold ${getAreaColor(reserva.area)}">
                            ${reserva.area === 'interna' ? 'INTERNA' : 'EXTERNA'}
                        </span>
                    </div>
                    
                    <!-- Pessoas -->
                    <div class="mb-4">
                        <div class="flex items-center mb-2">
                            <i class="fas fa-users text-muza-gold mr-2"></i>
                            <span class="text-muza-gold text-xs font-bold uppercase tracking-wide">Pessoas</span>
                        </div>
                        <p class="text-muza-cream font-bold">${reserva.adultos} ${reserva.adultos === 1 ? 'adulto' : 'adultos'}</p>
                        ${reserva.criancas > 0 ? `<p class="text-muza-cream text-sm opacity-80">${reserva.criancas} ${reserva.criancas === 1 ? 'criança' : 'crianças'}</p>` : ''}
                    </div>
                    
                    <!-- Valor -->
                    <div class="mb-4">
                        <div class="flex items-center mb-2">
                            <i class="fas fa-dollar-sign text-muza-gold mr-2"></i>
                            <span class="text-muza-gold text-xs font-bold uppercase tracking-wide">Valor</span>
                        </div>
                        <p class="text-muza-gold font-bold text-2xl">R$ ${reserva.valor}</p>
                    </div>
                    
                    <!-- Status -->
                    <div class="mb-4">
                        <span class="inline-block px-3 py-2 rounded text-sm font-bold ${getStatusColor(reserva.status)}">
                            ${getStatusText(reserva.status)}
                        </span>
                    </div>
                    
                    <!-- Ações -->
                    <div class="pt-4 border-t border-muza-gold border-opacity-20">
                        <div class="flex items-center mb-3">
                            <i class="fas fa-cog text-muza-gold mr-2"></i>
                            <span class="text-muza-gold text-xs font-bold uppercase tracking-wide">Ações</span>
                        </div>
                        <div class="flex space-x-2 mb-3">
                            <button onclick="abrirModalReserva('${reserva.id}')" class="flex-1 bg-muza-burgundy hover:bg-red-800 text-white py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center">
                                <i class="fas fa-eye mr-2"></i>
                                Ver Detalhes
                            </button>
                        </div>
                        <div class="flex space-x-3">
                            <button onclick="abrirWhatsApp('${reserva.whatsapp}', '${reserva.nome}')" class="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center">
                                <i class="fab fa-whatsapp mr-2"></i>
                                WhatsApp
                            </button>
                            <button onclick="apagarReserva('${reserva.id}')" class="flex-1 ${podeApagarReserva(reserva) ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-400 cursor-not-allowed'} text-white py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center">
                                <i class="fas fa-trash mr-2"></i>
                                Apagar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        atualizarPaginacao(reservasList.length);
    }

    // Funções auxiliares
    function formatarData(data) {
        return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
    }

    function getAreaColor(area) {
        return area === 'interna' ? 'bg-blue-500 bg-opacity-20 text-blue-400' : 'bg-green-500 bg-opacity-20 text-green-400';
    }

    function getStatusColor(status) {
        switch(status) {
            case 'pago': return 'bg-green-500 bg-opacity-20 text-green-400';
            case 'reembolsado': return 'bg-orange-500 bg-opacity-20 text-orange-400';
            default: return 'bg-green-500 bg-opacity-20 text-green-400'; // Default para pago
        }
    }

    function getStatusText(status) {
        switch(status) {
            case 'pago': return 'PAGO';
            case 'reembolsado': return 'REEMBOLSADO';
            default: return 'PAGO'; // Default para pago
        }
    }

    // Atualizar paginação
    function atualizarPaginacao(totalItens) {
        const paginacao = document.getElementById('paginacao');
        const infoPagina = document.getElementById('infoPagina');
        const btnAnterior = document.getElementById('btnAnterior');
        const btnProximo = document.getElementById('btnProximo');

        if (!paginacao) return;

        const totalPaginas = Math.ceil(totalItens / itensPorPagina);
        
        if (totalPaginas <= 1) {
            paginacao.classList.add('hidden');
            return;
        }

        paginacao.classList.remove('hidden');
        infoPagina.textContent = `Página ${paginaAtual} de ${totalPaginas}`;
        
        btnAnterior.disabled = paginaAtual === 1;
        btnProximo.disabled = paginaAtual === totalPaginas;
    }

    // Carregar reservas da API
    async function carregarReservas() {
        try {
            const response = await fetch('/api/reservas');
            if (response.ok) {
                const data = await response.json();
                reservas = data.reservas || [];
            }
        } catch (error) {
            console.log('Carregando reservas da API...');
            reservas = [];
        }
        reservasFiltradas = [...reservas];
        renderizarReservas();
        atualizarPaginacao(reservasFiltradas.length);
    }

    // Função para abrir WhatsApp
    window.abrirWhatsApp = function(whatsapp, nome) {
        const numeroLimpo = whatsapp.replace(/\D/g, '');
        const mensagem = `Olá ${nome}! Entramos em contato sobre sua reserva no Muzza Jazz Club.`;
        const mensagemCodificada = encodeURIComponent(mensagem);
        const urlWhatsApp = `https://wa.me/55${numeroLimpo}?text=${mensagemCodificada}`;
        window.open(urlWhatsApp, '_blank');
    };
    
    // Função para cancelar reserva
    window.cancelarReserva = function(reservaId) {
        if (confirm('Tem certeza que deseja cancelar esta reserva?')) {
            const reservaIndex = reservas.findIndex(r => r.id === reservaId);
            if (reservaIndex !== -1) {
                reservas[reservaIndex].status = 'cancelado';
                renderizarReservas();
            }
        }
    };
    
    // Verificar se pode apagar reserva
    function podeApagarReserva(reserva) {
        const hoje = new Date();
        const dataReserva = new Date(reserva.data);
        const umDiaApos = new Date(dataReserva);
        umDiaApos.setDate(dataReserva.getDate() + 1);
        
        return hoje >= umDiaApos || reserva.status === 'reembolsado';
    }

    // Função para reembolsar reserva
    window.reembolsarReserva = async function(reservaId) {
        if (confirm('Tem certeza que deseja processar o reembolso desta reserva?')) {
            try {
                // Atualizar status no Firebase via API
                const response = await fetch(`/api/reservas/${reservaId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'reembolsado', dataReembolso: new Date().toISOString() })
                });
                
                if (response.ok) {
                    console.log('✅ Status atualizado no Firebase via API');
                    
                    // Atualizar localmente
                    const reservaIndex = reservas.findIndex(r => r.id === reservaId);
                    if (reservaIndex !== -1) {
                        reservas[reservaIndex].status = 'reembolsado';
                        reservas[reservaIndex].dataReembolso = new Date().toISOString();
                        // Atualizar também nas reservas filtradas se existir
                        const filtradaIndex = reservasFiltradas.findIndex(r => r.id === reservaId);
                        if (filtradaIndex !== -1) {
                            reservasFiltradas[filtradaIndex].status = 'reembolsado';
                            reservasFiltradas[filtradaIndex].dataReembolso = new Date().toISOString();
                        }
                        renderizarReservas();
                        alert('Reembolso processado com sucesso!');
                        // Fechar e reabrir modal para atualizar botões
                        document.getElementById('modalReserva').classList.add('hidden');
                        setTimeout(() => abrirModalReserva(reservaId), 100);
                    }
                } else {
                    alert('Erro ao processar reembolso no Firebase');
                }
            } catch (error) {
                console.warn('❌ Erro ao processar reembolso:', error);
                alert('Erro de conexão com o servidor');
            }
        }
    };

    // Função para apagar reserva
    window.apagarReserva = async function(reservaId) {
        const reserva = reservas.find(r => r.id === reservaId);
        if (!reserva) return;
        
        if (!podeApagarReserva(reserva)) {
            alert('Esta reserva só pode ser apagada um dia após a data da reserva ou após reembolso.');
            return;
        }
        
        if (confirm('ATENÇÃO: Esta ação irá apagar permanentemente a reserva do sistema. Tem certeza?')) {
            try {
                // Remover do Firebase via API PRIMEIRO
                const response = await fetch(`/api/reservas/${reservaId}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    console.log('✅ Reserva removida do Firebase via API');
                    
                    // Só remove localmente se Firebase deu certo
                    const reservaIndex = reservas.findIndex(r => r.id === reservaId);
                    if (reservaIndex !== -1) {
                        reservas.splice(reservaIndex, 1);
                        // Atualizar também as reservas filtradas
                        const filtradaIndex = reservasFiltradas.findIndex(r => r.id === reservaId);
                        if (filtradaIndex !== -1) {
                            reservasFiltradas.splice(filtradaIndex, 1);
                        }
                        renderizarReservas();
                        atualizarPaginacao(reservasFiltradas.length > 0 ? reservasFiltradas.length : reservas.length);
                        // Fechar modal se estiver aberto
                        document.getElementById('modalReserva').classList.add('hidden');
                        document.body.style.overflow = '';
                        
                        alert('Reserva removida com sucesso!');
                    }
                } else {
                    alert('Erro ao remover reserva do Firebase');
                }
            } catch (error) {
                console.warn('❌ Erro ao remover reserva do Firebase:', error);
                alert('Erro de conexão com o servidor');
            }
        }
    };

    // Modal de reserva
    window.abrirModalReserva = function(reservaId) {
        const reserva = reservas.find(r => r.id === reservaId);
        if (!reserva) return;

        // Preencher dados no modal
        document.getElementById('modalNome').textContent = reserva.nome;
        document.getElementById('modalWhatsapp').textContent = reserva.whatsapp;
        document.getElementById('modalData').textContent = formatarData(reserva.data);
        document.getElementById('modalArea').textContent = reserva.area === 'interna' ? 'Área Interna' : 'Área Externa';
        document.getElementById('modalAdultos').textContent = reserva.adultos;
        document.getElementById('modalCriancas').textContent = reserva.criancas;
        document.getElementById('modalValor').textContent = `R$ ${reserva.valor}`;
        document.getElementById('modalStatus').textContent = getStatusText(reserva.status);
        document.getElementById('modalTransacao').textContent = reserva.transacaoId || '-';
        document.getElementById('modalDataPagamento').textContent = reserva.dataPagamento ? formatarData(reserva.dataPagamento) : '-';
        document.getElementById('modalObservacoes').textContent = reserva.observacoes || 'Nenhuma observação';

        // Configurar botões de ação
        const btnApagar = document.getElementById('btnApagar');
        const btnReembolso = document.getElementById('btnReembolso');
        
        if (btnApagar) {
            if (podeApagarReserva(reserva)) {
                btnApagar.disabled = false;
                btnApagar.className = 'flex-1 min-w-[120px] bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 font-raleway';
                btnApagar.onclick = () => apagarReserva(reservaId);
            } else {
                btnApagar.disabled = true;
                btnApagar.className = 'flex-1 min-w-[120px] bg-gray-400 text-gray-600 font-bold py-2 px-4 rounded-lg cursor-not-allowed font-raleway';
                btnApagar.onclick = null;
            }
        }
        
        if (btnReembolso) {
            // Limpar avisos anteriores
            const avisoAnterior = btnReembolso.parentNode.querySelector('.aviso-reembolso');
            if (avisoAnterior) avisoAnterior.remove();
            
            if (reserva.status === 'reembolsado') {
                btnReembolso.disabled = true;
                btnReembolso.className = 'flex-1 min-w-[120px] bg-gray-400 text-gray-600 font-bold py-2 px-4 rounded-lg cursor-not-allowed font-raleway';
                btnReembolso.innerHTML = '<span class="line-through"><i class="fas fa-undo mr-2"></i>Reembolsar</span>';
            } else {
                btnReembolso.disabled = false;
                btnReembolso.className = 'flex-1 min-w-[120px] bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 font-raleway';
                btnReembolso.innerHTML = '<i class="fas fa-undo mr-2"></i>Reembolsar';
                btnReembolso.onclick = () => reembolsarReserva(reservaId);
            }
        }

        // Mostrar modal
        document.getElementById('modalReserva').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    };

    // Fechar modal
    document.getElementById('fecharModal')?.addEventListener('click', function() {
        document.getElementById('modalReserva').classList.add('hidden');
        document.body.style.overflow = '';
    });
    
    // Estrutura de dados do relatório
    let dadosRelatorio = {
        totalReservas: 0,
        receitaTotal: 0,
        ticketMedio: 0,
        totalPessoas: 0,
        reservasInterna: 0,
        receitaInterna: 0,
        pessoasInterna: 0,
        ocupacaoInterna: 0,
        reservasExterna: 0,
        receitaExterna: 0,
        pessoasExterna: 0,
        ocupacaoExterna: 0,
        reservasDetalhadas: []
    };
    
    // Função para calcular dados do relatório
    function calcularDadosRelatorio(reservasList) {
        dadosRelatorio.totalReservas = reservasList.length;
        dadosRelatorio.receitaTotal = reservasList.reduce((sum, r) => {
            const valor = r.valor ? parseFloat(r.valor.toString().replace(',', '.')) : 0;
            return sum + valor;
        }, 0);
        dadosRelatorio.ticketMedio = dadosRelatorio.totalReservas > 0 ? dadosRelatorio.receitaTotal / dadosRelatorio.totalReservas : 0;
        dadosRelatorio.totalPessoas = reservasList.reduce((sum, r) => {
            const adultos = r.adultos || 0;
            const criancas = r.criancas || 0;
            return sum + adultos + criancas;
        }, 0);
        
        const reservasInterna = reservasList.filter(r => r.area === 'interna');
        const reservasExterna = reservasList.filter(r => r.area === 'externa');
        
        dadosRelatorio.reservasInterna = reservasInterna.length;
        dadosRelatorio.receitaInterna = reservasInterna.reduce((sum, r) => {
            const valor = r.valor ? parseFloat(r.valor.toString().replace(',', '.')) : 0;
            return sum + valor;
        }, 0);
        dadosRelatorio.pessoasInterna = reservasInterna.reduce((sum, r) => {
            const adultos = r.adultos || 0;
            const criancas = r.criancas || 0;
            return sum + adultos + criancas;
        }, 0);
        dadosRelatorio.ocupacaoInterna = dadosRelatorio.totalReservas > 0 ? (dadosRelatorio.reservasInterna / dadosRelatorio.totalReservas * 100) : 0;
        
        dadosRelatorio.reservasExterna = reservasExterna.length;
        dadosRelatorio.receitaExterna = reservasExterna.reduce((sum, r) => {
            const valor = r.valor ? parseFloat(r.valor.toString().replace(',', '.')) : 0;
            return sum + valor;
        }, 0);
        dadosRelatorio.pessoasExterna = reservasExterna.reduce((sum, r) => {
            const adultos = r.adultos || 0;
            const criancas = r.criancas || 0;
            return sum + adultos + criancas;
        }, 0);
        dadosRelatorio.ocupacaoExterna = dadosRelatorio.totalReservas > 0 ? (dadosRelatorio.reservasExterna / dadosRelatorio.totalReservas * 100) : 0;
        
        dadosRelatorio.reservasDetalhadas = reservasList;
    }
    
    // Função para gerar relatório
    function gerarRelatorio() {
        const tipoPeriodo = document.querySelector('input[name="tipoPeriodo"]:checked')?.value;
        const areaFiltro = document.getElementById('filtroAreaRelatorio')?.value || '';
        const statusFiltro = document.getElementById('filtroStatusRelatorio')?.value || '';
        
        let dataInicio, dataFim;
        
        if (tipoPeriodo === 'dia') {
            const data = document.getElementById('dataEspecifica')?.value;
            if (!data) return alert('Selecione uma data específica');
            dataInicio = dataFim = data;
        } else if (tipoPeriodo === 'mes') {
            const mesAno = document.getElementById('mesAno')?.value;
            if (!mesAno) return alert('Selecione um mês/ano');
            const [ano, mes] = mesAno.split('-');
            dataInicio = `${ano}-${mes}-01`;
            dataFim = `${ano}-${mes}-${new Date(ano, mes, 0).getDate().toString().padStart(2, '0')}`;
        } else if (tipoPeriodo === 'periodo') {
            dataInicio = document.getElementById('dataInicial')?.value;
            dataFim = document.getElementById('dataFinal')?.value;
            if (!dataInicio || !dataFim) return alert('Selecione as datas inicial e final');
        }
        
        const reservasRelatorio = reservas.filter(reserva => {
            const dataReserva = reserva.data;
            const matchPeriodo = dataReserva >= dataInicio && dataReserva <= dataFim;
            const matchArea = !areaFiltro || reserva.area === areaFiltro;
            const matchStatus = !statusFiltro || reserva.status === statusFiltro;
            return matchPeriodo && matchArea && matchStatus;
        });
        
        calcularDadosRelatorio(reservasRelatorio);
        exibirRelatorio(dataInicio, dataFim);
    }
    
    // Função para exibir relatório
    function exibirRelatorio(dataInicio, dataFim) {
        document.getElementById('totalReservas').textContent = dadosRelatorio.totalReservas;
        document.getElementById('receitaTotal').textContent = `R$ ${dadosRelatorio.receitaTotal.toFixed(2).replace('.', ',')}`;
        document.getElementById('ticketMedio').textContent = `R$ ${dadosRelatorio.ticketMedio.toFixed(2).replace('.', ',')}`;
        document.getElementById('totalPessoas').textContent = dadosRelatorio.totalPessoas;
        
        document.getElementById('reservasInterna').textContent = dadosRelatorio.reservasInterna;
        document.getElementById('receitaInterna').textContent = `R$ ${dadosRelatorio.receitaInterna.toFixed(2).replace('.', ',')}`;
        document.getElementById('pessoasInterna').textContent = dadosRelatorio.pessoasInterna;
        document.getElementById('ocupacaoInterna').textContent = `${dadosRelatorio.ocupacaoInterna.toFixed(1)}%`;
        
        document.getElementById('reservasExterna').textContent = dadosRelatorio.reservasExterna;
        document.getElementById('receitaExterna').textContent = `R$ ${dadosRelatorio.receitaExterna.toFixed(2).replace('.', ',')}`;
        document.getElementById('pessoasExterna').textContent = dadosRelatorio.pessoasExterna;
        document.getElementById('ocupacaoExterna').textContent = `${dadosRelatorio.ocupacaoExterna.toFixed(1)}%`;
        
        document.getElementById('periodoRelatorio').textContent = `${formatarData(dataInicio)} - ${formatarData(dataFim)}`;
        
        const listaReservasRelatorio = document.getElementById('listaReservasRelatorio');
        
        if (dadosRelatorio.reservasDetalhadas.length === 0) {
            listaReservasRelatorio.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-calendar-times text-muza-gold text-3xl mb-3 opacity-50"></i>
                    <p class="text-muza-cream opacity-70 font-raleway">Sem reservas registradas no período selecionado</p>
                </div>
            `;
        } else {
            listaReservasRelatorio.innerHTML = dadosRelatorio.reservasDetalhadas.map(reserva => `
                <div class="grid grid-cols-6 gap-4 py-2 px-4 bg-muza-wood bg-opacity-20 rounded text-sm">
                    <div class="text-muza-cream">${formatarData(reserva.data)}</div>
                    <div class="text-muza-cream">${reserva.nome}</div>
                    <div class="text-muza-cream">${reserva.area === 'interna' ? 'Interna' : 'Externa'}</div>
                    <div class="text-muza-cream">${(reserva.adultos || 0) + (reserva.criancas || 0)}</div>
                    <div class="text-muza-gold font-bold">R$ ${reserva.valor}</div>
                    <div class="text-${reserva.status === 'pago' ? 'green' : 'orange'}-400 font-bold">${getStatusText(reserva.status)}</div>
                </div>
            `).join('');
        }
        
        document.getElementById('previaRelatorio').classList.remove('hidden');
    }
    
    // Função para gerar PDF
    function gerarPDF() {
        if (dadosRelatorio.totalReservas === 0) {
            alert('Gere um relatório primeiro antes de exportar para PDF');
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Cores do sistema
        const corDourada = [212, 175, 55]; // #D4AF37
        const corBorgonha = [139, 0, 0]; // #8B0000
        const corEscura = [26, 18, 11]; // #1A120B
        
        // Cabeçalho
        doc.setFillColor(...corDourada);
        doc.rect(0, 0, 210, 30, 'F');
        
        doc.setTextColor(...corEscura);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('MUZZA JAZZ CLUB', 20, 15);
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Relatório Financeiro', 20, 22);
        
        // Período
        const periodo = document.getElementById('periodoRelatorio').textContent;
        doc.text(`Período: ${periodo}`, 120, 22);
        
        // Resumo Executivo
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('RESUMO EXECUTIVO', 20, 45);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        let y = 55;
        
        doc.text(`Total de Reservas: ${dadosRelatorio.totalReservas}`, 20, y);
        doc.text(`Receita Total: R$ ${dadosRelatorio.receitaTotal.toFixed(2).replace('.', ',')}`, 110, y);
        y += 8;
        
        doc.text(`Ticket Médio: R$ ${dadosRelatorio.ticketMedio.toFixed(2).replace('.', ',')}`, 20, y);
        doc.text(`Total de Pessoas: ${dadosRelatorio.totalPessoas}`, 110, y);
        y += 15;
        
        // Detalhamento por Área
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('DETALHAMENTO POR ÁREA', 20, y);
        y += 10;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        // Área Interna
        doc.setFont('helvetica', 'bold');
        doc.text('Área Interna:', 20, y);
        doc.setFont('helvetica', 'normal');
        y += 6;
        doc.text(`Reservas: ${dadosRelatorio.reservasInterna}`, 25, y);
        doc.text(`Receita: R$ ${dadosRelatorio.receitaInterna.toFixed(2).replace('.', ',')}`, 70, y);
        doc.text(`Pessoas: ${dadosRelatorio.pessoasInterna}`, 130, y);
        y += 10;
        
        // Área Externa
        doc.setFont('helvetica', 'bold');
        doc.text('Área Externa:', 20, y);
        doc.setFont('helvetica', 'normal');
        y += 6;
        doc.text(`Reservas: ${dadosRelatorio.reservasExterna}`, 25, y);
        doc.text(`Receita: R$ ${dadosRelatorio.receitaExterna.toFixed(2).replace('.', ',')}`, 70, y);
        doc.text(`Pessoas: ${dadosRelatorio.pessoasExterna}`, 130, y);
        y += 15;
        
        // Lista de Reservas
        if (dadosRelatorio.reservasDetalhadas.length > 0) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('RESERVAS DETALHADAS', 20, y);
            y += 10;
            
            // Cabeçalho da tabela
            doc.setFillColor(240, 240, 240);
            doc.rect(20, y - 5, 170, 8, 'F');
            
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text('DATA', 22, y);
            doc.text('CLIENTE', 45, y);
            doc.text('ÁREA', 85, y);
            doc.text('PESSOAS', 105, y);
            doc.text('VALOR', 130, y);
            doc.text('STATUS', 155, y);
            y += 8;
            
            // Dados das reservas
            doc.setFont('helvetica', 'normal');
            dadosRelatorio.reservasDetalhadas.forEach(reserva => {
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
                
                doc.text(formatarData(reserva.data), 22, y);
                doc.text(reserva.nome.substring(0, 15), 45, y);
                doc.text(reserva.area === 'interna' ? 'Interna' : 'Externa', 85, y);
                doc.text(String((reserva.adultos || 0) + (reserva.criancas || 0)), 105, y);
                doc.text(`R$ ${reserva.valor}`, 130, y);
                doc.text(reserva.status === 'pago' ? 'PAGO' : 'REEMBOLSADO', 155, y);
                y += 6;
            });
        }
        
        // Rodapé
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} - Página ${i} de ${pageCount}`, 20, 290);
            doc.text('Muzza Jazz Club - Jazz da Floresta', 120, 290);
        }
        
        // Salvar PDF
        const nomeArquivo = `relatorio-muzza-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(nomeArquivo);
    }
    
    // Event listeners para relatórios
    document.getElementById('btnVisualizarRelatorio')?.addEventListener('click', gerarRelatorio);
    document.getElementById('btnGerarPDF')?.addEventListener('click', gerarPDF);
    
    // Controlar exibição dos campos de data
    document.querySelectorAll('input[name="tipoPeriodo"]').forEach(radio => {
        radio.addEventListener('change', function() {
            document.querySelectorAll('.campo-data').forEach(campo => campo.classList.add('hidden'));
            
            if (this.value === 'dia') {
                document.getElementById('campoDia').classList.remove('hidden');
            } else if (this.value === 'mes') {
                document.getElementById('campoMes').classList.remove('hidden');
            } else if (this.value === 'periodo') {
                document.getElementById('campoPeriodo').classList.remove('hidden');
            }
        });
    });
    
    // Sistema de Recebíveis
    function calcularRecebiveis() {
        const hoje = new Date();
        const receitaTotal = reservas.filter(r => r.status === 'pago').reduce((sum, r) => sum + (r.valor || 0), 0);
        const receitaHoje = reservas.filter(r => {
            const dataReserva = new Date(r.data);
            return r.status === 'pago' && dataReserva.toDateString() === hoje.toDateString();
        }).reduce((sum, r) => sum + (r.valor || 0), 0);
        
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - hoje.getDay());
        const receitaSemana = reservas.filter(r => {
            const dataReserva = new Date(r.data);
            return r.status === 'pago' && dataReserva >= inicioSemana && dataReserva <= hoje;
        }).reduce((sum, r) => sum + (r.valor || 0), 0);
        
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const receitaMes = reservas.filter(r => {
            const dataReserva = new Date(r.data);
            return r.status === 'pago' && dataReserva >= inicioMes && dataReserva <= hoje;
        }).reduce((sum, r) => sum + (r.valor || 0), 0);
        
        return { receitaTotal, receitaHoje, receitaSemana, receitaMes };
    }
    
    function atualizarRecebiveis() {
        const { receitaTotal, receitaHoje, receitaSemana, receitaMes } = calcularRecebiveis();
        
        document.getElementById('receitaTotal').textContent = `R$ ${receitaTotal.toFixed(2).replace('.', ',')}`;
        document.getElementById('receitaHoje').textContent = `R$ ${receitaHoje.toFixed(2).replace('.', ',')}`;
        document.getElementById('receitaSemana').textContent = `R$ ${receitaSemana.toFixed(2).replace('.', ',')}`;
        document.getElementById('receitaMes').textContent = `R$ ${receitaMes.toFixed(2).replace('.', ',')}`;
    }
    
    function verificarPodeAlterarFrequencia() {
        const ultimaAlteracao = localStorage.getItem('ultima_alteracao_frequencia');
        const frequenciaAtual = localStorage.getItem('frequencia_recebimento') || 'mensal';
        
        if (!ultimaAlteracao) return true;
        
        const dataUltimaAlteracao = new Date(ultimaAlteracao);
        const agora = new Date();
        
        let proximaAlteracao;
        switch(frequenciaAtual) {
            case 'diario':
                proximaAlteracao = new Date(dataUltimaAlteracao);
                proximaAlteracao.setDate(proximaAlteracao.getDate() + 1);
                break;
            case 'semanal':
                proximaAlteracao = new Date(dataUltimaAlteracao);
                proximaAlteracao.setDate(proximaAlteracao.getDate() + 7);
                break;
            case 'mensal':
                proximaAlteracao = new Date(dataUltimaAlteracao);
                proximaAlteracao.setMonth(proximaAlteracao.getMonth() + 1);
                break;
        }
        
        return agora >= proximaAlteracao;
    }
    
    document.getElementById('formRecebiveis')?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!verificarPodeAlterarFrequencia()) {
            const frequenciaAtual = localStorage.getItem('frequencia_recebimento') || 'mensal';
            const ultimaAlteracao = localStorage.getItem('ultima_alteracao_frequencia');
            const dataUltimaAlteracao = new Date(ultimaAlteracao);
            
            let proximaData;
            switch(frequenciaAtual) {
                case 'diario':
                    proximaData = new Date(dataUltimaAlteracao);
                    proximaData.setDate(proximaData.getDate() + 1);
                    break;
                case 'semanal':
                    proximaData = new Date(dataUltimaAlteracao);
                    proximaData.setDate(proximaData.getDate() + 7);
                    break;
                case 'mensal':
                    proximaData = new Date(dataUltimaAlteracao);
                    proximaData.setMonth(proximaData.getMonth() + 1);
                    break;
            }
            
            alert(`A configuração só pode ser alterada após ${proximaData.toLocaleDateString('pt-BR')}`);
            return;
        }
        
        const frequencia = document.querySelector('input[name="frequenciaRecebimento"]:checked')?.value;
        localStorage.setItem('frequencia_recebimento', frequencia);
        localStorage.setItem('ultima_alteracao_frequencia', new Date().toISOString());
        alert('Configuração de recebimento salva com sucesso!');
    });
    
    // Carregar configuração salva
    const frequenciaSalva = localStorage.getItem('frequencia_recebimento') || 'mensal';
    const radioFrequencia = document.querySelector(`input[name="frequenciaRecebimento"][value="${frequenciaSalva}"]`);
    if (radioFrequencia) radioFrequencia.checked = true;
    
    // Gerenciamento de Mesas
    let mesas = JSON.parse(localStorage.getItem('muzza_mesas')) || [];
    
    function salvarMesas() {
        localStorage.setItem('muzza_mesas', JSON.stringify(mesas));
        atualizarResumoCapacidade();
        renderizarListaMesas();
    }
    
    function atualizarResumoCapacidade() {
        const mesasInterna = mesas.filter(m => m.area === 'interna' && m.status === 'ativa');
        const mesasExterna = mesas.filter(m => m.area === 'externa' && m.status === 'ativa');
        
        const capacidadeInterna = mesasInterna.reduce((sum, m) => sum + m.capacidade, 0);
        const capacidadeExterna = mesasExterna.reduce((sum, m) => sum + m.capacidade, 0);
        const capacidadeTotal = capacidadeInterna + capacidadeExterna;
        
        document.getElementById('totalMesasInterna').textContent = `${mesasInterna.length} mesas`;
        document.getElementById('capacidadeInterna').textContent = `${capacidadeInterna} pessoas`;
        document.getElementById('mesasAtivasInterna').textContent = mesasInterna.length;
        
        document.getElementById('totalMesasExterna').textContent = `${mesasExterna.length} mesas`;
        document.getElementById('capacidadeExterna').textContent = `${capacidadeExterna} pessoas`;
        document.getElementById('mesasAtivasExterna').textContent = mesasExterna.length;
        
        document.getElementById('capacidadeTotal').textContent = capacidadeTotal;
        
        renderizarListaMesas();
    }
    
    function renderizarListaMesas() {
        const listaMesas = document.getElementById('listaMesas');
        const estadoVazioMesas = document.getElementById('estadoVazioMesas');
        
        if (!listaMesas) return;
        
        if (mesas.length === 0) {
            if (estadoVazioMesas) estadoVazioMesas.classList.remove('hidden');
            listaMesas.innerHTML = '';
            return;
        }
        
        if (estadoVazioMesas) estadoVazioMesas.classList.add('hidden');
        
        listaMesas.innerHTML = mesas.map(mesa => `
            <div class="hover:bg-muza-gold hover:bg-opacity-10 transition duration-300">
                <!-- Desktop Layout -->
                <div class="hidden md:block px-6 py-4">
                    <div class="grid grid-cols-6 gap-4 items-center">
                        <div class="font-bold text-muza-gold">Mesa ${mesa.numero}</div>
                        <div class="text-muza-cream">${mesa.capacidade} pessoas</div>
                        <div class="text-muza-cream">${mesa.area === 'interna' ? 'Interna' : 'Externa'}</div>
                        <div>
                            <span class="inline-block px-2 py-1 rounded text-xs font-bold ${
                                mesa.status === 'ativa' ? 'bg-green-500 bg-opacity-20 text-green-400' : 'bg-red-500 bg-opacity-20 text-red-400'
                            }">
                                ${mesa.status === 'ativa' ? 'ATIVA' : 'INATIVA'}
                            </span>
                        </div>
                        <div class="text-muza-cream text-sm">${mesa.observacoes || '-'}</div>
                        <div class="flex space-x-2">
                            <button onclick="editarMesa('${mesa.id}')" class="bg-muza-burgundy hover:bg-red-800 text-white px-2 py-1 rounded text-xs transition duration-300" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="removerMesa('${mesa.id}')" class="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs transition duration-300" title="Remover">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Mobile Layout -->
                <div class="md:hidden bg-muza-wood bg-opacity-30 rounded-lg p-4 mb-4 mx-4 mt-4 border border-muza-gold border-opacity-20">
                    <div class="flex justify-between items-center mb-3">
                        <h3 class="font-bold text-muza-gold font-raleway text-lg">Mesa ${mesa.numero}</h3>
                        <span class="inline-block px-3 py-1 rounded text-sm font-bold ${
                            mesa.status === 'ativa' ? 'bg-green-500 bg-opacity-20 text-green-400' : 'bg-red-500 bg-opacity-20 text-red-400'
                        }">
                            ${mesa.status === 'ativa' ? 'ATIVA' : 'INATIVA'}
                        </span>
                    </div>
                    
                    <div class="space-y-3 mb-4">
                        <div class="flex items-center">
                            <i class="fas fa-users text-muza-gold mr-2"></i>
                            <span class="text-muza-cream font-raleway">${mesa.capacidade} pessoas</span>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-map-marker-alt text-muza-gold mr-2"></i>
                            <span class="text-muza-cream font-raleway">${mesa.area === 'interna' ? 'Área Interna' : 'Área Externa'}</span>
                        </div>
                        ${mesa.observacoes ? `
                            <div class="flex items-start">
                                <i class="fas fa-sticky-note text-muza-gold mr-2 mt-1"></i>
                                <span class="text-muza-cream font-raleway text-sm">${mesa.observacoes}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="pt-3 border-t border-muza-gold border-opacity-20">
                        <div class="flex space-x-3">
                            <button onclick="editarMesa('${mesa.id}')" class="flex-1 bg-muza-burgundy hover:bg-red-800 text-white py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center">
                                <i class="fas fa-edit mr-2"></i>
                                Editar
                            </button>
                            <button onclick="removerMesa('${mesa.id}')" class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center">
                                <i class="fas fa-trash mr-2"></i>
                                Remover
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    let mesaEditando = null;
    
    window.editarMesa = function(mesaId) {
        const mesa = mesas.find(m => m.id === mesaId);
        if (!mesa) return;
        
        mesaEditando = mesaId;
        document.getElementById('numeroMesa').value = mesa.numero;
        document.getElementById('capacidadeMesa').value = mesa.capacidade;
        document.querySelector(`input[name="areaMesa"][value="${mesa.area}"]`).checked = true;
        document.getElementById('statusMesa').value = mesa.status;
        document.getElementById('observacoesMesa').value = mesa.observacoes || '';
        
        const submitBtn = document.querySelector('#formMesa button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Atualizar Mesa';
        submitBtn.className = 'w-full bg-muza-burgundy text-muza-cream font-bold py-3 px-6 rounded-lg hover:bg-red-800 transition duration-300 font-raleway';
        
        // Scroll para o formulário
        document.getElementById('formMesa').scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    
    window.removerMesa = async function(mesaId) {
        if (confirm('Tem certeza que deseja remover esta mesa?')) {
            try {
                const response = await fetch(`/api/mesas/${mesaId}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    mesas = mesas.filter(m => m.id !== mesaId);
                    salvarMesas();
                    alert('Mesa removida com sucesso!');
                } else {
                    alert('Erro ao remover mesa do Firebase');
                }
            } catch (error) {
                console.error('Erro ao remover mesa:', error);
                alert('Erro de conexão com o servidor');
            }
        }
    };
    
    document.getElementById('formMesa')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const numeroMesa = parseInt(document.getElementById('numeroMesa').value);
        const capacidadeMesa = parseInt(document.getElementById('capacidadeMesa').value);
        const areaMesa = document.querySelector('input[name="areaMesa"]:checked').value;
        const statusMesa = document.getElementById('statusMesa').value;
        const observacoesMesa = document.getElementById('observacoesMesa').value;
        
        const mesaData = {
            numero: numeroMesa,
            capacidade: capacidadeMesa,
            area: areaMesa,
            status: statusMesa,
            observacoes: observacoesMesa
        };
        
        try {
            if (mesaEditando) {
                // Verificar se o número já existe em outra mesa
                const mesaExistente = mesas.find(m => m.numero === numeroMesa && m.id !== mesaEditando);
                if (mesaExistente) {
                    alert('Já existe outra mesa com este número!');
                    return;
                }
                
                // Atualizar no Firebase
                const response = await fetch(`/api/mesas/${mesaEditando}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(mesaData)
                });
                
                if (response.ok) {
                    // Atualizar localmente
                    const mesaIndex = mesas.findIndex(m => m.id === mesaEditando);
                    if (mesaIndex !== -1) {
                        mesas[mesaIndex] = { ...mesas[mesaIndex], ...mesaData };
                    }
                    
                    mesaEditando = null;
                    const submitBtn = this.querySelector('button[type="submit"]');
                    submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Salvar Mesa';
                    submitBtn.className = 'w-full bg-muza-gold text-muza-dark font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition duration-300 font-raleway';
                    
                    alert('Mesa atualizada com sucesso!');
                } else {
                    alert('Erro ao atualizar mesa no Firebase');
                    return;
                }
            } else {
                // Verificar se já existe mesa com este número
                if (mesas.find(m => m.numero === numeroMesa)) {
                    alert('Já existe uma mesa com este número!');
                    return;
                }
                
                // Criar no Firebase
                const response = await fetch('/api/mesas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(mesaData)
                });
                
                if (response.ok) {
                    const result = await response.json();
                    // Adicionar localmente
                    const novaMesa = { id: result.id, ...mesaData };
                    mesas.push(novaMesa);
                    
                    alert('Mesa adicionada com sucesso!');
                } else {
                    alert('Erro ao adicionar mesa no Firebase');
                    return;
                }
            }
            
            // Atualizar interface
            salvarMesas();
            this.reset();
        } catch (error) {
            console.error('Erro ao salvar mesa:', error);
            alert('Erro de conexão com o servidor');
        }
    });
    
    // Inicializar seção de reservas e dashboard
    carregarReservas().then(() => {
        atualizarDashboard();
    });
    
    // Inicializar filtros
    inicializarFiltros();
    
    // Atualizar resumo de capacidade
    atualizarResumoCapacidade();
    
    // Renderizar lista inicial
    renderizarListaMesas();

    // Mostrar nome do usuário
    const adminUser = localStorage.getItem('muzza_admin_user') || 'Admin';
    document.getElementById('adminUser').textContent = adminUser;
    
    // Função para atualizar dashboard
    function atualizarDashboard() {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        // Reservas hoje
        const reservasHoje = reservas.filter(r => {
            const dataReserva = new Date(r.data);
            dataReserva.setHours(0, 0, 0, 0);
            return dataReserva.getTime() === hoje.getTime() && r.status === 'pago';
        });
        
        // Receita hoje
        const receitaHoje = reservasHoje.reduce((sum, r) => sum + (r.valor || 0), 0);
        
        // Ocupação (assumindo capacidade total de 100 pessoas)
        const pessoasHoje = reservasHoje.reduce((sum, r) => sum + (r.adultos || 0) + (r.criancas || 0), 0);
        const ocupacao = Math.round((pessoasHoje / 100) * 100);
        
        // Próximas chegadas (próximas 2 horas)
        const agora = new Date();
        const duasHoras = new Date(agora.getTime() + 2 * 60 * 60 * 1000);
        const proximasChegadas = reservas.filter(r => {
            const dataReserva = new Date(r.data);
            return dataReserva >= agora && dataReserva <= duasHoras && r.status === 'pago';
        }).length;
        
        // Atualizar elementos
        document.getElementById('reservasHoje').textContent = reservasHoje.length;
        document.getElementById('receitaHoje').textContent = `R$ ${receitaHoje.toFixed(2).replace('.', ',')}`;
        document.getElementById('ocupacao').textContent = `${ocupacao}%`;
        document.getElementById('proximasChegadas').textContent = proximasChegadas;
    }
    
    // Atualizar recebíveis e dashboard quando carregar reservas
    const originalCarregarReservas = carregarReservas;
    carregarReservas = async function() {
        await originalCarregarReservas();
        setTimeout(() => {
            atualizarRecebiveis();
            atualizarDashboard();
        }, 100);
    };
    
    // Gerenciar tabs de configuração
    setTimeout(() => {
        document.querySelectorAll('.config-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                
                // Remover active de todas as tabs
                document.querySelectorAll('.config-tab').forEach(t => {
                    t.classList.remove('active', 'text-muza-gold', 'border-muza-gold');
                    t.classList.add('text-muza-cream', 'border-transparent');
                });
                
                // Adicionar active na tab clicada
                this.classList.add('active', 'text-muza-gold', 'border-muza-gold');
                this.classList.remove('text-muza-cream', 'border-transparent');
                
                // Esconder todos os conteúdos
                document.querySelectorAll('.config-content').forEach(content => {
                    content.classList.add('hidden');
                });
                
                // Mostrar conteúdo da tab ativa
                let targetContent;
                if (tabId === 'nagapay') {
                    targetContent = document.getElementById('tabNagapay');
                } else {
                    targetContent = document.getElementById('tab' + tabId.charAt(0).toUpperCase() + tabId.slice(1));
                }
                if (targetContent) {
                    targetContent.classList.remove('hidden');
                    if (tabId === 'nagapay') {
                        setTimeout(atualizarRecebiveis, 100);
                    }
                }
            });
        });
        
        // Gerenciar preços
        const formPrecos = document.getElementById('formPrecos');
        if (formPrecos) {
            formPrecos.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const tipoCrianca = document.querySelector('input[name="tipoCrianca"]:checked')?.value || '50';
                const precos = {
                    interna_sexta: parseFloat(document.getElementById('precoInternaSexa')?.value || '0'),
                    interna_sabado: parseFloat(document.getElementById('precoInternaSabado')?.value || '0'),
                    externa: parseFloat(document.getElementById('precoExterna')?.value || '0'),
                    crianca_desconto: tipoCrianca === 'fixo' ? -1 : parseInt(tipoCrianca),
                    crianca_preco_fixo: parseFloat(document.getElementById('precoFixoCrianca')?.value || '0')
                };
                
                try {
                    // Salvar via API do backend
                    const response = await fetch('/api/config/precos', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(precos)
                    });
                    
                    if (response.ok) {
                        console.log('✅ Preços salvos no Firebase via API');
                        
                        // Limpar cache antigo e notificar site
                        localStorage.removeItem('muzza_precos');
                        localStorage.setItem('precos_updated', Date.now().toString());
                        
                        alert('Preços salvos com sucesso!');
                    } else {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Erro ao salvar no servidor');
                    }
                } catch (error) {
                    console.error('❌ Erro ao salvar preços:', error);
                    alert('Erro ao salvar preços: ' + error.message);
                }
            });
        }
        
        // Controlar exibição do campo preço fixo
        document.querySelectorAll('input[name="tipoCrianca"]').forEach(radio => {
            radio.addEventListener('change', function() {
                const campoPrecoFixo = document.getElementById('campoPrecoFixo');
                if (this.value === 'fixo') {
                    campoPrecoFixo?.classList.remove('hidden');
                } else {
                    campoPrecoFixo?.classList.add('hidden');
                }
            });
        });
        
        // Gerenciar eventos especiais
        let eventos = JSON.parse(localStorage.getItem('muzza_eventos')) || [];
        
        function renderizarEventos() {
            const listaEventos = document.getElementById('listaEventos');
            if (!listaEventos) return;
            
            if (eventos.length === 0) {
                listaEventos.innerHTML = `
                    <div class="text-center py-4">
                        <i class="fas fa-calendar-times text-muza-gold text-2xl mb-2 opacity-50"></i>
                        <p class="text-muza-cream opacity-70 font-raleway text-sm">Nenhum evento cadastrado</p>
                    </div>
                `;
                return;
            }
            
            listaEventos.innerHTML = eventos.map(evento => `
                <div class="bg-muza-wood bg-opacity-30 rounded-lg p-3 border border-muza-gold border-opacity-20">
                    <div class="flex justify-between items-start mb-2">
                        <h5 class="text-muza-gold font-bold font-raleway">${evento.nome}</h5>
                        <div class="flex space-x-2">
                            <button class="btn-editar-evento text-muza-gold hover:text-muza-cream text-sm" title="Editar" data-evento-id="${evento.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-remover-evento text-red-400 hover:text-red-300 text-sm" title="Remover" data-evento-id="${evento.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <p class="text-muza-cream text-sm mb-1">
                        <i class="fas fa-calendar mr-1"></i>${new Date(evento.data).toLocaleDateString('pt-BR')}
                    </p>
                    <p class="text-muza-cream text-xs opacity-80">
                        <i class="fas fa-tag mr-1"></i>${evento.tipo === 'gratuito' ? 'Evento Gratuito' : 'Preço Especial'}
                    </p>
                    ${evento.descricao ? `<p class="text-muza-cream text-xs opacity-70 mt-2">${evento.descricao}</p>` : ''}
                </div>
            `).join('');
            
            // Adicionar event listeners aos botões
            document.querySelectorAll('.btn-editar-evento').forEach(btn => {
                btn.addEventListener('click', function() {
                    editarEvento(this.dataset.eventoId);
                });
            });
            
            document.querySelectorAll('.btn-remover-evento').forEach(btn => {
                btn.addEventListener('click', function() {
                    removerEvento(this.dataset.eventoId);
                });
            });
        }
        
        let eventoEditando = null;
        
        function editarEvento(eventoId) {
            const evento = eventos.find(e => e.id === eventoId);
            if (!evento) return;
            
            eventoEditando = eventoId;
            
            // Preencher formulário
            document.getElementById('dataEvento').value = evento.data;
            document.getElementById('dataEventoDisplay').value = new Date(evento.data).toLocaleDateString('pt-BR');
            document.getElementById('nomeEvento').value = evento.nome;
            document.getElementById('descricaoEvento').value = evento.descricao || '';
            
            // Tipo de evento
            document.querySelector(`input[name="tipoEvento"][value="${evento.tipo}"]`).checked = true;
            
            if (evento.tipo === 'especial') {
                document.getElementById('campoPrecoEspecial')?.classList.remove('hidden');
                document.getElementById('precoEspecialInterna').value = evento.precoInterna || 0;
                document.getElementById('precoEspecialExterna').value = evento.precoExterna || 0;
                
                // Tipo criança
                document.querySelector(`input[name="tipoCriancaEvento"][value="${evento.tipoCrianca || '50'}"]`).checked = true;
                
                if (evento.tipoCrianca === 'personalizado') {
                    document.getElementById('campoPrecoPersonalizadoCrianca')?.classList.remove('hidden');
                    document.getElementById('precoPersonalizadoCrianca').value = evento.precoPersonalizadoCrianca || 0;
                }
            }
            
            // Alterar botão
            const submitBtn = document.querySelector('#formEvento button[type="submit"]');
            submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Atualizar Evento';
            submitBtn.className = 'w-full bg-muza-gold text-muza-dark font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition duration-300 font-raleway';
            
            // Scroll para o formulário
            document.getElementById('formEvento').scrollIntoView({ behavior: 'smooth' });
        }
        
        async function removerEvento(eventoId) {
            if (confirm('Tem certeza que deseja remover este evento?')) {
                try {
                    // Remover do Firebase via API PRIMEIRO
                    const response = await fetch(`/api/eventos/${eventoId}`, {
                        method: 'DELETE'
                    });
                    
                    if (response.ok) {
                        console.log('✅ Evento removido do Firebase via API');
                        
                        // Só remove localmente se Firebase deu certo
                        eventos = eventos.filter(e => e.id !== eventoId);
                        localStorage.setItem('muzza_eventos', JSON.stringify(eventos));
                        localStorage.setItem('eventos_updated', Date.now().toString());
                        renderizarEventos();
                        
                        // Atualizar calendário
                        if (typeof renderCalendarEvento === 'function') {
                            renderCalendarEvento();
                        }
                        
                        alert('Evento removido com sucesso!');
                    } else {
                        alert('Erro ao remover evento do Firebase');
                    }
                } catch (error) {
                    console.warn('❌ Erro ao remover do Firebase:', error);
                    alert('Erro de conexão com o servidor');
                }
            }
        }
        
        const formEvento = document.getElementById('formEvento');
        if (formEvento) {
            formEvento.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const evento = {
                    id: eventoEditando || Date.now().toString(),
                    data: document.getElementById('dataEvento').value,
                    nome: document.getElementById('nomeEvento').value,
                    tipo: document.querySelector('input[name="tipoEvento"]:checked').value,
                    descricao: document.getElementById('descricaoEvento').value || '',
                    precoInterna: parseFloat(document.getElementById('precoEspecialInterna')?.value || '0'),
                    precoExterna: parseFloat(document.getElementById('precoEspecialExterna')?.value || '0'),
                    tipoCrianca: document.querySelector('input[name="tipoCriancaEvento"]:checked')?.value || '50',
                    precoPersonalizadoCrianca: parseFloat(document.getElementById('precoPersonalizadoCrianca')?.value || '0')
                };
                
                if (eventoEditando) {
                    // Editando evento existente
                    const eventoIndex = eventos.findIndex(e => e.id === eventoEditando);
                    if (eventoIndex !== -1) {
                        eventos[eventoIndex] = evento;
                    }
                    eventoEditando = null;
                    
                    // Restaurar botão
                    const submitBtn = this.querySelector('button[type="submit"]');
                    submitBtn.innerHTML = '<i class="fas fa-plus mr-2"></i>Adicionar Evento';
                    submitBtn.className = 'w-full bg-muza-burgundy text-muza-cream font-bold py-3 px-6 rounded-lg hover:bg-red-800 transition duration-300 font-raleway';
                    
                    alert('Evento atualizado com sucesso!');
                } else {
                    // Adicionando novo evento
                    eventos.push(evento);
                    alert('Evento cadastrado com sucesso!');
                }
                
                // Salvar no Firebase via API
                try {
                    const response = await fetch('/api/eventos', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(evento)
                    });
                    if (response.ok) {
                        console.log('✅ Evento salvo no Firebase via API');
                    } else {
                        console.warn('❌ Erro ao salvar no Firebase');
                    }
                } catch (error) {
                    console.warn('❌ Erro ao salvar no Firebase:', error);
                }
                
                localStorage.setItem('muzza_eventos', JSON.stringify(eventos));
                localStorage.setItem('eventos_updated', Date.now().toString());
                
                renderizarEventos();
                this.reset();
                document.getElementById('campoPrecoEspecial')?.classList.add('hidden');
                document.getElementById('campoPrecoPersonalizadoCrianca')?.classList.add('hidden');
                
                // Atualizar calendário
                if (typeof renderCalendarEvento === 'function') {
                    renderCalendarEvento();
                }
            });
        }
        
        // Controlar campos de evento especial
        document.querySelectorAll('input[name="tipoEvento"]').forEach(radio => {
            radio.addEventListener('change', function() {
                const campoPrecoEspecial = document.getElementById('campoPrecoEspecial');
                if (this.value === 'especial') {
                    campoPrecoEspecial?.classList.remove('hidden');
                } else {
                    campoPrecoEspecial?.classList.add('hidden');
                }
            });
        });
        
        document.querySelectorAll('input[name="tipoCriancaEvento"]').forEach(radio => {
            radio.addEventListener('change', function() {
                const campoPersonalizado = document.getElementById('campoPrecoPersonalizadoCrianca');
                if (this.value === 'personalizado') {
                    campoPersonalizado?.classList.remove('hidden');
                } else {
                    campoPersonalizado?.classList.add('hidden');
                }
            });
        });
        
        // Carregar preços atuais da API
        async function carregarPrecosAdmin() {
            try {
                const response = await fetch('/api/config/precos');
                if (response.ok) {
                    const dadosAPI = await response.json();
                    const precos = dadosAPI.precos || dadosAPI;
                    
                    console.log('📋 Preços carregados no admin:', precos);
                    
                    if (document.getElementById('precoInternaSexa')) document.getElementById('precoInternaSexa').value = precos.interna_sexta || 0;
                    if (document.getElementById('precoInternaSabado')) document.getElementById('precoInternaSabado').value = precos.interna_sabado || 0;
                    if (document.getElementById('precoExterna')) document.getElementById('precoExterna').value = precos.externa || 0;
                    
                    // Determinar tipo de criança
                    let tipoCrianca = '50';
                    if (precos.crianca_desconto === 0) tipoCrianca = 'gratuito';
                    else if (precos.crianca_desconto === -1) tipoCrianca = 'fixo';
                    else if (precos.crianca_desconto) tipoCrianca = precos.crianca_desconto.toString();
                    
                    const radioTipoCrianca = document.querySelector(`input[name="tipoCrianca"][value="${tipoCrianca}"]`);
                    if (radioTipoCrianca) {
                        radioTipoCrianca.checked = true;
                        // Mostrar campo preço fixo se necessário
                        if (tipoCrianca === 'fixo') {
                            document.getElementById('campoPrecoFixo')?.classList.remove('hidden');
                        }
                    }
                    
                    if (document.getElementById('precoFixoCrianca')) document.getElementById('precoFixoCrianca').value = precos.crianca_preco_fixo || 0;
                } else {
                    console.warn('⚠️ Não foi possível carregar preços da API');
                }
            } catch (error) {
                console.error('❌ Erro ao carregar preços:', error);
            }
        }
        
        // Carregar preços na inicialização
        carregarPrecosAdmin();
        
        // Renderizar eventos na inicialização
        renderizarEventos();
        
        // Renderizar eventos quando navegar para configurações
        navLinks.forEach(link => {
            if (link.getAttribute('href') === '#configuracoes') {
                link.addEventListener('click', function() {
                    setTimeout(() => {
                        renderizarEventos();
                    }, 100);
                });
            }
        });
        
        mobileNavLinks.forEach(link => {
            if (link.getAttribute('href') === '#configuracoes') {
                link.addEventListener('click', function() {
                    setTimeout(() => {
                        renderizarEventos();
                    }, 100);
                });
            }
        });
    }, 100);
});