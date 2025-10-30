// Fix: Adicionar dropdown de status inline nas reservas
(function() {
    const API_BASE_URL = 'https://muzzajazz-production.up.railway.app/api';
    
    // Função para criar dropdown de status
    window.criarDropdownStatus = function(reserva) {
        const statusAtual = (reserva.status || 'pre-reserva').toLowerCase();
        
        const container = document.createElement('div');
        container.className = 'status-dropdown-container';
        
        const select = document.createElement('select');
        select.className = 'px-2 py-1 bg-muza-dark border border-muza-gold border-opacity-30 rounded text-muza-cream text-sm focus:border-muza-gold focus:outline-none w-full';
        select.dataset.reservaId = reserva.id;
        select.dataset.statusAtual = statusAtual;
        
        const opcoes = [
            { value: 'pre-reserva', label: 'Pré-reserva' },
            { value: 'confirmado', label: 'Confirmado' },
            { value: 'cancelado', label: 'Cancelado' }
        ];
        
        opcoes.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.label;
            option.selected = statusAtual === opt.value;
            select.appendChild(option);
        });
        
        select.addEventListener('change', async function() {
            const novoStatus = this.value;
            const reservaId = this.dataset.reservaId;
            const statusAnterior = this.dataset.statusAtual;
            
            if (!confirm(`Alterar status para "${this.options[this.selectedIndex].text}"?`)) {
                this.value = statusAnterior;
                return;
            }
            
            try {
                const response = await fetch(`${API_BASE_URL}/reservas/${reservaId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: novoStatus })
                });
                
                if (response.ok) {
                    this.dataset.statusAtual = novoStatus;
                    alert('Status atualizado com sucesso!');
                    // Recarregar reservas mantendo filtros
                    if (typeof window.carregarReservas === 'function') {
                        window.carregarReservas();
                    }
                } else {
                    alert('Erro ao atualizar status');
                    this.value = statusAnterior;
                }
            } catch (error) {
                console.error('Erro:', error);
                alert('Erro de conexão');
                this.value = statusAnterior;
            }
        });
        
        container.appendChild(select);
        return container;
    };
})();
