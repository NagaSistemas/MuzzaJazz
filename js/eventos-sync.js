// Script para sincronização de eventos especiais em tempo real
// Este script garante que os eventos especiais sejam destacados corretamente no calendário

document.addEventListener('DOMContentLoaded', function() {
    // Função para aplicar estilos de evento especial
    function aplicarEstilosEventoEspecial(elemento) {
        elemento.style.background = 'linear-gradient(135deg, #D4AF37, #FFD700)';
        elemento.style.color = '#1A120B';
        elemento.style.fontWeight = 'bold';
        elemento.style.border = '2px solid #D4AF37';
        elemento.style.boxShadow = '0 0 15px rgba(212, 175, 55, 0.6)';
        elemento.style.animation = 'pulse-gold 2s infinite';
        elemento.style.position = 'relative';
        
        // Adicionar estrelinhas se não existirem
        if (!elemento.querySelector('.star-before')) {
            const starBefore = document.createElement('span');
            starBefore.className = 'star-before';
            starBefore.innerHTML = '★';
            starBefore.style.position = 'absolute';
            starBefore.style.left = '2px';
            starBefore.style.top = '50%';
            starBefore.style.transform = 'translateY(-50%)';
            starBefore.style.fontSize = '8px';
            starBefore.style.lineHeight = '1';
            starBefore.style.color = '#1A120B';
            elemento.appendChild(starBefore);
        }
        
        if (!elemento.querySelector('.star-after')) {
            const starAfter = document.createElement('span');
            starAfter.className = 'star-after';
            starAfter.innerHTML = '★';
            starAfter.style.position = 'absolute';
            starAfter.style.right = '2px';
            starAfter.style.top = '50%';
            starAfter.style.transform = 'translateY(-50%)';
            starAfter.style.fontSize = '8px';
            starAfter.style.lineHeight = '1';
            starAfter.style.color = '#1A120B';
            elemento.appendChild(starAfter);
        }
    }
    
    // Observer para detectar mudanças no calendário
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                // Verificar se novos elementos de calendário foram adicionados
                const eventoDays = document.querySelectorAll('.calendar-day.evento-especial');
                eventoDays.forEach(day => {
                    aplicarEstilosEventoEspecial(day);
                });
            }
        });
    });
    
    // Observar mudanças no container do calendário
    const calendarContainer = document.getElementById('calendarDays');
    if (calendarContainer) {
        observer.observe(calendarContainer, {
            childList: true,
            subtree: true
        });
    }
    
    // Função global para forçar atualização de eventos
    window.sincronizarEventosEspeciais = function() {
        console.log('🔄 Sincronizando eventos especiais...');
        
        // Aguardar um pouco para garantir que o DOM foi atualizado
        setTimeout(() => {
            const eventoDays = document.querySelectorAll('.calendar-day.evento-especial');
            console.log(`✨ Encontrados ${eventoDays.length} dias de eventos especiais`);
            
            eventoDays.forEach((day, index) => {
                aplicarEstilosEventoEspecial(day);
                console.log(`   🎆 Dia ${index + 1} estilizado`);
            });
            
            // Verificar se há data selecionada para atualizar preços
            const dataSelecionada = document.getElementById('data')?.value;
            if (dataSelecionada && window.eventosEspeciais) {
                const eventoEspecial = window.eventosEspeciais.find(e => e.data === dataSelecionada);
                if (eventoEspecial) {
                    console.log('🎭 Atualizando preços para evento especial:', eventoEspecial.nome);
                    if (window.atualizarPrecosNaTela) {
                        window.atualizarPrecosNaTela();
                    }
                }
            }
        }, 100);
    };
    
    // Executar sincronização inicial após delay
    setTimeout(() => {
        window.sincronizarEventosEspeciais();
    }, 1000);
    
    // Executar sincronização a cada 5 segundos para garantir consistência
    setInterval(() => {
        const eventoDays = document.querySelectorAll('.calendar-day.evento-especial');
        if (eventoDays.length > 0) {
            eventoDays.forEach(day => {
                // Verificar se os estilos ainda estão aplicados
                if (!day.style.background || !day.style.background.includes('linear-gradient')) {
                    aplicarEstilosEventoEspecial(day);
                }
            });
        }
    }, 5000);
});