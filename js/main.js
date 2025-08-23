// Muzza Jazz Club - JavaScript Principal

// Função para atualizar preços na tela
function atualizarPrecosNaTela() {
    // Verificar se há uma data selecionada e se é evento especial
    const dataSelecionada = document.getElementById('data')?.value;
    const eventoEspecial = dataSelecionada ? eventosEspeciais.find(e => e.data === dataSelecionada) : null;
    
    if (eventoEspecial) {
        // Atualizar preços para evento especial
        const precoInternaSexa = document.getElementById('preco-interna-sexta');
        const precoInternaSabado = document.getElementById('preco-interna-sabado');
        const precoExterna = document.getElementById('preco-externa');
        
        if (eventoEspecial.tipo === 'gratuito') {
            if (precoInternaSexa) precoInternaSexa.textContent = 'Entrada Gratuita';
            if (precoInternaSabado) precoInternaSabado.textContent = 'Entrada Gratuita';
            if (precoExterna) precoExterna.textContent = 'Entrada Gratuita';
        } else {
            const precoInterna = eventoEspecial.precoInterna || 0;
            const precoExt = eventoEspecial.precoExterna || 0;
            
            if (precoInternaSexa) precoInternaSexa.textContent = precoInterna === 0 ? 'Entrada Gratuita' : `R$ ${precoInterna}`;
            if (precoInternaSabado) precoInternaSabado.textContent = precoInterna === 0 ? 'Entrada Gratuita' : `R$ ${precoInterna}`;
            if (precoExterna) precoExterna.textContent = precoExt === 0 ? 'Entrada Gratuita' : `R$ ${precoExt}`;
        }
        return;
    }
    
    // Preços padrão
    if (!precosAtuais || !precosAtuais.precos) {
        console.log('Sem preços para atualizar');
        return;
    }
    
    const precos = precosAtuais.precos;
    console.log('Atualizando preços na tela:', precos);
    
    // Atualizar seção de valores
    const precoInternaSexa = document.getElementById('preco-interna-sexta');
    const precoInternaSabado = document.getElementById('preco-interna-sabado');
    const precoExterna = document.getElementById('preco-externa');
    
    if (precoInternaSexa) {
        const valor = Number(precos.interna_sexta) === 0 ? 'Entrada Gratuita' : `R$ ${precos.interna_sexta}`;
        precoInternaSexa.textContent = valor;
        console.log('Sexta atualizada:', valor);
    }
    if (precoInternaSabado) {
        const valor = Number(precos.interna_sabado) === 0 ? 'Entrada Gratuita' : `R$ ${precos.interna_sabado}`;
        precoInternaSabado.textContent = valor;
        console.log('Sábado atualizado:', valor);
    }
    if (precoExterna) {
        const valor = Number(precos.externa) === 0 ? 'Entrada Gratuita' : `R$ ${precos.externa}`;
        precoExterna.textContent = valor;
        console.log('Externa atualizada:', valor);
    }
    
    // Atualizar cards de seleção
    const cardInternaPrecos = document.getElementById('card-interna-precos');
    const cardExternaPrecos = document.getElementById('card-externa-precos');
    
    if (cardInternaPrecos) {
        const sexta = Number(precos.interna_sexta) === 0 ? 'Gratuita' : `R$ ${precos.interna_sexta}`;
        const sabado = Number(precos.interna_sabado) === 0 ? 'Gratuita' : `R$ ${precos.interna_sabado}`;
        cardInternaPrecos.textContent = `Sex: ${sexta} | Sáb: ${sabado}`;
    }
    if (cardExternaPrecos) {
        const externa = Number(precos.externa) === 0 ? 'Sempre Gratuita' : `Sempre R$ ${precos.externa}`;
        cardExternaPrecos.textContent = externa;
    }
    
    // Atualizar desconto de crianças
    const descontoCriancas = document.getElementById('desconto-criancas');
    if (descontoCriancas) {
        const desconto = Number(precos.crianca_desconto);
        const precoFixo = Number(precos.crianca_preco_fixo || 0);
        
        if (desconto === 0) {
            descontoCriancas.textContent = 'Entrada gratuita';
        } else if (desconto === -1) {
            descontoCriancas.textContent = precoFixo === 0 ? 'Entrada gratuita' : `Preço fixo: R$ ${precoFixo}`;
        } else if (desconto === 50) {
            descontoCriancas.textContent = 'Pagam meia entrada';
        } else {
            descontoCriancas.textContent = `${desconto}% de desconto`;
        }
    }
}

// Controle de scroll e efeitos do hero
let lastScrollPosition = window.scrollY;
let ticking = false;

window.addEventListener('scroll', function() {
    lastScrollPosition = window.scrollY;
    
    if (!ticking) {
        window.requestAnimationFrame(function() {
            const heroContent = document.getElementById('heroContent');
            const scrollDown = document.getElementById('scrollDown');
            const heroOverlay = document.getElementById('heroOverlay');
            
            if (lastScrollPosition > 50) {
                heroContent.classList.add('visible');
                scrollDown.classList.add('hidden');
                heroOverlay.classList.remove('bg-opacity-0');
                heroOverlay.classList.add('bg-opacity-40');
            } else {
                heroContent.classList.remove('visible');
                scrollDown.classList.remove('hidden');
                heroOverlay.classList.remove('bg-opacity-40');
                heroOverlay.classList.add('bg-opacity-0');
            }
            ticking = false;
        });
        ticking = true;
    }
});

// Funções do modal lightbox
function openModal(src, alt) {
    const modal = document.getElementById('lightboxModal');
    const modalImg = document.getElementById('modalImage');
    modalImg.src = src;
    modalImg.alt = alt;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('lightboxModal');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

// Event listeners para o modal
document.addEventListener('DOMContentLoaded', function() {
    // Fechar modal com X ou clique fora
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('lightboxModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });

    // Fechar modal com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
});

// Menu mobile
const mobileMenuButton = document.getElementById('mobileMenuButton');
const mobileMenu = document.getElementById('mobileMenu');
const closeMobileMenu = document.getElementById('closeMobileMenu');

mobileMenuButton.addEventListener('click', function() {
    mobileMenu.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
});

closeMobileMenu.addEventListener('click', function() {
    mobileMenu.classList.add('hidden');
    document.body.style.overflow = '';
});

// Fechar menu mobile ao clicar em link
mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function() {
        mobileMenu.classList.add('hidden');
        document.body.style.overflow = '';
    });
});

// Scroll suave para âncoras
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetId === '#') {
            e.preventDefault();
            return;
        }

        if (targetElement) {
            e.preventDefault();
            
            const startPosition = window.pageYOffset;
            const targetPosition = targetElement.getBoundingClientRect().top + startPosition;
            const distance = targetPosition - startPosition;
            const duration = 800;
            let startTime = null;

            let animationFrame;
            function animation(currentTime) {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
                window.scrollTo(0, run);
                if (timeElapsed < duration) {
                    animationFrame = requestAnimationFrame(animation);
                } else {
                    cancelAnimationFrame(animationFrame);
                }
            }

            function easeInOutQuad(t, b, c, d) {
                t /= d/2;
                if (t < 1) return c/2*t*t + b;
                t--;
                return -c/2 * (t*(t-2) - 1) + b;
            }

            animationFrame = requestAnimationFrame(animation);

            // Animação de destaque na seção
            targetElement.classList.add('animate-pulse');
            setTimeout(() => {
                targetElement.classList.remove('animate-pulse');
            }, 1500);
        }
    });
});

// Sistema dinâmico de preços e capacidade
let precosAtuais = {
    tipo: 'padrao',
    precos: { interna_sexta: 35, interna_sabado: 50, externa: 35, crianca_desconto: 50 }
};
let capacidadeAtual = {
    capacidade: { interna: 40, externa: 60 },
    disponivel: { interna: 35, externa: 55 }
};
let eventosEspeciais = [];

async function carregarPrecos(data) {
    try {
        // Sempre usar a API do backend para garantir consistência
        const url = data ? `${API_BASE_URL}/config/precos/${data}` : `${API_BASE_URL}/config/precos`;
        const response = await fetch(url);
        if (response.ok) {
            const dadosAPI = await response.json();
            precosAtuais = dadosAPI;
            console.log('✅ Preços carregados da API:', precosAtuais);
            
            // Atualizar localStorage como cache
            localStorage.setItem('muzza_precos_cache', JSON.stringify(precosAtuais));
            return precosAtuais;
        } else {
            throw new Error('API não disponível');
        }
    } catch (error) {
        console.warn('⚠️ API indisponível, usando cache local:', error);
        
        // Tentar usar cache local primeiro
        const cache = localStorage.getItem('muzza_precos_cache');
        if (cache) {
            precosAtuais = JSON.parse(cache);
            console.log('📦 Usando preços do cache:', precosAtuais);
            return precosAtuais;
        }
        
        // Fallback para preços padrão
        precosAtuais = {
            tipo: 'padrao',
            precos: { interna_sexta: 35, interna_sabado: 50, externa: 35, crianca_desconto: 50 }
        };
        console.log('🔄 Usando preços padrão:', precosAtuais);
        return precosAtuais;
    }
}

async function carregarCapacidade(data) {
    try {
        const url = data ? `${API_BASE_URL}/config/capacidade/${data}` : `${API_BASE_URL}/config/capacidade`;
        const response = await fetch(url);
        if (response.ok) {
            capacidadeAtual = await response.json();
            console.log('Capacidade carregada:', capacidadeAtual);
        }
        return capacidadeAtual;
    } catch (error) {
        console.error('Erro ao carregar capacidade:', error);
        return null;
    }
}

async function carregarEventos() {
    try {
        console.log('🎭 Carregando eventos especiais...');
        const response = await fetch(`${API_BASE_URL}/eventos`);
        console.log('📡 Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('📋 Dados recebidos da API:', data);
            
            // Validar estrutura da resposta
            if (data && Array.isArray(data.eventos)) {
                eventosEspeciais = data.eventos;
                console.log('✅ Eventos especiais carregados:', eventosEspeciais.length, 'eventos');
                eventosEspeciais.forEach(evento => {
                    console.log(`   📅 ${evento.data} - ${evento.nome} (${evento.tipo})`);
                });
                
                // Salvar no localStorage como cache
                localStorage.setItem('muzza_eventos_cache', JSON.stringify(eventosEspeciais));
            } else {
                console.warn('⚠️ Estrutura de dados inválida, tentando cache local');
                const cache = localStorage.getItem('muzza_eventos_cache');
                if (cache) {
                    eventosEspeciais = JSON.parse(cache);
                    console.log('📦 Usando eventos do cache:', eventosEspeciais.length);
                }
            }
        } else {
            console.warn('⚠️ API indisponível, tentando cache local');
            const cache = localStorage.getItem('muzza_eventos_cache');
            if (cache) {
                eventosEspeciais = JSON.parse(cache);
                console.log('📦 Usando eventos do cache:', eventosEspeciais.length);
            }
        }
        
        return eventosEspeciais;
    } catch (error) {
        console.error('❌ Erro ao carregar eventos:', error);
        // Tentar cache local em caso de erro
        const cache = localStorage.getItem('muzza_eventos_cache');
        if (cache) {
            eventosEspeciais = JSON.parse(cache);
            console.log('📦 Usando eventos do cache após erro:', eventosEspeciais.length);
        }
        return eventosEspeciais;
    }
}

function getPrice() {
    const data = document.getElementById('data').value;
    const area = document.getElementById('area').value;
    
    if (!data || !area) return 0;
    
    // Verificar se é evento especial
    const eventoEspecial = eventosEspeciais.find(e => e.data === data);
    if (eventoEspecial) {
        console.log('Evento especial encontrado:', eventoEspecial);
        if (eventoEspecial.tipo === 'gratuito') {
            return 0;
        } else if (eventoEspecial.tipo === 'especial') {
            const preco = area === 'externa' ? (eventoEspecial.precoExterna || 0) : (eventoEspecial.precoInterna || 0);
            console.log(`Preço do evento para ${area}:`, preco);
            return preco;
        }
    }
    
    // Preços padrão
    if (!precosAtuais) {
        const dayOfWeek = new Date(data + 'T00:00:00').getDay();
        if (area === 'externa') return 35;
        if (area === 'interna') {
            return dayOfWeek === 6 ? 50 : 35;
        }
        return 0;
    }
    
    const dayOfWeek = new Date(data + 'T00:00:00').getDay();
    const precos = precosAtuais.precos;
    
    if (area === 'externa') {
        return precos?.externa || 35;
    } else if (area === 'interna') {
        if (dayOfWeek === 5) {
            return precos?.interna_sexta || 35;
        } else if (dayOfWeek === 6) {
            return precos?.interna_sabado || 50;
        }
    }
    
    return 0;
}

function getPriceChild() {
    const data = document.getElementById('data').value;
    const precoAdulto = getPrice();
    
    // Verificar se é evento especial
    const eventoEspecial = eventosEspeciais.find(e => e.data === data);
    if (eventoEspecial) {
        console.log('Evento especial encontrado para criança:', eventoEspecial);
        if (eventoEspecial.tipo === 'gratuito') {
            return 0;
        } else if (eventoEspecial.tipoCrianca === 'gratuito') {
            return 0;
        } else if (eventoEspecial.tipoCrianca === 'personalizado') {
            const preco = eventoEspecial.precoPersonalizadoCrianca || 0;
            console.log('Preço personalizado criança:', preco);
            return preco;
        } else {
            const percentual = parseInt(eventoEspecial.tipoCrianca) || 50;
            const precoCalculado = Math.round(precoAdulto * (percentual / 100));
            console.log(`Preço criança (${percentual}% de ${precoAdulto}):`, precoCalculado);
            return precoCalculado;
        }
    }
    
    // Preços padrão
    const desconto = precosAtuais?.precos?.crianca_desconto || 50;
    const precoFixo = precosAtuais?.precos?.crianca_preco_fixo || 0;
    
    if (desconto === 0) return 0;
    if (desconto === -1) return precoFixo;
    
    return Math.round(precoAdulto * (desconto / 100));
}

function updateTotal() {
    const adultosElement = document.getElementById('adultos');
    const criancasElement = document.getElementById('criancas');
    let totalElement = document.getElementById('totalValue');
    
    // Se estiver mostrando evento especial, usar o elemento totalCalculado
    const totalCalculado = document.getElementById('totalCalculado');
    if (totalCalculado) {
        totalElement = totalCalculado;
    }
    
    if (!adultosElement || !criancasElement || !totalElement) {
        return;
    }
    
    const adultos = parseInt(adultosElement.value) || 0;
    const criancas = parseInt(criancasElement.value) || 0;
    
    const precoAdulto = getPrice();
    const precoCrianca = getPriceChild();
    

    
    const area = document.getElementById('area').value;
    const data = document.getElementById('data').value;
    
    if (!area || !data) {
        totalElement.innerHTML = '<div class="text-lg">Total: <span class="font-bold">--</span></div><div class="text-sm text-muza-cream opacity-80">Selecione data e área primeiro</div>';
        return;
    }
    
    if ((precoAdulto > 0 || precoCrianca >= 0) && (adultos > 0 || criancas > 0)) {
        const totalAdultos = adultos * precoAdulto;
        const totalCriancas = criancas * precoCrianca;
        const total = totalAdultos + totalCriancas;
        
        let detalhes = '';
        if (adultos > 0) {
            detalhes += precoAdulto === 0 ? `${adultos} adulto(s): Gratuito` : `${adultos} adulto(s): R$ ${totalAdultos}`;
        }
        if (criancas > 0) {
            if (detalhes) detalhes += ' + ';
            detalhes += precoCrianca === 0 ? `${criancas} criança(s): Gratuito` : `${criancas} criança(s): R$ ${totalCriancas}`;
        }
        
        const totalTexto = total === 0 ? 'Entrada Gratuita' : `R$ ${total}`;
        totalElement.innerHTML = `<div class="text-lg">Total: <span class="font-bold">${totalTexto}</span></div><div class="text-sm text-muza-cream opacity-80">${detalhes}</div>`;
    } else {
        totalElement.innerHTML = '<div class="text-lg">Total: <span class="font-bold">R$ 0</span></div><div class="text-sm text-muza-cream opacity-80">Selecione quantidade</div>';
    }
}

// Controle dos contadores
function updateCounter(inputId, change, min = 0) {
    // Verificar se o elemento de input existe
    const input = document.getElementById(inputId);
    if (!input) {
        console.error(`Elemento ${inputId} não encontrado`);
        return false;
    }
    
    // Verificar se nome foi preenchido
    const nomeInput = document.getElementById('nome');
    if (!nomeInput || !nomeInput.value.trim()) {
        alert('Por favor, preencha seu nome primeiro.');
        nomeInput?.focus();
        return false;
    }
    
    // Verificar se WhatsApp foi preenchido
    const whatsappInput = document.getElementById('whatsapp');
    if (!whatsappInput || !whatsappInput.value.trim()) {
        alert('Por favor, preencha seu WhatsApp primeiro.');
        whatsappInput?.focus();
        return false;
    }
    
    // Verificar se data foi selecionada
    const dataInput = document.getElementById('data');
    if (!dataInput || !dataInput.value) {
        alert('Por favor, selecione uma data primeiro.');
        return false;
    }
    
    // Verificar se área foi selecionada
    const areaInput = document.getElementById('area');
    if (!areaInput || !areaInput.value) {
        alert('Por favor, selecione uma área primeiro.');
        return false;
    }
    
    let currentValue = parseInt(input.value) || (inputId === 'adultos' ? 1 : 0);
    const newValue = Math.max(min, Math.min(20, currentValue + change));
    
    input.value = newValue;
    return true;
}

// Event listeners para o formulário
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um pouco para garantir que todos os elementos estejam carregados
    setTimeout(() => {
        // Controles dos contadores
        const decreaseAdults = document.getElementById('decreaseAdults');
        const increaseAdults = document.getElementById('increaseAdults');
        const decreaseChildren = document.getElementById('decreaseChildren');
        const increaseChildren = document.getElementById('increaseChildren');
        const areaSelect = document.getElementById('area');
        const dataInput = document.getElementById('data');
        
        if (decreaseAdults) decreaseAdults.addEventListener('click', () => { 
            if (updateCounter('adultos', -1, 1)) updateTotal(); 
        });
        if (increaseAdults) increaseAdults.addEventListener('click', () => { 
            if (updateCounter('adultos', 1, 1)) updateTotal(); 
        });
        if (decreaseChildren) decreaseChildren.addEventListener('click', () => { 
            if (updateCounter('criancas', -1, 0)) updateTotal(); 
        });
        if (increaseChildren) increaseChildren.addEventListener('click', () => { 
            if (updateCounter('criancas', 1, 0)) updateTotal(); 
        });
        
        // Seleção de área por cards
        const areaCards = document.querySelectorAll('.area-card');
        const areaInput = document.getElementById('area');
        
        areaCards.forEach(card => {
            card.addEventListener('click', function() {
                // Remove seleção anterior
                areaCards.forEach(c => c.classList.remove('selected'));
                // Adiciona seleção atual
                this.classList.add('selected');
                // Atualiza valor
                areaInput.value = this.dataset.area;
                updateTotal();
            });
        });
        
        // Atualizar total quando mudar data ou área
        if (dataInput) {
            dataInput.addEventListener('change', async function() {
                const data = this.value;
                console.log('📅 Data alterada para:', data);
                if (data) {
                    const eventoEspecial = eventosEspeciais.find(e => e.data === data);
                    if (eventoEspecial) {
                        console.log('✨ Data selecionada tem evento especial:', eventoEspecial.nome);
                    }
                    
                    await carregarPrecos(data);
                    await carregarCapacidade(data);
                    verificarDisponibilidade();
                }
                updateTotal();
            });
        }
        
        if (areaInput) {
            areaInput.addEventListener('change', function() {
                updateTotal();
            });
        }
        
        // Validação de WhatsApp
        const whatsappInput = document.getElementById('whatsapp');
        if (whatsappInput) {
            whatsappInput.addEventListener('input', function() {
                let value = this.value.replace(/\D/g, '');
                if (value.length >= 10) {
                    if (value.length === 10) {
                        value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
                    } else if (value.length === 11) {
                        value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                    }
                }
                this.value = value;
                
                const cleanNumber = value.replace(/\D/g, '');
                if (cleanNumber.length < 10 || cleanNumber.length > 11) {
                    this.setCustomValidity('Digite um número válido com DDD');
                } else {
                    this.setCustomValidity('');
                }
            });
        }
        
        // Carregar preços padrão e eventos
        Promise.all([carregarPrecos(), carregarEventos()]).then(() => {
            console.log('🔄 Dados carregados, atualizando interface...');
            console.log('📋 Eventos carregados:', eventosEspeciais);
            updateTotal();
            atualizarPrecosNaTela();
            mostrarAvisosEventosEspeciais();
            // Navegar para mês do primeiro evento e renderizar
            navegarParaPrimeiroEvento();
        });
        
        // Recarregar preços e eventos a cada 60 segundos para sincronizar com admin
        setInterval(async () => {
            const precosAnteriores = JSON.stringify(precosAtuais);
            const eventosAnteriores = JSON.stringify(eventosEspeciais);
            
            await Promise.all([carregarPrecos(), carregarEventos()]);
            
            const precosAlterados = JSON.stringify(precosAtuais) !== precosAnteriores;
            const eventosAlterados = JSON.stringify(eventosEspeciais) !== eventosAnteriores;
            
            if (precosAlterados || eventosAlterados) {
                console.log('🔄 Dados alterados, atualizando interface...');
                if (precosAlterados) console.log('   💰 Preços alterados');
                if (eventosAlterados) console.log('   🎭 Eventos alterados');
                
                updateTotal();
                atualizarPrecosNaTela();
                mostrarAvisosEventosEspeciais();
                renderCalendar();
                
                // Atualizar preços se há data selecionada
                const dataSelecionada = document.getElementById('data')?.value;
                if (dataSelecionada) {
                    const eventoEspecial = eventosEspeciais.find(e => e.data === dataSelecionada);
                    atualizarPrecosCards(eventoEspecial);
                }
                
                // Forçar atualização visual dos eventos
                setTimeout(() => {
                    if (window.forcarAtualizacaoEventos) {
                        window.forcarAtualizacaoEventos();
                    }
                }, 100);
            }
        }, 60000);
        
        // Escuta de eventos do localStorage para sincronização entre abas
        window.addEventListener('storage', function(e) {
            if (e.key === 'precos_updated') {
                console.log('💰 Preços atualizados no admin, recarregando...');
                carregarPrecos().then(() => {
                    updateTotal();
                    atualizarPrecosNaTela();
                    const dataSelecionada = document.getElementById('data')?.value;
                    if (dataSelecionada) {
                        const eventoEspecial = eventosEspeciais.find(ev => ev.data === dataSelecionada);
                        atualizarPrecosCards(eventoEspecial);
                    }
                });
            } else if (e.key === 'eventos_updated') {
                console.log('🎭 Eventos atualizados no admin, recarregando...');
                carregarEventos().then(() => {
                    renderCalendar();
                    mostrarAvisosEventosEspeciais();
                    const dataSelecionada = document.getElementById('data')?.value;
                    if (dataSelecionada) {
                        const eventoEspecial = eventosEspeciais.find(ev => ev.data === dataSelecionada);
                        atualizarPrecosCards(eventoEspecial);
                        atualizarPrecosNaTela();
                    }
                });
            }
        });
        
        // Função para verificar disponibilidade
        window.verificarDisponibilidade = function() {
            if (!capacidadeAtual || !capacidadeAtual.disponivel) return;
            
            const area = document.getElementById('area').value;
            const adultos = parseInt(document.getElementById('adultos').value) || 0;
            const criancas = parseInt(document.getElementById('criancas').value) || 0;
            const totalPessoas = adultos + criancas;
            
            if (area && capacidadeAtual.disponivel[area] < totalPessoas) {
                alert(`Capacidade esgotada! Disponível: ${capacidadeAtual.disponivel[area]} pessoas na área ${area}`);
                return false;
            }
            return true;
        };
    }, 100);
    
    // Calendário personalizado
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let selectedDate = null;
    
    function renderCalendar() {
        console.log('📅 Renderizando calendário...');
        console.log('   🎭 Eventos disponíveis:', eventosEspeciais.length);
        console.log('   📅 Mês/Ano atual:', currentMonth + 1, currentYear);
        if (eventosEspeciais.length === 0) {
            console.log('   ⚠️ Nenhum evento disponível para renderizar');
        }
        eventosEspeciais.forEach(evento => {
            console.log(`   ⭐ ${evento.data} - ${evento.nome} (${evento.tipo})`);
        });
        
        const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                           'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        
        document.getElementById('monthYear').textContent = `${monthNames[currentMonth]} ${currentYear}`;
        
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const calendarDays = document.getElementById('calendarDays');
        calendarDays.innerHTML = '';
        
        // Dias vazios do início do mês
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'p-2';
            calendarDays.appendChild(emptyDay);
        }
        
        // Teste direto para dia 23 de outubro de 2025
        if (currentMonth === 9 && currentYear === 2025) {
            const testeData = '2025-10-23';
            const eventoTeste = eventosEspeciais.find(e => e.data === testeData);
            console.log(`🔍 TESTE: Procurando evento para ${testeData}:`, eventoTeste);
        }
        
        // Dias do mês
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const dayOfWeek = date.getDay();
            const isPast = date < today;
            const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
            
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const dayStr = String(date.getDate()).padStart(2, '0');
            const dateString = `${year}-${month}-${dayStr}`;
            
            const eventoEspecial = eventosEspeciais.find(e => {
                console.log(`   🔍 Comparando: evento.data='${e.data}' com dateString='${dateString}'`);
                return e.data === dateString;
            });
            if (eventoEspecial) {
                console.log(`   🎆 Dia ${day} (${dateString}) tem evento: ${eventoEspecial.nome}`);
            } else {
                console.log(`   ❌ Dia ${day} (${dateString}) SEM evento`);
            }
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            
            if (isPast) {
                dayElement.classList.add('past');
            } else if (eventoEspecial) {
                console.log(`   ✨ APLICANDO evento especial ao dia ${day} (${dateString})`);
                dayElement.classList.add('evento-especial', 'available');
                dayElement.title = `Evento Especial: ${eventoEspecial.nome}`;
                dayElement.addEventListener('click', () => selectDate(date, eventoEspecial));
                dayElement.textContent = day;
                console.log(`   ✅ Evento especial aplicado ao dia ${day}`);
            } else if (isWeekend) {
                dayElement.classList.add('available');
                dayElement.addEventListener('click', () => selectDate(date));
            } else {
                dayElement.classList.add('disabled');
            }
            
            if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
                dayElement.classList.add('selected');
            }
            
            calendarDays.appendChild(dayElement);
        }
        
        console.log('✅ Calendário renderizado');
    }
    
    function selectDate(date, eventoEspecial = null) {
        selectedDate = date;
        // Usar formato local para evitar problemas de fuso horário
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        
        document.getElementById('data').value = dateString;
        document.getElementById('dataDisplay').value = date.toLocaleDateString('pt-BR');
        document.getElementById('calendar').classList.add('hidden');
        
        // Carregar preços específicos da data
        carregarPrecos(dateString).then(() => {
            // Mostrar informações do evento especial
            if (eventoEspecial) {
                mostrarInfoEvento(eventoEspecial);
            } else {
                ocultarInfoEvento();
            }
            
            // Atualizar preços dos cards de área
            atualizarPrecosCards(eventoEspecial);
            
            // Atualizar preços na seção de valores
            atualizarPrecosNaTela();
            
            updateTotal();
        });
        
        renderCalendar();
    }
    
    // Event listeners do calendário
    document.getElementById('dataDisplay').addEventListener('click', function() {
        document.getElementById('calendar').classList.toggle('hidden');
    });
    
    document.getElementById('prevMonth').addEventListener('click', function() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });
    
    document.getElementById('nextMonth').addEventListener('click', function() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });
    
    // Fechar calendário ao clicar fora
    document.addEventListener('click', function(e) {
        const calendar = document.getElementById('calendar');
        const dataDisplay = document.getElementById('dataDisplay');
        if (!calendar.contains(e.target) && e.target !== dataDisplay) {
            calendar.classList.add('hidden');
        }
    });
    
    // Funções para mostrar informações do evento especial
    function mostrarInfoEvento(evento) {
        const valoresCard = document.querySelector('.reservation-card');
        
        // Criar conteúdo do evento especial
        let precoTexto = '';
        if (evento.tipo === 'gratuito') {
            precoTexto = '<div class="text-center text-green-400 font-bold text-lg mb-4">🎉 ENTRADA GRATUITA 🎉</div>';
        } else {
            precoTexto = `
                <div class="bg-muza-dark bg-opacity-50 rounded-lg p-4 mb-4">
                    <h5 class="text-muza-gold font-bold mb-3 text-center">Preços Especiais:</h5>
                    <div class="grid grid-cols-2 gap-3 text-sm mb-3">
                        <div class="text-center p-3 bg-muza-wood bg-opacity-30 rounded">
                            <div class="font-bold text-muza-gold">Área Interna</div>
                            <div class="text-muza-cream text-lg">R$ ${evento.precoInterna || 0}</div>
                        </div>
                        <div class="text-center p-3 bg-muza-wood bg-opacity-30 rounded">
                            <div class="font-bold text-muza-gold">Área Externa</div>
                            <div class="text-muza-cream text-lg">R$ ${evento.precoExterna || 0}</div>
                        </div>
                    </div>
                    <div class="text-center p-3 bg-muza-burgundy bg-opacity-20 rounded">
                        <i class="fas fa-child text-muza-gold text-xl mb-2"></i>
                        <div class="font-bold text-muza-gold">Crianças (até 14 anos)</div>
                        <div class="text-muza-cream">${obterTextoCriancas(evento)}</div>
                    </div>
                </div>
            `;
        }
        
        valoresCard.innerHTML = `
            <div class="text-center border-2 border-muza-gold rounded-lg p-6 bg-muza-gold bg-opacity-10">
                <div class="flex items-center justify-center mb-3">
                    <i class="fas fa-star text-muza-gold text-xl mr-2"></i>
                    <h3 class="text-xl font-bold text-muza-gold">EVENTO ESPECIAL</h3>
                    <i class="fas fa-star text-muza-gold text-xl ml-2"></i>
                </div>
                <h4 class="text-2xl font-playfair font-bold text-muza-cream mb-3">${evento.nome}</h4>
                ${evento.descricao ? `<p class="text-muza-cream text-sm mb-4 italic">${evento.descricao}</p>` : ''}
                ${precoTexto}
                <div class="text-center">
                    <p class="text-muza-cream text-sm italic mb-4">
                        Ficou em dúvida? Entre em contato conosco no WhatsApp
                    </p>
                    <a href="https://wa.me/+5562998380208" class="inline-flex items-center bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition duration-300">
                        <i class="fab fa-whatsapp text-xl mr-2"></i> WHATSAPP
                    </a>
                </div>
            </div>
        `;
    }
    
    function obterTextoCriancas(evento) {
        if (evento.tipoCrianca === 'gratuito') {
            return 'Entrada gratuita';
        } else if (evento.tipoCrianca === 'personalizado') {
            return `R$ ${evento.precoPersonalizadoCrianca || 0}`;
        } else {
            return `${evento.tipoCrianca || 50}% do preço do adulto`;
        }
    }
    
    function atualizarPrecosCards(eventoEspecial = null) {
        const cardInternaPrecos = document.getElementById('card-interna-precos');
        const cardExternaPrecos = document.getElementById('card-externa-precos');
        
        if (eventoEspecial) {
            if (eventoEspecial.tipo === 'gratuito') {
                if (cardInternaPrecos) cardInternaPrecos.textContent = 'Entrada Gratuita';
                if (cardExternaPrecos) cardExternaPrecos.textContent = 'Entrada Gratuita';
            } else {
                const precoInterna = eventoEspecial.precoInterna || 0;
                const precoExterna = eventoEspecial.precoExterna || 0;
                if (cardInternaPrecos) cardInternaPrecos.textContent = precoInterna === 0 ? 'Gratuita' : `R$ ${precoInterna}`;
                if (cardExternaPrecos) cardExternaPrecos.textContent = precoExterna === 0 ? 'Gratuita' : `R$ ${precoExterna}`;
            }
            
            // Atualizar preços nos cards de área para eventos especiais
            const cardInterna = document.querySelector('[data-area="interna"]');
            const cardExterna = document.querySelector('[data-area="externa"]');
            
            if (cardInterna) {
                const precoInternaCard = cardInterna.querySelector('#card-interna-precos');
                if (precoInternaCard) {
                    if (eventoEspecial.tipo === 'gratuito') {
                        precoInternaCard.textContent = 'Entrada Gratuita';
                    } else {
                        const preco = eventoEspecial.precoInterna || 0;
                        precoInternaCard.textContent = preco === 0 ? 'Gratuita' : `R$ ${preco}`;
                    }
                }
            }
            
            if (cardExterna) {
                const precoExternaCard = cardExterna.querySelector('#card-externa-precos');
                if (precoExternaCard) {
                    if (eventoEspecial.tipo === 'gratuito') {
                        precoExternaCard.textContent = 'Entrada Gratuita';
                    } else {
                        const preco = eventoEspecial.precoExterna || 0;
                        precoExternaCard.textContent = preco === 0 ? 'Gratuita' : `R$ ${preco}`;
                    }
                }
            }
            
            // Atualizar também os preços na seção de valores para eventos especiais
            if (eventoEspecial.tipo === 'gratuito') {
                const precoInternaSexa = document.getElementById('preco-interna-sexta');
                const precoInternaSabado = document.getElementById('preco-interna-sabado');
                const precoExterna = document.getElementById('preco-externa');
                
                if (precoInternaSexa) precoInternaSexa.textContent = 'Entrada Gratuita';
                if (precoInternaSabado) precoInternaSabado.textContent = 'Entrada Gratuita';
                if (precoExterna) precoExterna.textContent = 'Entrada Gratuita';
            } else {
                const precoInternaSexa = document.getElementById('preco-interna-sexta');
                const precoInternaSabado = document.getElementById('preco-interna-sabado');
                const precoExterna = document.getElementById('preco-externa');
                
                const precoInterna = eventoEspecial.precoInterna || 0;
                const precoExt = eventoEspecial.precoExterna || 0;
                
                if (precoInternaSexa) precoInternaSexa.textContent = precoInterna === 0 ? 'Entrada Gratuita' : `R$ ${precoInterna}`;
                if (precoInternaSabado) precoInternaSabado.textContent = precoInterna === 0 ? 'Entrada Gratuita' : `R$ ${precoInterna}`;
                if (precoExterna) precoExterna.textContent = precoExt === 0 ? 'Entrada Gratuita' : `R$ ${precoExt}`;
            }
        } else {
            // Preços padrão
            const precos = precosAtuais?.precos;
            if (precos) {
                const sexta = Number(precos.interna_sexta) === 0 ? 'Gratuita' : `R$ ${precos.interna_sexta}`;
                const sabado = Number(precos.interna_sabado) === 0 ? 'Gratuita' : `R$ ${precos.interna_sabado}`;
                const externa = Number(precos.externa) === 0 ? 'Sempre Gratuita' : `Sempre R$ ${precos.externa}`;
                
                if (cardInternaPrecos) cardInternaPrecos.textContent = `Sex: ${sexta} | Sáb: ${sabado}`;
                if (cardExternaPrecos) cardExternaPrecos.textContent = externa;
            }
        }
    }
    
    function ocultarInfoEvento() {
        const valoresCard = document.querySelector('.reservation-card');
        valoresCard.innerHTML = `
            <h3 class="text-2xl font-bold text-muza-gold mb-6 text-center">
                <i class="fas fa-money-bill-wave mr-2"></i>Valores
            </h3>
            
            <div class="space-y-6">
                <div class="grid grid-cols-2 gap-4">
                    <div class="text-center p-4 bg-muza-wood bg-opacity-30 rounded-lg">
                        <h4 class="text-lg font-bold text-muza-gold mb-2">Área Interna</h4>
                        <div class="text-sm text-muza-cream space-y-1">
                            <div class="whitespace-nowrap">Sex: <span class="font-bold text-muza-gold" id="preco-interna-sexta">R$ 35</span></div>
                            <div class="whitespace-nowrap">Sáb: <span class="font-bold text-muza-gold" id="preco-interna-sabado">R$ 50</span></div>
                        </div>
                    </div>
                    <div class="text-center p-4 bg-muza-wood bg-opacity-30 rounded-lg">
                        <h4 class="text-lg font-bold text-muza-gold mb-2">Área Externa</h4>
                        <p class="text-muza-cream text-sm mb-1">Todos os dias:</p>
                        <p class="text-2xl font-bold text-muza-gold" id="preco-externa">R$ 35</p>
                    </div>
                </div>

                <div class="text-center p-4 bg-muza-burgundy bg-opacity-20 rounded-lg">
                    <i class="fas fa-child text-muza-gold text-2xl mb-2"></i>
                    <p class="text-muza-cream font-bold">Crianças até 14 anos</p>
                    <p class="text-muza-gold" id="desconto-criancas">Pagam meia entrada</p>
                </div>

                <div id="avisos-eventos-especiais"></div>

                <div class="text-center">
                    <p class="text-muza-cream text-sm italic mb-4">
                        Ficou em dúvida? Entre em contato conosco no WhatsApp
                    </p>
                    <a href="https://wa.me/+5562998380208" class="inline-flex items-center bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition duration-300">
                        <i class="fab fa-whatsapp text-xl mr-2"></i> WHATSAPP
                    </a>
                </div>
            </div>
        `;
        atualizarPrecosNaTela();
        mostrarAvisosEventosEspeciais();
    }
    
    function mostrarAvisosEventosEspeciais() {
        let avisosContainer = document.getElementById('avisos-eventos-especiais');
        
        // Se não existe o container, criar após o card de crianças
        if (!avisosContainer) {
            const valoresCard = document.querySelector('.reservation-card');
            if (valoresCard && !valoresCard.innerHTML.includes('EVENTO ESPECIAL')) {
                // Adicionar o container se não existir
                const criancasCard = valoresCard.querySelector('.bg-muza-burgundy');
                if (criancasCard) {
                    const avisoDiv = document.createElement('div');
                    avisoDiv.id = 'avisos-eventos-especiais';
                    criancasCard.parentNode.insertBefore(avisoDiv, criancasCard.nextSibling);
                    avisosContainer = avisoDiv;
                }
            }
        }
        
        if (!avisosContainer || !eventosEspeciais.length) return;
        
        // Filtrar eventos futuros (a partir de hoje)
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); // Zerar horas para comparar apenas a data
        
        const eventosFuturos = eventosEspeciais.filter(evento => {
            const [ano, mes, dia] = evento.data.split('-');
            const dataEvento = new Date(ano, mes - 1, dia);
            return dataEvento >= hoje;
        }).sort((a, b) => {
            const [anoA, mesA, diaA] = a.data.split('-');
            const [anoB, mesB, diaB] = b.data.split('-');
            return new Date(anoA, mesA - 1, diaA) - new Date(anoB, mesB - 1, diaB);
        });
        
        if (eventosFuturos.length === 0) {
            avisosContainer.innerHTML = '';
            return;
        }
        
        const proximosEventos = eventosFuturos.slice(0, 3); // Mostrar até 3 próximos eventos
        
        avisosContainer.innerHTML = proximosEventos.map(evento => {
            const dataFormatada = evento.data.split('-').reverse().join('/');
            const tipoTexto = evento.tipo === 'gratuito' ? 'GRATUITO' : 'ESPECIAL';
            const corFundo = evento.tipo === 'gratuito' ? 'bg-green-500' : 'bg-muza-gold';
            
            return `
                <div class="${corFundo} bg-opacity-20 border-2 border-muza-gold rounded-lg p-3 text-center mb-4 animate-pulse" style="animation: pulse-border 2s infinite;">
                    <div class="flex items-center justify-center mb-2">
                        <i class="fas fa-star text-muza-gold mr-2"></i>
                        <span class="font-bold text-muza-gold text-sm">EVENTO ${tipoTexto}</span>
                        <i class="fas fa-star text-muza-gold ml-2"></i>
                    </div>
                    <p class="font-bold text-muza-cream">${evento.nome}</p>
                    <p class="text-muza-gold text-sm font-bold">${dataFormatada}</p>
                </div>
            `;
        }).join('');
    }
    
    // Não inicializar calendário aqui - aguardar eventos serem carregados
    
    // Função para forçar atualização visual dos eventos especiais
    window.forcarAtualizacaoEventos = function() {
        console.log('🎭 Forçando atualização visual dos eventos especiais...');
        const eventoDays = document.querySelectorAll('.calendar-day.evento-especial');
        eventoDays.forEach(day => {
            // Aplicar estilos inline para garantir que sejam visíveis
            day.style.background = 'linear-gradient(135deg, #D4AF37, #FFD700)';
            day.style.color = '#1A120B';
            day.style.fontWeight = 'bold';
            day.style.border = '2px solid #D4AF37';
            day.style.boxShadow = '0 0 15px rgba(212, 175, 55, 0.6)';
            day.style.animation = 'pulse-gold 2s infinite';
        });
        console.log(`✨ ${eventoDays.length} dias de eventos especiais atualizados`);
    };
    
    // Função para navegar para o mês do primeiro evento
    function navegarParaPrimeiroEvento() {
        if (eventosEspeciais.length > 0) {
            // Filtrar eventos futuros
            const hoje = new Date();
            const eventosFuturos = eventosEspeciais.filter(e => new Date(e.data) >= hoje);
            
            if (eventosFuturos.length > 0) {
                // Ordenar eventos por data
                const eventosOrdenados = eventosFuturos.sort((a, b) => new Date(a.data) - new Date(b.data));
                const primeiroEvento = eventosOrdenados[0];
                const [ano, mes] = primeiroEvento.data.split('-');
                currentYear = parseInt(ano);
                currentMonth = parseInt(mes) - 1; // JavaScript usa 0-11 para meses
                console.log(`📅 Navegando para ${mes}/${ano} (primeiro evento: ${primeiroEvento.nome})`);
            }
        }
        renderCalendar();
    }
    
    // Executar após renderização inicial
    setTimeout(() => {
        window.forcarAtualizacaoEventos();
        // Sincronizar com o script adicional
        if (window.sincronizarEventosEspeciais) {
            window.sincronizarEventosEspeciais();
        }
    }, 1000);
    
    // Expor variáveis globalmente para sincronização
    window.eventosEspeciais = eventosEspeciais;
    window.atualizarPrecosNaTela = atualizarPrecosNaTela;
    window.renderCalendar = renderCalendar;
    
    // Atualizar variável global sempre que eventos forem carregados
    const originalCarregarEventos = carregarEventos;
    carregarEventos = async function() {
        const result = await originalCarregarEventos();
        window.eventosEspeciais = eventosEspeciais;
        return result;
    };
    
    // Rate limiting para formulário
    let ultimaSubmissao = 0;
    const INTERVALO_MINIMO = 30000; // 30 segundos
    
    // Submissão do formulário
    document.getElementById('reservationForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Verificar rate limiting
        const agora = Date.now();
        if (agora - ultimaSubmissao < INTERVALO_MINIMO) {
            const tempoRestante = Math.ceil((INTERVALO_MINIMO - (agora - ultimaSubmissao)) / 1000);
            alert(`Aguarde ${tempoRestante} segundos antes de enviar outra reserva.`);
            return;
        }
        
        const nome = document.getElementById('nome').value;
        const whatsapp = document.getElementById('whatsapp').value;
        const data = document.getElementById('data').value;
        const adultos = parseInt(document.getElementById('adultos').value);
        const criancas = parseInt(document.getElementById('criancas').value) || 0;
        const area = document.getElementById('area').value;
        const observacoes = document.getElementById('observacoes').value;
        
        const precoAdulto = getPrice();
        const precoCrianca = getPriceChild();
        const totalAdultos = adultos * precoAdulto;
        const totalCriancas = criancas * precoCrianca;
        const total = totalAdultos + totalCriancas;
        
        const reservaData = {
            nome,
            whatsapp,
            data,
            adultos,
            criancas,
            area,
            valor: total,
            observacoes
        };
        
        // Verificar capacidade antes de enviar
        try {
            const capacidadeResponse = await fetch(`${API_BASE_URL}/mesas/capacidade/${data}`);
            if (capacidadeResponse.ok) {
                const capacidadeData = await capacidadeResponse.json();
                const totalPessoas = adultos + criancas;
                const disponivel = capacidadeData.disponivel[area];
                
                if (disponivel < totalPessoas) {
                    alert(`Capacidade esgotada! Disponível: ${disponivel} pessoas na área ${area === 'interna' ? 'interna' : 'externa'}.`);
                    return;
                }
            }
        } catch (error) {
            console.warn('Não foi possível verificar capacidade:', error);
        }
        
        try {
            // Criar pagamento IPAG
            const response = await fetch(`${API_BASE_URL}/ipag/create-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reserva: { ...reservaData, id: Date.now().toString() } })
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Resposta do pagamento:', result);
                ultimaSubmissao = agora;
                
                // Redirecionar para pagamento
                console.log('🔄 Redirecionando para:', result.paymentUrl);
                window.location.href = result.paymentUrl;
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao processar pagamento');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao processar pagamento: ' + error.message);
        }
    });
});

// Inicializar carrossel
document.addEventListener('DOMContentLoaded', function() {
    new Glider(document.querySelector('.glider'), {
        slidesToShow: 1,
        slidesToScroll: 1,
        draggable: true,
        dots: '.glider-dots',
        arrows: {
            prev: '.glider-prev',
            next: '.glider-next'
        },
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2
                }
            },
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3
                }
            }
        ]
    });
});