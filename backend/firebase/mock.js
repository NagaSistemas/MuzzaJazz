// Mock do Firebase para testes
let mockData = {
    reservas: [],
    mesas: [],
    precos: [],
    eventos: [],
    nagapay_config: []
};

let nextId = 1;

const mockDb = {
    collection: (name) => ({
        get: async () => ({
            empty: mockData[name].length === 0,
            forEach: (callback) => {
                mockData[name].forEach((item, index) => {
                    callback({
                        id: item.id || `mock_${index}`,
                        data: () => item,
                        exists: true
                    });
                });
            }
        }),
        
        doc: (id) => ({
            get: async () => {
                const item = mockData[name].find(item => item.id === id);
                return {
                    exists: !!item,
                    id: id,
                    data: () => item
                };
            },
            
            update: async (data) => {
                const index = mockData[name].findIndex(item => item.id === id);
                if (index !== -1) {
                    mockData[name][index] = { ...mockData[name][index], ...data };
                }
                return { id };
            }
        }),
        
        add: async (data) => {
            const id = `mock_${nextId++}`;
            const newItem = { id, ...data };
            mockData[name].push(newItem);
            return { id };
        },
        
        where: (field, operator, value) => ({
            get: async () => {
                let filtered = mockData[name];
                
                if (operator === '==') {
                    filtered = filtered.filter(item => item[field] === value);
                } else if (operator === '>=') {
                    filtered = filtered.filter(item => item[field] >= value);
                } else if (operator === '<=') {
                    filtered = filtered.filter(item => item[field] <= value);
                }
                
                return {
                    empty: filtered.length === 0,
                    forEach: (callback) => {
                        filtered.forEach((item) => {
                            callback({
                                id: item.id,
                                data: () => item
                            });
                        });
                    }
                };
            },
            
            where: (field2, operator2, value2) => ({
                get: async () => {
                    let filtered = mockData[name];
                    
                    // Primeiro filtro
                    if (operator === '==') {
                        filtered = filtered.filter(item => item[field] === value);
                    } else if (operator === '>=') {
                        filtered = filtered.filter(item => item[field] >= value);
                    } else if (operator === '<=') {
                        filtered = filtered.filter(item => item[field] <= value);
                    }
                    
                    // Segundo filtro
                    if (operator2 === '==') {
                        filtered = filtered.filter(item => item[field2] === value2);
                    } else if (operator2 === '>=') {
                        filtered = filtered.filter(item => item[field2] >= value2);
                    } else if (operator2 === '<=') {
                        filtered = filtered.filter(item => item[field2] <= value2);
                    }
                    
                    return {
                        empty: filtered.length === 0,
                        forEach: (callback) => {
                            filtered.forEach((item) => {
                                callback({
                                    id: item.id,
                                    data: () => item
                                });
                            });
                        }
                    };
                }
            })
        }),
        
        orderBy: (field, direction = 'asc') => ({
            get: async () => {
                const sorted = [...mockData[name]].sort((a, b) => {
                    if (direction === 'desc') {
                        return b[field] > a[field] ? 1 : -1;
                    }
                    return a[field] > b[field] ? 1 : -1;
                });
                
                return {
                    empty: sorted.length === 0,
                    forEach: (callback) => {
                        sorted.forEach((item) => {
                            callback({
                                id: item.id,
                                data: () => item
                            });
                        });
                    }
                };
            }
        }),
        
        limit: (count) => ({
            get: async () => {
                const limited = mockData[name].slice(0, count);
                return {
                    empty: limited.length === 0,
                    docs: limited.map(item => ({
                        id: item.id,
                        data: () => item
                    })),
                    forEach: (callback) => {
                        limited.forEach((item) => {
                            callback({
                                id: item.id,
                                data: () => item
                            });
                        });
                    }
                };
            }
        })
    })
};

// Dados iniciais para teste
mockData.mesas = [
    { id: 'mesa1', numero: 1, capacidade: 4, area: 'interna', status: 'ativa', observacoes: '', created_at: new Date(), updated_at: new Date() },
    { id: 'mesa2', numero: 2, capacidade: 6, area: 'interna', status: 'ativa', observacoes: '', created_at: new Date(), updated_at: new Date() },
    { id: 'mesa3', numero: 3, capacidade: 4, area: 'externa', status: 'ativa', observacoes: '', created_at: new Date(), updated_at: new Date() }
];

mockData.reservas = [
    {
        id: 'reserva1',
        nome: 'João Silva',
        sobrenome: 'Silva',
        whatsapp: '62999887766',
        data: new Date().toISOString().split('T')[0],
        area: 'interna',
        adultos: 2,
        criancas: 1,
        valor: 105,
        status: 'confirmada',
        transacao_id: 'TXN123456',
        data_pagamento: new Date(),
        observacoes: 'Mesa próxima ao palco',
        created_at: new Date(),
        updated_at: new Date()
    }
];

mockData.precos = [
    {
        id: 'precos1',
        interna_sexta: 35,
        interna_sabado: 50,
        externa: 35,
        crianca_percentual: 50,
        updated_at: new Date()
    }
];

console.log('🧪 Mock Firebase inicializado para testes');

module.exports = { db: mockDb };
