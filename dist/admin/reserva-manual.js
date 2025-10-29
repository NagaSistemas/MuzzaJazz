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
    const manualMesaExtra = document.getElementById('manualMesaExtra');
    const manualAdultos = document.getElementById('manualAdultos');
    const manualCriancas = document.getElementById('manualCriancas');
    const infoCapacidadeMesas = document.getElementById('infoCapacidadeMesas');
    const grupoMesaExtra = document.getElementById('grupoMesaExtra');
    
    let mesasDisponiveisCache = [];
    
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
            mesasDisponiveisCache = mesasDisponiveis;
            
            console.log(`✅ Mesas disponíveis para ${data} (${area}):`, mesasDisponiveis.map(m => m.numero));
            
            if (mesasDisponiveis.length === 0) {
                manualMesaPrincipal.innerHTML = '<option value="">Nenhuma mesa disponível</option>';
            } else {
                manualMesaPrincipal.innerHTML = '<option value="">Selecione uma mesa</option>' +
                    mesasDisponiveis.map(m => 
                        `<option value="${m.numero}" data-capacidade="${m.capacidade}">Mesa ${m.numero} (${m.capacidade}p)</option>`
                    ).join('');
            }
            
            verificarCapacidade();
                
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
    
    // Verificar capacidade e selecionar mesa extra automaticamente
    function verificarCapacidade() {
        const mesaPrincipalNum = parseInt(manualMesaPrincipal?.value);
        const adultos = parseInt(manualAdultos?.value) || 0;
        const criancas = parseInt(manualCriancas?.value) || 0;
        const totalPessoas = adultos + criancas;
        
        if (!mesaPrincipalNum || totalPessoas === 0) {
            if (infoCapacidadeMesas) infoCapacidadeMesas.textContent = 'Informe adultos, crianças e mesas para validar a capacidade.';
            if (grupoMesaExtra) grupoMesaExtra.classList.add('hidden');
            return;
        }
        
        const mesaPrincipal = mesasDisponiveisCache.find(m => parseInt(m.numero) === mesaPrincipalNum);
        if (!mesaPrincipal) return;
        
        const capacidadePrincipal = mesaPrincipal.capacidade || 0;
        
        if (totalPessoas <= capacidadePrincipal) {
            if (infoCapacidadeMesas) {
                infoCapacidadeMesas.className = 'rounded-lg border border-green-500 border-opacity-20 bg-green-500 bg-opacity-10 p-4 text-sm text-green-400 font-raleway';
                infoCapacidadeMesas.innerHTML = `✅ Mesa ${mesaPrincipalNum} comporta ${totalPessoas} pessoas (capacidade: ${capacidadePrincipal})`;
            }
            if (grupoMesaExtra) grupoMesaExtra.classList.add('hidden');
            if (manualMesaExtra) manualMesaExtra.value = '';
        } else {
            // Precisa de mesa extra - selecionar automaticamente a próxima disponível
            const mesasOrdenadas = mesasDisponiveisCache
                .filter(m => parseInt(m.numero) !== mesaPrincipalNum)
                .sort((a, b) => parseInt(a.numero) - parseInt(b.numero));
            
            const mesaExtra = mesasOrdenadas[0];
            
            if (mesaExtra) {
                const capacidadeTotal = capacidadePrincipal + (mesaExtra.capacidade || 0);
                
                if (grupoMesaExtra) grupoMesaExtra.classList.remove('hidden');
                if (manualMesaExtra) {
                    manualMesaExtra.innerHTML = '<option value="">Nenhuma</option>' +
                        mesasOrdenadas.map(m => 
                            `<option value="${m.numero}" ${m.numero === mesaExtra.numero ? 'selected' : ''}>Mesa ${m.numero} (${m.capacidade}p)</option>`
                        ).join('');
                }
                
                if (infoCapacidadeMesas) {
                    if (totalPessoas <= capacidadeTotal) {
                        infoCapacidadeMesas.className = 'rounded-lg border border-yellow-500 border-opacity-20 bg-yellow-500 bg-opacity-10 p-4 text-sm text-yellow-300 font-raleway';
                        infoCapacidadeMesas.innerHTML = `⚠️ Mesa ${mesaPrincipalNum} insuficiente. Mesa ${mesaExtra.numero} selecionada automaticamente.<br>Capacidade total: ${capacidadeTotal} pessoas para ${totalPessoas}.`;
                    } else {
                        infoCapacidadeMesas.className = 'rounded-lg border border-red-500 border-opacity-20 bg-red-500 bg-opacity-10 p-4 text-sm text-red-400 font-raleway';
                        infoCapacidadeMesas.innerHTML = `❌ Capacidade insuficiente! ${totalPessoas} pessoas excedem ${capacidadeTotal} lugares disponíveis.`;
                    }
                }
            } else {
                if (infoCapacidadeMesas) {
                    infoCapacidadeMesas.className = 'rounded-lg border border-red-500 border-opacity-20 bg-red-500 bg-opacity-10 p-4 text-sm text-red-400 font-raleway';
                    infoCapacidadeMesas.innerHTML = `❌ Sem mesas extras disponíveis! ${totalPessoas} pessoas excedem ${capacidadePrincipal} lugares.`;
                }
            }
        }
    }
    
    manualMesaPrincipal?.addEventListener('change', verificarCapacidade);
    manualAdultos?.addEventListener('input', verificarCapacidade);
    manualCriancas?.addEventListener('input', verificarCapacidade);
    
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
            mesaExtra: parseInt(document.getElementById('manualMesaExtra').value) || null,
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
