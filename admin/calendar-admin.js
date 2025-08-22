// Calendário de eventos especiais para admin
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDate = null;

function renderCalendarEvento() {
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                       'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    const monthYearEvento = document.getElementById('monthYearEvento');
    if (monthYearEvento) {
        monthYearEvento.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }
    
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const calendarDaysEvento = document.getElementById('calendarDaysEvento');
    if (!calendarDaysEvento) return;
    
    calendarDaysEvento.innerHTML = '';
    
    // Dias vazios do início
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'p-2';
        calendarDaysEvento.appendChild(emptyDay);
    }
    
    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dayOfWeek = date.getDay();
        const isPast = date < today;
        const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
        
        const dayElement = document.createElement('div');
        dayElement.textContent = day;
        dayElement.className = 'calendar-day p-2 text-center text-sm transition duration-300';
        
        if (isPast) {
            dayElement.classList.add('past', 'text-gray-400', 'cursor-not-allowed');
        } else {
            dayElement.classList.add('available', 'cursor-pointer');
            dayElement.addEventListener('click', () => selectDateEvento(date));
        }
        
        if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
            dayElement.classList.add('selected');
        }
        
        calendarDaysEvento.appendChild(dayElement);
    }
}

function selectDateEvento(date) {
    selectedDate = date;
    const dataEvento = document.getElementById('dataEvento');
    const dataEventoDisplay = document.getElementById('dataEventoDisplay');
    
    // Usar formato local para evitar problemas de fuso horário
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    console.log('📅 Data selecionada no admin:', dateString);
    console.log('📅 Data formatada para exibição:', `${day}/${month}/${year}`);
    
    if (dataEvento) dataEvento.value = dateString;
    if (dataEventoDisplay) dataEventoDisplay.value = `${day}/${month}/${year}`;
    
    const calendarEvento = document.getElementById('calendarEvento');
    if (calendarEvento) calendarEvento.classList.add('hidden');
    
    renderCalendarEvento();
}

// Event listeners do calendário
document.addEventListener('DOMContentLoaded', function() {
    const dataEventoDisplay = document.getElementById('dataEventoDisplay');
    if (dataEventoDisplay) {
        dataEventoDisplay.addEventListener('click', function() {
            const calendarEvento = document.getElementById('calendarEvento');
            if (calendarEvento) {
                calendarEvento.classList.toggle('hidden');
                if (!calendarEvento.classList.contains('hidden')) {
                    renderCalendarEvento();
                }
            }
        });
    }

    const prevMonthEvento = document.getElementById('prevMonthEvento');
    if (prevMonthEvento) {
        prevMonthEvento.addEventListener('click', function() {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendarEvento();
        });
    }

    const nextMonthEvento = document.getElementById('nextMonthEvento');
    if (nextMonthEvento) {
        nextMonthEvento.addEventListener('click', function() {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendarEvento();
        });
    }

    // Fechar calendário ao clicar fora
    document.addEventListener('click', function(e) {
        const calendarEvento = document.getElementById('calendarEvento');
        const dataEventoDisplay = document.getElementById('dataEventoDisplay');
        if (calendarEvento && dataEventoDisplay && 
            !calendarEvento.contains(e.target) && e.target !== dataEventoDisplay) {
            calendarEvento.classList.add('hidden');
        }
    });

    // Inicializar calendário
    setTimeout(() => {
        renderCalendarEvento();
    }, 100);
});