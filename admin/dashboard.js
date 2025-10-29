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
    console.log('Dashboard carregado - usuário autenticado');

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
            sessionStorage.clear();
            localStorage.clear();
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
            console.log('📡 Navegando para:', sectionId);
            showSection(sectionId);
            
            if (sectionId === 'reservas') {
                console.log('📋 Abrindo seção de reservas');
                console.log('📊 Reservas disponíveis:', reservas.length);
                renderizarReservas();
            } else if (sectionId === 'configuracoes') {
                setTimeout(carregarMesas, 100);
            }
        });
    });

    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('href').substring(1);
            console.log('📡 Navegando para (mobile):', sectionId);
            showSection(sectionId);
            
            if (sectionId === 'reservas') {
                console.log('📋 Abrindo seção de reservas (mobile)');
                console.log('📊 Reservas disponíveis:', reservas.length);
                renderizarReservas();
            } else if (sectionId === 'configuracoes') {
                setTimeout(carregarMesas, 100);
            }
        });
    });

        // Gerenciamento de Reservas
    let reservas = [];
    let reservasFiltradas = [];

    const filtrosDOM = {
        data: document.getElementById('filtroData'),
        area: document.getElementById('filtroArea'),
        status: document.getElementById('filtroStatus'),
        busca: document.getElementById('buscaReserva')
    };
    const contadorReservas = document.getElementById('contadorReservas');
    const totalReservasSpan = document.getElementById('totalReservas');
    const limparFiltrosBtn = document.getElementById('limparFiltros');

    function obterValoresFiltros() {
        return {
            data: filtrosDOM.data?.value || '',
            area: filtrosDOM.area?.value || '',
            status: filtrosDOM.status?.value || '',
            busca: (filtrosDOM.busca?.value || '').trim().toLowerCase()
        };
    }

    function filtrosEstaoAtivos(valores = obterValoresFiltros()) {
        return Object.values(valores).some(valor => (valor || '').length > 0);
    }

    function atualizarResumoReservas(listaAtual = reservas, filtrosAtivos = filtrosEstaoAtivos()) {
        if (contadorReservas) contadorReservas.textContent = listaAtual.length;
        if (totalReservasSpan) totalReservasSpan.textContent = reservas.length;
        if (limparFiltrosBtn) {
            if (filtrosAtivos) {
                limparFiltrosBtn.classList.remove('hidden');
            } else {
                limparFiltrosBtn.classList.add('hidden');
            }
        }
    }

    function normalizarTexto(valor) {
        return (valor || '').toString().toLowerCase().trim();
    }

    function normalizarTelefone(valor) {
        return (valor || '').toString().replace(/\D/g, '');
    }

    const STATUS_OCUPAM_MESA = ['confirmado', 'pre-reserva'];
    const STATUS_CONTA_RECEITA = ['confirmado'];

    function normalizarNumeroMesa(valor) {
        const numero = parseInt(valor, 10);
        return Number.isInteger(numero) ? numero : null;
    }

    function statusBloqueiaMesa(status) {
        return STATUS_OCUPAM_MESA.includes((status || '').toLowerCase());
    }

    function statusContaReceita(status) {
        return STATUS_CONTA_RECEITA.includes((status || '').toLowerCase());
    }

    function obterMesasDaReserva(reserva = {}) {
        const mesasReserva = [];

        if (Array.isArray(reserva.mesasSelecionadas)) {
            reserva.mesasSelecionadas.forEach(numero => {
                const normalizado = normalizarNumeroMesa(numero);
                if (normalizado !== null) mesasReserva.push(normalizado);
            });
        }

        const mesaPrincipal = normalizarNumeroMesa(reserva.numeroMesa);
        if (mesaPrincipal !== null) mesasReserva.push(mesaPrincipal);

        const mesaExtra = normalizarNumeroMesa(reserva.mesaExtra);
        if (mesaExtra !== null) mesasReserva.push(mesaExtra);

        return [...new Set(mesasReserva)];
    }

    function getDescricaoMesas(reserva = {}) {
        const mesasReserva = obterMesasDaReserva(reserva);
        if (mesasReserva.length === 0) return '';
        if (mesasReserva.length === 1) return `Mesa ${mesasReserva[0]}`;
        return `Mesas ${mesasReserva.join(' + ')}`;
    }

    function totalPessoasReserva(reserva = {}) {
        return (parseInt(reserva.adultos, 10) || 0) + (parseInt(reserva.criancas, 10) || 0);
    }

    // Função para inicializar filtros
    function inicializarFiltros() {
        console.log('🔧 Inicializando filtros...');

        if (filtrosDOM.data) filtrosDOM.data.value = '';
        if (filtrosDOM.area) filtrosDOM.area.value = '';
        if (filtrosDOM.status) filtrosDOM.status.value = '';
        if (filtrosDOM.busca) filtrosDOM.busca.value = '';

        if (filtrosDOM.data) filtrosDOM.data.addEventListener('change', filtrarReservas);
        if (filtrosDOM.area) filtrosDOM.area.addEventListener('change', filtrarReservas);
        if (filtrosDOM.status) filtrosDOM.status.addEventListener('change', filtrarReservas);
        if (filtrosDOM.busca) filtrosDOM.busca.addEventListener('input', filtrarReservas);

        if (limparFiltrosBtn) {
            limparFiltrosBtn.addEventListener('click', () => {
                if (filtrosDOM.data) filtrosDOM.data.value = '';
                if (filtrosDOM.area) filtrosDOM.area.value = '';
                if (filtrosDOM.status) filtrosDOM.status.value = '';
                if (filtrosDOM.busca) filtrosDOM.busca.value = '';
                reservasFiltradas = [...reservas];
                renderizarReservas(reservas, { filtrosAtivos: false });
            });
        }
        
        console.log('✅ Filtros inicializados');
    }

    // Função para filtrar reservas
    function filtrarReservas() {
        const filtrosSelecionados = obterValoresFiltros();
        const buscaTexto = filtrosSelecionados.busca;
        const buscaTelefone = normalizarTelefone(buscaTexto);
        
        reservasFiltradas = reservas.filter(reserva => {
            const dataReserva = reserva.data || '';
            const areaReserva = normalizarTexto(reserva.area);
            const statusReserva = normalizarTexto(reserva.status);
            const nomeNormalizado = normalizarTexto(reserva.nome);
            const whatsappNormalizado = normalizarTexto(reserva.whatsapp);
            const whatsappNumeros = normalizarTelefone(reserva.whatsapp);

            const matchData = !filtrosSelecionados.data || verificarFiltroData(dataReserva, filtrosSelecionados.data);
            const matchArea = !filtrosSelecionados.area || areaReserva === filtrosSelecionados.area;
            const matchStatus = !filtrosSelecionados.status || statusReserva === filtrosSelecionados.status;
            const matchBusca = !buscaTexto || 
                nomeNormalizado.includes(buscaTexto) ||
                whatsappNormalizado.includes(buscaTexto) ||
                (buscaTelefone && whatsappNumeros.includes(buscaTelefone));

            return matchData && matchArea && matchStatus && matchBusca;
        });
        
        const filtrosAtivos = filtrosEstaoAtivos(filtrosSelecionados);
        console.log('🔍 FILTRADAS:', reservasFiltradas.length, 'de', reservas.length);
        
        renderizarReservas(filtrosAtivos ? reservasFiltradas : reservas, {
            filtros: filtrosSelecionados,
            filtrosAtivos
        });
    }


    // Verificar filtro de data
    function verificarFiltroData(dataReserva, filtro) {
        const hoje = new Date();
        const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
        
        const amanha = new Date(hoje);
        amanha.setDate(hoje.getDate() + 1);
        const amanhaStr = `${amanha.getFullYear()}-${String(amanha.getMonth() + 1).padStart(2, '0')}-${String(amanha.getDate()).padStart(2, '0')}`;
        
        if (!dataReserva) return false;
        
        switch(filtro) {
            case 'hoje':
                return dataReserva === hojeStr;
            case 'amanha':
                return dataReserva === amanhaStr;
            case 'semana':
                const fimSemana = new Date(hoje);
                fimSemana.setDate(hoje.getDate() + 7);
                const fimSemanaStr = `${fimSemana.getFullYear()}-${String(fimSemana.getMonth() + 1).padStart(2, '0')}-${String(fimSemana.getDate()).padStart(2, '0')}`;
                return dataReserva >= hojeStr && dataReserva <= fimSemanaStr;
            default:
                return true;
        }
    }

    // Renderizar lista de reservas
    function renderizarReservas(reservasList, opcoes = {}) {
        const listaReservas = document.getElementById('listaReservas');
        const estadoVazio = document.getElementById('estadoVazio');
        const filtrosSelecionados = opcoes.filtros || obterValoresFiltros();
        const filtrosAtivos = typeof opcoes.filtrosAtivos === 'boolean'
            ? opcoes.filtrosAtivos
            : filtrosEstaoAtivos(filtrosSelecionados);
        const listaParaRenderizar = Array.isArray(reservasList)
            ? reservasList
            : (filtrosAtivos ? reservasFiltradas : reservas);
        
        if (!listaReservas) return;

        if (listaParaRenderizar.length === 0) {
            if (estadoVazio) estadoVazio.classList.remove('hidden');
            listaReservas.innerHTML = '';
            atualizarResumoReservas(listaParaRenderizar, filtrosAtivos);
            return;
        }

        if (estadoVazio) estadoVazio.classList.add('hidden');
        console.log('🎨 RENDERIZANDO', listaParaRenderizar.length, 'RESERVAS');

        const htmlReservas = listaParaRenderizar.map(reserva => {
            const descricaoMesas = getDescricaoMesas(reserva);
            const precisaConfirmar = (reserva.status || '').toLowerCase() === 'pre-reserva';
            return `
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
                            ${descricaoMesas ? `<p class="text-muza-gold text-sm"><i class="fas fa-chair"></i> ${descricaoMesas}</p>` : ''}
                        </div>
                        <div>
                            <p class="text-muza-gold font-bold text-lg">R$ ${reserva.valor}</p>
                            ${reserva.cupom ? `<p class="text-green-400 text-xs"><i class="fas fa-ticket-alt"></i> ${reserva.cupom} (-${reserva.descontoCupom}%)</p>` : ''}
                        </div>
                        <div id="status-${reserva.id}"></div>
                        <div>
                            <button onclick="abrirModalReserva('${reserva.id}')" class="bg-muza-burgundy hover:bg-red-800 text-white px-2 py-1 rounded text-xs transition duration-300" title="Ver Detalhes">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                        <div class="flex space-x-2">
                            ${precisaConfirmar ? `
                                <button onclick="confirmarReserva('${reserva.id}')" class="bg-muza-gold hover:bg-opacity-90 text-muza-dark px-2 py-1 rounded text-xs font-bold transition duration-300" title="Confirmar pré-reserva">
                                    <i class="fas fa-check-circle"></i>
                                </button>
                            ` : ''}
                            <button onclick="abrirWhatsApp('${reserva.whatsapp}', '${reserva.nome}', '${reserva.id}')" class="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs transition duration-300" title="WhatsApp">
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
                        ${descricaoMesas ? `<p class="text-muza-gold font-bold mt-2"><i class="fas fa-chair mr-1"></i>${descricaoMesas}</p>` : ''}
                    </div>
                    
                    <!-- Valor -->
                    <div class="mb-4">
                        <div class="flex items-center mb-2">
                            <i class="fas fa-dollar-sign text-muza-gold mr-2"></i>
                            <span class="text-muza-gold text-xs font-bold uppercase tracking-wide">Valor</span>
                        </div>
                        <p class="text-muza-gold font-bold text-2xl">R$ ${reserva.valor}</p>
                        ${reserva.cupom ? `<p class="text-green-400 text-sm mt-1"><i class="fas fa-ticket-alt mr-1"></i>Cupom: ${reserva.cupom} (-${reserva.descontoCupom}%)</p>` : ''}
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
                        ${precisaConfirmar ? `
                            <div class="mb-3">
                                <button onclick="confirmarReserva('${reserva.id}')" class="w-full bg-muza-gold text-muza-dark py-3 px-4 rounded-lg font-bold font-raleway hover:bg-opacity-90 transition duration-300 flex items-center justify-center gap-2">
                                    <i class="fas fa-check-circle"></i>
                                    Confirmar Pré-reserva
                                </button>
                            </div>
                        ` : ''}
                        <div class="flex space-x-3">
                            <button onclick="abrirWhatsApp('${reserva.whatsapp}', '${reserva.nome}', '${reserva.id}')" class="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center">
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
        `;
        }).join('');
        
        listaReservas.innerHTML = htmlReservas;
        
        // Inserir dropdowns de status
        listaParaRenderizar.forEach(reserva => {
            const container = document.getElementById(`status-${reserva.id}`);
            if (container && typeof criarDropdownStatus === 'function') {
                const dropdown = criarDropdownStatus(reserva);
                container.appendChild(dropdown);
            }
        });
        
        atualizarResumoReservas(listaParaRenderizar, filtrosAtivos);
        console.log('✅ EXIBIDAS', listaParaRenderizar.length, 'RESERVAS NA PÁGINA');
    }

    // Funções auxiliares
    function formatarData(data) {
        if (!data) return '-';
        const parsed = new Date(`${data}T00:00:00`);
        if (Number.isNaN(parsed.getTime())) return '-';
        return parsed.toLocaleDateString('pt-BR');
    }

    function getAreaColor(area) {
        return area === 'interna' ? 'bg-blue-500 bg-opacity-20 text-blue-400' : 'bg-green-500 bg-opacity-20 text-green-400';
    }

    function getStatusColor(status) {
        switch((status || '').toLowerCase()) {
            case 'pago':
                return 'bg-green-500 bg-opacity-20 text-green-400';
            case 'confirmado':
            case 'confirmada':
                return 'bg-blue-500 bg-opacity-20 text-blue-300';
            case 'pre-reserva':
                return 'bg-yellow-500 bg-opacity-20 text-yellow-300';
            case 'pendente':
                return 'bg-yellow-500 bg-opacity-20 text-yellow-300';
            case 'reembolsado':
                return 'bg-orange-500 bg-opacity-20 text-orange-400';
            case 'cancelado':
                return 'bg-red-500 bg-opacity-20 text-red-400';
            default:
                return 'bg-gray-500 bg-opacity-20 text-gray-300';
        }
    }

    function getStatusText(status) {
        switch((status || '').toLowerCase()) {
            case 'pago':
                return 'PAGO';
            case 'confirmado':
            case 'confirmada':
                return 'CONFIRMADO';
            case 'pre-reserva':
                return 'PRÉ-RESERVA';
            case 'pendente':
                return 'PENDENTE';
            case 'reembolsado':
                return 'REEMBOLSADO';
            case 'cancelado':
                return 'CANCELADO';
            default:
                return 'SEM STATUS';
        }
    }

    function obterTimestampData(reserva) {
        if (!reserva || !reserva.data) return 0;
        const parsed = Date.parse(`${reserva.data}T00:00:00`);
        return Number.isNaN(parsed) ? 0 : parsed;
    }

    function obterTimestampCriacao(reserva) {
        if (!reserva || !reserva.dataCriacao) return 0;
        const parsed = Date.parse(reserva.dataCriacao);
        return Number.isNaN(parsed) ? 0 : parsed;
    }

    function ordenarReservas(lista) {
        return [...lista].sort((a, b) => {
            const dataB = obterTimestampData(b);
            const dataA = obterTimestampData(a);
            if (dataB === dataA) {
                return obterTimestampCriacao(b) - obterTimestampCriacao(a);
            }
            return dataB - dataA;
        });
    }



    // Configuração da API
    const API_BASE_URL = 'https://muzzajazz-production.up.railway.app/api';
    console.log('🔗 API URL:', API_BASE_URL);
    
    // Carregar reservas da API
    async function carregarReservas() {
        try {
            const response = await fetch(`${API_BASE_URL}/reservas`);
            if (response.ok) {
                const data = await response.json();
                const listaRecebida = Array.isArray(data.reservas) ? data.reservas : [];
                reservas = ordenarReservas(listaRecebida);
                console.log('✅ CARREGADAS', reservas.length, 'RESERVAS DO FIREBASE');
            } else {
                reservas = [];
            }
        } catch (error) {
            console.error('Erro:', error);
            reservas = [];
        }
        reservasFiltradas = [...reservas];
        if (filtrosEstaoAtivos()) {
            filtrarReservas();
        } else {
            renderizarReservas(reservas, { filtrosAtivos: false });
        }
        atualizarDashboard();
        atualizarRecebiveis();
    }

    // Função para abrir WhatsApp com mensagem estruturada
    window.abrirWhatsApp = function(whatsapp, nome, reservaId) {
        if (!whatsapp) {
            alert('Número de WhatsApp não disponível para esta reserva.');
            return;
        }
        const reserva = reservas.find(r => r.id === reservaId || r.nome === nome);
        if (!reserva) {
            // Fallback para mensagem simples
            const numeroLimpo = whatsapp.replace(/\D/g, '');
            const mensagem = `Olá ${nome}! Entramos em contato sobre sua reserva no Muzza Jazz Club.`;
            const mensagemCodificada = encodeURIComponent(mensagem);
            window.open(`https://wa.me/55${numeroLimpo}?text=${mensagemCodificada}`, '_blank');
            return;
        }
        
        const numeroLimpo = whatsapp.replace(/\D/g, '');
        const dataFormatada = formatarData(reserva.data);
        const areaTexto = reserva.area === 'interna' ? 'Área Interna' : 'Área Externa';
        const mesasDescricao = getDescricaoMesas(reserva);
        const mesaTexto = mesasDescricao ? `\n🪑 *${mesasDescricao}*` : '';
        const cupomTexto = reserva.cupom ? `\n🎟️ *Cupom:* ${reserva.cupom} (-${reserva.descontoCupom}%)` : '';
        
        const mensagem = `🎷 *MUZZA JAZZ CLUB* 🎷\n` +
            `━━━━━━━━━━━━━━━━━━━━\n\n` +
            `Olá *${reserva.nome}*! 👋\n\n` +
            `✅ *CONFIRMAÇÃO DE RESERVA*\n\n` +
            `📅 *Data:* ${dataFormatada}\n` +
            `📍 *Área:* ${areaTexto}${mesaTexto}\n` +
            `👥 *Pessoas:* ${reserva.adultos} adulto(s)${reserva.criancas > 0 ? ` + ${reserva.criancas} criança(s)` : ''}\n` +
            `💰 *Valor Total:* R$ ${reserva.valor}${cupomTexto}\n\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `💳 *PAGAMENTO VIA PIX*\n\n` +
            `*Chave PIX (CNPJ):*\n` +
            `📋 \`54.310.118/0001-74\`\n\n` +
            `*Favorecido:*\n` +
            `MUZZA JAZZ CLUB LTDA\n\n` +
            `⚠️ *Importante:*\n` +
            `• Envie o comprovante após o pagamento\n` +
            `• Sua reserva será confirmada após verificação\n\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `📍 *Localização:*\n` +
            `Rodovia GO 225, KM 02 - IPEC, Goiás\n` +
            `https://maps.app.goo.gl/hfSYWpn6ngNRAhNfA\n\n` +
            `📱 *Contato:* (62) 99838-0208\n\n` +
            `🎵 _"Aprecie a vida"_ 🎵`;
        
        const mensagemCodificada = encodeURIComponent(mensagem);
        window.open(`https://wa.me/55${numeroLimpo}?text=${mensagemCodificada}`, '_blank');
    };
    
    // Função para alterar status da reserva
    window.alterarStatus = async function(reservaId, novoStatus) {
        try {
            const response = await fetch(`${API_BASE_URL}/reservas/${reservaId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: novoStatus })
            });
            
            if (response.ok) {
                const reservaIndex = reservas.findIndex(r => r.id === reservaId);
                if (reservaIndex !== -1) {
                    reservas[reservaIndex].status = novoStatus;
                    const filtradaIndex = reservasFiltradas.findIndex(r => r.id === reservaId);
                    if (filtradaIndex !== -1) {
                        reservasFiltradas[filtradaIndex].status = novoStatus;
                    }
                }
                renderizarReservas();
            } else {
                alert('Erro ao atualizar status');
            }
        } catch (error) {
            console.error('Erro ao alterar status:', error);
            alert('Erro de conexão');
        }
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
                const response = await fetch(`${API_BASE_URL}/reservas/${reservaId}`, {
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
                const response = await fetch(`${API_BASE_URL}/reservas/${reservaId}`, {
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
    window.abrirModalReserva = async function(reservaId) {
        const reserva = reservas.find(r => r.id === reservaId);
        if (!reserva) return;

        const descricaoMesas = getDescricaoMesas(reserva);

        // Preencher dados no modal
        document.getElementById('modalNome').textContent = reserva.nome;
        document.getElementById('modalWhatsapp').textContent = reserva.whatsapp;
        document.getElementById('modalData').textContent = formatarData(reserva.data);
        document.getElementById('modalArea').textContent = reserva.area === 'interna' ? 'Área Interna' : 'Área Externa';
        document.getElementById('modalAdultos').textContent = reserva.adultos;
        document.getElementById('modalCriancas').textContent = reserva.criancas;
        
        // Carregar mesas disponíveis para a área da reserva
        const modalMesaContainer = document.getElementById('modalMesaContainer');
        const modalMesaSelect = document.getElementById('modalMesaSelect');
        
        const modalMesaExtraInfo = document.getElementById('modalMesaExtraInfo');
        if (modalMesaExtraInfo) {
            modalMesaExtraInfo.textContent = descricaoMesas || 'Sem mesa atribuída';
        }

        if (modalMesaSelect) {
            // Buscar mesas da área
            const mesasArea = mesas.filter(m => m.area === reserva.area && m.status === 'ativa');
            
            // Buscar reservas da mesma data para verificar disponibilidade
            const reservasMesmaData = reservas.filter(r => 
                r.data === reserva.data && 
                r.id !== reserva.id && 
                r.area === reserva.area &&
                statusBloqueiaMesa(r.status)
            );
            const mesasOcupadas = reservasMesmaData.flatMap(r => obterMesasDaReserva(r));
            const mesaPrincipalAtual = normalizarNumeroMesa(reserva.numeroMesa) ?? obterMesasDaReserva(reserva)[0] ?? null;
            
            // Preencher select
            modalMesaSelect.innerHTML = '<option value="">Sem mesa</option>' + 
                mesasArea.map(m => {
                    const numeroMesa = normalizarNumeroMesa(m.numero);
                    const ocupada = numeroMesa !== null && mesasOcupadas.includes(numeroMesa);
                    const selecionada = numeroMesa !== null && mesaPrincipalAtual === numeroMesa;
                    return `<option value="${m.numero}" ${selecionada ? 'selected' : ''} ${ocupada && !selecionada ? 'disabled' : ''}>
                        Mesa ${m.numero} (${m.capacidade}p) ${ocupada && !selecionada ? '- Ocupada' : ''}
                    </option>`;
                }).join('');
            
            modalMesaContainer.style.display = 'block';
        }
        document.getElementById('modalValor').textContent = `R$ ${reserva.valor}`;
        document.getElementById('modalStatus').textContent = getStatusText(reserva.status);
        document.getElementById('modalTransacao').textContent = reserva.transacaoId || '-';
        document.getElementById('modalDataPagamento').textContent = reserva.dataPagamento ? formatarData(reserva.dataPagamento) : '-';
        
        // Adicionar informação do cupom se existir
        const modalValorDiv = document.getElementById('modalValor').parentElement;
        const cupomInfo = modalValorDiv.querySelector('.cupom-info');
        if (cupomInfo) cupomInfo.remove();
        
        if (reserva.cupom) {
            const cupomP = document.createElement('p');
            cupomP.className = 'text-green-400 text-sm mt-1 cupom-info';
            cupomP.innerHTML = `<i class="fas fa-ticket-alt mr-1"></i>Cupom: ${reserva.cupom} (Desconto: ${reserva.descontoCupom}%)`;
            modalValorDiv.appendChild(cupomP);
        }
        
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

        // Configurar botão salvar mesa
        const btnSalvarMesa = document.getElementById('btnSalvarMesa');
        if (btnSalvarMesa) {
            btnSalvarMesa.onclick = async () => {
                const novaMesa = modalMesaSelect.value ? parseInt(modalMesaSelect.value) : null;
                try {
                    const response = await fetch(`${API_BASE_URL}/reservas/${reservaId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ numeroMesa: novaMesa })
                    });
                    
                    if (response.ok) {
                        reserva.numeroMesa = novaMesa;
                        const reservaIndex = reservas.findIndex(r => r.id === reservaId);
                        if (reservaIndex !== -1) reservas[reservaIndex].numeroMesa = novaMesa;
                        const filtradaIndex = reservasFiltradas.findIndex(r => r.id === reservaId);
                        if (filtradaIndex !== -1) reservasFiltradas[filtradaIndex].numeroMesa = novaMesa;
                        
                        alert('Mesa atualizada com sucesso!');
                        renderizarReservas();
                    } else {
                        alert('Erro ao atualizar mesa');
                    }
                } catch (error) {
                    console.error('Erro ao atualizar mesa:', error);
                    alert('Erro de conexão');
                }
            };
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
                <div class="grid grid-cols-7 gap-4 py-2 px-4 bg-muza-wood bg-opacity-20 rounded text-sm">
                    <div class="text-muza-cream">${formatarData(reserva.data)}</div>
                    <div class="text-muza-cream">${reserva.nome}</div>
                    <div class="text-muza-cream text-center">${reserva.numeroMesa || '-'}</div>
                    <div class="text-muza-cream">${(reserva.adultos || 0) + (reserva.criancas || 0)}</div>
                    <div class="text-muza-cream">${reserva.adultos || 0}A / ${reserva.criancas || 0}C</div>
                    <div class="text-muza-gold font-bold">R$ ${reserva.valor}${reserva.cupom ? '<br><span class="text-green-400 text-xs">' + reserva.cupom + '</span>' : ''}</div>
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
            doc.text('CLIENTE', 42, y);
            doc.text('MESA', 75, y);
            doc.text('PESSOAS', 95, y);
            doc.text('DETALHES', 115, y);
            doc.text('VALOR', 140, y);
            doc.text('STATUS', 165, y);
            y += 8;
            
            // Dados das reservas
            doc.setFont('helvetica', 'normal');
            dadosRelatorio.reservasDetalhadas.forEach(reserva => {
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
                
                doc.text(formatarData(reserva.data), 22, y);
                doc.text(reserva.nome.substring(0, 12), 42, y);
                doc.text(reserva.numeroMesa ? String(reserva.numeroMesa) : '-', 78, y);
                doc.text(String((reserva.adultos || 0) + (reserva.criancas || 0)), 95, y);
                doc.text(`${reserva.adultos || 0}A/${reserva.criancas || 0}C`, 115, y);
                doc.text(`R$ ${reserva.valor}`, 140, y);
                if (reserva.cupom) {
                    doc.setFontSize(6);
                    doc.text(reserva.cupom, 140, y + 3);
                    doc.setFontSize(8);
                }
                const statusTexto = (reserva.status || 'pago').toLowerCase() === 'reembolsado' ? 'REEMBOLSADO' : 'PAGO';
                doc.text(statusTexto, 165, y);
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
        console.log('💵 Calculando recebíveis...');
        const hoje = new Date();
        const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
        
        const receitaTotal = reservas.filter(r => r.status === 'pago').reduce((sum, r) => {
            const valor = typeof r.valor === 'string' ? parseFloat(r.valor.replace(',', '.')) : (r.valor || 0);
            return sum + valor;
        }, 0);
        
        const receitaHoje = reservas.filter(r => r.data === hojeStr && r.status === 'pago').reduce((sum, r) => {
            const valor = typeof r.valor === 'string' ? parseFloat(r.valor.replace(',', '.')) : (r.valor || 0);
            return sum + valor;
        }, 0);
        
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - hoje.getDay());
        const inicioSemanaStr = `${inicioSemana.getFullYear()}-${String(inicioSemana.getMonth() + 1).padStart(2, '0')}-${String(inicioSemana.getDate()).padStart(2, '0')}`;
        
        const receitaSemana = reservas.filter(r => r.data >= inicioSemanaStr && r.data <= hojeStr && r.status === 'pago').reduce((sum, r) => {
            const valor = typeof r.valor === 'string' ? parseFloat(r.valor.replace(',', '.')) : (r.valor || 0);
            return sum + valor;
        }, 0);
        
        const inicioMesStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-01`;
        const receitaMes = reservas.filter(r => r.data >= inicioMesStr && r.data <= hojeStr && r.status === 'pago').reduce((sum, r) => {
            const valor = typeof r.valor === 'string' ? parseFloat(r.valor.replace(',', '.')) : (r.valor || 0);
            return sum + valor;
        }, 0);
        
        console.log('💰 Recebíveis calculados:', { receitaTotal, receitaHoje, receitaSemana, receitaMes });
        return { receitaTotal, receitaHoje, receitaSemana, receitaMes };
    }
    
    function atualizarRecebiveis() {
        console.log('💳 Atualizando recebíveis...');
        const { receitaTotal, receitaHoje, receitaSemana, receitaMes } = calcularRecebiveis();
        
        const elemReceitaTotal = document.getElementById('receitaTotal');
        const elemReceitaHoje = document.getElementById('receitaHoje');
        const elemReceitaSemana = document.getElementById('receitaSemana');
        const elemReceitaMes = document.getElementById('receitaMes');
        
        if (elemReceitaTotal) elemReceitaTotal.textContent = `R$ ${receitaTotal.toFixed(2).replace('.', ',')}`;
        if (elemReceitaHoje) elemReceitaHoje.textContent = `R$ ${receitaHoje.toFixed(2).replace('.', ',')}`;
        if (elemReceitaSemana) elemReceitaSemana.textContent = `R$ ${receitaSemana.toFixed(2).replace('.', ',')}`;
        if (elemReceitaMes) elemReceitaMes.textContent = `R$ ${receitaMes.toFixed(2).replace('.', ',')}`;
        
        console.log('✅ Recebíveis atualizados');
    }
    
    function verificarPodeAlterarFrequencia() {
        const ultimaAlteracao = sessionStorage.getItem('ultima_alteracao_frequencia');
        const frequenciaAtual = sessionStorage.getItem('frequencia_recebimento') || 'mensal';
        
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
        sessionStorage.setItem('frequencia_recebimento', frequencia);
        sessionStorage.setItem('ultima_alteracao_frequencia', new Date().toISOString());
        alert('Configuração de recebimento salva com sucesso!');
    });
    
    // Carregar configuração salva
    const frequenciaSalva = sessionStorage.getItem('frequencia_recebimento') || 'mensal';
    const radioFrequencia = document.querySelector(`input[name="frequenciaRecebimento"][value="${frequenciaSalva}"]`);
    if (radioFrequencia) radioFrequencia.checked = true;
    
    // Gerenciamento de Mesas
    let mesas = [];
    
    // Carregar mesas do Firebase
    async function carregarMesas() {
        try {
            console.log('🔄 Carregando mesas de:', `${API_BASE_URL}/mesas`);
            const response = await fetch(`${API_BASE_URL}/mesas`);
            if (response.ok) {
                const data = await response.json();
                mesas = data.mesas || [];
                console.log('✅ Mesas carregadas:', mesas.length, mesas);
                atualizarResumoCapacidade();
                renderizarListaMesas();
            } else {
                console.error('❌ Erro na resposta:', response.status);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar mesas:', error);
            mesas = [];
        }
    }
    
    function salvarMesas() {
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
                const response = await fetch(`${API_BASE_URL}/mesas/${mesaId}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    alert('Mesa removida com sucesso!');
                    // Recarregar mesas do Firebase
                    await carregarMesas();
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
                // Não verificar duplicação ao editar - permitir manter o mesmo número
                const mesaAtual = mesas.find(m => m.id === mesaEditando);
                if (mesaAtual && mesaAtual.numero !== numeroMesa) {
                    // Só verificar se mudou o número
                    const mesaExistente = mesas.find(m => m.numero === numeroMesa && m.id !== mesaEditando);
                    if (mesaExistente) {
                        alert('Já existe outra mesa com este número!');
                        return;
                    }
                }
                
                // Atualizar no Firebase
                const response = await fetch(`${API_BASE_URL}/mesas/${mesaEditando}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(mesaData)
                });
                
                if (response.ok) {
                    mesaEditando = null;
                    const submitBtn = this.querySelector('button[type="submit"]');
                    submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Salvar Mesa';
                    submitBtn.className = 'w-full bg-muza-gold text-muza-dark font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition duration-300 font-raleway';
                    
                    alert('Mesa atualizada com sucesso!');
                    // Recarregar mesas do Firebase
                    await carregarMesas();
                } else {
                    alert('Erro ao atualizar mesa no Firebase');
                    return;
                }
            } else {
                // Verificar duplicação apenas ao criar nova mesa
                const mesaExistente = mesas.find(m => m.numero === numeroMesa);
                if (mesaExistente) {
                    alert('Já existe uma mesa com este número!');
                    return;
                }
                
                // Criar no Firebase
                const response = await fetch(`${API_BASE_URL}/mesas`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(mesaData)
                });
                
                if (response.ok) {
                    alert('Mesa adicionada com sucesso!');
                    // Recarregar mesas do Firebase
                    await carregarMesas();
                } else {
                    alert('Erro ao adicionar mesa no Firebase');
                    return;
                }
            }
            
            this.reset();
        } catch (error) {
            console.error('Erro ao salvar mesa:', error);
            alert('Erro de conexão com o servidor');
        }
    });
    
    // Inicializar sistema
    async function inicializarSistema() {
        console.log('🚀 Inicializando sistema...');
        await carregarMesas();
        await carregarReservas();
        console.log('✅ Sistema inicializado');
    }
    
    inicializarSistema();
    inicializarFiltros();

    // Mostrar nome do usuário
    const adminUser = sessionStorage.getItem('muzza_admin_user') || 'Admin';
    const elemAdminUser = document.getElementById('adminUser');
    if (elemAdminUser) elemAdminUser.textContent = adminUser;
    
    // Função para atualizar dashboard
    function atualizarDashboard() {
        console.log('📊 Atualizando dashboard...');
        const hoje = new Date();
        const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
        
        // Reservas hoje
        const reservasHoje = reservas.filter(r => r.data === hojeStr && r.status === 'pago');
        console.log('📅 Reservas hoje:', reservasHoje.length);
        
        // Receita hoje
        const receitaHoje = reservasHoje.reduce((sum, r) => {
            const valor = typeof r.valor === 'string' ? parseFloat(r.valor.replace(',', '.')) : (r.valor || 0);
            return sum + valor;
        }, 0);
        console.log('💰 Receita hoje:', receitaHoje);
        
        // Capacidade total das mesas
        const capacidadeTotal = mesas.filter(m => m.status === 'ativa').reduce((sum, m) => sum + (m.capacidade || 0), 0) || 100;
        
        // Ocupação
        const pessoasHoje = reservasHoje.reduce((sum, r) => sum + (r.adultos || 0) + (r.criancas || 0), 0);
        const ocupacao = capacidadeTotal > 0 ? Math.round((pessoasHoje / capacidadeTotal) * 100) : 0;
        
        // Atualizar elementos
        const elemReservasHoje = document.getElementById('reservasHoje');
        const elemReceitaHoje = document.getElementById('receitaHoje');
        const elemOcupacao = document.getElementById('ocupacao');
        
        if (elemReservasHoje) elemReservasHoje.textContent = reservasHoje.length;
        if (elemReceitaHoje) elemReceitaHoje.textContent = `R$ ${receitaHoje.toFixed(2).replace('.', ',')}`;
        if (elemOcupacao) elemOcupacao.textContent = `${ocupacao}%`;
        
        console.log('✅ Dashboard atualizado');
        
        // Atualizar próximas reservas
        atualizarProximasReservas();
        
        // Atualizar estatísticas da semana
        atualizarEstatisticasSemana();
    }
    
    // Função para atualizar estatísticas da semana
    function atualizarEstatisticasSemana() {
        console.log('📈 Atualizando estatísticas da semana...');
        const hoje = new Date();
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - hoje.getDay());
        const inicioSemanaStr = `${inicioSemana.getFullYear()}-${String(inicioSemana.getMonth() + 1).padStart(2, '0')}-${String(inicioSemana.getDate()).padStart(2, '0')}`;
        
        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(inicioSemana.getDate() + 6);
        const fimSemanaStr = `${fimSemana.getFullYear()}-${String(fimSemana.getMonth() + 1).padStart(2, '0')}-${String(fimSemana.getDate()).padStart(2, '0')}`;
        
        const reservasSemana = reservas.filter(r => {
            return r.data >= inicioSemanaStr && r.data <= fimSemanaStr && r.status === 'pago';
        });
        console.log('📊 Reservas da semana:', reservasSemana.length);
        
        const reservasInterna = reservasSemana.filter(r => r.area === 'interna');
        const reservasExterna = reservasSemana.filter(r => r.area === 'externa');
        
        const totalReservas = reservasSemana.length;
        const percInterna = totalReservas > 0 ? Math.round((reservasInterna.length / totalReservas) * 100) : 0;
        const percExterna = totalReservas > 0 ? Math.round((reservasExterna.length / totalReservas) * 100) : 0;
        
        const receitaTotal = reservasSemana.reduce((sum, r) => {
            const valor = typeof r.valor === 'string' ? parseFloat(r.valor.replace(',', '.')) : (r.valor || 0);
            return sum + valor;
        }, 0);
        
        const mediaDia = totalReservas > 0 ? Math.round(totalReservas / 7) : 0;
        
        const capacidadeTotal = mesas.filter(m => m.status === 'ativa').reduce((sum, m) => sum + (m.capacidade || 0), 0) || 100;
        const pessoasSemana = reservasSemana.reduce((sum, r) => sum + (r.adultos || 0) + (r.criancas || 0), 0);
        const ocupacaoMedia = capacidadeTotal > 0 ? Math.round((pessoasSemana / (capacidadeTotal * 7)) * 100) : 0;
        
        // Atualizar elementos
        const barraInterna = document.querySelector('.bg-muza-gold.h-2');
        const barraExterna = document.querySelector('.bg-muza-burgundy.h-2');
        const textoPercInterna = barraInterna?.parentElement.previousElementSibling.querySelector('.text-muza-gold');
        const textoPercExterna = barraExterna?.parentElement.previousElementSibling.querySelector('.text-muza-gold');
        
        if (barraInterna) barraInterna.style.width = `${percInterna}%`;
        if (barraExterna) barraExterna.style.width = `${percExterna}%`;
        if (textoPercInterna) textoPercInterna.textContent = `${percInterna}%`;
        if (textoPercExterna) textoPercExterna.textContent = `${percExterna}%`;
        
        if (!document.getElementById('dashboardSection')) return;
        
        const resumoElements = document.querySelectorAll('#dashboardSection .bg-muza-dark.bg-opacity-30.rounded-lg.p-4.mt-6 .text-muza-gold.font-bold.text-lg');
        if (resumoElements.length >= 4) {
            resumoElements[0].textContent = totalReservas;
            resumoElements[1].textContent = `R$ ${receitaTotal.toFixed(2).replace('.', ',')}`;
            resumoElements[2].textContent = mediaDia;
            resumoElements[3].textContent = `${ocupacaoMedia}%`;
        }
    }
    
    // Função para atualizar próximas reservas
    function atualizarProximasReservas() {
        console.log('📋 Atualizando próximas reservas...');
        const proximasReservasDiv = document.getElementById('proximasReservas');
        if (!proximasReservasDiv) return;
        
        const hoje = new Date();
        const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
        
        const proximas = reservas
            .filter(r => r.status === 'pago' && r.data >= hojeStr)
            .sort((a, b) => a.data.localeCompare(b.data))
            .slice(0, 5);
        
        console.log('📅 Próximas reservas:', proximas.length);
        
        if (proximas.length === 0) {
            proximasReservasDiv.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-calendar-times text-muza-gold text-4xl mb-4 opacity-50"></i>
                    <p class="text-muza-cream opacity-70 font-raleway">Nenhuma reserva encontrada</p>
                </div>
            `;
            return;
        }
        
        proximasReservasDiv.innerHTML = proximas.map(r => `
            <div class="bg-muza-dark bg-opacity-30 rounded-lg p-4 hover:bg-opacity-50 transition duration-300">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="text-muza-gold font-bold font-raleway">${r.nome}</h4>
                    <span class="text-muza-cream text-sm">${formatarData(r.data)}</span>
                </div>
                <div class="flex justify-between items-center text-sm">
                    <span class="text-muza-cream opacity-80">
                        <i class="fas fa-users mr-1"></i>${(r.adultos || 0) + (r.criancas || 0)} pessoas
                    </span>
                    <span class="text-muza-cream opacity-80">
                        <i class="fas fa-map-marker-alt mr-1"></i>${r.area === 'interna' ? 'Interna' : 'Externa'}
                    </span>
                </div>
            </div>
        `).join('');
    }
    

    
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
                    const response = await fetch(`${API_BASE_URL}/config/precos`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(precos)
                    });
                    
                    if (response.ok) {
                        console.log('✅ Preços salvos no Firebase via API');
                        
                        // Sinalizar atualização para o site principal
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
        let eventos = [];
        
        // Carregar eventos da API
        async function carregarEventosAdmin() {
            try {
                const response = await fetch(`${API_BASE_URL}/eventos`);
                if (response.ok) {
                    const data = await response.json();
                    eventos = data.eventos || [];
                    console.log('Eventos carregados no admin:', eventos);
                    renderizarEventos();
                } else {
                    console.warn('Erro ao carregar eventos da API');
                }
            } catch (error) {
                console.error('Erro ao carregar eventos:', error);
                // Fallback para sessionStorage
                eventos = JSON.parse(sessionStorage.getItem('muzza_eventos')) || [];
            }
        }
        
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
                        <i class="fas fa-calendar mr-1"></i>${evento.data.split('-').reverse().join('/')}
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
            document.getElementById('dataEventoDisplay').value = new Date(evento.data + 'T00:00:00').toLocaleDateString('pt-BR');
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
                    const response = await fetch(`${API_BASE_URL}/eventos/${eventoId}`, {
                        method: 'DELETE'
                    });
                    
                    if (response.ok) {
                        console.log('✅ Evento removido do Firebase via API');
                        
                        // Recarregar eventos da API para sincronizar
                        await carregarEventosAdmin();
                        
                        // Sinalizar atualização para o site principal
                        localStorage.setItem('eventos_updated', Date.now().toString());
                        
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
                
                // Salvar no Firebase via API PRIMEIRO
                try {
                    const response = await fetch(`${API_BASE_URL}/eventos`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(evento)
                    });
                    if (response.ok) {
                        console.log('✅ Evento salvo no Firebase via API');
                        
                        // Recarregar eventos da API para sincronizar
                        await carregarEventosAdmin();
                        
                        // Sinalizar atualização para o site principal
                        localStorage.setItem('eventos_updated', Date.now().toString());
                        
                        this.reset();
                        document.getElementById('campoPrecoEspecial')?.classList.add('hidden');
                        document.getElementById('campoPrecoPersonalizadoCrianca')?.classList.add('hidden');
                    } else {
                        console.warn('❌ Erro ao salvar no Firebase');
                        alert('Erro ao salvar evento no servidor');
                    }
                } catch (error) {
                    console.warn('❌ Erro ao salvar no Firebase:', error);
                    alert('Erro de conexão com o servidor');
                }
                
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
                const response = await fetch(`${API_BASE_URL}/config/precos`);
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
        
        // Carregar e renderizar eventos na inicialização
        carregarEventosAdmin();
        
        // Gerenciar cupons
        let cupons = [];
        
        async function carregarCupons() {
            try {
                const response = await fetch(`${API_BASE_URL}/cupons`);
                if (response.ok) {
                    const data = await response.json();
                    cupons = data.cupons || [];
                    renderizarCupons();
                }
            } catch (error) {
                console.error('Erro ao carregar cupons:', error);
            }
        }
        
        function renderizarCupons() {
            const listaCupons = document.getElementById('listaCupons');
            const estadoVazio = document.getElementById('estadoVazioCupons');
            
            if (!listaCupons) return;
            
            if (cupons.length === 0) {
                if (estadoVazio) estadoVazio.classList.remove('hidden');
                listaCupons.innerHTML = '<div id="estadoVazioCupons" class="text-center py-12"><i class="fas fa-ticket-alt text-muza-gold text-4xl mb-4 opacity-50"></i><p class="text-muza-cream opacity-70 font-raleway">Nenhum cupom cadastrado</p></div>';
                return;
            }
            
            if (estadoVazio) estadoVazio.classList.add('hidden');
            
            listaCupons.innerHTML = cupons.map(cupom => `
                <div class="hover:bg-muza-gold hover:bg-opacity-10 transition duration-300">
                    <div class="hidden md:block px-6 py-4">
                        <div class="grid grid-cols-5 gap-4 items-center">
                            <div class="font-bold text-muza-gold text-lg">${cupom.codigo}</div>
                            <div class="text-muza-cream font-bold">${cupom.desconto}%</div>
                            <div>
                                <span class="inline-block px-2 py-1 rounded text-xs font-bold ${
                                    cupom.ativo ? 'bg-green-500 bg-opacity-20 text-green-400' : 'bg-red-500 bg-opacity-20 text-red-400'
                                }">
                                    ${cupom.ativo ? 'ATIVO' : 'INATIVO'}
                                </span>
                            </div>
                            <div class="text-muza-cream text-sm">${cupom.criadoEm ? (cupom.criadoEm.seconds ? new Date(cupom.criadoEm.seconds * 1000).toLocaleDateString('pt-BR') : new Date(cupom.criadoEm).toLocaleDateString('pt-BR')) : '-'}</div>
                            <div class="flex space-x-2">
                                <button onclick="editarCupom('${cupom.id}')" class="bg-muza-burgundy hover:bg-red-800 text-white px-2 py-1 rounded text-xs transition duration-300" title="Editar">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="removerCupom('${cupom.id}')" class="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs transition duration-300" title="Remover">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="md:hidden bg-muza-wood bg-opacity-30 rounded-lg p-4 m-4 border border-muza-gold border-opacity-20">
                        <div class="flex justify-between items-center mb-3">
                            <h3 class="font-bold text-muza-gold text-lg">${cupom.codigo}</h3>
                            <span class="inline-block px-3 py-1 rounded text-sm font-bold ${
                                cupom.ativo ? 'bg-green-500 bg-opacity-20 text-green-400' : 'bg-red-500 bg-opacity-20 text-red-400'
                            }">
                                ${cupom.ativo ? 'ATIVO' : 'INATIVO'}
                            </span>
                        </div>
                        <p class="text-muza-cream mb-2">Desconto: <span class="font-bold text-muza-gold">${cupom.desconto}%</span></p>
                        <div class="flex space-x-3 mt-3">
                            <button onclick="editarCupom('${cupom.id}')" class="flex-1 bg-muza-burgundy hover:bg-red-800 text-white py-2 px-4 rounded-lg transition duration-300">
                                <i class="fas fa-edit mr-2"></i>Editar
                            </button>
                            <button onclick="removerCupom('${cupom.id}')" class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition duration-300">
                                <i class="fas fa-trash mr-2"></i>Remover
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
        let cupomEditando = null;
        
        window.editarCupom = function(cupomId) {
            const cupom = cupons.find(c => c.id === cupomId);
            if (!cupom) return;
            
            cupomEditando = cupomId;
            document.getElementById('codigoCupom').value = cupom.codigo;
            document.getElementById('descontoCupom').value = cupom.desconto;
            document.getElementById('statusCupom').value = cupom.ativo.toString();
            
            const submitBtn = document.querySelector('#formCupom button[type="submit"]');
            submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Atualizar Cupom';
            submitBtn.className = 'w-full bg-muza-burgundy text-muza-cream font-bold py-3 px-6 rounded-lg hover:bg-red-800 transition duration-300 font-raleway';
            
            document.getElementById('formCupom').scrollIntoView({ behavior: 'smooth' });
        };
        
        window.removerCupom = async function(cupomId) {
            if (confirm('Tem certeza que deseja remover este cupom?')) {
                try {
                    const response = await fetch(`${API_BASE_URL}/cupons/${cupomId}`, {
                        method: 'DELETE'
                    });
                    
                    if (response.ok) {
                        alert('Cupom removido com sucesso!');
                        await carregarCupons();
                    } else {
                        alert('Erro ao remover cupom');
                    }
                } catch (error) {
                    console.error('Erro ao remover cupom:', error);
                    alert('Erro de conexão com o servidor');
                }
            }
        };
        
        document.getElementById('formCupom')?.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const cupomData = {
                codigo: document.getElementById('codigoCupom').value.toUpperCase(),
                desconto: parseFloat(document.getElementById('descontoCupom').value),
                ativo: document.getElementById('statusCupom').value === 'true'
            };
            
            if (cupomEditando) {
                cupomData.id = cupomEditando;
            }
            
            try {
                const response = await fetch(`${API_BASE_URL}/cupons`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(cupomData)
                });
                
                if (response.ok) {
                    alert(cupomEditando ? 'Cupom atualizado com sucesso!' : 'Cupom adicionado com sucesso!');
                    cupomEditando = null;
                    
                    const submitBtn = this.querySelector('button[type="submit"]');
                    submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Salvar Cupom';
                    submitBtn.className = 'w-full bg-muza-gold text-muza-dark font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition duration-300 font-raleway';
                    
                    this.reset();
                    await carregarCupons();
                } else {
                    alert('Erro ao salvar cupom');
                }
            } catch (error) {
                console.error('Erro ao salvar cupom:', error);
                alert('Erro de conexão com o servidor');
            }
        });
        
        // Carregar cupons na inicialização
        carregarCupons();
        
        // Gerenciar mapas
        async function carregarMapas() {
            try {
                const response = await fetch(`${API_BASE_URL}/mapas`);
                if (response.ok) {
                    const data = await response.json();
                    const mapas = data.mapas || {};
                    
                    if (mapas.mapaInterno) {
                        mostrarPreview('Interno', mapas.mapaInterno);
                    }
                    if (mapas.mapaExterno) {
                        mostrarPreview('Externo', mapas.mapaExterno);
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar mapas:', error);
            }
        }
        
        function mostrarPreview(tipo, url) {
            const preview = document.getElementById('preview' + tipo);
            const img = document.getElementById('imgPreview' + tipo);
            if (url && preview && img) {
                img.src = url;
                preview.classList.remove('hidden');
            }
        }
        
        // Preview ao selecionar arquivo
        document.getElementById('uploadMapaInterno')?.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => mostrarPreview('Interno', e.target.result);
                reader.readAsDataURL(file);
            }
        });
        
        document.getElementById('uploadMapaExterno')?.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => mostrarPreview('Externo', e.target.result);
                reader.readAsDataURL(file);
            }
        });
        
        document.getElementById('formMapas')?.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const uploadInterno = document.getElementById('uploadMapaInterno').files[0];
            const uploadExterno = document.getElementById('uploadMapaExterno').files[0];
            
            if (!uploadInterno && !uploadExterno) {
                alert('Selecione pelo menos uma imagem para fazer upload');
                return;
            }
            
            try {
                // Upload mapa interno
                if (uploadInterno) {
                    const formData = new FormData();
                    formData.append('mapa', uploadInterno);
                    formData.append('area', 'interno');
                    
                    const response = await fetch(`${API_BASE_URL}/storage/upload-mapa`, {
                        method: 'POST',
                        body: formData
                    });
                    
                    if (!response.ok) {
                        throw new Error('Erro ao fazer upload do mapa interno');
                    }
                }
                
                // Upload mapa externo
                if (uploadExterno) {
                    const formData = new FormData();
                    formData.append('mapa', uploadExterno);
                    formData.append('area', 'externo');
                    
                    const response = await fetch(`${API_BASE_URL}/storage/upload-mapa`, {
                        method: 'POST',
                        body: formData
                    });
                    
                    if (!response.ok) {
                        throw new Error('Erro ao fazer upload do mapa externo');
                    }
                }
                
                alert('Mapas salvos com sucesso!');
                await carregarMapas();
            } catch (error) {
                console.error('Erro ao salvar mapas:', error);
                alert('Erro: ' + error.message);
            }
        });
        
        // Carregar mapas na inicialização
        carregarMapas();
        
        // Gerenciar bloqueios
        let bloqueios = [];
        
        async function carregarBloqueios() {
            try {
                const response = await fetch(`${API_BASE_URL}/bloqueios`);
                if (response.ok) {
                    const data = await response.json();
                    bloqueios = data.bloqueios || [];
                    renderizarBloqueios();
                }
            } catch (error) {
                console.error('Erro ao carregar bloqueios:', error);
            }
        }
        
        function renderizarBloqueios() {
            const lista = document.getElementById('listaBloqueios');
            if (!lista) return;
            
            const bloqueiosAtivos = bloqueios.filter(b => b.bloqueado);
            
            if (bloqueiosAtivos.length === 0) {
                lista.innerHTML = '<p class="text-muza-cream text-sm opacity-70">Nenhuma data bloqueada</p>';
                return;
            }
            
            lista.innerHTML = bloqueiosAtivos.map(b => `
                <div class="flex justify-between items-center bg-muza-wood bg-opacity-30 p-3 rounded">
                    <span class="text-muza-cream">${new Date(b.data + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                    <button onclick="desbloquearData('${b.data}')" class="text-red-400 hover:text-red-300">
                        <i class="fas fa-unlock"></i>
                    </button>
                </div>
            `).join('');
        }
        
        const btnBloquear = document.getElementById('btnBloquear');
        console.log('🔍 btnBloquear encontrado:', btnBloquear);
        
        if (btnBloquear) {
            btnBloquear.addEventListener('click', async function() {
                console.log('🔒 Botão bloquear clicado');
                const data = document.getElementById('dataBloqueio').value;
                console.log('📅 Data selecionada:', data);
                
                if (!data) return alert('Selecione uma data');
                
                try {
                    console.log('📡 Enviando requisição para:', `${API_BASE_URL}/bloqueios`);
                    const response = await fetch(`${API_BASE_URL}/bloqueios`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ data, bloqueado: true })
                    });
                    
                    console.log('📶 Resposta:', response.status);
                    
                    if (response.ok) {
                        alert('Data bloqueada com sucesso!');
                        await carregarBloqueios();
                        document.getElementById('dataBloqueio').value = '';
                    } else {
                        const error = await response.text();
                        console.error('❌ Erro na resposta:', error);
                        alert('Erro ao bloquear data: ' + error);
                    }
                } catch (error) {
                    console.error('❌ Erro:', error);
                    alert('Erro ao bloquear data: ' + error.message);
                }
            });
        }
        
        const btnDesbloquear = document.getElementById('btnDesbloquear');
        console.log('🔍 btnDesbloquear encontrado:', btnDesbloquear);
        
        if (btnDesbloquear) {
            btnDesbloquear.addEventListener('click', async function() {
                console.log('🔓 Botão desbloquear clicado');
                const data = document.getElementById('dataBloqueio').value;
                console.log('📅 Data selecionada:', data);
                
                if (!data) return alert('Selecione uma data');
                
                try {
                    console.log('📡 Enviando requisição para:', `${API_BASE_URL}/bloqueios`);
                    const response = await fetch(`${API_BASE_URL}/bloqueios`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ data, bloqueado: false })
                    });
                    
                    console.log('📶 Resposta:', response.status);
                    
                    if (response.ok) {
                        alert('Data desbloqueada com sucesso!');
                        await carregarBloqueios();
                        document.getElementById('dataBloqueio').value = '';
                    } else {
                        const error = await response.text();
                        console.error('❌ Erro na resposta:', error);
                        alert('Erro ao desbloquear data: ' + error);
                    }
                } catch (error) {
                    console.error('❌ Erro:', error);
                    alert('Erro ao desbloquear data: ' + error.message);
                }
            });
        }
        
        window.desbloquearData = async function(data) {
            if (confirm('Desbloquear esta data?')) {
                try {
                    const response = await fetch(`${API_BASE_URL}/bloqueios`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ data, bloqueado: false })
                    });
                    
                    if (response.ok) {
                        await carregarBloqueios();
                    }
                } catch (error) {
                    console.error('Erro:', error);
                }
            }
        };
        
        carregarBloqueios();

    }, 100);
});
