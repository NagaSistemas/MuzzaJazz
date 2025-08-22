const express = require('express');
const { db } = require('../firebase/config');
const router = express.Router();

// Webhook para confirmação de pagamento
router.post('/pagamento', async (req, res) => {
  try {
    const { transacaoId, status, reservaId } = req.body;
    
    if (status === 'approved' || status === 'paid') {
      await db.collection('reservas').doc(reservaId).update({
        status: 'pago',
        transacaoId,
        dataPagamento: new Date().toISOString()
      });
      
      console.log(`✅ Pagamento confirmado para reserva ${reservaId}`);
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).json({ success: false });
  }
});

module.exports = router;