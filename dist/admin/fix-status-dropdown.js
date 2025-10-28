// Fix: Adicionar dropdown de status inline nas reservas
(function() {
    const API_BASE_URL = 'https://muzzajazz-production.up.railway.app/api';
    
    // Função para criar dropdown de status
    window.criarDropdownStatus = function(reserva) {
        const statusAtual = (reserva.status || 'pre-reserva').toLowerCase();
        
        const select = document.createElement('select');
        select.className = 'px-2 py-1 bg-muza-dark border border-muza-gold border-opacity-30 rounded text-muza-cream text-sm focus:border-muza-gold focus:outline-none';
        select.dataset.reservaId = reserva.id;
        
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
            
            if (!confirm(`Alterar status para "${this.options[this.selectedIndex].text}"?`)) {
                this.value = statusAtual;
                return;
            }
            
            try {
                const response = await fetch(`${API_BASE_URL}/reservas/${reservaId}`, {
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
        });
        
        return select;
    };
})();
