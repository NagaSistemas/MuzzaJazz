const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

const checkoutContainer = document.getElementById('checkoutContent');
const missingContainer = document.getElementById('checkoutMissing');
const statusMessage = document.getElementById('checkoutStatus');
const errorMessage = document.getElementById('checkoutErro');
const btnPagar = document.getElementById('btnPagarIpag');
const btnCopiar = document.getElementById('btnCopiarLink');
const btnRegerar = document.getElementById('btnRegerar');
const ambientePill = document.getElementById('checkoutAmbientePill');
const resumoContato = document.getElementById('checkoutResumoContato');
const resumoLista = document.getElementById('checkoutResumoLista');
const expiracaoEl = document.getElementById('checkoutExpiracao');

const storedCheckout = sessionStorage.getItem('muzzaCheckoutIntent');
const storedReserva = sessionStorage.getItem('muzzaCheckoutReserva');

if (!storedCheckout || !storedReserva) {
    showMissingState();
} else {
    let checkout = JSON.parse(storedCheckout);
    let reserva = JSON.parse(storedReserva);

    updateSummary(checkout, reserva);

    btnPagar.addEventListener('click', () => {
        if (!checkout.paymentUrl) {
            showStatus('Link de pagamento indisponível. Gere um novo link.', 'error');
            return;
        }
        sessionStorage.setItem('muzzaCheckoutInFlight', JSON.stringify({
            ...checkout,
            startedAt: Date.now()
        }));
        window.location.href = checkout.paymentUrl;
    });

    btnCopiar.addEventListener('click', async () => {
        if (!checkout.paymentUrl) {
            showStatus('Link ainda não gerado. Gere um novo link.', 'error');
            return;
        }
        try {
            await navigator.clipboard.writeText(checkout.paymentUrl);
            showStatus('Link copiado! Abra no mesmo navegador para continuar.', 'success');
        } catch (err) {
            console.warn('Falha ao copiar link:', err);
            showStatus('Copie manualmente: ' + checkout.paymentUrl, 'info');
        }
    });

    btnRegerar.addEventListener('click', async () => {
        await regenerateCheckout(checkout, reserva, (nextCheckout, nextReserva) => {
            checkout = nextCheckout;
            reserva = nextReserva;
            updateSummary(checkout, reserva);
        });
    });
}

function showMissingState() {
    if (checkoutContainer) checkoutContainer.classList.add('hidden');
    if (missingContainer) missingContainer.classList.remove('hidden');
}

function formatDate(value) {
    if (!value) return '-';
    const date = new Date(value + 'T00:00:00');
    return dateFormatter.format(date);
}

function updateSummary(checkout, reserva) {
    setText('checkoutPedido', checkout.orderId || reserva.id || '-');
    setText('checkoutNome', reserva.nome || '-');
    setText('checkoutData', formatDate(reserva.data));
    setText('checkoutAreaMesa', `${(reserva.area || '-').toUpperCase()} • Mesa ${reserva.numeroMesa || reserva.mesa || '-'}`);
    setText('checkoutValor', formatter.format(checkout.total || reserva.valor || 0));

    const ambienteLabel = checkout.environment === 'production' ? 'Ambiente seguro' : 'Ambiente de testes';
    setText('checkoutAmbiente', ambienteLabel);
    if (ambientePill) {
        ambientePill.textContent = checkout.environment === 'production' ? 'Ambiente seguro' : 'Ambiente de testes';
        ambientePill.classList.remove('bg-amber-500/20', 'border-amber-400/40', 'text-amber-200', 'bg-green-500/20', 'border-green-400/40', 'text-green-200');
        if (checkout.environment === 'production') {
            ambientePill.classList.add('bg-green-500/20', 'border-green-400/40', 'text-green-200');
        } else {
            ambientePill.classList.add('bg-amber-500/20', 'border-amber-400/40', 'text-amber-200');
        }
    }

    if (resumoContato) {
        const contato = [reserva.email, reserva.whatsapp].filter(Boolean).join(' • ');
        resumoContato.textContent = contato || 'Contato não informado';
    }

    if (expiracaoEl) {
        if (checkout.expiresAt) {
            expiracaoEl.textContent = `Link expira em ${formatDateTime(checkout.expiresAt)}`;
        } else {
            expiracaoEl.textContent = 'Link válido por tempo limitado';
        }
    }

    if (resumoLista) {
        resumoLista.innerHTML = `
            <li class="flex items-start gap-3">
                <i class="fas fa-check text-muza-gold mt-0.5"></i>
                Área escolhida: <strong class="text-muza-gold ml-1">${(reserva.area || 'não informado').toUpperCase()}</strong> • Mesa ${reserva.numeroMesa || reserva.mesa || '-'}.
            </li>
            <li class="flex items-start gap-3">
                <i class="fas fa-check text-muza-gold mt-0.5"></i>
                Data: <strong class="text-muza-gold ml-1">${formatDate(reserva.data)}</strong> para ${reserva.adultos || 0} adultos e ${reserva.criancas || 0} crianças.
            </li>
            <li class="flex items-start gap-3">
                <i class="fas fa-check text-muza-gold mt-0.5"></i>
                Assim que o  confirmar o pagamento, o sistema atualiza sua reserva automaticamente.
            </li>
        `;
    }

    showStatus('Revise os dados antes de seguir para o pagamento.', 'info');
    if (errorMessage) {
        errorMessage.classList.add('hidden');
        errorMessage.textContent = '';
    }
}

function showStatus(message, type) {
    if (!statusMessage) return;
    statusMessage.textContent = message;
    statusMessage.classList.remove('text-red-300', 'text-green-300', 'text-muza-cream/80', 'text-muza-gold');
    if (type === 'error') {
        statusMessage.classList.add('text-red-300');
    } else if (type === 'success') {
        statusMessage.classList.add('text-green-300');
    } else {
        statusMessage.classList.add('text-muza-cream/80');
    }
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function formatDateTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'tempo limitado';
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

async function regenerateCheckout(currentCheckout, currentReserva, onSuccess) {
    if (!API_BASE_URL) {
        showStatus('API_BASE_URL não configurada.', 'error');
        return;
    }

    setRegenerateLoading(true);
    showStatus('Gerando um novo link de pagamento...', 'info');

    const novaReserva = {
        ...currentReserva,
        id: Date.now().toString()
    };

    try {
        const response = await fetch(`${API_BASE_URL}/ipag/create-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reserva: novaReserva })
        });

        if (!response.ok) {
            const erroApi = await response.json().catch(() => ({}));
            throw new Error(erroApi.error || 'Não foi possível gerar um novo checkout.');
        }

        const result = await response.json();
        const nextCheckout = {
            ...currentCheckout,
            orderId: result.orderId,
            token: result.token,
            checkoutId: result.checkoutId,
            paymentUrl: result.paymentUrl,
            expiresAt: result.expiresAt,
            environment: result.environment || currentCheckout.environment,
            success: true
        };
        const nextReserva = { ...novaReserva };

        sessionStorage.setItem('muzzaCheckoutIntent', JSON.stringify(nextCheckout));
        sessionStorage.setItem('muzzaCheckoutReserva', JSON.stringify(nextReserva));
        sessionStorage.removeItem('muzzaCheckoutInFlight');

        onSuccess(nextCheckout, nextReserva);
        showStatus('Novo link gerado! Clique em "Ir para pagamento".', 'success');
    } catch (error) {
        console.error('Erro ao regerar link:', error);
        showStatus(error.message, 'error');
        if (errorMessage) {
            errorMessage.textContent = error.message;
            errorMessage.classList.remove('hidden');
        }
    } finally {
        setRegenerateLoading(false);
    }
}

function setRegenerateLoading(isLoading) {
    if (!btnRegerar) return;
    btnRegerar.disabled = isLoading;
    btnRegerar.innerHTML = isLoading
        ? '<i class="fas fa-spinner fa-spin mr-2"></i>Gerando...'
        : 'Gerar novo link';
}
