// Calendário específico para o site principal
document.addEventListener('DOMContentLoaded', function() {
    // Garantir que o CSS está carregado
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/styles.css';
    document.head.appendChild(link);
    
    // Forçar aplicação dos estilos de evento especial
    const style = document.createElement('style');
    style.textContent = `
        .calendar-day.evento-especial {
            background: linear-gradient(135deg, #D4AF37, #FFD700) !important;
            color: #1A120B !important;
            font-weight: bold !important;
            border: 2px solid #D4AF37 !important;
            box-shadow: 0 0 15px rgba(212, 175, 55, 0.6) !important;
            animation: pulse-gold 2s infinite !important;
            position: relative !important;
        }
        
        .calendar-day.evento-especial::before {
            content: '★' !important;
            position: absolute !important;
            left: 2px !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
            font-size: 8px !important;
        }
        
        .calendar-day.evento-especial::after {
            content: '★' !important;
            position: absolute !important;
            right: 2px !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
            font-size: 8px !important;
        }
        
        @keyframes pulse-gold {
            0% { box-shadow: 0 0 15px rgba(212, 175, 55, 0.6) !important; }
            50% { box-shadow: 0 0 25px rgba(212, 175, 55, 0.8) !important; }
            100% { box-shadow: 0 0 15px rgba(212, 175, 55, 0.6) !important; }
        }
    `;
    document.head.appendChild(style);
});