// Muzza Jazz - Sistema de Reservas
window.precosAtuais = window.precosAtuais || { precos: { interna_sexta: 35, interna_sabado: 50, externa: 35, crianca_desconto: 50 } };
window.eventosEspeciais = window.eventosEspeciais || [];
let precosAtuais = window.precosAtuais;
let eventosEspeciais = window.eventosEspeciais;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// Carregar dados
async function carregarDados() {
    try {
        const [precos, eventos] = await Promise.all([
            fetch(`${API_BASE_URL}/config/precos`).then(r => r.json()).catch(() => precosAtuais),
            fetch(`${API_BASE_URL}/eventos`).then(r => r.json()).then(d => d.eventos || []).catch(() => [])
        ]);
        precosAtuais = precos;
        eventosEspeciais = eventos;
    } catch (e) {}
}

// Calcular preço
function calcularPreco() {
    const data = document.getElementById('data').value;
    const area = document.getElementById('area').value;
    if (!data || !area) return 0;
    
    const evento = eventosEspeciais.find(e => e.data === data);
    if (evento) {
        if (evento.tipo === 'gratuito') return 0;
        return area === 'externa' ? (evento.precoExterna || 0) : (evento.precoInterna || 0);
    }
    
    const dia = new Date(data + 'T00:00:00').getDay();
    if (area === 'externa') return precosAtuais.precos.externa;
    if (dia === 5) return precosAtuais.precos.interna_sexta;
    if (dia === 6) return precosAtuais.precos.interna_sabado;
    return 0;
}

function atualizarTotal() {
    const adultos = parseInt(document.getElementById('adultos').value) || 0;
    const criancas = parseInt(document.getElementById('criancas').value) || 0;
    const precoAdulto = calcularPreco();
    const precoCrianca = Math.round(precoAdulto * (precosAtuais.precos.crianca_desconto / 100));
    const total = (adultos * precoAdulto) + (criancas * precoCrianca);
    document.getElementById('totalValue').innerHTML = `Total: <span class="font-bold">R$ ${total}</span>`;
}

// Renderizar calendário
function renderCalendar() {
    console.log('📅 renderCalendar chamado');
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    const monthYearEl = document.getElementById('monthYear');
    const container = document.getElementById('calendarDays');
    
    console.log('📅 monthYear:', monthYearEl);
    console.log('📅 calendarDays:', container);
    
    if (!monthYearEl || !container) {
        console.error('❌ Elementos do calendário não encontrados!');
        return;
    }
    
    monthYearEl.textContent = `${meses[currentMonth]} ${currentYear}`;
    
    const primeiroDia = new Date(currentYear, currentMonth, 1).getDay();
    const diasNoMes = new Date(currentYear, currentMonth + 1, 0).getDate();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    container.innerHTML = '';
    console.log('📅 Renderizando', diasNoMes, 'dias');
    
    for (let i = 0; i < primeiroDia; i++) {
        container.innerHTML += '<div></div>';
    }
    
    for (let dia = 1; dia <= diasNoMes; dia++) {
        const data = new Date(currentYear, currentMonth, dia);
        const diaSemana = data.getDay();
        const passado = data < hoje;
        const fimSemana = diaSemana === 5 || diaSemana === 6;
        const dataStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        const evento = eventosEspeciais.find(e => e.data === dataStr);
        
        let classe = 'calendar-day';
        let clicavel = false;
        
        if (passado) {
            classe += ' past';
        } else if (evento) {
            classe += ' evento-especial available';
            clicavel = true;
        } else if (fimSemana) {
            classe += ' available';
            clicavel = true;
        } else {
            classe += ' disabled';
        }
        
        const onclick = clicavel ? `onclick="selecionarData('${dataStr}')"` : '';
        container.innerHTML += `<div class="${classe}" ${onclick}>${dia}</div>`;
    }
    
    console.log('✅ Calendário renderizado. HTML:', container.innerHTML.substring(0, 200));
}

function selecionarData(dataStr) {
    const [ano, mes, dia] = dataStr.split('-');
    const data = new Date(ano, mes - 1, dia);
    document.getElementById('data').value = dataStr;
    document.getElementById('dataDisplay').value = data.toLocaleDateString('pt-BR');
    const cal = document.getElementById('calendar');
    cal.style.display = 'none';
    cal.style.setProperty('display', 'none', 'important');
    atualizarTotal();
}

// Inicialização
document.addEventListener('DOMContentLoaded', async function() {
    console.log('✅ Iniciando main.js...');
    
    // Aguardar um pouco para garantir que DOM está pronto
    setTimeout(function() {
        console.log('📅 Renderizando calendário inicial...');
        renderCalendar();
    }, 100);
    
    await carregarDados();
    renderCalendar();
    
    // Calendário - usar style.display direto
    const dataDisplay = document.getElementById('dataDisplay');
    const calendar = document.getElementById('calendar');
    
    dataDisplay.addEventListener('click', function(e) {
        e.stopPropagation();
        const isVisible = calendar.style.display === 'block';
        if (isVisible) {
            calendar.style.display = 'none';
            calendar.style.setProperty('display', 'none', 'important');
        } else {
            calendar.style.display = 'block';
            calendar.style.setProperty('display', 'block', 'important');
        }
        console.log('📅 Calendário:', calendar.style.display);
    });
    
    document.getElementById('prevMonth').addEventListener('click', function() {
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        renderCalendar();
    });
    
    document.getElementById('nextMonth').addEventListener('click', function() {
        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        renderCalendar();
    });
    
    document.addEventListener('click', function(e) {
        if (!calendar.contains(e.target) && e.target !== dataDisplay) {
            calendar.style.display = 'none';
            calendar.style.setProperty('display', 'none', 'important');
        }
    });
    
    // Seleção de área
    document.querySelectorAll('.area-card').forEach(function(card) {
        card.addEventListener('click', function() {
            console.log('🏠 Área clicada:', this.getAttribute('data-area'));
            document.querySelectorAll('.area-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            document.getElementById('area').value = this.getAttribute('data-area');
            atualizarTotal();
        });
    });
    
    // Contadores
    document.getElementById('decreaseAdults').addEventListener('click', function() {
        const input = document.getElementById('adultos');
        if (input.value > 1) { input.value--; atualizarTotal(); }
    });
    
    document.getElementById('increaseAdults').addEventListener('click', function() {
        const input = document.getElementById('adultos');
        if (input.value < 20) { input.value++; atualizarTotal(); }
    });
    
    document.getElementById('decreaseChildren').addEventListener('click', function() {
        const input = document.getElementById('criancas');
        if (input.value > 0) { input.value--; atualizarTotal(); }
    });
    
    document.getElementById('increaseChildren').addEventListener('click', function() {
        const input = document.getElementById('criancas');
        if (input.value < 20) { input.value++; atualizarTotal(); }
    });
    
    // Formulário
    const form = document.getElementById('reservationForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const reserva = {
                id: Date.now().toString(),
                nome: document.getElementById('nome').value,
                whatsapp: document.getElementById('whatsapp').value,
                data: document.getElementById('data').value,
                adultos: parseInt(document.getElementById('adultos').value),
                criancas: parseInt(document.getElementById('criancas').value) || 0,
                area: document.getElementById('area').value,
                observacoes: document.getElementById('observacoes').value,
                valor: (parseInt(document.getElementById('adultos').value) * calcularPreco()) + 
                       ((parseInt(document.getElementById('criancas').value) || 0) * Math.round(calcularPreco() * (precosAtuais.precos.crianca_desconto / 100)))
            };
            
            try {
                const res = await fetch(`${API_BASE_URL}/ipag/create-payment`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reserva })
                });
                
                if (res.ok) {
                    const result = await res.json();
                    window.location.href = result.paymentUrl;
                } else {
                    alert('Erro ao processar pagamento');
                }
            } catch (error) {
                alert('Erro: ' + error.message);
            }
        });
    }
    
    console.log('✅ Pronto!');
});

// Expor funções globalmente
window.selecionarData = selecionarData;
window.renderCalendar = renderCalendar;
