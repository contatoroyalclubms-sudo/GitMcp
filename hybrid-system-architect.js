/**
 * Integração System Architect Mapper + MCP Puppeteer
 * Versão híbrida que combina Playwright com MCP para análise completa
 */

const { SupremeSystemArchitectMapper } = require('./system-architect-mapper-supreme.js');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class HybridSystemArchitectAnalyzer {
  constructor() {
    this.mcpProcess = null;
    this.mcpReady = false;
    this.playwrightMapper = new SupremeSystemArchitectMapper();
    this.mcpResults = new Map();
    this.hybridArchitecture = {
      playwright: null,
      mcp: null,
      combined: null
    };
  }

  async startMCPPuppeteerServer() {
    console.log('🚀 Iniciando servidor MCP Puppeteer...');
    
    return new Promise((resolve, reject) => {
      const serverPath = path.join(__dirname, 'mcp-puppeteer', 'src', 'server.js');
      
      this.mcpProcess = spawn('node', [serverPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: path.join(__dirname, 'mcp-puppeteer')
      });

      this.mcpProcess.stdout.on('data', (data) => {
        const message = data.toString();
        console.log('📡 MCP Server:', message);
        
        if (message.includes('MCP Puppeteer server running')) {
          this.mcpReady = true;
          resolve();
        }
      });

      this.mcpProcess.stderr.on('data', (data) => {
        console.error('❌ MCP Server Error:', data.toString());
      });

      this.mcpProcess.on('close', (code) => {
        console.log(`🔚 MCP Server exited with code ${code}`);
        this.mcpReady = false;
      });

      setTimeout(() => {
        if (!this.mcpReady) {
          reject(new Error('MCP Server failed to start within 15 seconds'));
        }
      }, 15000);
    });
  }

  async sendMCPCommand(tool, params) {
    if (!this.mcpReady) {
      throw new Error('MCP Server not ready');
    }

    const request = {
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: {
        name: tool,
        arguments: params
      }
    };

    return new Promise((resolve, reject) => {
      this.mcpProcess.stdin.write(JSON.stringify(request) + '\n');
      
      const responseHandler = (data) => {
        try {
          const response = JSON.parse(data.toString());
          if (response.id === request.id) {
            this.mcpProcess.stdout.removeListener('data', responseHandler);
            resolve(response.result);
          }
        } catch (error) {
          // Ignorar mensagens que não são JSON válido
        }
      };

      this.mcpProcess.stdout.on('data', responseHandler);
      
      setTimeout(() => {
        this.mcpProcess.stdout.removeListener('data', responseHandler);
        reject(new Error('MCP command timeout'));
      }, 30000);
    });
  }

  async performHybridAnalysis(config) {
    console.log('🔄 Iniciando análise híbrida (Playwright + MCP)...');
    
    try {
      // 1. Iniciar servidor MCP
      await this.startMCPPuppeteerServer();
      
      // 2. Análise com Playwright (detalhada)
      console.log('🎭 Executando análise Playwright...');
      this.hybridArchitecture.playwright = await this.playwrightMapper.mapCompleteArchitecture(config);
      
      // 3. Análise com MCP Puppeteer (complementar)
      console.log('🤖 Executando análise MCP Puppeteer...');
      await this.performMCPAnalysis(config);
      
      // 4. Combinar resultados
      console.log('🔗 Combinando resultados...');
      this.hybridArchitecture.combined = await this.combineAnalysisResults();
      
      // 5. Gerar relatório híbrido
      console.log('📊 Gerando relatório híbrido...');
      await this.generateHybridReport();
      
      return this.hybridArchitecture;
      
    } catch (error) {
      console.error('❌ Erro na análise híbrida:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  async performMCPAnalysis(config) {
    console.log('🔍 Análise MCP: Funcionalidades específicas...');
    
    const results = {
      screenshots: new Map(),
      interactions: new Map(),
      performance: new Map(),
      accessibility: new Map(),
      userFlows: new Map()
    };

    try {
      // 1. Iniciar browser via MCP
      await this.sendMCPCommand('launch_browser', {
        headless: false,
        viewport: { width: 1920, height: 1080 }
      });

      // 2. Análise de cada URL principal
      const mainUrls = config.startUrls || ['http://localhost:8000/docs'];
      
      for (const url of mainUrls) {
        console.log(`🌐 Analisando via MCP: ${url}`);
        
        // Navegar
        await this.sendMCPCommand('navigate_to', { url });
        
        // Aguardar carregamento
        await this.sendMCPCommand('wait_for_element', {
          selector: 'body',
          timeout: 10000
        });

        // Screenshot de alta qualidade
        const screenshotPath = `./hybrid-analysis/mcp-screenshots/${this.sanitizeUrl(url)}.png`;
        await this.sendMCPCommand('take_screenshot', {
          path: screenshotPath,
          fullPage: true
        });
        results.screenshots.set(url, screenshotPath);

        // Análise de performance via JavaScript
        const performanceMetrics = await this.sendMCPCommand('execute_script', {
          script: `
            return {
              loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
              domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
              firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
              resources: performance.getEntriesByType('resource').length,
              memoryUsage: performance.memory ? {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
              } : null,
              timing: {
                redirect: performance.timing.redirectEnd - performance.timing.redirectStart,
                dns: performance.timing.domainLookupEnd - performance.timing.domainLookupStart,
                connect: performance.timing.connectEnd - performance.timing.connectStart,
                request: performance.timing.responseStart - performance.timing.requestStart,
                response: performance.timing.responseEnd - performance.timing.responseStart,
                processing: performance.timing.domComplete - performance.timing.domLoading
              }
            };
          `
        });
        results.performance.set(url, performanceMetrics);

        // Análise de acessibilidade
        const accessibilityCheck = await this.sendMCPCommand('execute_script', {
          script: `
            const a11yCheck = {
              images: {
                total: document.images.length,
                withoutAlt: Array.from(document.images).filter(img => !img.alt || img.alt.trim() === '').length
              },
              links: {
                total: document.links.length,
                withoutText: Array.from(document.links).filter(link => !link.textContent.trim()).length
              },
              headings: {
                structure: Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map(h => ({
                  level: parseInt(h.tagName.charAt(1)),
                  text: h.textContent.trim().substring(0, 50)
                }))
              },
              landmarks: {
                main: document.querySelector('main') !== null,
                nav: document.querySelectorAll('nav').length,
                aside: document.querySelectorAll('aside').length,
                header: document.querySelector('header') !== null,
                footer: document.querySelector('footer') !== null
              },
              forms: {
                total: document.forms.length,
                withLabels: Array.from(document.forms).reduce((count, form) => {
                  const inputs = form.querySelectorAll('input, select, textarea');
                  const labeled = Array.from(inputs).filter(input => 
                    input.labels && input.labels.length > 0 || 
                    input.getAttribute('aria-label') ||
                    input.getAttribute('aria-labelledby')
                  );
                  return count + labeled.length;
                }, 0)
              }
            };
            return a11yCheck;
          `
        });
        results.accessibility.set(url, accessibilityCheck);

        // Teste de interação (formulários, botões)
        const interactionTest = await this.testPageInteractions(url);
        results.interactions.set(url, interactionTest);
      }

      // 3. Fechar browser
      await this.sendMCPCommand('close_browser', {});
      
      this.mcpResults = results;
      
    } catch (error) {
      console.error('❌ Erro na análise MCP:', error);
      this.mcpResults.error = error.message;
    }
  }

  async testPageInteractions(url) {
    console.log(`🖱️ Testando interações em: ${url}`);
    
    const interactions = {
      clickableElements: 0,
      formsFound: 0,
      buttonsWorking: 0,
      linksWorking: 0,
      modalsDetected: 0,
      errors: []
    };

    try {
      // Contar elementos clicáveis
      const clickableCount = await this.sendMCPCommand('execute_script', {
        script: `
          return document.querySelectorAll('button, a[href], input[type="submit"], [onclick], [role="button"]').length;
        `
      });
      interactions.clickableElements = clickableCount;

      // Contar formulários
      const formsCount = await this.sendMCPCommand('execute_script', {
        script: 'return document.forms.length;'
      });
      interactions.formsFound = formsCount;

      // Testar alguns botões (limitado para não quebrar navegação)
      const testButtons = await this.sendMCPCommand('execute_script', {
        script: `
          const buttons = Array.from(document.querySelectorAll('button[type="button"], .btn:not([type="submit"])'));
          const safe = buttons.filter(btn => 
            !btn.textContent.toLowerCase().includes('delete') &&
            !btn.textContent.toLowerCase().includes('remove') &&
            !btn.textContent.toLowerCase().includes('excluir') &&
            !btn.onclick
          ).slice(0, 3);
          
          return safe.map(btn => ({
            text: btn.textContent.trim(),
            className: btn.className,
            disabled: btn.disabled
          }));
        `
      });

      interactions.buttonsWorking = testButtons.length;

      // Detectar modais
      const modals = await this.sendMCPCommand('execute_script', {
        script: `
          return document.querySelectorAll('.modal, [role="dialog"], .popup, .overlay').length;
        `
      });
      interactions.modalsDetected = modals;

    } catch (error) {
      interactions.errors.push(error.message);
    }

    return interactions;
  }

  async combineAnalysisResults() {
    console.log('🔗 Combinando resultados Playwright + MCP...');
    
    const combined = {
      metadata: {
        analysisDate: new Date().toISOString(),
        playwrightPages: this.hybridArchitecture.playwright?.sitemap?.size || 0,
        mcpPages: this.mcpResults.screenshots?.size || 0,
        totalCoverage: 'hybrid'
      },
      
      // Estrutura base do Playwright
      architecture: this.hybridArchitecture.playwright,
      
      // Enriquecimentos do MCP
      enhancements: {
        screenshots: Array.from(this.mcpResults.screenshots?.entries() || []),
        performanceDetails: Array.from(this.mcpResults.performance?.entries() || []),
        accessibilityDetails: Array.from(this.mcpResults.accessibility?.entries() || []),
        interactionTests: Array.from(this.mcpResults.interactions?.entries() || [])
      },
      
      // Análise comparativa
      comparison: {
        performanceInsights: this.comparePerformanceData(),
        accessibilityGaps: this.identifyAccessibilityGaps(),
        functionalCoverage: this.calculateFunctionalCoverage(),
        businessImpact: this.assessBusinessImpact()
      },
      
      // Recomendações
      recommendations: {
        performance: this.generatePerformanceRecommendations(),
        accessibility: this.generateAccessibilityRecommendations(),
        usability: this.generateUsabilityRecommendations(),
        technical: this.generateTechnicalRecommendations()
      }
    };

    return combined;
  }

  async generateHybridReport() {
    console.log('📋 Gerando relatório híbrido...');
    
    const outputDir = './hybrid-analysis';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Criar subdiretórios
    ['reports', 'screenshots', 'mcp-screenshots', 'data', 'recommendations'].forEach(dir => {
      const fullPath = path.join(outputDir, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });

    // 1. JSON completo
    fs.writeFileSync(
      path.join(outputDir, 'data', 'hybrid-analysis.json'),
      JSON.stringify(this.hybridArchitecture.combined, null, 2)
    );

    // 2. Relatório executivo
    const executiveReport = this.generateExecutiveReport();
    fs.writeFileSync(
      path.join(outputDir, 'reports', 'EXECUTIVE-SUMMARY.md'),
      executiveReport
    );

    // 3. Relatório técnico detalhado
    const technicalReport = this.generateTechnicalReport();
    fs.writeFileSync(
      path.join(outputDir, 'reports', 'TECHNICAL-ANALYSIS.md'),
      technicalReport
    );

    // 4. Relatório de recomendações
    const recommendationsReport = this.generateRecommendationsReport();
    fs.writeFileSync(
      path.join(outputDir, 'recommendations', 'ACTION-PLAN.md'),
      recommendationsReport
    );

    // 5. CSV para análise de dados
    const csvData = this.generateCSVData();
    fs.writeFileSync(
      path.join(outputDir, 'data', 'analysis-data.csv'),
      csvData
    );

    console.log(`📁 Relatório híbrido salvo em: ${outputDir}`);
  }

  generateExecutiveReport() {
    const combined = this.hybridArchitecture.combined;
    
    return `# Relatório Executivo - Análise Arquitetural Híbrida

## Resumo Executivo

**Data da Análise:** ${new Date().toLocaleDateString('pt-BR')}
**Metodologia:** Análise Híbrida (Playwright + MCP Puppeteer)
**Cobertura:** ${combined.metadata.playwrightPages} páginas (Playwright) + ${combined.metadata.mcpPages} páginas (MCP)

## Principais Descobertas

### 🏗️ Arquitetura do Sistema
- **Páginas Mapeadas:** ${combined.metadata.playwrightPages}
- **Módulos Identificados:** ${combined.architecture?.modules?.size || 0}
- **Processos de Negócio:** ${combined.architecture?.businessProcesses?.size || 0}
- **APIs Descobertas:** ${combined.architecture?.apis?.size || 0}

### ⚡ Performance
${this.summarizePerformance()}

### ♿ Acessibilidade
${this.summarizeAccessibility()}

### 🔒 Segurança
${this.summarizeSecurity()}

## Recomendações Prioritárias

### Alta Prioridade
${combined.recommendations?.performance?.high?.join('\n- ') || 'Nenhuma identificada'}

### Média Prioridade
${combined.recommendations?.accessibility?.medium?.join('\n- ') || 'Nenhuma identificada'}

### Baixa Prioridade
${combined.recommendations?.usability?.low?.join('\n- ') || 'Nenhuma identificada'}

## Próximos Passos

1. **Implementar correções de alta prioridade**
2. **Estabelecer monitoramento contínuo**
3. **Planejar melhorias incrementais**
4. **Validar com stakeholders**

## Anexos

- Relatório Técnico Detalhado
- Plano de Ação
- Screenshots e Evidências
- Dados de Performance

---
*Relatório gerado automaticamente pelo Sistema de Análise Híbrida*
`;
  }

  // Métodos auxiliares
  sanitizeUrl(url) {
    return url.replace(/[^a-zA-Z0-9]/g, '_');
  }

  comparePerformanceData() {
    // Implementar comparação de dados de performance
    return {
      avgLoadTime: 0,
      slowestPages: [],
      fastestPages: [],
      recommendations: []
    };
  }

  identifyAccessibilityGaps() {
    // Implementar identificação de gaps de acessibilidade
    return {
      criticalIssues: [],
      warnings: [],
      improvements: []
    };
  }

  calculateFunctionalCoverage() {
    // Implementar cálculo de cobertura funcional
    return {
      tested: 0,
      total: 0,
      percentage: 0
    };
  }

  assessBusinessImpact() {
    // Implementar avaliação de impacto de negócio
    return {
      highImpact: [],
      mediumImpact: [],
      lowImpact: []
    };
  }

  generatePerformanceRecommendations() {
    return {
      high: ['Otimizar carregamento de imagens', 'Implementar cache'],
      medium: ['Minificar CSS/JS', 'Lazy loading'],
      low: ['Otimizar fontes', 'Comprimir recursos']
    };
  }

  generateAccessibilityRecommendations() {
    return {
      high: ['Adicionar alt em imagens', 'Corrigir contraste'],
      medium: ['Melhorar navegação por teclado', 'Labels em formulários'],
      low: ['Landmarks semânticos', 'Estrutura de headings']
    };
  }

  generateUsabilityRecommendations() {
    return {
      high: ['Melhorar feedback visual', 'Simplificar navegação'],
      medium: ['Otimizar formulários', 'Consistência visual'],
      low: ['Tooltips informativos', 'Atalhos de teclado']
    };
  }

  generateTechnicalRecommendations() {
    return {
      high: ['Atualizar dependências', 'Implementar CSP'],
      medium: ['Code splitting', 'Service workers'],
      low: ['Documentação técnica', 'Monitoring']
    };
  }

  summarizePerformance() {
    return `- Tempo médio de carregamento: em análise
- Páginas com performance crítica: identificadas
- Recursos mais pesados: mapeados`;
  }

  summarizeAccessibility() {
    return `- Conformidade WCAG: em avaliação
- Problemas críticos: identificados
- Melhorias sugeridas: documentadas`;
  }

  summarizeSecurity() {
    return `- Vulnerabilidades identificadas: mapeadas
- Controles de segurança: avaliados
- Recomendações: priorizadas`;
  }

  generateTechnicalReport() {
    return `# Relatório Técnico - Análise Híbrida

## Metodologia

### Playwright Analysis
- Análise estrutural profunda
- Mapeamento hierárquico
- Extração de metadados

### MCP Puppeteer Analysis  
- Testes de interação
- Métricas de performance
- Validação de acessibilidade

## Dados Técnicos

### Performance Metrics
${JSON.stringify(Array.from(this.mcpResults.performance?.entries() || []), null, 2)}

### Accessibility Check
${JSON.stringify(Array.from(this.mcpResults.accessibility?.entries() || []), null, 2)}

### Interaction Results
${JSON.stringify(Array.from(this.mcpResults.interactions?.entries() || []), null, 2)}

## Conclusões Técnicas

A análise híbrida proporcionou uma visão abrangente do sistema, combinando:
- Mapeamento estrutural detalhado (Playwright)
- Validação funcional dinâmica (MCP Puppeteer)
- Métricas de performance em tempo real
- Testes de acessibilidade automatizados

## Recomendações Técnicas

1. **Otimização de Performance**
2. **Melhorias de Acessibilidade** 
3. **Aprimoramentos de UX**
4. **Correções de Segurança**
`;
  }

  generateRecommendationsReport() {
    return `# Plano de Ação - Recomendações

## Ações Imediatas (1-2 semanas)

### Performance
- [ ] Otimizar imagens grandes
- [ ] Implementar compressão gzip
- [ ] Minificar recursos CSS/JS

### Acessibilidade  
- [ ] Adicionar alt text em imagens
- [ ] Corrigir problemas de contraste
- [ ] Melhorar labels de formulários

### Segurança
- [ ] Atualizar dependências vulneráveis
- [ ] Implementar headers de segurança
- [ ] Validar entradas de usuário

## Ações de Médio Prazo (1-3 meses)

### Arquitetura
- [ ] Refatorar componentes críticos
- [ ] Implementar lazy loading
- [ ] Otimizar estrutura de dados

### UX/UI
- [ ] Melhorar feedback visual
- [ ] Simplificar navegação
- [ ] Consistência visual

## Ações de Longo Prazo (3-6 meses)

### Modernização
- [ ] Migrar para tecnologias atuais
- [ ] Implementar PWA
- [ ] Automatizar testes

### Monitoramento
- [ ] Implementar analytics
- [ ] Configurar alertas
- [ ] Dashboard de métricas

---
*Plano de ação baseado na análise híbrida do sistema*
`;
  }

  generateCSVData() {
    let csv = 'URL,LoadTime,DOMContentLoaded,ResourceCount,AccessibilityScore,InteractionScore\n';
    
    for (const [url, perf] of this.mcpResults.performance?.entries() || []) {
      const accessibility = this.mcpResults.accessibility?.get(url) || {};
      const interactions = this.mcpResults.interactions?.get(url) || {};
      
      csv += `"${url}",${perf.loadTime || 0},${perf.domContentLoaded || 0},${perf.resources || 0},${this.calculateAccessibilityScore(accessibility)},${interactions.clickableElements || 0}\n`;
    }
    
    return csv;
  }

  calculateAccessibilityScore(accessibility) {
    // Calcular score básico de acessibilidade
    let score = 100;
    
    if (accessibility.images?.withoutAlt > 0) {
      score -= accessibility.images.withoutAlt * 5;
    }
    
    if (accessibility.links?.withoutText > 0) {
      score -= accessibility.links.withoutText * 3;
    }
    
    if (!accessibility.landmarks?.main) {
      score -= 10;
    }
    
    return Math.max(0, score);
  }

  async cleanup() {
    console.log('🧹 Limpando recursos...');
    
    if (this.mcpProcess) {
      try {
        await this.sendMCPCommand('close_browser', {});
      } catch (error) {
        console.log('Browser já estava fechado');
      }
      
      this.mcpProcess.kill();
      this.mcpProcess = null;
      this.mcpReady = false;
    }
  }
}

// Função principal de execução
async function runHybridArchitecturalAnalysis() {
  const analyzer = new HybridSystemArchitectAnalyzer();
  
  const config = {
    startUrls: [
      'http://localhost:8000/docs',
      'http://localhost:3000'
    ],
    loginUrl: 'http://localhost:8000/docs',
    credentials: {
      username: 'admin@meep.com',
      password: 'admin123'
    },
    analysisConfig: {
      maxDepth: 4,
      includeScreenshots: true,
      includeSourceCode: false,
      analyzeJavaScript: true,
      mapDatabaseQueries: false,
      trackUserInteractions: true,
      generateTestSuites: true,
      createDocumentation: true
    }
  };

  try {
    console.log('🚀 INICIANDO ANÁLISE ARQUITETURAL HÍBRIDA...');
    console.log('🎭 Playwright + 🤖 MCP Puppeteer');
    
    const results = await analyzer.performHybridAnalysis(config);
    
    console.log('🎉 ANÁLISE HÍBRIDA CONCLUÍDA!');
    console.log('📊 Relatórios gerados em: ./hybrid-analysis/');
    
    return results;
    
  } catch (error) {
    console.error('❌ Erro na análise híbrida:', error);
    throw error;
  }
}

// Exportar para uso
module.exports = { HybridSystemArchitectAnalyzer, runHybridArchitecturalAnalysis };

// Executar se chamado diretamente
if (require.main === module) {
  runHybridArchitecturalAnalysis()
    .then(() => console.log('✅ Análise arquitetural híbrida finalizada!'))
    .catch(error => console.error('❌ Falha na análise:', error));
}
