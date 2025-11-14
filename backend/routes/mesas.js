const express = require('express');
const router = express.Router();

const STATUS_OCUPAM_MESA = ['manual', 'pago'];

module.exports = (db) => {
    // GET /api/mesas - Buscar todas as mesas
    router.get('/', async (req, res) => {
        try {
            const snapshot = await db.collection('mesas').get();
            const mesas = [];
            snapshot.forEach(doc => {
                mesas.push({ id: doc.id, ...doc.data() });
            });
            res.json({ mesas });
        } catch (error) {
            console.error('Erro ao buscar mesas:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    });

    // POST /api/mesas - Criar nova mesa
    router.post('/', async (req, res) => {
        try {
            const mesa = {
                ...req.body,
                id: Date.now().toString(),
                dataCriacao: new Date().toISOString()
            };
            
            await db.collection('mesas').doc(mesa.id).set(mesa);
            res.json({ success: true, message: 'Mesa criada com sucesso', id: mesa.id });
        } catch (error) {
            console.error('Erro ao criar mesa:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    });

    // PUT /api/mesas/:id - Atualizar mesa
    router.put('/:id', async (req, res) => {
        try {
            await db.collection('mesas').doc(req.params.id).update(req.body);
            res.json({ success: true, message: 'Mesa atualizada com sucesso' });
        } catch (error) {
            console.error('Erro ao atualizar mesa:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    });

    // DELETE /api/mesas/:id - Remover mesa
    router.delete('/:id', async (req, res) => {
        try {
            await db.collection('mesas').doc(req.params.id).delete();
            res.json({ success: true, message: 'Mesa removida com sucesso' });
        } catch (error) {
            console.error('Erro ao remover mesa:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    });

    // GET /api/config/capacidade - Buscar capacidade geral
    router.get('/config/capacidade', async (req, res) => {
        try {
            // Buscar mesas ativas
            const mesasSnapshot = await db.collection('mesas').where('status', '==', 'ativa').get();
            const mesas = [];
            mesasSnapshot.forEach(doc => {
                mesas.push({ id: doc.id, ...doc.data() });
            });
            
            // Calcular capacidade total por área
            const capacidade = {
                interna: mesas.filter(m => m.area === 'interna').reduce((sum, m) => sum + m.capacidade, 0),
                externa: mesas.filter(m => m.area === 'externa').reduce((sum, m) => sum + m.capacidade, 0)
            };
            
            // Assumir disponibilidade total se não há data específica
            const disponivel = {
                interna: Math.max(0, capacidade.interna - 5), // Reservar 5 lugares
                externa: Math.max(0, capacidade.externa - 5)  // Reservar 5 lugares
            };
            
            res.json({
                capacidade,
                disponivel
            });
        } catch (error) {
            console.error('Erro ao buscar capacidade geral:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    });

    // GET /api/mesas/capacidade/:data - Verificar capacidade disponível por data
    router.get('/capacidade/:data', async (req, res) => {
        try {
            const data = req.params.data;
            
            // Buscar mesas ativas
            const mesasSnapshot = await db.collection('mesas').where('status', '==', 'ativa').get();
            const mesas = [];
            mesasSnapshot.forEach(doc => {
                mesas.push({ id: doc.id, ...doc.data() });
            });
            
            // Calcular capacidade total por área
            const capacidadeTotal = {
                interna: mesas.filter(m => m.area === 'interna').reduce((sum, m) => sum + m.capacidade, 0),
                externa: mesas.filter(m => m.area === 'externa').reduce((sum, m) => sum + m.capacidade, 0)
            };
            
            // Buscar reservas da data (todos os status que ocupam mesa)
            const reservasSnapshot = await db.collection('reservas')
                .where('data', '==', data)
                .get();
            
            // Filtrar apenas reservas que ocupam mesa
            const reservas = [];
            reservasSnapshot.forEach(doc => {
                const data = doc.data();
                const status = (data.status || '').toLowerCase();
                if (STATUS_OCUPAM_MESA.includes(status)) {
                    reservas.push({ id: doc.id, ...data });
                }
            });
            
            // Calcular ocupação por área
            const ocupacao = {
                interna: reservas.filter(r => r.area === 'interna').reduce((sum, r) => sum + (r.adultos || 0) + (r.criancas || 0), 0),
                externa: reservas.filter(r => r.area === 'externa').reduce((sum, r) => sum + (r.adultos || 0) + (r.criancas || 0), 0)
            };
            
            // Calcular disponibilidade
            const disponivel = {
                interna: Math.max(0, capacidadeTotal.interna - ocupacao.interna),
                externa: Math.max(0, capacidadeTotal.externa - ocupacao.externa)
            };
            
            res.json({
                data,
                capacidade: capacidadeTotal,
                ocupacao,
                disponivel,
                totalMesas: mesas.length
            });
        } catch (error) {
            console.error('Erro ao verificar capacidade:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    });

    // GET /api/mesas/disponiveis/:data/:area - Buscar mesas disponíveis
    router.get('/disponiveis/:data/:area', async (req, res) => {
        try {
            const { data, area } = req.params;
            console.log(`🔍 Buscando mesas disponíveis para ${data} - ${area}`);
            
            const mesasSnapshot = await db.collection('mesas')
                .where('status', '==', 'ativa')
                .where('area', '==', area)
                .get();
            
            const mesas = [];
            mesasSnapshot.forEach(doc => {
                mesas.push({ id: doc.id, ...doc.data() });
            });
            console.log(`📋 Total de mesas ativas na área: ${mesas.length}`);
            
            const reservasSnapshot = await db.collection('reservas')
                .where('data', '==', data)
                .where('area', '==', area)
                .get();
            
            const mesasOcupadas = [];
            
            console.log(`📊 Total de reservas encontradas: ${reservasSnapshot.size}`);
            
            reservasSnapshot.forEach(doc => {
                const r = doc.data();
                const status = (r.status || '').toLowerCase();
                console.log(`   Reserva ${doc.id}: status=${status}, mesa=${r.numeroMesa}`);
                if (STATUS_OCUPAM_MESA.includes(status)) {
                    if (r.numeroMesa) mesasOcupadas.push(Number(r.numeroMesa));
                    if (r.mesaExtra) mesasOcupadas.push(Number(r.mesaExtra));
                    if (Array.isArray(r.mesasSelecionadas)) {
                        r.mesasSelecionadas.forEach(num => mesasOcupadas.push(Number(num)));
                    }
                }
            });
            
            const mesasOcupadasUnicas = [...new Set(mesasOcupadas)];
            console.log(`🚫 Mesas ocupadas: [${mesasOcupadasUnicas.join(', ')}]`);
            
            const mesasDisponiveis = mesas.filter(m => !mesasOcupadasUnicas.includes(Number(m.numero)));
            console.log(`✅ Mesas disponíveis: ${mesasDisponiveis.length}`);
            
            res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            res.json({ mesas: mesasDisponiveis });
        } catch (error) {
            console.error('Erro ao buscar mesas disponíveis:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    });

    return router;
};
