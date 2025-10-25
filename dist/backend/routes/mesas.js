const express = require('express');
const router = express.Router();

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
            
            // Buscar reservas da data
            const reservasSnapshot = await db.collection('reservas')
                .where('data', '==', data)
                .where('status', '==', 'pago')
                .get();
            
            const reservas = [];
            reservasSnapshot.forEach(doc => {
                reservas.push({ id: doc.id, ...doc.data() });
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
            
            const mesasSnapshot = await db.collection('mesas')
                .where('status', '==', 'ativa')
                .where('area', '==', area)
                .get();
            
            const mesas = [];
            mesasSnapshot.forEach(doc => {
                mesas.push({ id: doc.id, ...doc.data() });
            });
            
            const reservasSnapshot = await db.collection('reservas')
                .where('data', '==', data)
                .where('area', '==', area)
                .where('status', '==', 'pago')
                .get();
            
            const mesasOcupadas = [];
            reservasSnapshot.forEach(doc => {
                const r = doc.data();
                if (r.numeroMesa) mesasOcupadas.push(r.numeroMesa);
            });
            
            const mesasDisponiveis = mesas.filter(m => !mesasOcupadas.includes(m.numero));
            
            res.json({ mesas: mesasDisponiveis });
        } catch (error) {
            console.error('Erro ao buscar mesas disponíveis:', error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    });

    return router;
};