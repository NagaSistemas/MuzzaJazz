const express = require('express');
const router = express.Router();

module.exports = (db) => {

// Obter preços padrão ou por data
router.get('/precos/:data?', async (req, res) => {
  try {
    const { data } = req.params;
    
    // Verificar se há evento especial na data
    if (data) {
      const eventoSnapshot = await db.collection('eventos')
        .where('data', '==', data)
        .limit(1)
        .get();
      
      if (!eventoSnapshot.empty) {
        const evento = eventoSnapshot.docs[0].data();
        return res.json({
          tipo: 'evento',
          evento,
          precos: {
            interna_sexta: evento.precoInterna || 0,
            interna_sabado: evento.precoInterna || 0,
            externa: evento.precoExterna || 0,
            crianca_desconto: evento.tipoCrianca === 'gratuito' ? 0 : 
                             evento.tipoCrianca === 'personalizado' ? -1 : 
                             parseInt(evento.tipoCrianca) || 50,
            crianca_preco_fixo: evento.precoPersonalizadoCrianca || 0
          }
        });
      }
    }
    
    // Preços padrão
    const precosDoc = await db.collection('configuracoes').doc('precos').get();
    const precos = precosDoc.exists ? precosDoc.data() : {
      interna_sexta: 35,
      interna_sabado: 50,
      externa: 35,
      crianca_desconto: 50,
      crianca_preco_fixo: 0
    };
    
    res.json({
      tipo: 'padrao',
      precos
    });
  } catch (error) {
    console.error('Erro ao buscar preços:', error);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
});

// Obter capacidade por data
router.get('/capacidade/:data?', async (req, res) => {
  try {
    const { data } = req.params;
    const dataStr = data || new Date().toISOString().split('T')[0];
    
    // Capacidade total (pode ser configurável no futuro)
    const capacidade = { interna: 40, externa: 60 };
    
    // Calcular ocupação atual
    const reservasSnapshot = await db.collection('reservas')
      .where('data', '==', dataStr)
      .where('status', 'in', ['confirmada', 'pago'])
      .get();
    
    const ocupacao = { interna: 0, externa: 0 };
    
    reservasSnapshot.forEach(doc => {
      const reserva = doc.data();
      ocupacao[reserva.area] += reserva.adultos + reserva.criancas;
    });
    
    const disponivel = {
      interna: Math.max(0, capacidade.interna - ocupacao.interna),
      externa: Math.max(0, capacidade.externa - ocupacao.externa)
    };
    
    res.json({
      capacidade,
      ocupacao,
      disponivel
    });
  } catch (error) {
    console.error('Erro ao buscar capacidade:', error);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
});

// Salvar preços padrão (requer autenticação)
router.post('/precos', async (req, res) => {
  try {
    const precos = req.body;
    await db.collection('configuracoes').doc('precos').set(precos);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao salvar preços:', error);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
});

  return router;
};