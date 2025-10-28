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
            const response = await fetch(`${API_BASE_URL}/mesas`);
            const mesasData = await response.json();
            const todasMesas = mesasData.mesas || [];
            
            const mesasArea = todasMesas.filter(m => m.area === area && m.status === 'ativa');
            
            // Buscar reservas da mesma data
            const resResponse = await fetch(`${API_BASE_URL}/reservas`);
            const resData = await resResponse.json();
            const reservas = resData.reservas || [];
            
            const reservasMesmaData = reservas.filter(r => 
                r.data === data && 
                r.area === area &&
                ['confirmado', 'pre-reserva'].includes((r.status || '').toLowerCase())
            );
            
            const mesasOcupadas = [];
            reservasMesmaData.forEach(r => {
                if (r.numeroMesa) mesasOcupadas.push(parseInt(r.numeroMesa));
                if (r.mesaExtra) mesasOcupadas.push(parseInt(r.mesaExtra));
                if (Array.isArray(r.mesasSelecionadas)) {
                    r.mesasSelecionadas.forEach(m => mesasOcupadas.push(parseInt(m)));
                }
            });
            
            const mesasDisponiveis = mesasArea.filter(m => !mesasOcupadas.includes(m.numero));
            
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
    
    manualArea?.addEventListener('change', carregarMesasDisponiveis);
    manualData?.addEventListener('change', carregarMesasDisponiveis);
    
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
                // Recarregar reservas
                if (typeof carregarReservas === 'function') {
                    carregarReservas();
                }
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
