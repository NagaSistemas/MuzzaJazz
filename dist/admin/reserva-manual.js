// Funcionalidade de Reserva Manual
(function() {
    const API_BASE_URL = 'https://muzzajazz-production.up.railway.app/api';
    
    const modal = document.getElementById('modalReservaManual');
    const btnAbrir = document.getElementById('btnAbrirReservaManual');
    const btnFechar = document.getElementById('fecharReservaManual');
    const btnCancelar = document.getElementById('btnCancelarReservaManual');
    const form = document.getElementById('formReservaManual');
    const alerta = document.getElementById('alertaReservaManual');
    
    // Abrir modal
    btnAbrir?.addEventListener('click', () => {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    });
    
    // Fechar modal
    function fecharModal() {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = '';
        form.reset();
        alerta.classList.add('hidden');
    }
    
    btnFechar?.addEventListener('click', fecharModal);
    btnCancelar?.addEventListener('click', fecharModal);
    
    // Carregar mesas quando área/data mudarem
    const manualArea = document.getElementById('manualArea');
    const manualData = document.getElementById('manualData');
    const manualMesaPrincipal = document.getElementById('manualMesaPrincipal');
    
    async function carregarMesasDisponiveis() {
        const area = manualArea.value;
        const data = manualData.value;
        
        if (!area || !data) {
            manualMesaPrincipal.innerHTML = '<option value="">Selecione a área e a data</option>';
            return;
        }
        
        try {
            // Usar rota específica do backend que já filtra mesas ocupadas
            const response = await fetch(`${API_BASE_URL}/mesas/disponiveis/${data}/${area}`, {
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache' }
            });
            const mesasData = await response.json();
            const mesasDisponiveis = mesasData.mesas || [];
            
            console.log(`✅ Mesas disponíveis para ${data} (${area}):`, mesasDisponiveis.map(m => m.numero));
            
            if (mesasDisponiveis.length === 0) {
                manualMesaPrincipal.innerHTML = '<option value="">Nenhuma mesa disponível</option>';
            } else {
                manualMesaPrincipal.innerHTML = '<option value="">Selecione uma mesa</option>' +
                    mesasDisponiveis.map(m => 
                        `<option value="${m.numero}">Mesa ${m.numero} (${m.capacidade}p)</option>`
                    ).join('');
            }
                
        } catch (error) {
            console.error('Erro ao carregar mesas:', error);
            manualMesaPrincipal.innerHTML = '<option value="">Erro ao carregar mesas</option>';
        }
    }
    
    manualArea?.addEventListener('change', () => {
        console.log('🔄 Área alterada, recarregando mesas...');
        carregarMesasDisponiveis();
    });
    manualData?.addEventListener('change', () => {
        console.log('🔄 Data alterada, recarregando mesas...');
        carregarMesasDisponiveis();
    });
    
    // Submit do formulário
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const reserva = {
            nome: document.getElementById('manualNome').value,
            whatsapp: document.getElementById('manualWhatsapp').value,
            data: document.getElementById('manualData').value,
            area: document.getElementById('manualArea').value,
            adultos: parseInt(document.getElementById('manualAdultos').value),
            criancas: parseInt(document.getElementById('manualCriancas').value) || 0,
            numeroMesa: parseInt(document.getElementById('manualMesaPrincipal').value),
            valor: parseFloat(document.getElementById('manualValor').value) || 0,
            observacoes: document.getElementById('manualObservacoes').value,
            status: 'pre-reserva',
            origem: 'manual'
        };
        
        try {
            const response = await fetch(`${API_BASE_URL}/reservas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reserva)
            });
            
            if (response.ok) {
                alert('Pré-reserva criada com sucesso!');
                fecharModal();
                // Recarregar reservas e forçar atualização
                if (typeof carregarReservas === 'function') {
                    setTimeout(() => carregarReservas(), 500);
                }
                // Limpar cache de mesas
                carregarMesasDisponiveis();
            } else {
                const error = await response.json();
                alerta.textContent = error.error || 'Erro ao criar reserva';
                alerta.classList.remove('hidden');
            }
        } catch (error) {
            console.error('Erro:', error);
            alerta.textContent = 'Erro de conexão com o servidor';
            alerta.classList.remove('hidden');
        }
    });
})();
