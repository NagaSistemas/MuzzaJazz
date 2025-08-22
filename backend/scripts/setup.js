const bcrypt = require('bcryptjs');
const { db } = require('../firebase/config');

async function setupInitialData() {
  try {
    console.log('🔧 Configurando dados iniciais...');
    
    // Criar usuário admin padrão
    const senhaHash = await bcrypt.hash('muzza2023', 10);
    await db.collection('admins').doc('admin').set({
      username: 'admin',
      nome: 'Administrador',
      senha: senhaHash,
      criadoEm: new Date().toISOString()
    });
    console.log('✅ Usuário admin criado');
    
    // Configurar preços padrão
    await db.collection('configuracoes').doc('precos').set({
      interna_sexta: 35,
      interna_sabado: 50,
      externa: 35,
      crianca_desconto: 50,
      crianca_preco_fixo: 0
    });
    console.log('✅ Preços padrão configurados');
    
    // Criar mesas exemplo
    const mesasExemplo = [
      { numero: '1', capacidade: 4, area: 'interna', status: 'ativa', observacoes: 'Mesa próxima ao palco' },
      { numero: '2', capacidade: 6, area: 'interna', status: 'ativa', observacoes: '' },
      { numero: '3', capacidade: 8, area: 'externa', status: 'ativa', observacoes: 'Vista para a floresta' },
      { numero: '4', capacidade: 4, area: 'externa', status: 'ativa', observacoes: '' }
    ];
    
    for (const mesa of mesasExemplo) {
      await db.collection('mesas').add(mesa);
    }
    console.log('✅ Mesas exemplo criadas');
    
    console.log('🎉 Setup concluído com sucesso!');
    console.log('👤 Login: admin');
    console.log('🔑 Senha: muzza2023');
    
  } catch (error) {
    console.error('❌ Erro no setup:', error);
  }
}

if (require.main === module) {
  setupInitialData().then(() => process.exit(0));
}

module.exports = { setupInitialData };