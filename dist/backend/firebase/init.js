const { db } = require('./config');

async function initializeFirestore() {
  try {
    console.log('🔥 Inicializando Firestore...');
    
    // Testar conexão
    await db.collection('test').doc('connection').set({
      timestamp: new Date(),
      status: 'connected'
    });
    
    console.log('✅ Firestore conectado com sucesso!');
    
    // Limpar teste
    await db.collection('test').doc('connection').delete();
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar Firestore:', error.message);
    return false;
  }
}

module.exports = { initializeFirestore };