// Script para atualizar status no dashboard.js
// Substituir as funções getStatusColor e getStatusText

function getStatusColor(status) {
    switch((status || '').toLowerCase()) {
        case 'pago':
            return 'bg-green-500 bg-opacity-20 text-green-400';
        case 'manual':
            return 'bg-blue-500 bg-opacity-20 text-blue-300';
        case 'cancelado':
            return 'bg-red-500 bg-opacity-20 text-red-400';
        default:
            return 'bg-gray-500 bg-opacity-20 text-gray-300';
    }
}

function getStatusText(status) {
    switch((status || '').toLowerCase()) {
        case 'pago':
            return 'PAGO';
        case 'manual':
            return 'MANUAL';
        case 'cancelado':
            return 'CANCELADO';
        default:
            return 'SEM STATUS';
    }
}

// Constantes atualizadas
const STATUS_OCUPAM_MESA = ['pago', 'manual'];
const STATUS_CONTA_RECEITA = ['pago'];
