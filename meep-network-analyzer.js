/**
 * MEEP NETWORK ANALYZER
 * Analisa todas as requisições de rede para mapear a arquitetura
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;

class MeepNetworkAnalyzer {
    constructor() {
        this.requests = [];
        this.responses = [];
        this.apis = [];
        this.assets = [];
    }

    async analyze() {
        console.log('🌐 Iniciando análise de rede do MEEP...');
        
        const browser = await chromium.launch({ headless: false });
        const page = await browser.newPage();

        // Interceptar todas as requisições
        page.on('request', request => {
            this.requests.push({
                url: request.url(),
                method: request.method(),
                headers: request.headers(),
                timestamp: new Date().toISOString(),
                resourceType: request.resourceType()
            });
        });

        // Interceptar todas as respostas
        page.on('response', async response => {
            const responseData = {
                url: response.url(),
                status: response.status(),
                statusText: response.statusText(),
                headers: response.headers(),
                timestamp: new Date().toISOString(),
                size: 0
            };

            try {
                const body = await response.body();
                responseData.size = body.length;
                responseData.contentType = response.headers()['content-type'] || '';
                
                // Classificar tipo de recurso
                if (response.url().includes('/api/') || response.url().includes('api.')) {
                    this.apis.push(responseData);
                } else {
                    this.assets.push(responseData);
                }
            } catch (e) {
                // Ignorar erros de recursos não disponíveis
            }

            this.responses.push(responseData);
            console.log(`📡 ${response.request().method()} ${response.url()} [${response.status()}]`);
        });

        // Navegar e aguardar carregamento completo
        console.log('🚀 Navegando para Portal MEEP...');
        await page.goto('https://beta.portal.meep.com.br', { 
            waitUntil: 'networkidle',
            timeout: 60000 
        });

        // Aguardar um pouco mais para carregar recursos lazy
        await page.waitForTimeout(5000);

        // Tentar navegar por algumas seções se possível
        try {
            const links = await page.$$('a[href^="/"]');
            console.log(`🔗 Encontrados ${links.length} links internos`);
            
            for (let i = 0; i < Math.min(3, links.length); i++) {
                try {
                    const href = await links[i].getAttribute('href');
                    console.log(`📱 Visitando: ${href}`);
                    await page.click(`a[href="${href}"]`);
                    await page.waitForTimeout(2000);
                    await page.goBack();
                    await page.waitForTimeout(1000);
                } catch (e) {
                    console.log(`⚠️ Erro ao visitar link: ${e.message}`);
                }
            }
        } catch (e) {
            console.log('⚠️ Navegação limitada, analisando apenas página inicial');
        }

        await this.generateNetworkReport();
        await browser.close();
    }

    async generateNetworkReport() {
        console.log('📊 Gerando relatório de rede...');

        const stats = {
            totalRequests: this.requests.length,
            totalResponses: this.responses.length,
            totalAPIs: this.apis.length,
            totalAssets: this.assets.length,
            successfulRequests: this.responses.filter(r => r.status >= 200 && r.status < 300).length,
            failedRequests: this.responses.filter(r => r.status >= 400).length
        };

        // Agrupar por domínio
        const domainStats = {};
        this.responses.forEach(response => {
            try {
                const domain = new URL(response.url).hostname;
                if (!domainStats[domain]) {
                    domainStats[domain] = { count: 0, size: 0 };
                }
                domainStats[domain].count++;
                domainStats[domain].size += response.size || 0;
            } catch (e) {}
        });

        // Identificar APIs únicas
        const uniqueAPIs = [...new Set(this.apis.map(api => {
            try {
                const url = new URL(api.url);
                return `${url.hostname}${url.pathname}`;
            } catch (e) {
                return api.url;
            }
        }))];

        const report = {
            timestamp: new Date().toISOString(),
            stats,
            domainStats,
            uniqueAPIs,
            allRequests: this.requests,
            allResponses: this.responses,
            apis: this.apis,
            assets: this.assets
        };

        // Salvar JSON completo
        await fs.writeFile('./meep-network-analysis.json', JSON.stringify(report, null, 2));

        // Gerar relatório Markdown
        let md = '# Portal MEEP - Análise de Rede\n\n';
        md += `**Data:** ${new Date().toLocaleString('pt-BR')}\n\n`;

        md += '## 📈 Estatísticas Gerais\n\n';
        md += `- **Total de requisições:** ${stats.totalRequests}\n`;
        md += `- **Total de respostas:** ${stats.totalResponses}\n`;
        md += `- **APIs identificadas:** ${stats.totalAPIs}\n`;
        md += `- **Assets carregados:** ${stats.totalAssets}\n`;
        md += `- **Requisições bem-sucedidas:** ${stats.successfulRequests}\n`;
        md += `- **Requisições com erro:** ${stats.failedRequests}\n\n`;

        md += '## 🌐 Domínios Acessados\n\n';
        md += '| Domínio | Requisições | Tamanho Total |\n';
        md += '|---------|-------------|---------------|\n';
        Object.entries(domainStats).forEach(([domain, data]) => {
            const size = (data.size / 1024).toFixed(1) + ' KB';
            md += `| ${domain} | ${data.count} | ${size} |\n`;
        });
        md += '\n';

        md += '## 🔌 APIs Descobertas\n\n';
        if (uniqueAPIs.length > 0) {
            uniqueAPIs.forEach(api => {
                md += `- \`${api}\`\n`;
            });
        } else {
            md += 'Nenhuma API específica descoberta (apenas recursos estáticos).\n';
        }
        md += '\n';

        md += '## 📦 Principais Assets\n\n';
        const mainAssets = this.assets
            .filter(asset => asset.size > 10000) // Maior que 10KB
            .sort((a, b) => (b.size || 0) - (a.size || 0))
            .slice(0, 20);

        if (mainAssets.length > 0) {
            md += '| Asset | Tamanho | Status |\n';
            md += '|-------|---------|--------|\n';
            mainAssets.forEach(asset => {
                const fileName = asset.url.split('/').pop() || asset.url;
                const size = ((asset.size || 0) / 1024).toFixed(1) + ' KB';
                md += `| ${fileName} | ${size} | ${asset.status} |\n`;
            });
        }
        md += '\n';

        md += '## 🔍 Análise Detalhada\n\n';
        md += '### Tecnologias Identificadas\n\n';
        
        const technologies = [];
        this.responses.forEach(response => {
            if (response.url.includes('react')) technologies.push('React.js');
            if (response.url.includes('jquery')) technologies.push('jQuery');
            if (response.url.includes('bootstrap')) technologies.push('Bootstrap');
            if (response.url.includes('material')) technologies.push('Material Design');
            if (response.url.includes('google')) technologies.push('Google Services');
            if (response.url.includes('font')) technologies.push('Web Fonts');
        });

        [...new Set(technologies)].forEach(tech => {
            md += `- ✅ ${tech}\n`;
        });
        md += '\n';

        await fs.writeFile('./MEEP-NETWORK-ANALYSIS.md', md);

        console.log('✅ Relatório de rede gerado!');
        console.log('📁 Arquivos criados:');
        console.log('   - meep-network-analysis.json');
        console.log('   - MEEP-NETWORK-ANALYSIS.md');
        console.log(`📊 Resumo: ${stats.totalRequests} requisições analisadas`);
    }
}

// Executar
const analyzer = new MeepNetworkAnalyzer();
analyzer.analyze().catch(console.error);
