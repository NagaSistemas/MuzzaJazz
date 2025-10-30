// Script para atualizar status no dashboard.js
// Substituir as funções getStatusColor e getStatusText

function getStatusColor(status) {
    switch((status || '').toLowerCase()) {
        case 'confirmado':
        case 'confirmada':
            return 'bg-green-500 bg-opacity-20 text-green-400';
        case 'pre-reserva':
            return 'bg-yellow-500 bg-opacity-20 text-yellow-300';
        case 'cancelado':
            return 'bg-red-500 bg-opacity-20 text-red-400';
        default:
            return 'bg-gray-500 bg-opacity-20 text-gray-300';
    }
}

function getStatusText(status) {
    switch((status || '').toLowerCase()) {
        case 'confirmado':
        case 'confirmada':
            return 'CONFIRMADO';
        case 'pre-reserva':
            return 'PRÉ-RESERVA';
        case 'cancelado':
            return 'CANCELADO';
        default:
            return 'SEM STATUS';
    }
}

// Constantes atualizadas
const STATUS_OCUPAM_MESA = ['confirmado', 'pre-reserva'];
const STATUS_CONTA_RECEITA = ['confirmado'];
