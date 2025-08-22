const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../firebase/config');
const { validate } = require('../middleware/validation');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'muzza-jazz-secret-2024';

// Login admin
router.post('/login', validate('login'), async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Buscar usuário admin
    const adminDoc = await db.collection('admins').doc(username).get();
    
    if (!adminDoc.exists) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }
    
    const admin = adminDoc.data();
    const senhaValida = await bcrypt.compare(password, admin.senha);
    
    if (!senhaValida) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }
    
    const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({
      success: true,
      token,
      admin: { username: admin.username, nome: admin.nome }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Middleware de autenticação
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token não fornecido' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token inválido' });
  }
};

// Dashboard - métricas
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const hoje = new Date().toISOString().split('T')[0];
    
    // Reservas hoje
    const reservasHojeSnapshot = await db.collection('reservas')
      .where('data', '==', hoje)
      .where('status', '==', 'confirmada')
      .get();
    
    const reservasHoje = reservasHojeSnapshot.size;
    const receitaHoje = reservasHojeSnapshot.docs.reduce((sum, doc) => sum + doc.data().valor, 0);
    
    // Próximas reservas (próximas 2 horas)
    const agora = new Date();
    const proximasDuasHoras = new Date(agora.getTime() + 2 * 60 * 60 * 1000);
    
    const proximasSnapshot = await db.collection('reservas')
      .where('data', '==', hoje)
      .where('status', '==', 'confirmada')
      .get();
    
    const proximasChegadas = proximasSnapshot.size; // Simplificado
    
    // Capacidade e ocupação
    const capacidadeResponse = await fetch(`${req.protocol}://${req.get('host')}/api/config/capacidade/${hoje}`);
    const capacidadeData = await capacidadeResponse.json();
    
    const totalCapacidade = capacidadeData.capacidade.interna + capacidadeData.capacidade.externa;
    const totalDisponivel = capacidadeData.disponivel.interna + capacidadeData.disponivel.externa;
    const ocupacao = totalCapacidade > 0 ? ((totalCapacidade - totalDisponivel) / totalCapacidade) * 100 : 0;
    
    res.json({
      success: true,
      metricas: {
        reservasHoje,
        receitaHoje,
        ocupacao: Math.round(ocupacao),
        proximasChegadas
      }
    });
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Gerenciar mesas
router.get('/mesas', authMiddleware, async (req, res) => {
  try {
    const snapshot = await db.collection('mesas').orderBy('numero').get();
    const mesas = [];
    snapshot.forEach(doc => mesas.push({ id: doc.id, ...doc.data() }));
    res.json({ success: true, mesas });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/mesas', authMiddleware, validate('mesa'), async (req, res) => {
  try {
    const mesa = {
      ...req.body,
      criadoEm: new Date().toISOString()
    };
    const docRef = await db.collection('mesas').add(mesa);
    res.json({ success: true, id: docRef.id });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
});

router.put('/mesas/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('mesas').doc(id).update(req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/mesas/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('mesas').doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;