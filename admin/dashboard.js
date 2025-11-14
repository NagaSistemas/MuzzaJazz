// Dashboard funcional sem duplicar config Tailwind

(function() {

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
const resolveApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
        if (window.MUZZA_API_BASE_URL) return window.MUZZA_API_BASE_URL;
        if (window.API_BASE_URL && typeof window.API_BASE_URL === 'string') return window.API_BASE_URL;

        const hasConfig = typeof window.API_CONFIG === 'object' && window.API_CONFIG !== null;
        const hostname = (window.location && window.location.hostname) || '';
        const isHttps = window.location && window.location.protocol === 'https:';
        const isProductionHost = hostname.includes('muzzajazz.com.br') || hostname.includes('railway.app') || isHttps;

        if (hasConfig) {
            const envUrl = isProductionHost ? window.API_CONFIG.production : window.API_CONFIG.development;
            if (envUrl) return envUrl;
        }

        if (!isProductionHost) {
            return 'http://localhost:3001/api';
        }
    }
    return 'https://muzzajazz-production.up.railway.app/api';
};

const API_BASE_URL = resolveApiBaseUrl();
window.__MUZZA_DASHBOARD_API__ = API_BASE_URL;

let mesas = Array.isArray(window.__MUZZA_DASHBOARD_MESAS__) ? window.__MUZZA_DASHBOARD_MESAS__ : [];
window.__MUZZA_DASHBOARD_MESAS__ = mesas;

console.log('Sistema usando backend Firebase API', API_BASE_URL);

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
    const agendaCalendar = document.getElementById('agendaCalendarDays');
    const agendaPrevBtn = document.getElementById('agendaPrev');
    const agendaNextBtn = document.getElementById('agendaNext');
    const agendaHojeBtn = document.getElementById('agendaHoje');
    const agendaDataInput = document.getElementById('agendaData');
    const btnAbrirDia = document.getElementById('btnAbrirDia');
    const btnFecharDia = document.getElementById('btnFecharDia');

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
                setTimeout(() => {
                    window.carregarMesas?.();
                    window.carregarBloqueiosAgenda?.();
                }, 100);
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
                setTimeout(() => {
                    window.carregarMesas?.();
                    window.carregarBloqueiosAgenda?.();
                }, 100);
            }
        });
    });


    if (!window.__agendaListenersBound) {
        window.__agendaListenersBound = true;

        if (agendaDataInput) {
            const hojeISO = normalizarDataISO(new Date());
            agendaDataInput.min = hojeISO;
            if (!agendaDataInput.value) {
                agendaDataInput.value = hojeISO;
            }
        }

        const alterarMesAgenda = (delta) => {
            agendaMesAtual += delta;
            while (agendaMesAtual < 0) {
                agendaMesAtual += 12;
                agendaAnoAtual -= 1;
            }
            while (agendaMesAtual > 11) {
                agendaMesAtual -= 12;
                agendaAnoAtual += 1;
            }
            renderAgendaCalendar();
        };

        if (agendaPrevBtn) {
            agendaPrevBtn.onclick = () => alterarMesAgenda(-1);
        }
        if (agendaNextBtn) {
            agendaNextBtn.onclick = () => alterarMesAgenda(1);
        }

        if (agendaHojeBtn) {
            agendaHojeBtn.onclick = () => {
                const agora = new Date();
                agendaMesAtual = agora.getMonth();
                agendaAnoAtual = agora.getFullYear();
                if (agendaDataInput) {
                    agendaDataInput.value = normalizarDataISO(agora);
                }
                renderAgendaCalendar();
            };
        }

        if (agendaCalendar) {
            agendaCalendar.onclick = (event) => {
                const alvo = event.target.closest('[data-agenda-date]');
                if (!alvo) return;
                const dataISO = alvo.getAttribute('data-agenda-date');
                const bloqueado = alvo.getAttribute('data-agenda-status') === 'closed';
                atualizarDiaAgenda(dataISO, !bloqueado);
            };
        }

        const listaAgendaFechados = document.getElementById('agendaListaFechados');
        if (listaAgendaFechados) {
            listaAgendaFechados.onclick = (event) => {
                const alvo = event.target.closest('[data-agenda-reabrir]');
                if (!alvo) return;
                const dataISO = alvo.getAttribute('data-agenda-reabrir');
                atualizarDiaAgenda(dataISO, false);
            };
        }

        if (btnAbrirDia) {
            btnAbrirDia.onclick = () => {
                atualizarDiaAgenda(agendaDataInput?.value, false);
            };
        }

        if (btnFecharDia) {
            btnFecharDia.onclick = () => {
                atualizarDiaAgenda(agendaDataInput?.value, true);
            };
        }
    }
    });

        // Gerenciamento de Reservas
    let reservas = [];
    let reservasFiltradas = [];
    const RESERVAS_CACHE_KEY = 'muzza_admin_reservas_cache';

    function obterReservasDoCache() {
        try {
            const armazenadas = sessionStorage.getItem(RESERVAS_CACHE_KEY);
            if (!armazenadas) return [];
            const parsed = JSON.parse(armazenadas);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.warn('Erro ao ler cache de reservas:', error);
            return [];
        }
    }

    function salvarReservasNoCache(lista = []) {
        try {
            sessionStorage.setItem(RESERVAS_CACHE_KEY, JSON.stringify(lista));
        } catch (error) {
            console.warn('Erro ao salvar cache de reservas:', error);
        }
    }

    const STATUS_CANCELADOS = ['cancelado', 'reembolsado'];
    const STATUS_CONFIRMADOS = ['pago', 'confirmado', 'confirmada'];

    function isReservaAtiva(reserva = {}) {
        const status = (reserva.status || '').toLowerCase();
        if (!status) return true;
        return !STATUS_CANCELADOS.includes(status);
    }

    function isReservaConfirmada(reserva = {}) {
        const status = (reserva.status || '').toLowerCase();
        return STATUS_CONFIRMADOS.includes(status);
    }

    function getStatusBadgeColor(reserva = {}) {
        if (isReservaConfirmada(reserva)) return 'green';
        const status = (reserva.status || '').toLowerCase();
        if (STATUS_CANCELADOS.includes(status)) return 'red';
        return 'orange';
    }

    function getValorReserva(reserva = {}) {
        const valor = reserva.valor;
        if (typeof valor === 'number') return valor;
        if (typeof valor === 'string') {
            const parsed = parseFloat(valor.replace(',', '.'));
            return Number.isFinite(parsed) ? parsed : 0;
        }
        return 0;
    }

    const filtrosDOM = {
        data: document.getElementById('filtroData'),
        area: document.getElementById('filtroArea'),
        status: document.getElementById('filtroStatus'),
        busca: document.getElementById('buscaReserva')
    };
    const contadorReservas = document.getElementById('contadorReservas');
    const totalReservasSpan = document.getElementById('totalReservasCarregadas');
    const limparFiltrosBtn = document.getElementById('limparFiltros');
    const listaReservasContainer = document.getElementById('listaReservas');

    const reservasCacheInicial = obterReservasDoCache();
    if (reservasCacheInicial.length) {
        reservas = ordenarReservas(reservasCacheInicial);
        reservasFiltradas = [...reservas];
        renderizarReservas(reservas, { filtrosAtivos: false });
        atualizarDashboard();
    }

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

    function normalizarDataISO(valor) {
        if (!valor) return '';
        if (valor instanceof Date) {
            return `${valor.getFullYear()}-${String(valor.getMonth() + 1).padStart(2, '0')}-${String(valor.getDate()).padStart(2, '0')}`;
        }
        const texto = valor.toString().trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
            return texto;
        }
        const parsed = new Date(texto);
        if (Number.isNaN(parsed.getTime())) return '';
        return normalizarDataISO(parsed);
    }

    function formatarMoeda(valor = 0) {
        const numero = Number(valor) || 0;
        return `R$ ${numero.toFixed(2).replace('.', ',')}`;
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
    
    function mesasDescricaoTexto(reserva = {}) {
        const descricao = getDescricaoMesas(reserva);
        if (descricao) return descricao.replace(/\s+/g, ' ').trim();
        if (reserva.numeroMesa) return `Mesa ${reserva.numeroMesa}`;
        return '-';
    }

    function totalPessoasReserva(reserva = {}) {
        return (parseInt(reserva.adultos, 10) || 0) + (parseInt(reserva.criancas, 10) || 0);
    }

    if (listaReservasContainer) {
        listaReservasContainer.addEventListener('click', handleCliqueAcaoReserva);
    }

    function handleCliqueAcaoReserva(event) {
        const botao = event.target.closest('[data-reserva-action]');
        if (!botao) return;
        event.preventDefault();
        const reservaId = botao.dataset.id;
        const acao = botao.dataset.reservaAction;

        switch (acao) {
            case 'view':
                if (typeof window.abrirModalReserva === 'function') {
                    window.abrirModalReserva(reservaId);
                }
                break;
            case 'confirm':
                if (typeof window.confirmarReserva === 'function') {
                    window.confirmarReserva(reservaId);
                }
                break;
            case 'whatsapp':
                if (typeof window.abrirWhatsApp === 'function') {
                    window.abrirWhatsApp(botao.dataset.whatsapp || '', botao.dataset.nome || '', reservaId);
                }
                break;
            case 'delete':
                if (botao.dataset.canDelete !== 'true') {
                    alert('Esta reserva só pode ser apagada 1 dia após a data agendada.');
                    return;
                }
                apagarReserva(reservaId);
                break;
            default:
                break;
        }
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
        const listaReservas = listaReservasContainer;
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
            const nomeCompleto = getNomeCompleto(reserva);
            const nomeCompletoEscapado = nomeCompleto.replace(/'/g, "\\'");
            const nomeCompletoDataset = nomeCompleto.replace(/"/g, '&quot;');
            const whatsappDataset = (reserva.whatsapp || '').replace(/"/g, '&quot;');
            const descricaoMesas = getDescricaoMesas(reserva);
            const precisaConfirmar = (reserva.status || '').toLowerCase() === 'pre-reserva';
            const podeApagar = podeApagarReserva(reserva);
            const classeApagar = podeApagar ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-400 cursor-not-allowed';
            const tooltipApagar = podeApagar ? 'Apagar' : 'Disponível após 1 dia da reserva';
            return `
            <div class="hover:bg-muza-gold hover:bg-opacity-10 transition duration-300">
                <!-- Desktop Layout -->
                <div class="hidden md:block px-6 py-4">
                    <div class="grid grid-cols-8 gap-4 items-center">
                        <div>
                            <p class="font-bold text-muza-cream font-raleway">${nomeCompleto}</p>
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
                        <div id="status-${reserva.id}" class="status-container"></div>
                        <div>
                            <button data-reserva-action="view" data-id="${reserva.id}" class="bg-muza-burgundy hover:bg-red-800 text-white px-2 py-1 rounded text-xs transition duration-300" title="Ver Detalhes">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                        <div class="flex space-x-2">
                            ${precisaConfirmar ? `
                                <button data-reserva-action="confirm" data-id="${reserva.id}" class="bg-muza-gold hover:bg-opacity-90 text-muza-dark px-2 py-1 rounded text-xs font-bold transition duration-300" title="Confirmar pré-reserva">
                                    <i class="fas fa-check-circle"></i>
                                </button>
                            ` : ''}
                            <button data-reserva-action="whatsapp" data-id="${reserva.id}" data-whatsapp="${whatsappDataset}" data-nome="${nomeCompletoDataset}" class="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs transition duration-300" title="WhatsApp">
                                <i class="fab fa-whatsapp"></i>
                            </button>
                            <button data-reserva-action="delete" data-id="${reserva.id}" data-can-delete="${podeApagar ? 'true' : 'false'}" class="${classeApagar} text-white px-2 py-1 rounded text-xs transition duration-300" title="${tooltipApagar}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Mobile Layout -->
                <div class="md:hidden reservas-mobile-card bg-muza-wood bg-opacity-30 rounded-lg p-4 mb-4 border border-muza-gold border-opacity-20">
                    <div class="reservas-mobile-header">
                        <div>
                            <span class="reservas-mobile-label"><i class="fas fa-user mr-2"></i>Cliente</span>
                            <h3 class="font-bold text-muza-cream font-raleway text-lg">${nomeCompleto}</h3>
                            <p class="text-muza-cream text-sm opacity-80 break-all">${reserva.whatsapp}</p>
                        </div>
                        <span class="reservas-mobile-status inline-flex items-center justify-center px-3 py-2 rounded text-xs font-bold ${getStatusColor(reserva.status)}">
                            ${getStatusText(reserva.status)}
                        </span>
                    </div>
                    <div class="reservas-mobile-grid">
                        <div class="reservas-mobile-info">
                            <span class="reservas-mobile-label"><i class="fas fa-calendar mr-2"></i>Data</span>
                            <p class="text-muza-cream font-bold">${formatarData(reserva.data)}</p>
                        </div>
                        <div class="reservas-mobile-info">
                            <span class="reservas-mobile-label"><i class="fas fa-map-marker-alt mr-2"></i>??rea</span>
                            <span class="inline-block px-3 py-1 rounded text-sm font-bold ${getAreaColor(reserva.area)}">
                                ${reserva.area === 'interna' ? 'INTERNA' : 'EXTERNA'}
                            </span>
                        </div>
                        <div class="reservas-mobile-info">
                            <span class="reservas-mobile-label"><i class="fas fa-users mr-2"></i>Pessoas</span>
                            <p class="text-muza-cream font-bold">${reserva.adultos} ${reserva.adultos === 1 ? 'adulto' : 'adultos'}</p>
                            ${reserva.criancas > 0 ? `<p class="text-muza-cream text-sm opacity-80">${reserva.criancas} ${reserva.criancas === 1 ? 'crian??a' : 'crian??as'}</p>` : ''}
                            ${descricaoMesas ? `<p class="text-muza-gold font-bold mt-2 flex items-center gap-1 text-sm"><i class="fas fa-chair"></i>${descricaoMesas}</p>` : ''}
                        </div>
                        <div class="reservas-mobile-info">
                            <span class="reservas-mobile-label"><i class="fas fa-dollar-sign mr-2"></i>Valor previsto</span>
                            <p class="text-muza-gold font-bold text-2xl">R$ ${reserva.valor}</p>
                            ${reserva.cupom ? `<p class="text-green-400 text-xs mt-1 flex items-center gap-1"><i class="fas fa-ticket-alt"></i>Cupom: ${reserva.cupom} (-${reserva.descontoCupom}%)</p>` : ''}
                        </div>
                    </div>
                    <div class="reservas-mobile-actions border-t border-muza-gold border-opacity-20 pt-4">
                        <span class="reservas-mobile-label mb-2"><i class="fas fa-cog mr-2"></i>A????es Ropidas</span>
                        <button data-reserva-action="view" data-id="${reserva.id}" class="reservas-mobile-action-button bg-muza-burgundy hover:bg-red-800 text-white">
                            <i class="fas fa-eye mr-2"></i>
                            Ver Detalhes
                        </button>
                        ${precisaConfirmar ? `
                            <button data-reserva-action="confirm" data-id="${reserva.id}" class="reservas-mobile-action-button bg-muza-gold text-muza-dark hover:bg-opacity-90 font-bold">
                                <i class="fas fa-check-circle mr-2"></i>
                                Confirmar Pr?-reserva
                            </button>
                        ` : ''}
                        <div class="reservas-mobile-actions-row">
                            <button data-reserva-action="whatsapp" data-id="${reserva.id}" data-whatsapp="${whatsappDataset}" data-nome="${nomeCompletoDataset}" class="reservas-mobile-action-button bg-green-600 hover:bg-green-700 text-white">
                                <i class="fab fa-whatsapp mr-2"></i>
                                WhatsApp
                            </button>
                            <button data-reserva-action="delete" data-id="${reserva.id}" data-can-delete="${podeApagar ? 'true' : 'false'}" class="reservas-mobile-action-button ${classeApagar} text-white">
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
        
        // Inserir dropdowns de status - SEMPRE usar dropdown, nunca texto estático
        setTimeout(() => {
            listaParaRenderizar.forEach(reserva => {
                const container = document.getElementById(`status-${reserva.id}`);
                if (container) {
                    // SEMPRE limpar e recriar o dropdown
                    container.innerHTML = '';
                    
                    if (typeof window.criarDropdownStatus === 'function') {
                        const dropdown = window.criarDropdownStatus(reserva);
                        container.appendChild(dropdown);
                        console.log(`✅ Dropdown criado para reserva ${reserva.id} com status: ${reserva.status}`);
                    } else {
                        // Se a função não existir, criar dropdown manualmente
                        console.warn('⚠️ Função criarDropdownStatus não encontrada, criando dropdown manual');
                        const select = document.createElement('select');
                        select.className = 'px-2 py-1 bg-muza-dark border border-muza-gold border-opacity-30 rounded text-muza-cream text-sm focus:border-muza-gold focus:outline-none w-full';
                        
                        const opcoes = [
                            { value: 'pre-reserva', label: 'Pré-reserva' },
                            { value: 'confirmado', label: 'Confirmado' },
                            { value: 'cancelado', label: 'Cancelado' }
                        ];
                        
                        const statusAtual = (reserva.status || 'pre-reserva').toLowerCase();
                        
                        opcoes.forEach(opt => {
                            const option = document.createElement('option');
                            option.value = opt.value;
                            option.textContent = opt.label;
                            option.selected = statusAtual === opt.value;
                            select.appendChild(option);
                        });
                        
                        select.addEventListener('change', async function() {
                            const novoStatus = this.value;
                            if (confirm(`Alterar status para "${this.options[this.selectedIndex].text}"?`)) {
                                try {
                                    const response = await fetch(`${API_BASE_URL}/reservas/${reserva.id}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ status: novoStatus })
                                    });
                                    
                                    if (response.ok) {
                                        alert('Status atualizado com sucesso!');
                                        if (typeof carregarReservas === 'function') {
                                            carregarReservas();
                                        }
                                    } else {
                                        alert('Erro ao atualizar status');
                                        this.value = statusAtual;
                                    }
                                } catch (error) {
                                    console.error('Erro:', error);
                                    alert('Erro de conexão');
                                    this.value = statusAtual;
                                }
                            } else {
                                this.value = statusAtual;
                            }
                        });
                        
                        container.appendChild(select);
                    }
                }
            });
        }, 100);
        
        atualizarResumoReservas(listaParaRenderizar, filtrosAtivos);
        console.log('✅ EXIBIDAS', listaParaRenderizar.length, 'RESERVAS NA PÁGINA');
    }

    // Funções auxiliares
    function formatarData(data) {
        const iso = normalizarDataISO(data);
        if (!iso) return '-';
        const parsed = new Date(`${iso}T00:00:00`);
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

    function getNomeCompleto(reserva = {}) {
        const nome = (reserva.nome || '').trim();
        const sobrenome = (reserva.sobrenome || '').trim();
        if (nome && sobrenome) return `${nome} ${sobrenome}`;
        return nome || sobrenome || 'Cliente sem nome';
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



    async function carregarMesas() {
        try {
            console.log('📥 Carregando mesas de:', `${API_BASE_URL}/mesas`);
            const response = await fetch(`${API_BASE_URL}/mesas`);
            if (response.ok) {
                const data = await response.json();
                mesas = data.mesas || [];
                console.log('✅ Mesas carregadas:', mesas.length);
                atualizarResumoCapacidade();
                renderizarListaMesas();
            } else {
                console.error('❌ Erro ao buscar mesas:', response.status);
                mesas = [];
            }
        } catch (error) {
            console.error('❌ Erro ao carregar mesas:', error);
            mesas = [];
        }
    }
    window.carregarMesas = carregarMesas;

    function atualizarResumoCapacidade() {
        const mesasInterna = mesas.filter(m => m.area === 'interna' && m.status === 'ativa');
        const mesasExterna = mesas.filter(m => m.area === 'externa' && m.status === 'ativa');

        const capacidadeInterna = mesasInterna.reduce((sum, m) => sum + (m.capacidade || 0), 0);
        const capacidadeExterna = mesasExterna.reduce((sum, m) => sum + (m.capacidade || 0), 0);
        const capacidadeTotal = capacidadeInterna + capacidadeExterna;

        const totalInternaEl = document.getElementById('totalMesasInterna');
        const capInternaEl = document.getElementById('capacidadeInterna');
        const ativasInternaEl = document.getElementById('mesasAtivasInterna');
        const totalExternaEl = document.getElementById('totalMesasExterna');
        const capExternaEl = document.getElementById('capacidadeExterna');
        const ativasExternaEl = document.getElementById('mesasAtivasExterna');
        const capTotalEl = document.getElementById('capacidadeTotal');

        if (totalInternaEl) totalInternaEl.textContent = `${mesasInterna.length} mesas`;
        if (capInternaEl) capInternaEl.textContent = `${capacidadeInterna} pessoas`;
        if (ativasInternaEl) ativasInternaEl.textContent = mesasInterna.length;

        if (totalExternaEl) totalExternaEl.textContent = `${mesasExterna.length} mesas`;
        if (capExternaEl) capExternaEl.textContent = `${capacidadeExterna} pessoas`;
        if (ativasExternaEl) ativasExternaEl.textContent = mesasExterna.length;

        if (capTotalEl) capTotalEl.textContent = capacidadeTotal;
    }

    function renderizarListaMesas() {
        const listaMesas = document.getElementById('listaMesas');
        const estadoVazioMesas = document.getElementById('estadoVazioMesas');
        if (!listaMesas) return;

        if (!mesas.length) {
            if (estadoVazioMesas) estadoVazioMesas.classList.remove('hidden');
            listaMesas.innerHTML = '';
            return;
        }

        if (estadoVazioMesas) estadoVazioMesas.classList.add('hidden');

        listaMesas.innerHTML = mesas.map(mesa => `
            <div class="hover:bg-muza-gold hover:bg-opacity-10 transition duration-300">
                <div class="hidden md:block px-6 py-4">
                    <div class="grid grid-cols-6 gap-4 items-center">
                        <div class="font-bold text-muza-gold">Mesa ${mesa.numero}</div>
                        <div class="text-muza-cream">${mesa.capacidade} pessoas</div>
                        <div class="text-muza-cream">${mesa.area === 'interna' ? 'Interna' : 'Externa'}</div>
                        <div>
                            <span class="inline-block px-2 py-1 rounded text-xs font-bold ${mesa.status === 'ativa' ? 'bg-green-500 bg-opacity-20 text-green-400' : 'bg-red-500 bg-opacity-20 text-red-400'}">
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

                <div class="md:hidden bg-muza-wood bg-opacity-30 rounded-lg p-4 mb-4 mx-4 mt-4 border border-muza-gold border-opacity-20">
                    <div class="flex justify-between items-center mb-3">
                        <h3 class="font-bold text-muza-gold font-raleway text-lg">Mesa ${mesa.numero}</h3>
                        <span class="inline-block px-3 py-1 rounded text-sm font-bold ${mesa.status === 'ativa' ? 'bg-green-500 bg-opacity-20 text-green-400' : 'bg-red-500 bg-opacity-20 text-red-400'}">
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

    // Gestão de agenda
    let bloqueiosAgenda = [];
    let agendaMesAtual = new Date().getMonth();
    let agendaAnoAtual = new Date().getFullYear();

    function ehDiaPadraoAberto(dataISO) {
        const [ano, mes, dia] = dataISO.split('-').map(Number);
        if (!ano || !mes || !dia) return false;
        const diaSemana = new Date(ano, mes - 1, dia).getDay();
        return diaSemana === 5 || diaSemana === 6;
    }

    function estaAbertoNaAgenda(dataISO) {
        const registro = bloqueiosAgenda.find(b => b.data === dataISO);
        if (registro) return !registro.bloqueado;
        return ehDiaPadraoAberto(dataISO);
    }

    async function carregarBloqueiosAgenda() {
        const agendaSection = document.getElementById('tabAgenda');
        if (!agendaSection) return;
        try {
            const response = await fetch(`${API_BASE_URL}/bloqueios`);
            if (response.ok) {
                const data = await response.json();
                bloqueiosAgenda = (data.bloqueios || []).map(b => ({
                    data: b.data,
                    bloqueado: Boolean(b.bloqueado)
                }));
                renderAgendaCalendar();
                renderAgendaListaFechados();
            }
        } catch (error) {
            console.error('Erro ao carregar agenda:', error);
        }
    }
    window.carregarBloqueiosAgenda = carregarBloqueiosAgenda;

    function renderAgendaCalendar() {
        const container = document.getElementById('agendaCalendarDays');
        const label = document.getElementById('agendaMonthLabel');
        if (!container || !label) return;

        const primeiroDia = new Date(agendaAnoAtual, agendaMesAtual, 1);
        const diasNoMes = new Date(agendaAnoAtual, agendaMesAtual + 1, 0).getDate();
        const nomeMes = primeiroDia.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        label.textContent = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);

        const offset = primeiroDia.getDay();
        const hojeISO = normalizarDataISO(new Date());

        const fragment = [];
        for (let i = 0; i < offset; i += 1) {
            fragment.push('<div></div>');
        }

        for (let dia = 1; dia <= diasNoMes; dia += 1) {
            const dataStr = `${agendaAnoAtual}-${String(agendaMesAtual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            const registro = bloqueiosAgenda.find(b => b.data === dataStr);
            const aberto = estaAbertoNaAgenda(dataStr);
            const passado = dataStr < hojeISO;
            const classes = aberto
                ? 'bg-green-500/20 border border-green-500/40 text-green-100'
                : 'bg-red-500/30 border border-red-500/40 text-red-100';
            const badge = registro
                ? `<span class="absolute top-1 right-1 text-[10px] px-1 rounded ${registro.bloqueado ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}">${registro.bloqueado ? 'F' : 'A'}</span>`
                : '';
            const attrs = passado
                ? 'data-agenda-disabled="true" tabindex="-1" aria-disabled="true" disabled'
                : `data-agenda-date="${dataStr}" data-agenda-status="${aberto ? 'open' : 'closed'}"`;
            const stateClasses = passado ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'hover:opacity-100 transition cursor-pointer';

            fragment.push(`
                <button type="button" class="relative p-2 rounded-lg ${classes} ${stateClasses} text-sm font-semibold"
                        ${attrs}>
                    ${dia}
                    ${badge}
                </button>
            `);
        }

        container.innerHTML = fragment.join('');
    }

    function renderAgendaListaFechados() {
        const lista = document.getElementById('agendaListaFechados');
        if (!lista) return;

        const fechados = bloqueiosAgenda
            .filter(b => b.bloqueado)
            .sort((a, b) => (a.data > b.data ? 1 : -1));

        if (!fechados.length) {
            lista.innerHTML = '<p class="text-muza-cream text-sm opacity-70">Nenhum dia fechado.</p>';
            return;
        }

        lista.innerHTML = fechados.map(b => `
            <div class="flex items-center justify-between bg-muza-dark bg-opacity-40 border border-muza-gold/20 rounded-lg px-3 py-2">
                <div>
                    <p class="text-muza-gold font-semibold">${formatarData(b.data)}</p>
                    <p class="text-xs text-muza-cream/70">${b.data}</p>
                </div>
                <button type="button" data-agenda-reabrir="${b.data}" class="text-sm text-green-300 hover:text-white transition">
                    <i class="fas fa-unlock mr-1"></i>Abrir
                </button>
            </div>
        `).join('');
    }

    async function atualizarDiaAgenda(dataISO, bloquear) {
        if (!dataISO) {
            alert('Selecione uma data.');
            return;
        }
        const hojeISO = normalizarDataISO(new Date());
        if (dataISO < hojeISO) {
            alert('Somente dias atuais ou futuros podem ser configurados.');
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/bloqueios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: dataISO, bloqueado: bloquear })
            });
            if (!response.ok) {
                const erro = await response.text();
                throw new Error(erro || 'Erro ao atualizar agenda.');
            }
            await carregarBloqueiosAgenda();
            console.log('Agenda atualizada para', dataISO, bloquear ? 'fechado' : 'aberto');
        } catch (error) {
            console.error('Erro ao atualizar agenda:', error);
            alert('Erro ao atualizar agenda: ' + error.message);
        }
    }
    
    // Carregar reservas da API
    async function carregarReservas() {
        try {
            const response = await fetch(`${API_BASE_URL}/reservas`);
            if (response.ok) {
                const data = await response.json();
                const listaRecebida = Array.isArray(data.reservas) ? data.reservas : [];
                reservas = ordenarReservas(listaRecebida.map(reserva => {
                    const dataNormalizada = normalizarDataISO(reserva.data);
                    return {
                        ...reserva,
                        data: dataNormalizada || reserva.data
                    };
                }));
                console.log('✅ CARREGADAS', reservas.length, 'RESERVAS DO FIREBASE');
                salvarReservasNoCache(reservas);
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
        const nomeCompleto = getNomeCompleto(reserva);
        
        const mensagem = `🎷 *MUZZA JAZZ CLUB* 🎷\n` +
            `━━━━━━━━━━━━━━━━━━━━\n\n` +
            `Olá *${nomeCompleto}*! 👋\n\n` +
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
    
    // Função para confirmar pré-reserva
    window.confirmarReserva = async function(reservaId) {
        if (confirm('Confirmar esta pré-reserva?')) {
            await window.alterarStatus(reservaId, 'confirmado');
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
    function podeApagarReserva() {
        return true;
    }

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
        try {
            const reserva = reservas.find(r => r.id === reservaId);
            if (!reserva) return;

        const descricaoMesas = getDescricaoMesas(reserva);

        // Preencher dados no modal
        document.getElementById('modalNome').textContent = getNomeCompleto(reserva);
        document.getElementById('modalWhatsapp').textContent = reserva.whatsapp;
        document.getElementById('modalData').textContent = formatarData(reserva.data);
        document.getElementById('modalArea').textContent = reserva.area === 'interna' ? 'Área Interna' : 'Área Externa';

        const modalAdultosInput = document.getElementById('modalAdultosInput');
        const modalCriancasInput = document.getElementById('modalCriancasInput');
        const modalMesaSelect = document.getElementById('modalMesaSelect');
        const modalMesaExtraSelect = document.getElementById('modalMesaExtraSelect');
        const modalMesaExtraGroup = document.getElementById('modalMesaExtraGroup');
        const modalMesaResumo = document.getElementById('modalMesaResumo');
        const modalCapacidadeInfo = document.getElementById('modalCapacidadeInfo');
        const btnSalvarDetalhes = document.getElementById('btnSalvarReservaDetalhes');

        if (modalAdultosInput) modalAdultosInput.value = reserva.adultos || 0;
        if (modalCriancasInput) modalCriancasInput.value = reserva.criancas || 0;
        if (modalMesaResumo) modalMesaResumo.textContent = descricaoMesas || 'Sem mesa atribuída';
        
        // Carregar mesas disponíveis para a área da reserva
        const mesasAreaAtivas = mesas.filter(m => m.area === reserva.area && m.status === 'ativa');
            
        // Buscar reservas da mesma data para verificar disponibilidade
        const reservasMesmaData = reservas.filter(r => 
            r.data === reserva.data && 
            r.id !== reserva.id && 
            r.area === reserva.area &&
            statusBloqueiaMesa(r.status)
        );
        const mesasOcupadas = reservasMesmaData.flatMap(r => obterMesasDaReserva(r));
        const mesaPrincipalAtual = normalizarNumeroMesa(reserva.numeroMesa) ?? obterMesasDaReserva(reserva)[0] ?? null;
        const mesaExtraAtual = normalizarNumeroMesa(reserva.mesaExtra);

        function capacidadeMesa(numeroMesa) {
            if (!Number.isInteger(numeroMesa)) return 0;
            const mesaEncontrada = mesas.find(m => normalizarNumeroMesa(m.numero) === numeroMesa);
            return mesaEncontrada ? (parseInt(mesaEncontrada.capacidade, 10) || 0) : 0;
        }

        function listarMesasDisponiveis(incluirNumero) {
            const lista = [...mesasAreaAtivas];
            if (Number.isInteger(incluirNumero) && !lista.some(m => normalizarNumeroMesa(m.numero) === incluirNumero)) {
                const mesaExtra = mesas.find(m => normalizarNumeroMesa(m.numero) === incluirNumero);
                if (mesaExtra) lista.push(mesaExtra);
            }
            return lista;
        }

        function preencherMesaPrincipalSelect(selecionadaNumero) {
            if (!modalMesaSelect) return;
            const lista = listarMesasDisponiveis(selecionadaNumero);
            let options = '<option value="">Selecione uma mesa</option>';
            lista.forEach(m => {
                const numeroMesa = normalizarNumeroMesa(m.numero);
                if (numeroMesa === null) return;
                const ocupada = mesasOcupadas.includes(numeroMesa);
                const selecionada = selecionadaNumero !== null && numeroMesa === selecionadaNumero;
                const disabled = ocupada && !selecionada;
                options += `<option value="${m.numero}" ${selecionada ? 'selected' : ''} ${disabled ? 'disabled' : ''}>
                    Mesa ${m.numero} (${m.capacidade}p) ${disabled ? '- Ocupada' : ''}
                </option>`;
            });
            modalMesaSelect.innerHTML = options;
            modalMesaSelect.value = selecionadaNumero ? selecionadaNumero.toString() : '';
        }

        function preencherMesaExtraSelect(selecionadaNumero) {
            if (!modalMesaExtraSelect) return;
            const principalNumero = normalizarNumeroMesa(modalMesaSelect?.value);
            const lista = listarMesasDisponiveis(selecionadaNumero);
            let options = '<option value="">Sem mesa adicional</option>';
            let possuiOpcaoDisponivel = false;

            lista.forEach(m => {
                const numeroMesa = normalizarNumeroMesa(m.numero);
                if (numeroMesa === null || numeroMesa === principalNumero) return;
                const ocupada = mesasOcupadas.includes(numeroMesa);
                const selecionada = selecionadaNumero !== null && numeroMesa === selecionadaNumero;
                const disabled = ocupada && !selecionada;
                if (!disabled) possuiOpcaoDisponivel = true;
                options += `<option value="${m.numero}" ${selecionada ? 'selected' : ''} ${disabled ? 'disabled' : ''}>
                    Mesa ${m.numero} (${m.capacidade}p) ${disabled ? '- Ocupada' : ''}
                </option>`;
            });

            modalMesaExtraSelect.innerHTML = options;
            if (selecionadaNumero && modalMesaExtraSelect.querySelector(`option[value="${selecionadaNumero}"]`)) {
                modalMesaExtraSelect.value = selecionadaNumero;
            } else {
                modalMesaExtraSelect.value = '';
            }

            if (modalMesaExtraGroup) {
                if (possuiOpcaoDisponivel) {
                    modalMesaExtraGroup.classList.remove('hidden');
                } else {
                    modalMesaExtraGroup.classList.add('hidden');
                }
            }
        }

        function atualizarResumoMesas() {
            if (!modalMesaResumo) return;
            const principal = modalMesaSelect?.value;
            const extra = modalMesaExtraSelect?.value;
            if (principal) {
                modalMesaResumo.textContent = `Mesa ${principal}${extra ? ` + Mesa ${extra}` : ''}`;
            } else {
                modalMesaResumo.textContent = 'Sem mesa atribuída';
            }
        }

        function sugerirMesaExtra(totalPessoas, principalNumero) {
            const lista = listarMesasDisponiveis();
            const candidatos = lista
                .map(m => normalizarNumeroMesa(m.numero))
                .filter(numero => Number.isInteger(numero) && numero !== principalNumero && !mesasOcupadas.includes(numero));
            
            for (const candidato of candidatos) {
                if (capacidadeMesa(principalNumero) + capacidadeMesa(candidato) >= totalPessoas) {
                    return candidato;
                }
            }
            return null;
        }

        function atualizarAnaliseCapacidade(autoSugerirExtra = false) {
            if (!modalCapacidadeInfo) {
                return { valido: true };
            }

            const adultos = parseInt(modalAdultosInput?.value, 10) || 0;
            const criancas = parseInt(modalCriancasInput?.value, 10) || 0;
            const total = adultos + criancas;
            const principalNumero = normalizarNumeroMesa(modalMesaSelect?.value);
            let extraNumero = normalizarNumeroMesa(modalMesaExtraSelect?.value);
            const capacidadePrincipal = capacidadeMesa(principalNumero);
            let capacidadeExtra = capacidadeMesa(extraNumero);
            let capacidadeTotal = capacidadePrincipal + capacidadeExtra;

            let mensagem = '';
            let valido = true;

            if (!principalNumero) {
                mensagem = 'Selecione uma mesa principal para continuar.';
                valido = false;
            } else if (total <= 0) {
                mensagem = 'Informe ao menos uma pessoa para a reserva.';
                valido = false;
            } else if (total > capacidadeTotal) {
                if (autoSugerirExtra) {
                    const sugestao = sugerirMesaExtra(total, principalNumero);
                    if (sugestao) {
                        extraNumero = sugestao;
                        if (modalMesaExtraSelect) modalMesaExtraSelect.value = sugestao.toString();
                        capacidadeExtra = capacidadeMesa(extraNumero);
                        capacidadeTotal = capacidadePrincipal + capacidadeExtra;
                    }
                }

                if (total > capacidadeTotal) {
                    mensagem = `Capacidade insuficiente (${capacidadeTotal} lugares) para ${total} pessoas. Ajuste mesas ou quantidades.`;
                    valido = false;
                } else {
                    mensagem = `Mesa adicional necessária. Capacidade combinada: ${capacidadeTotal} lugares para ${total} pessoas.`;
                }
            } else {
                mensagem = `Capacidade disponível: ${capacidadeTotal} lugares para ${total} pessoas.`;
            }

            modalCapacidadeInfo.textContent = mensagem;
            modalCapacidadeInfo.className = `text-sm font-raleway rounded-lg border px-3 py-2 ${
                valido
                    ? 'border-green-500 text-green-300 bg-green-500 bg-opacity-10'
                    : 'border-red-500 text-red-300 bg-red-500 bg-opacity-10'
            }`;

            return { valido, adultos, criancas, principalNumero, extraNumero };
        }

        preencherMesaPrincipalSelect(mesaPrincipalAtual);
        preencherMesaExtraSelect(mesaExtraAtual);
        atualizarResumoMesas();
        atualizarAnaliseCapacidade(true);

        if (modalAdultosInput) modalAdultosInput.oninput = () => atualizarAnaliseCapacidade(true);
        if (modalCriancasInput) modalCriancasInput.oninput = () => atualizarAnaliseCapacidade(true);
        if (modalMesaSelect) {
            modalMesaSelect.onchange = () => {
                preencherMesaExtraSelect(normalizarNumeroMesa(modalMesaExtraSelect?.value));
                atualizarResumoMesas();
                atualizarAnaliseCapacidade(true);
            };
        }
        if (modalMesaExtraSelect) {
            modalMesaExtraSelect.onchange = () => {
                atualizarResumoMesas();
                atualizarAnaliseCapacidade(false);
            };
        }

        if (btnSalvarDetalhes) {
            btnSalvarDetalhes.onclick = async () => {
                const analise = atualizarAnaliseCapacidade(false);
                if (!analise.valido) {
                    alert('Ajuste as informações de pessoas ou mesas antes de salvar.');
                    return;
                }

                try {
                    btnSalvarDetalhes.disabled = true;
                    btnSalvarDetalhes.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Salvando...';

                    const payload = {
                        adultos: analise.adultos,
                        criancas: analise.criancas,
                        numeroMesa: analise.principalNumero,
                        mesaExtra: analise.extraNumero
                    };

                    const response = await fetch(`${API_BASE_URL}/reservas/${reservaId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (!response.ok) {
                        throw new Error('Erro ao atualizar reserva');
                    }

                    reserva.adultos = analise.adultos;
                    reserva.criancas = analise.criancas;
                    reserva.numeroMesa = analise.principalNumero;
                    reserva.mesaExtra = analise.extraNumero;

                    const reservaIndex = reservas.findIndex(r => r.id === reservaId);
                    if (reservaIndex !== -1) {
                        reservas[reservaIndex] = { ...reservas[reservaIndex], ...reserva };
                    }

                    const filtradaIndex = reservasFiltradas.findIndex(r => r.id === reservaId);
                    if (filtradaIndex !== -1) {
                        reservasFiltradas[filtradaIndex] = { ...reservasFiltradas[filtradaIndex], ...reserva };
                    }

                    atualizarResumoMesas();
                    await carregarReservas();
                    alert('Reserva atualizada com sucesso!');
                } catch (error) {
                    console.error('Erro ao atualizar reserva:', error);
                    alert('Erro ao salvar alterações. Tente novamente.');
                } finally {
                    btnSalvarDetalhes.disabled = false;
                    btnSalvarDetalhes.innerHTML = '<i class="fas fa-save mr-2"></i>Salvar alterações';
                }
            };
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
        if (btnApagar) {
            btnApagar.disabled = false;
            btnApagar.className = 'flex-1 min-w-[120px] bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duração-300 font-raleway';
            btnApagar.onclick = () => apagarReserva(reservaId);
        }

        // Mostrar modal
            document.getElementById('modalReserva').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        } catch (error) {
            console.error('Erro ao abrir modal da reserva:', error);
            alert('Não foi possível abrir os detalhes da reserva. Atualize a página e tente novamente.');
        }
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
    const btnVisualizarRelatorio = document.getElementById('btnVisualizarRelatorio');
    const btnGerarPDF = document.getElementById('btnGerarPDF');
    const labelBtnVisualizarRelatorio = btnVisualizarRelatorio ? btnVisualizarRelatorio.innerHTML : '';
    let filtrosRelatorioAtuais = null;

    function setEstadoGerandoRelatorio(ativo = false) {
        if (!btnVisualizarRelatorio) return;
        btnVisualizarRelatorio.disabled = ativo;
        btnVisualizarRelatorio.innerHTML = ativo
            ? '<i class="fas fa-spinner fa-spin mr-2"></i>Gerando...'
            : (labelBtnVisualizarRelatorio || 'Visualizar Relatório');
    }

    if (btnVisualizarRelatorio) {
        btnVisualizarRelatorio.addEventListener('click', () => {
            if (!btnVisualizarRelatorio.disabled) {
                console.log('📊 Solicitado relatório pelo botão');
                gerarRelatorio();
            }
        });
    }

    if (btnGerarPDF) {
        btnGerarPDF.addEventListener('click', () => {
            console.log('📄 Solicitado PDF do relatório');
            gerarPDF();
        });
    }
    
    function statusCorrespondeAoFiltro(statusNormalizado = '', filtroSelecionado = '') {
        if (!filtroSelecionado) return true;
        const filtro = filtroSelecionado.toLowerCase();
        if (filtro === 'confirmado') {
            return STATUS_CONFIRMADOS.includes(statusNormalizado);
        }
        if (filtro === 'cancelado') {
            return STATUS_CANCELADOS.includes(statusNormalizado);
        }
        return statusNormalizado === filtro;
    }
    
    // Função para calcular dados do relatório
    function calcularDadosRelatorio(reservasList = []) {
        const reservasNormalizadas = reservasList.map(reserva => ({
            ...reserva,
            valorNormalizado: getValorReserva(reserva),
            areaNormalizada: (reserva.area || '').toLowerCase(),
            statusNormalizado: (reserva.status || '').toLowerCase()
        }));
        
        dadosRelatorio.totalReservas = reservasNormalizadas.length;
        dadosRelatorio.receitaTotal = reservasNormalizadas.reduce((sum, reserva) => sum + reserva.valorNormalizado, 0);
        dadosRelatorio.ticketMedio = dadosRelatorio.totalReservas > 0 ? dadosRelatorio.receitaTotal / dadosRelatorio.totalReservas : 0;
        dadosRelatorio.totalPessoas = reservasNormalizadas.reduce((sum, reserva) => {
            const adultos = parseInt(reserva.adultos, 10) || 0;
            const criancas = parseInt(reserva.criancas, 10) || 0;
            return sum + adultos + criancas;
        }, 0);
        
        const reservasInterna = reservasNormalizadas.filter(reserva => reserva.areaNormalizada === 'interna');
        const reservasExterna = reservasNormalizadas.filter(reserva => reserva.areaNormalizada === 'externa');
        
        dadosRelatorio.reservasInterna = reservasInterna.length;
        dadosRelatorio.receitaInterna = reservasInterna.reduce((sum, reserva) => sum + reserva.valorNormalizado, 0);
        dadosRelatorio.pessoasInterna = reservasInterna.reduce((sum, reserva) => {
            const adultos = parseInt(reserva.adultos, 10) || 0;
            const criancas = parseInt(reserva.criancas, 10) || 0;
            return sum + adultos + criancas;
        }, 0);
        dadosRelatorio.ocupacaoInterna = dadosRelatorio.totalReservas > 0
            ? (dadosRelatorio.reservasInterna / dadosRelatorio.totalReservas) * 100
            : 0;
        
        dadosRelatorio.reservasExterna = reservasExterna.length;
        dadosRelatorio.receitaExterna = reservasExterna.reduce((sum, reserva) => sum + reserva.valorNormalizado, 0);
        dadosRelatorio.pessoasExterna = reservasExterna.reduce((sum, reserva) => {
            const adultos = parseInt(reserva.adultos, 10) || 0;
            const criancas = parseInt(reserva.criancas, 10) || 0;
            return sum + adultos + criancas;
        }, 0);
        dadosRelatorio.ocupacaoExterna = dadosRelatorio.totalReservas > 0
            ? (dadosRelatorio.reservasExterna / dadosRelatorio.totalReservas) * 100
            : 0;
        
        dadosRelatorio.reservasDetalhadas = reservasNormalizadas;
    }
    
    // Função para gerar relatório
    function gerarRelatorio() {
        if (!reservas.length) {
            alert('Ainda não há reservas carregadas. Aguarde alguns segundos e tente novamente.');
            return;
        }
        
        setEstadoGerandoRelatorio(true);
        
        try {
            const tipoPeriodo = document.querySelector('input[name="tipoPeriodo"]:checked')?.value || 'dia';
            const areaFiltro = (document.getElementById('filtroAreaRelatorio')?.value || '').toLowerCase();
            const statusFiltro = (document.getElementById('filtroStatusRelatorio')?.value || '').toLowerCase();
            
            let dataInicio;
            let dataFim;
            
            if (tipoPeriodo === 'dia') {
                let data = document.getElementById('dataEspecifica')?.value;
                if (!data) data = normalizarDataISO(new Date());
                dataInicio = dataFim = normalizarDataISO(data);
            } else if (tipoPeriodo === 'mes') {
                const mesAno = document.getElementById('mesAno')?.value;
                if (!mesAno) {
                    alert('Selecione um mês/ano');
                    return;
                }
                const [ano, mes] = mesAno.split('-');
                dataInicio = `${ano}-${mes}-01`;
                dataFim = `${ano}-${mes}-${new Date(ano, mes, 0).getDate().toString().padStart(2, '0')}`;
            } else if (tipoPeriodo === 'periodo') {
                dataInicio = document.getElementById('dataInicial')?.value;
                dataFim = document.getElementById('dataFinal')?.value;
                if (!dataInicio || !dataFim) {
                    alert('Selecione as datas inicial e final');
                    return;
                }
            } else {
                const hoje = normalizarDataISO(new Date());
                dataInicio = hoje;
                dataFim = hoje;
            }

            dataInicio = normalizarDataISO(dataInicio);
            dataFim = normalizarDataISO(dataFim);

            if (!dataInicio || !dataFim) {
                alert('Datas inválidas para o relatório.');
                return;
            }

            if (dataInicio > dataFim) {
                alert('A data inicial deve ser anterior à data final.');
                return;
            }
            
            const reservasRelatorio = reservas.filter(reserva => {
                const dataReserva = normalizarDataISO(reserva.data);
                if (!dataReserva) return false;
                const matchPeriodo = dataReserva >= dataInicio && dataReserva <= dataFim;
                const areaNormalizada = (reserva.area || '').toLowerCase();
                const matchArea = !areaFiltro || areaNormalizada === areaFiltro;
                const statusNormalizado = (reserva.status || '').toLowerCase();
                const matchStatus = statusCorrespondeAoFiltro(statusNormalizado, statusFiltro);
                return matchPeriodo && matchArea && matchStatus;
            });
            
            filtrosRelatorioAtuais = { tipoPeriodo, areaFiltro, statusFiltro, dataInicio, dataFim };
            calcularDadosRelatorio(reservasRelatorio);
            exibirRelatorio(dataInicio, dataFim);
            document.getElementById('previaRelatorio')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (error) {
            console.error('Erro ao gerar relatório:', error);
            alert('Não foi possível gerar o relatório. Atualize a página e tente novamente.');
        } finally {
            setEstadoGerandoRelatorio(false);
        }
    }
    
    // Função para exibir relatório
    function exibirRelatorio(dataInicio, dataFim) {
        document.getElementById('relatorioTotalReservas').textContent = dadosRelatorio.totalReservas;
        document.getElementById('relatorioReceitaTotal').textContent = formatarMoeda(dadosRelatorio.receitaTotal);
        document.getElementById('relatorioTicketMedio').textContent = formatarMoeda(dadosRelatorio.ticketMedio);
        document.getElementById('relatorioTotalPessoas').textContent = dadosRelatorio.totalPessoas;
        
        document.getElementById('relatorioReservasInterna').textContent = dadosRelatorio.reservasInterna;
        document.getElementById('relatorioReceitaInterna').textContent = formatarMoeda(dadosRelatorio.receitaInterna);
        document.getElementById('relatorioPessoasInterna').textContent = dadosRelatorio.pessoasInterna;
        document.getElementById('relatorioOcupacaoInterna').textContent = `${dadosRelatorio.ocupacaoInterna.toFixed(1)}%`;
        
        document.getElementById('relatorioReservasExterna').textContent = dadosRelatorio.reservasExterna;
        document.getElementById('relatorioReceitaExterna').textContent = formatarMoeda(dadosRelatorio.receitaExterna);
        document.getElementById('relatorioPessoasExterna').textContent = dadosRelatorio.pessoasExterna;
        document.getElementById('relatorioOcupacaoExterna').textContent = `${dadosRelatorio.ocupacaoExterna.toFixed(1)}%`;
        
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
            const headerDesktop = `
                <div class="hidden md:grid grid-cols-7 gap-4 py-2 px-4 bg-muza-dark bg-opacity-40 rounded text-xs font-bold uppercase tracking-widest text-muza-cream/70">
                    <span>Data</span>
                    <span>Cliente</span>
                    <span>Mesa(s)</span>
                    <span>Total</span>
                    <span>Detalhes</span>
                    <span>Valor</span>
                    <span>Status</span>
                </div>
            `;
            
            const linhas = dadosRelatorio.reservasDetalhadas.map(reserva => {
                const nomeCompleto = getNomeCompleto(reserva);
                const totalPessoas = (parseInt(reserva.adultos, 10) || 0) + (parseInt(reserva.criancas, 10) || 0);
                const valorLinha = formatarMoeda(reserva.valorNormalizado ?? getValorReserva(reserva));
                const statusCor = getStatusBadgeColor(reserva);
                const statusTexto = getStatusText(reserva.status);
                const mesasDescricao = getDescricaoMesas(reserva) || reserva.numeroMesa || '-';
                const cupomLinha = reserva.cupom ? `<span class="text-green-400 text-xs uppercase tracking-wide">Cupom: ${reserva.cupom}</span>` : '';
                
                return `
                    <div class="hidden md:grid grid-cols-7 gap-4 py-2 px-4 bg-muza-wood bg-opacity-20 rounded text-sm">
                        <div class="text-muza-cream">${formatarData(reserva.data)}</div>
                        <div class="text-muza-cream">${nomeCompleto}</div>
                        <div class="text-muza-cream text-center">${mesasDescricao}</div>
                        <div class="text-muza-cream">${totalPessoas}</div>
                        <div class="text-muza-cream">${reserva.adultos || 0}A / ${reserva.criancas || 0}C</div>
                        <div class="text-muza-gold font-bold">${valorLinha}${reserva.cupom ? '<br><span class="text-green-400 text-xs uppercase tracking-wide">' + reserva.cupom + '</span>' : ''}</div>
                        <div class="text-${statusCor}-400 font-bold">${statusTexto}</div>
                    </div>
                    <div class="md:hidden bg-muza-dark bg-opacity-40 rounded-xl p-4 border border-muza-gold/10 text-sm text-muza-cream space-y-2">
                        <div class="flex items-center justify-between">
                            <span class="font-bold">${nomeCompleto}</span>
                            <span class="text-${statusCor}-400 font-bold">${statusTexto}</span>
                        </div>
                        <div class="flex justify-between text-xs uppercase text-muza-cream/60">
                            <span>${formatarData(reserva.data)}</span>
                            <span>${mesasDescricao}</span>
                        </div>
                        <div class="flex flex-wrap gap-4 text-sm">
                            <span><strong>Total:</strong> ${totalPessoas} pessoas</span>
                            <span><strong>Adultos:</strong> ${reserva.adultos || 0}</span>
                            <span><strong>Crianças:</strong> ${reserva.criancas || 0}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="font-bold text-muza-gold">${valorLinha}</span>
                            ${cupomLinha}
                        </div>
                    </div>
                `;
            }).join('');
            
            listaReservasRelatorio.innerHTML = headerDesktop + linhas;
        }
        
        document.getElementById('previaRelatorio').classList.remove('hidden');
    }
    
    // Função para gerar PDF
    function gerarPDF() {
        if (dadosRelatorio.totalReservas === 0 || !filtrosRelatorioAtuais) {
            alert('Gere um relatório primeiro antes de exportar para PDF');
            return;
        }
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const corDourada = [212, 175, 55];
        const corBorgonha = [139, 0, 0];
        const corEscura = [26, 18, 11];
        
        doc.setFillColor(...corDourada);
        doc.rect(0, 0, 210, 30, 'F');
        
        doc.setTextColor(...corEscura);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('MUZZA JAZZ CLUB', 20, 15);
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Relatório Financeiro', 20, 22);
        
        const periodo = `${formatarData(filtrosRelatorioAtuais.dataInicio)} - ${formatarData(filtrosRelatorioAtuais.dataFim)}`;
        doc.text(`Período: ${periodo}`, 120, 22);
        
        const detalhesFiltro = [];
        if (filtrosRelatorioAtuais.areaFiltro) {
            detalhesFiltro.push(`Área: ${filtrosRelatorioAtuais.areaFiltro === 'interna' ? 'Interna' : 'Externa'}`);
        }
        if (filtrosRelatorioAtuais.statusFiltro) {
            const statusLabel = filtrosRelatorioAtuais.statusFiltro === 'pre-reserva'
                ? 'Pré-reserva'
                : filtrosRelatorioAtuais.statusFiltro.charAt(0).toUpperCase() + filtrosRelatorioAtuais.statusFiltro.slice(1);
            detalhesFiltro.push(`Status: ${statusLabel}`);
        }
        if (detalhesFiltro.length) {
            doc.setFontSize(10);
            doc.text(detalhesFiltro.join(' | '), 20, 32);
        }
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('RESUMO EXECUTIVO', 20, 45);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        let y = 55;
        doc.text(`Total de Reservas: ${dadosRelatorio.totalReservas}`, 20, y);
        doc.text(`Receita Total: ${formatarMoeda(dadosRelatorio.receitaTotal)}`, 110, y);
        y += 8;
        doc.text(`Ticket Médio: ${formatarMoeda(dadosRelatorio.ticketMedio)}`, 20, y);
        doc.text(`Total de Pessoas: ${dadosRelatorio.totalPessoas}`, 110, y);
        y += 15;
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('DETALHAMENTO POR ÁREA', 20, y);
        y += 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        doc.setFont('helvetica', 'bold');
        doc.text('Área Interna:', 20, y);
        doc.setFont('helvetica', 'normal');
        y += 6;
        doc.text(`Reservas: ${dadosRelatorio.reservasInterna}`, 25, y);
        doc.text(`Receita: ${formatarMoeda(dadosRelatorio.receitaInterna)}`, 70, y);
        doc.text(`Pessoas: ${dadosRelatorio.pessoasInterna}`, 130, y);
        y += 10;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Área Externa:', 20, y);
        doc.setFont('helvetica', 'normal');
        y += 6;
        doc.text(`Reservas: ${dadosRelatorio.reservasExterna}`, 25, y);
        doc.text(`Receita: ${formatarMoeda(dadosRelatorio.receitaExterna)}`, 70, y);
        doc.text(`Pessoas: ${dadosRelatorio.pessoasExterna}`, 130, y);
        y += 15;
        
        if (dadosRelatorio.reservasDetalhadas.length > 0) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('RESERVAS DETALHADAS', 20, y);
            y += 10;
            
            const desenharCabecalhoDetalhes = () => {
                doc.setFillColor(240, 240, 240);
                doc.rect(20, y - 5, 170, 8, 'F');
                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                doc.text('DATA', 22, y);
                doc.text('CLIENTE', 42, y);
                doc.text('MESAS', 75, y);
                doc.text('PESSOAS', 95, y);
                doc.text('DETALHES', 115, y);
                doc.text('VALOR', 140, y);
                doc.text('STATUS', 165, y);
                y += 8;
                doc.setFont('helvetica', 'normal');
            };
            
            desenharCabecalhoDetalhes();
            dadosRelatorio.reservasDetalhadas.forEach(reserva => {
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'bold');
                    doc.text('RESERVAS DETALHADAS (continuação)', 20, y);
                    y += 10;
                    desenharCabecalhoDetalhes();
                }
                
                doc.text(formatarData(reserva.data), 22, y);
                const nomeCompleto = getNomeCompleto(reserva);
                doc.text(nomeCompleto.substring(0, 12), 42, y);
                doc.text(mesasDescricaoTexto(reserva), 75, y);
                doc.text(String((parseInt(reserva.adultos, 10) || 0) + (parseInt(reserva.criancas, 10) || 0)), 95, y);
                doc.text(`${reserva.adultos || 0}A/${reserva.criancas || 0}C`, 115, y);
                doc.text(formatarMoeda(reserva.valorNormalizado ?? getValorReserva(reserva)), 140, y);
                if (reserva.cupom) {
                    doc.setFontSize(6);
                    doc.text(reserva.cupom, 140, y + 3);
                    doc.setFontSize(8);
                }
                doc.text(getStatusText(reserva.status), 165, y);
                y += 6;
            });
        }
        
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i += 1) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} - Página ${i} de ${pageCount}`, 20, 290);
            doc.text('Muzza Jazz Club - Jazz da Floresta', 120, 290);
        }
        
        const nomeArquivo = `relatorio-muzza-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(nomeArquivo);
    }

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
        await carregarBloqueiosAgenda();
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
        const hojeISO = normalizarDataISO(new Date());
        
        // Reservas hoje
        const reservasHoje = reservas.filter(r => normalizarDataISO(r.data) === hojeISO && isReservaAtiva(r));
        console.log('📅 Reservas hoje:', reservasHoje.length);
        
        // Receita hoje
        const receitaHoje = reservasHoje.reduce((sum, r) => sum + getValorReserva(r), 0);
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
        if (elemReceitaHoje) elemReceitaHoje.textContent = formatarMoeda(receitaHoje);
        if (elemOcupacao) elemOcupacao.textContent = `${ocupacao}%`;
        
        const reservasAtivas = reservas.filter(isReservaAtiva);
        const preReservas = reservas.filter(r => (r.status || '').toLowerCase() === 'pre-reserva');
        const canceladas = reservas.filter(r => STATUS_CANCELADOS.includes((r.status || '').toLowerCase()));

        const elemAtivas = document.getElementById('dashReservasAtivas');
        const elemPreReservas = document.getElementById('dashPreReservas');
        const elemCanceladas = document.getElementById('dashReservasCanceladas');
        if (elemAtivas) elemAtivas.textContent = reservasAtivas.length;
        if (elemPreReservas) elemPreReservas.textContent = preReservas.length;
        if (elemCanceladas) elemCanceladas.textContent = canceladas.length;

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
        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(inicioSemana.getDate() + 6);

        const inicioSemanaStr = normalizarDataISO(inicioSemana);
        const fimSemanaStr = normalizarDataISO(fimSemana);
        
        const reservasSemana = reservas.filter(r => {
            const dataISO = normalizarDataISO(r.data);
            return dataISO && dataISO >= inicioSemanaStr && dataISO <= fimSemanaStr && isReservaAtiva(r);
        });
        console.log('📊 Reservas da semana:', reservasSemana.length);
        
        const reservasInterna = reservasSemana.filter(r => r.area === 'interna');
        const reservasExterna = reservasSemana.filter(r => r.area === 'externa');
        
        const totalReservas = reservasSemana.length;
        const percInterna = totalReservas > 0 ? Math.round((reservasInterna.length / totalReservas) * 100) : 0;
        const percExterna = totalReservas > 0 ? Math.round((reservasExterna.length / totalReservas) * 100) : 0;
        
        const receitaTotal = reservasSemana.reduce((sum, r) => sum + getValorReserva(r), 0);
        
        const diasConsiderados = Math.max(1, Math.round((fimSemana - inicioSemana) / 86400000) + 1);
        const mediaDia = totalReservas > 0 ? (totalReservas / diasConsiderados) : 0;
        
        const capacidadeTotal = mesas.filter(m => m.status === 'ativa').reduce((sum, m) => sum + (m.capacidade || 0), 0) || 100;
        const pessoasSemana = reservasSemana.reduce((sum, r) => sum + (r.adultos || 0) + (r.criancas || 0), 0);
        const ocupacaoMedia = capacidadeTotal > 0 ? Math.round((pessoasSemana / (capacidadeTotal * diasConsiderados)) * 100) : 0;
        
        const intervaloElem = document.getElementById('dashSemanaIntervalo');
        if (intervaloElem) intervaloElem.textContent = `${formatarData(inicioSemanaStr)} - ${formatarData(fimSemanaStr)}`;

        const percInternaLabel = document.getElementById('dashPercInternaLabel');
        const percExternaLabel = document.getElementById('dashPercExternaLabel');
        const percInternaBar = document.getElementById('dashPercInternaBar');
        const percExternaBar = document.getElementById('dashPercExternaBar');
        if (percInternaLabel) percInternaLabel.textContent = `${percInterna}%`;
        if (percExternaLabel) percExternaLabel.textContent = `${percExterna}%`;
        if (percInternaBar) percInternaBar.style.width = `${percInterna}%`;
        if (percExternaBar) percExternaBar.style.width = `${percExterna}%`;

        const totalElem = document.getElementById('dashSemanaTotal');
        const receitaElem = document.getElementById('dashSemanaReceita');
        const mediaElem = document.getElementById('dashSemanaMediaDia');
        const ocupacaoElem = document.getElementById('dashSemanaOcupacao');
        if (totalElem) totalElem.textContent = totalReservas;
        if (receitaElem) receitaElem.textContent = formatarMoeda(receitaTotal);
        if (mediaElem) mediaElem.textContent = mediaDia.toFixed(1).replace('.0', '');
        if (ocupacaoElem) ocupacaoElem.textContent = `${ocupacaoMedia}%`;
    }
    
    // Função para atualizar próximas reservas
    function atualizarProximasReservas() {
        console.log('📅 Atualizando próximas reservas...');
        const proximasReservasDiv = document.getElementById('proximasReservas');
        if (!proximasReservasDiv) return;
        const hojeStr = normalizarDataISO(new Date());
        const proximas = reservas
            .map(r => ({ ...r, dataISO: normalizarDataISO(r.data) }))
            .filter(r => isReservaAtiva(r) && r.dataISO && r.dataISO >= hojeStr)
            .sort((a, b) => a.dataISO.localeCompare(b.dataISO))
            .slice(0, 5);
        console.log('⌛ Próximas reservas:', proximas.length);
        if (proximas.length === 0) {
            proximasReservasDiv.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-calendar-times text-muza-gold text-4xl mb-4 opacity-50"></i>
                    <p class="text-muza-cream opacity-70 font-raleway">Nenhuma reserva encontrada</p>
                </div>
            `;
            return;
        }
        proximasReservasDiv.innerHTML = proximas.map(r => {
            const nomeCompleto = getNomeCompleto(r);
            const descricaoMesas = getDescricaoMesas(r);
            const pessoasTexto = `${r.adultos || 0}A${r.criancas ? ` • ${r.criancas}C` : ''}`;
            return `
            <div class="bg-muza-dark bg-opacity-40 rounded-xl border border-muza-gold/10 p-4">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <p class="text-sm text-muza-cream/70">Data</p>
                        <p class="text-muza-gold font-bold text-lg">${formatarData(r.dataISO || r.data)}</p>
                        <p class="text-muza-cream font-raleway">${nomeCompleto}</p>
                        <p class="text-xs text-muza-cream/60">${r.whatsapp || ''}</p>
                    </div>
                    <div class="text-right space-y-1">
                        <span class="inline-flex px-3 py-1 rounded-full text-xs font-bold ${getAreaColor(r.area)}">
                            ${r.area === 'interna' ? 'Área Interna' : 'Área Externa'}
                        </span>
                        <p class="text-sm text-muza-cream/80">Pessoas: <strong>${pessoasTexto}</strong></p>
                        ${descricaoMesas ? `<p class="text-xs text-muza-gold flex items-center gap-1 justify-end"><i class="fas fa-chair"></i>${descricaoMesas}</p>` : ''}
                    </div>
                </div>
            </div>`;
        }).join('');
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
                const targetContent = document.getElementById('tab' + tabId.charAt(0).toUpperCase() + tabId.slice(1));
                if (targetContent) {
                    targetContent.classList.remove('hidden');
                    if (tabId === 'agenda') {
                        carregarBloqueiosAgenda();
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
        

    }, 100);
});
})();
