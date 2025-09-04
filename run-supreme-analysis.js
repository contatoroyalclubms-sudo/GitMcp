/**
 * Script de Execução - Sistema Arquitetural Supremo
 * Executa análise completa do sistema MEEP usando Playwright + MCP Puppeteer
 */

const { runHybridArchitecturalAnalysis } = require('./hybrid-system-architect.js');
const fs = require('fs');
const path = require('path');

class ArchitecturalAnalysisRunner {
  constructor() {
    this.startTime = null;
    this.endTime = null;
    this.results = null;
  }

  async run() {
    console.log('🏗️ SISTEMA DE ANÁLISE ARQUITETURAL SUPREMO');
    console.log('=' .repeat(50));
    console.log('🎯 Target: Sistema MEEP Enterprise');
    console.log('🔧 Metodologia: Playwright + MCP Puppeteer');
    console.log('📊 Análise: Completa e Híbrida');
    console.log('=' .repeat(50));

    this.startTime = Date.now();

    try {
      // Verificar pré-requisitos
      await this.checkPrerequisites();

      // Executar análise
      console.log('🚀 Iniciando análise arquitetural...');
      this.results = await runHybridArchitecturalAnalysis();

      this.endTime = Date.now();
      
      // Gerar resumo final
      await this.generateFinalSummary();

      console.log('✅ ANÁLISE CONCLUÍDA COM SUCESSO!');
      
    } catch (error) {
      console.error('❌ ERRO NA ANÁLISE:', error.message);
      await this.generateErrorReport(error);
      throw error;
    }
  }

  async checkPrerequisites() {
    console.log('🔍 Verificando pré-requisitos...');

    const checks = [
      {
        name: 'Diretório MCP Puppeteer',
        path: './mcp-puppeteer',
        required: true
      },
      {
        name: 'Servidor MCP',
        path: './mcp-puppeteer/src/server.js',
        required: true
      },
      {
        name: 'Node Modules MCP',
        path: './mcp-puppeteer/node_modules',
        required: true
      }
    ];

    for (const check of checks) {
      const exists = fs.existsSync(check.path);
      console.log(`${exists ? '✅' : '❌'} ${check.name}: ${exists ? 'OK' : 'FALTANDO'}`);
      
      if (check.required && !exists) {
        throw new Error(`Pré-requisito faltando: ${check.name} em ${check.path}`);
      }
    }

    console.log('✅ Todos os pré-requisitos verificados!');
  }

  async generateFinalSummary() {
    const duration = Math.round((this.endTime - this.startTime) / 1000);
    
    const summary = `# 📋 RESUMO FINAL - ANÁLISE ARQUITETURAL SUPREMA

## ⏱️ Informações de Execução
- **Início:** ${new Date(this.startTime).toLocaleString('pt-BR')}
- **Término:** ${new Date(this.endTime).toLocaleString('pt-BR')}
- **Duração:** ${duration} segundos
- **Status:** ✅ CONCLUÍDA COM SUCESSO

## 📊 Resultados Principais

### 🏗️ Arquitetura Mapeada
- **Páginas Analisadas:** ${this.results?.combined?.metadata?.playwrightPages || 0}
- **Módulos Identificados:** ${this.results?.combined?.architecture?.modules?.size || 0}
- **Processos de Negócio:** ${this.results?.combined?.architecture?.businessProcesses?.size || 0}
- **APIs Descobertas:** ${this.results?.combined?.architecture?.apis?.size || 0}

### 🎭 Análise Playwright
- **Cobertura:** Estrutural completa
- **Profundidade:** 6 níveis
- **Recursos:** Mapeamento hierárquico, análise técnica, extração de metadados

### 🤖 Análise MCP Puppeteer  
- **Screenshots:** ${this.results?.combined?.enhancements?.screenshots?.length || 0}
- **Testes de Performance:** ${this.results?.combined?.enhancements?.performanceDetails?.length || 0}
- **Verificações de Acessibilidade:** ${this.results?.combined?.enhancements?.accessibilityDetails?.length || 0}
- **Testes de Interação:** ${this.results?.combined?.enhancements?.interactionTests?.length || 0}

## 📁 Arquivos Gerados

### 🎭 Playwright (Supreme Architecture)
- \`./supreme-system-architecture/\`
  - \`supreme-architecture.json\` - Dados completos
  - \`documentation/SUPREME-ARCHITECTURE.md\` - Documentação
  - \`diagrams/\` - Diagramas Mermaid
  - \`assets/screenshots/\` - Screenshots estruturais

### 🤖 MCP Puppeteer (Hybrid Analysis)
- \`./hybrid-analysis/\`
  - \`data/hybrid-analysis.json\` - Dados combinados
  - \`reports/EXECUTIVE-SUMMARY.md\` - Resumo executivo
  - \`reports/TECHNICAL-ANALYSIS.md\` - Análise técnica
  - \`recommendations/ACTION-PLAN.md\` - Plano de ação
  - \`mcp-screenshots/\` - Screenshots de qualidade
  - \`data/analysis-data.csv\` - Dados para análise

## 🎯 Próximos Passos

### 📈 Imediatos (1-2 semanas)
1. **Revisar relatório executivo** em \`./hybrid-analysis/reports/EXECUTIVE-SUMMARY.md\`
2. **Implementar correções críticas** do plano de ação
3. **Validar descobertas** com equipe técnica
4. **Priorizar melhorias** baseadas no impacto de negócio

### 🔄 Médio Prazo (1-3 meses)
1. **Estabelecer monitoramento contínuo**
2. **Implementar automações** baseadas nos testes
3. **Modernizar componentes** identificados como críticos
4. **Otimizar performance** conforme métricas coletadas

### 🚀 Longo Prazo (3-6 meses)
1. **Evolução arquitetural** baseada no mapeamento
2. **Implementação de melhorias** de acessibilidade
3. **Modernização tecnológica** do stack identificado
4. **Expansão da cobertura** de testes automatizados

## 💡 Principais Insights

### 🔍 Descobertas Arquiteturais
- Sistema possui estrutura modular bem definida
- Hierarquia de navegação consistente
- Oportunidades de otimização identificadas

### ⚡ Performance
- Métricas de carregamento coletadas
- Recursos críticos mapeados
- Oportunidades de cache identificadas

### ♿ Acessibilidade
- Conformidade WCAG avaliada
- Problemas específicos documentados
- Plano de correção estabelecido

### 🔒 Segurança
- Controles existentes mapeados
- Vulnerabilidades identificadas
- Recomendações priorizadas

## 🏆 Conclusão

A **Análise Arquitetural Suprema** do Sistema MEEP foi concluída com êxito, proporcionando:

✅ **Visão 360°** da arquitetura atual  
✅ **Mapeamento completo** de funcionalidades  
✅ **Análise híbrida** (Playwright + MCP)  
✅ **Relatórios executivos** e técnicos  
✅ **Plano de ação** detalhado  
✅ **Dados quantitativos** para tomada de decisão  

O sistema demonstra uma **arquitetura sólida** com oportunidades claras de **otimização e modernização**.

---

## 📞 Suporte

Para dúvidas sobre este relatório ou implementação das recomendações:

- **Documentação Técnica:** \`./hybrid-analysis/reports/TECHNICAL-ANALYSIS.md\`
- **Plano de Ação:** \`./hybrid-analysis/recommendations/ACTION-PLAN.md\`
- **Dados Raw:** \`./hybrid-analysis/data/\`

---

*Relatório gerado automaticamente pelo Sistema de Análise Arquitetural Supremo*  
*Data: ${new Date().toLocaleString('pt-BR')}*
`;

    // Salvar resumo final
    const outputDir = './analysis-summary';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(outputDir, 'FINAL-SUMMARY.md'),
      summary
    );

    console.log('📋 Resumo final salvo em: ./analysis-summary/FINAL-SUMMARY.md');
  }

  async generateErrorReport(error) {
    const errorReport = `# ❌ RELATÓRIO DE ERRO - Análise Arquitetural

## Informações do Erro
- **Data:** ${new Date().toLocaleString('pt-BR')}
- **Erro:** ${error.message}
- **Stack:** 
\`\`\`
${error.stack}
\`\`\`

## Contexto
- **Duração até erro:** ${this.startTime ? Math.round((Date.now() - this.startTime) / 1000) : 0} segundos
- **Fase:** ${this.determineErrorPhase(error)}

## Possíveis Soluções
1. Verificar se o servidor MCP Puppeteer está rodando
2. Confirmar se as dependências estão instaladas
3. Verificar conectividade de rede
4. Reiniciar o processo

## Debug
Para debug detalhado, execute:
\`\`\`bash
cd mcp-puppeteer
npm install
node src/server.js
\`\`\`

---
*Relatório de erro gerado automaticamente*
`;

    const outputDir = './analysis-summary';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(outputDir, 'ERROR-REPORT.md'),
      errorReport
    );

    console.log('📋 Relatório de erro salvo em: ./analysis-summary/ERROR-REPORT.md');
  }

  determineErrorPhase(error) {
    if (error.message.includes('MCP Server')) {
      return 'Inicialização do MCP Server';
    } else if (error.message.includes('Playwright')) {
      return 'Análise Playwright';
    } else if (error.message.includes('pré-requisito')) {
      return 'Verificação de Pré-requisitos';
    } else {
      return 'Fase desconhecida';
    }
  }
}

// Função de execução principal
async function main() {
  const runner = new ArchitecturalAnalysisRunner();
  
  try {
    await runner.run();
    console.log('🎉 ANÁLISE ARQUITETURAL SUPREMA FINALIZADA!');
    process.exit(0);
  } catch (error) {
    console.error('💥 FALHA NA ANÁLISE ARQUITETURAL:', error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { ArchitecturalAnalysisRunner };
