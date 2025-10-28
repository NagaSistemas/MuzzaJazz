// Muzza Jazz Club - JavaScript Principal (VERSÃO LIMPA)
console.log('🚀 main.js carregado!');

// Sistema dinâmico de preços e capacidade
let precosAtuais = {
    tipo: 'padrao',
    precos: { interna_sexta: 35, interna_sabado: 50, externa: 35, crianca_desconto: 50 }
};
let eventosEspeciais = [];

// Carregar dados da API
async function carregarPrecos() {
    try {
        const response = await fetch(`${API_BASE_URL}/config/precos`);
        if (response.ok) {
            precosAtuais = await response.json();
            console.log('✅ Preços carregados:', precosAtuais);
        }
    } catch (error) {
        console.warn('⚠️ Erro ao carregar preços:', error);
    }
}

async function carregarEventos() {
    try {
        const response = await fetch(`${API_BASE_URL}/eventos`);
        if (response.ok) {
            const data = await response.json();
            eventosEspeciais = data.eventos || [];
            console.log('✅ Eventos carregados:', eventosEspeciais.length);
        }
    } catch (error) {
        console.warn('⚠️ Erro ao carregar eventos:', error);
    }
}

// Calcular preços
function getPrice() {
    const data = document.getElementById('data').value;
    const area = document.getElementById('area').value;
    
    if (!data || !area) return 0;
    
    const eventoEspecial = eventosEspeciais.find(e => e.data === data);
    if (eventoEspecial) {
        if (eventoEspecial.tipo === 'gratuito') return 0;
        return area === 'externa' ? (eventoEspecial.precoExterna || 0) : (eventoEspecial.precoInterna || 0);
    }
    
    const dayOfWeek = new Date(data + 'T00:00:00').getDay();
    const precos = precosAtuais.precos;
    
    if (area === 'externa') return precos?.externa || 35;
    if (area === 'interna') {
        return dayOfWeek === 5 ? (precos?.interna_sexta || 35) : (precos?.interna_sabado || 50);
    }
    
    return 0;
}

function getPriceChild() {
    const precoAdulto = getPrice();
    const desconto = precosAtuais?.precos?.crianca_desconto || 50;
    return Math.round(precoAdulto * (desconto / 100));
}

// Atualizar total
function updateTotal() {
    const adultos = parseInt(document.getElementById('adultos').value) || 0;
    const criancas = parseInt(document.getElementById('criancas').value) || 0;
    const precoAdulto = getPrice();
    const precoCrianca = getPriceChild();
    const total = (adultos * precoAdulto) + (criancas * precoCrianca);
    
    const totalElement = document.getElementById('totalValue');
    if (totalElement) {
        const totalTexto = total === 0 ? 'Entrada Gratuita' : `R$ ${total}`;
        totalElement.innerHTML = `<div class="text-lg">Total: <span class="font-bold">${totalTexto}</span></div>`;
    }
}

// Controle dos contadores
function updateCounter(inputId, change, min = 0) {
    const input = document.getElementById(inputId);
    if (!input) return false;
    
    let currentValue = parseInt(input.value) || (inputId === 'adultos' ? 1 : 0);
    const newValue = Math.max(min, Math.min(20, currentValue + change));
    
    input.value = newValue;
    updateTotal();
    return true;
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Carregar dados
    Promise.all([carregarPrecos(), carregarEventos()]).then(() => {
        updateTotal();
    });
    
    // Event listeners dos contadores
    document.getElementById('decreaseAdults')?.addEventListener('click', () => updateCounter('adultos', -1, 1));
    document.getElementById('increaseAdults')?.addEventListener('click', () => updateCounter('adultos', 1, 1));
    document.getElementById('decreaseChildren')?.addEventListener('click', () => updateCounter('criancas', -1, 0));
    document.getElementById('increaseChildren')?.addEventListener('click', () => updateCounter('criancas', 1, 0));
    
    // Seleção de área
    document.querySelectorAll('.area-card').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('.area-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            document.getElementById('area').value = this.dataset.area;
            updateTotal();
        });
    });
    
    // FORMULÁRIO - ÚNICO EVENT LISTENER
    const form = document.getElementById('reservationForm');
    if (form) {
        console.log('✅ Formulário encontrado');
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('🚀 Formulário submetido!');
            
            // Validações
            const nome = document.getElementById('nome').value;
            const whatsapp = document.getElementById('whatsapp').value;
            const data = document.getElementById('data').value;
            const area = document.getElementById('area').value;
            
            if (!nome || !whatsapp || !data || !area) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }
            
            // Dados da reserva
            const adultos = parseInt(document.getElementById('adultos').value);
            const criancas = parseInt(document.getElementById('criancas').value) || 0;
            const observacoes = document.getElementById('observacoes').value;
            const total = (adultos * getPrice()) + (criancas * getPriceChild());
            
            const reservaData = {
                nome, whatsapp, data, adultos, criancas, area, valor: total, observacoes
            };
            
            console.log('📋 Dados da reserva:', reservaData);
            
            try {
                console.log('🔄 Enviando para API...');
                const response = await fetch(`${API_BASE_URL}/ipag/create-payment`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reserva: { ...reservaData, id: Date.now().toString() } })
                });
                
                console.log('📡 Status:', response.status);
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('✅ Resposta:', result);
                    console.log('🔄 Redirecionando para:', result.paymentUrl);
                    window.location.href = result.paymentUrl;
                } else {
                    const error = await response.json();
                    throw new Error(error.error || 'Erro ao processar pagamento');
                }
            } catch (error) {
                console.error('❌ Erro:', error);
                alert('Erro ao processar pagamento: ' + error.message);
            }
        });
    }
});