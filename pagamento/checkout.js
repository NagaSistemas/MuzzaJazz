const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

const checkoutContainer = document.getElementById('checkoutContent');
const missingContainer = document.getElementById('checkoutMissing');
const statusMessage = document.getElementById('checkoutStatus');
const errorMessage = document.getElementById('checkoutErro');
const btnPagar = document.getElementById('btnPagarIpag');
const btnCopiar = document.getElementById('btnCopiarLink');
const btnRegerar = document.getElementById('btnRegerar');

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
    document.getElementById('checkoutPedido').textContent = checkout.orderId || reserva.id || '-';
    document.getElementById('checkoutAmbiente').textContent = checkout.environment === 'production' ? 'Produção' : 'Sandbox';
    document.getElementById('checkoutNome').textContent = reserva.nome || '-';
    document.getElementById('checkoutData').textContent = formatDate(reserva.data);
    document.getElementById('checkoutAreaMesa').textContent = `${(reserva.area || '-').toUpperCase()} • Mesa ${reserva.numeroMesa || reserva.mesa || '-'}`;
    document.getElementById('checkoutValor').textContent = formatter.format(checkout.total || reserva.valor || 0);

    showStatus('Revise os dados antes de seguir para o pagamento.', 'info');
    if (errorMessage) {
        errorMessage.classList.add('hidden');
        errorMessage.textContent = '';
    }
}

function showStatus(message, type) {
    if (!statusMessage) return;
    statusMessage.textContent = message;
    statusMessage.classList.remove('text-red-300', 'text-green-300', 'text-muza-cream/80');
    if (type === 'error') {
        statusMessage.classList.add('text-red-300');
    } else if (type === 'success') {
        statusMessage.classList.add('text-green-300');
    } else {
        statusMessage.classList.add('text-muza-cream/80');
    }
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
