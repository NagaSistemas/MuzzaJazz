const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

const statusIcon = document.getElementById('statusIcon');
const statusTitulo = document.getElementById('statusTitulo');
const statusDescricao = document.getElementById('statusDescricao');
const statusNome = document.getElementById('statusNome');
const statusValor = document.getElementById('statusValor');
const statusPedido = document.getElementById('statusPedido');
const statusResumo = document.getElementById('statusResumo');
const statusCard = document.getElementById('statusCard');
const statusCardIcon = document.getElementById('statusCardIcon');
const statusCardTitulo = document.getElementById('statusCardTitulo');
const statusCardMensagem = document.getElementById('statusCardMensagem');

const storedCheckout = readJson('muzzaCheckoutInFlight')
    || readJson('muzzaCheckoutIntent');
const storedReserva = readJson('muzzaCheckoutReserva');

const params = new URLSearchParams(window.location.search);
const fallbackOrder = params.get('order_id') || params.get('orderId');
let currentOrderId = fallbackOrder || storedCheckout?.orderId || storedReserva?.id || null;

updateSummary(storedCheckout, storedReserva);
setStatusUI('pending');
if (currentOrderId && API_BASE_URL) {
    pollStatus(currentOrderId);
} else {
    setStatusUI('pending');
    statusDescricao.textContent = 'Não encontramos um pedido ativo. Volte ao site e gere uma nova reserva.';
}

function readJson(key) {
    try {
        const raw = sessionStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function updateSummary(checkoutData, reservaData) {
    if (reservaData) {
        statusNome.textContent = reservaData.nome || statusNome.textContent;
        statusValor.textContent = formatter.format(reservaData.valor || checkoutData?.total || 0);
        statusResumo.textContent = `${formatDate(reservaData.data)} • ${(reservaData.area || '-').toUpperCase()}`;
        statusPedido.textContent = currentOrderId || reservaData.id || statusPedido.textContent;
    } else if (checkoutData) {
        statusValor.textContent = formatter.format(checkoutData.total || 0);
        statusResumo.textContent = `${formatDate(checkoutData.data)} • ${(checkoutData.area || '-').toUpperCase()}`;
        statusPedido.textContent = currentOrderId || checkoutData.orderId || statusPedido.textContent;
        statusNome.textContent = checkoutData.nome || statusNome.textContent;
    }
}

function formatDate(value) {
    if (!value) return '-';
    const date = new Date(value + 'T00:00:00');
    return dateFormatter.format(date);
}

async function pollStatus(orderId, attempt = 0) {
    const MAX_ATTEMPTS = 8;
    try {
        const response = await fetch(`${API_BASE_URL}/ipag/status/${orderId}`);
        if (!response.ok) {
            throw new Error('Status temporariamente indisponível.');
        }

        const data = await response.json();
        currentOrderId = orderId;
        if (data.reserva) {
            updateSummary(null, data.reserva);
        }
        applyStatus(data.checkout, data.reserva);

        if (data.checkout?.status === 'paid') {
            clearSessionData();
            return;
        }

        if (data.checkout?.status === 'failed') {
            return;
        }

        if (attempt < MAX_ATTEMPTS) {
            setTimeout(() => pollStatus(orderId, attempt + 1), 5000);
        } else {
            statusDescricao.textContent = 'Ainda não recebemos o retorno do iPag. Assim que o pagamento for confirmado você será avisado por WhatsApp.';
        }
    } catch (error) {
        console.error('Falha ao consultar status IPAG:', error);
        if (attempt < 5) {
            setTimeout(() => pollStatus(orderId, attempt + 1), 6000);
        } else {
            statusDescricao.textContent = 'Não conseguimos confirmar o status agora. Caso já tenha pago, entre em contato com o nosso atendimento.';
            setStatusUI('pending');
        }
    }
}

function applyStatus(checkoutData = {}, reservaData) {
    const status = (checkoutData.status || '').toLowerCase();
    updateSummary(checkoutData, reservaData);

    if (status === 'paid') {
        setStatusUI('success');
        statusCardMensagem.textContent = 'Sua reserva foi registrada automaticamente. Em instantes você receberá a confirmação pelo WhatsApp.';
        statusCardTitulo.textContent = 'Pagamento aprovado';
        statusDescricao.textContent = 'Tudo certo! Obrigado por garantir seu lugar no Muzza Jazz.';
    } else if (status === 'failed') {
        setStatusUI('error');
        statusCardMensagem.textContent = 'O pagamento não foi concluído. Gere uma nova reserva ou tente novamente com outro método.';
        statusCardTitulo.textContent = 'Pagamento não aprovado';
        statusDescricao.textContent = 'Verifique os dados e gere uma nova reserva caso queira tentar novamente.';
    } else {
        setStatusUI('pending');
        statusCardMensagem.textContent = 'Estamos aguardando o retorno do iPag. Isso pode levar alguns segundos.';
        statusCardTitulo.textContent = 'Pagamento em processamento';
    }
}

function setStatusUI(state) {
    statusIcon.classList.remove('bg-green-600/20', 'bg-red-600/20', 'bg-muza-gold', 'bg-opacity-20');
    if (state === 'error') {
        statusIcon.classList.add('bg-red-600/20');
    } else if (state === 'success') {
        statusIcon.classList.add('bg-green-600/20');
    } else {
        statusIcon.classList.add('bg-muza-gold', 'bg-opacity-20');
    }
    statusIcon.innerHTML = state === 'success'
        ? '<i class="fas fa-check"></i>'
        : state === 'error'
            ? '<i class="fas fa-times"></i>'
            : '<i class="fas fa-clock"></i>';

    statusCardIcon.className = state === 'success'
        ? 'fas fa-check text-green-400'
        : state === 'error'
            ? 'fas fa-times text-red-400'
            : 'fas fa-circle-notch fa-spin text-muza-gold';

    if (state === 'success') {
        statusTitulo.textContent = 'Pagamento confirmado!';
    } else if (state === 'error') {
        statusTitulo.textContent = 'Pagamento não confirmado';
    } else {
        statusTitulo.textContent = 'Estamos validando o pagamento';
    }
}

function clearSessionData() {
    sessionStorage.removeItem('muzzaCheckoutInFlight');
    sessionStorage.removeItem('muzzaCheckoutIntent');
    sessionStorage.removeItem('muzzaCheckoutReserva');
}
