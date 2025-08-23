// Script de teste da API em produção
const API_BASE_URL = 'https://muzzajazz-production.up.railway.app/api';

async function testarAPI() {
    console.log('🧪 Iniciando testes da API...\n');
    
    const testes = [
        {
            nome: 'Health Check',
            url: `${API_BASE_URL}/health`,
            metodo: 'GET'
        },
        {
            nome: 'Listar Eventos',
            url: `${API_BASE_URL}/eventos`,
            metodo: 'GET'
        },
        {
            nome: 'Obter Preços',
            url: `${API_BASE_URL}/config/precos`,
            metodo: 'GET'
        },
        {
            nome: 'Listar Reservas',
            url: `${API_BASE_URL}/reservas`,
            metodo: 'GET'
        },
        {
            nome: 'Capacidade de Mesas',
            url: `${API_BASE_URL}/mesas/capacidade/2024-12-25`,
            metodo: 'GET'
        }
    ];
    
    let sucessos = 0;
    let falhas = 0;
    
    for (const teste of testes) {
        try {
            console.log(`🔍 Testando: ${teste.nome}`);
            console.log(`   URL: ${teste.url}`);
            
            const response = await fetch(teste.url, {
                method: teste.metodo,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log(`   ✅ Status: ${response.status}`);
                console.log(`   📊 Dados: ${JSON.stringify(data).substring(0, 100)}...`);
                sucessos++;
            } else {
                console.log(`   ❌ Erro: ${response.status} - ${response.statusText}`);
                falhas++;
            }
        } catch (error) {
            console.log(`   💥 Exceção: ${error.message}`);
            falhas++;
        }
        console.log('');
    }
    
    console.log('📈 Resumo dos Testes:');
    console.log(`   ✅ Sucessos: ${sucessos}`);
    console.log(`   ❌ Falhas: ${falhas}`);
    console.log(`   📊 Taxa de Sucesso: ${((sucessos / testes.length) * 100).toFixed(1)}%`);
    
    if (falhas === 0) {
        console.log('\n🎉 Todos os testes passaram! API está funcionando corretamente.');
    } else {
        console.log('\n⚠️ Alguns testes falharam. Verifique a configuração da API.');
    }
}

// Executar testes
testarAPI().catch(console.error);