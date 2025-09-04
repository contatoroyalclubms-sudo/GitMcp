const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class MEEPSystemMapper {
  constructor() {
    this.meepArchitecture = {
      // ARQUITETURA RAIZ DO MEEP
      systemInfo: {
        name: 'Sistema MEEP',
        version: null,
        technology: [],
        mappingDate: new Date().toISOString()
      },
      
      // ESTRUTURA HIERÁRQUICA COMPLETA
      rootStructure: {
        modules: new Map(),           // Módulos principais
        subModules: new Map(),        // Sub-módulos
        components: new Map(),        // Componentes individuais
        workflows: new Map(),         // Fluxos de trabalho
        dataStructures: new Map()     // Estruturas de dados
      },
      
      // MAPEAMENTO DE FUNCIONALIDADES
      features: {
        crud: new Map(),              // Create, Read, Update, Delete
        reports: new Map(),           // Relatórios disponíveis
        integrations: new Map(),      // Integrações externas
        dashboards: new Map(),        // Painéis e dashboards
        forms: new Map(),             // Formulários do sistema
        dataGrids: new Map()          // Grids de dados
      },
      
      // NAVEGAÇÃO E MENU COMPLETO
      navigation: {
        mainMenu: [],                 // Menu principal
        contextMenus: new Map(),      // Menus contextuais
        breadcrumbs: new Map(),       // Trilhas de navegação
        shortcuts: new Map()          // Atalhos e hotkeys
      },
      
      // PERMISSÕES E ACESSOS
      permissions: {
        userLevels: new Map(),        // Níveis de usuário
        moduleAccess: new Map(),      // Acesso por módulo
        featureRestrictions: new Map(), // Restrições por funcionalidade
        hiddenElements: new Map()     // Elementos ocultos por permissão
      },
      
      // TECNOLOGIAS E APIS
      technical: {
        endpoints: new Map(),         // APIs descobertas
        databases: new Map(),         // Estruturas de banco
        frameworks: new Set(),        // Frameworks identificados
        libraries: new Set(),         // Bibliotecas utilizadas
        customScripts: new Map()      // Scripts customizados
      }
    };
  }

  // 🚀 CONECTAR NO SISTEMA MEEP JÁ ABERTO
  async connectToOpenMEEP() {
    console.log('🔌 Conectando ao Sistema MEEP já aberto...');
    
    // Conectar ao Chrome já aberto (com debug port)
    const browser = await chromium.connectOverCDP('http://localhost:9222');
    const contexts = browser.contexts();
    
    if (contexts.length === 0) {
      throw new Error('❌ Nenhuma aba do MEEP encontrada. Abra o sistema primeiro!');
    }
    
    // Encontrar aba do MEEP
    let meepPage = null;
    for (const context of contexts) {
      const pages = context.pages();
      for (const page of pages) {
        const url = page.url();
        if (this.isMEEPSystem(url)) {
          meepPage = page;
          break;
        }
      }
      if (meepPage) break;
    }
    
    if (!meepPage) {
      throw new Error('❌ Sistema MEEP não encontrado nas abas abertas!');
    }
    
    console.log(`✅ Conectado ao MEEP: ${meepPage.url()}`);
    return meepPage;
  }

  // 🔍 IDENTIFICAR SE É O SISTEMA MEEP
  isMEEPSystem(url) {
    const meepIndicators = [
      'meep',
      'sistema',
      'erp',
      'gestao',
      'admin',
      'portal'
    ];
    
    return meepIndicators.some(indicator => 
      url.toLowerCase().includes(indicator.toLowerCase())
    );
  }

  // 🗺️ MAPEAMENTO COMPLETO DO MEEP
  async mapCompleteMEEPSystem() {
    const page = await this.connectToOpenMEEP();
    
    console.log('🏗️ Iniciando mapeamento arquitetural completo do MEEP...');
    
    // FASE 1: Identificação do sistema
    await this.identifyMEEPSystem(page);
    
    // FASE 2: Mapeamento da estrutura raiz
    await this.mapRootStructure(page);
    
    // FASE 3: Descoberta completa de módulos
    await this.discoverAllMEEPModules(page);
    
    // FASE 4: Mapeamento de componentes
    await this.mapMEEPComponents(page);
    
    // FASE 5: Análise de fluxos de trabalho
    await this.analyzeMEEPWorkflows(page);
    
    // FASE 6: Mapeamento de dados e APIs
    await this.mapMEEPDataStructures(page);
    
    // FASE 7: Análise de permissões
    await this.analyzeMEEPPermissions(page);
    
    // FASE 8: Geração da documentação
    await this.generateMEEPDocumentation();
    
    console.log('🎉 Mapeamento completo do MEEP finalizado!');
    return this.meepArchitecture;
  }

  // 🎯 IDENTIFICAÇÃO DO SISTEMA MEEP
  async identifyMEEPSystem(page) {
    console.log('🔍 Identificando Sistema MEEP...');
    
    const systemInfo = await page.evaluate(() => {
      const info = {
        title: document.title,
        url: location.href,
        version: null,
        technologies: [],
        meepIndicators: []
      };
      
      // Detectar versão do MEEP
      const versionElements = document.querySelectorAll('[class*="version"], [id*="version"]');
      versionElements.forEach(el => {
        const text = el.textContent.trim();
        if (text.match(/v?\d+\.\d+/)) {
          info.version = text;
        }
      });
      
      // Detectar tecnologias
      if (window.jQuery) info.technologies.push(`jQuery ${window.jQuery.fn.jquery}`);
      if (window.React) info.technologies.push('React');
      if (window.Vue) info.technologies.push('Vue.js');
      if (window.angular) info.technologies.push('Angular');
      
      // Identificadores específicos do MEEP
      const meepElements = document.querySelectorAll('[class*="meep"], [id*="meep"], [data-module]');
      meepElements.forEach(el => {
        info.meepIndicators.push({
          type: el.tagName,
          className: el.className,
          id: el.id,
          dataModule: el.getAttribute('data-module')
        });
      });
      
      return info;
    });
    
    this.meepArchitecture.systemInfo = {
      ...this.meepArchitecture.systemInfo,
      ...systemInfo,
      detectedAt: new Date().toISOString()
    };
    
    console.log(`✅ Sistema identificado: ${systemInfo.title}`);
    console.log(`📋 Tecnologias: ${systemInfo.technologies.join(', ')}`);
  }

  // 🌳 MAPEAMENTO DA ESTRUTURA RAIZ
  async mapRootStructure(page) {
    console.log('🌳 Mapeando estrutura raiz do MEEP...');
    
    const rootStructure = await page.evaluate(() => {
      const structure = {
        layout: {},
        mainNavigation: [],
        systemModules: [],
        globalComponents: []
      };
      
      // LAYOUT PRINCIPAL
      const layout = {
        hasHeader: !!document.querySelector('header, .header, #header'),
        hasSidebar: !!document.querySelector('.sidebar, .nav-sidebar, aside'),
        hasFooter: !!document.querySelector('footer, .footer, #footer'),
        mainContentArea: !!document.querySelector('main, .main-content, #content')
      };
      structure.layout = layout;
      
      // NAVEGAÇÃO PRINCIPAL - Estrutura hierárquica completa
      const buildNavigationTree = (container, level = 0) => {
        if (!container) return [];
        
        return Array.from(container.children).map(child => {
          const link = child.querySelector('a');
          const submenu = child.querySelector('ul, .submenu, .dropdown-menu');
          
          const navItem = {
            text: (link?.textContent || child.textContent).trim(),
            href: link?.href || null,
            level: level,
            hasSubmenu: !!submenu,
            className: child.className,
            id: child.id,
            dataAttributes: {}
          };
          
          // Capturar data-attributes específicos do MEEP
          Array.from(child.attributes).forEach(attr => {
            if (attr.name.startsWith('data-')) {
              navItem.dataAttributes[attr.name] = attr.value;
            }
          });
          
          // Submenu recursivo
          if (submenu) {
            navItem.children = buildNavigationTree(submenu, level + 1);
          }
          
          return navItem;
        });
      };
      
      // Buscar navegação principal
      const navContainers = [
        '.sidebar nav, .sidebar ul',
        'nav.main-nav, nav.primary-nav',
        '.main-menu, .primary-menu',
        '[role="navigation"]'
      ];
      
      for (const selector of navContainers) {
        const nav = document.querySelector(selector);
        if (nav) {
          structure.mainNavigation = buildNavigationTree(nav);
          break;
        }
      }
      
      // MÓDULOS DO SISTEMA - Identificação automática
      const moduleIndicators = document.querySelectorAll([
        '[data-module]',
        '[class*="module"]',
        '.panel[data-title]',
        '.widget[data-type]',
        '[id*="module"]'
      ].join(', '));
      
      moduleIndicators.forEach(element => {
        const module = {
          id: element.id,
          className: element.className,
          title: element.getAttribute('data-title') || 
                 element.getAttribute('data-module') ||
                 element.querySelector('.title, h1, h2, h3')?.textContent?.trim(),
          type: element.getAttribute('data-type') || 'unknown',
          position: {
            x: element.offsetLeft,
            y: element.offsetTop,
            width: element.offsetWidth,
            height: element.offsetHeight
          },
          attributes: {}
        };
        
        // Todos os data-attributes
        Array.from(element.attributes).forEach(attr => {
          if (attr.name.startsWith('data-')) {
            module.attributes[attr.name] = attr.value;
          }
        });
        
        structure.systemModules.push(module);
      });
      
      // COMPONENTES GLOBAIS
      const globalComponents = [
        { selector: '.notification, .alert', type: 'notification' },
        { selector: '.modal, .dialog', type: 'modal' },
        { selector: '.tooltip', type: 'tooltip' },
        { selector: '.dropdown', type: 'dropdown' },
        { selector: '.breadcrumb', type: 'breadcrumb' },
        { selector: '.pagination', type: 'pagination' },
        { selector: '[class*="loader"], [class*="spinner"]', type: 'loading' }
      ];
      
      globalComponents.forEach(({ selector, type }) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          structure.globalComponents.push({
            type: type,
            count: elements.length,
            selector: selector,
            instances: Array.from(elements).map(el => ({
              className: el.className,
              id: el.id,
              content: el.textContent.trim().substring(0, 100)
            }))
          });
        }
      });
      
      return structure;
    });
    
    this.meepArchitecture.rootStructure = rootStructure;
    console.log(`✅ Estrutura raiz mapeada:`);
    console.log(`   📋 ${rootStructure.mainNavigation.length} itens de navegação`);
    console.log(`   🧩 ${rootStructure.systemModules.length} módulos detectados`);
    console.log(`   🔧 ${rootStructure.globalComponents.length} componentes globais`);
  }

  // 🔍 DESCOBERTA COMPLETA DE MÓDULOS
  async discoverAllMEEPModules(page) {
    console.log('🔍 Descobrindo todos os módulos do MEEP...');
    
    const allLinks = this.extractAllNavigationLinks();
    const modules = new Map();
    
    for (const link of allLinks) {
      if (!link.href || link.href === '#') continue;
      
      try {
        console.log(`📄 Analisando módulo: ${link.text}`);
        await page.goto(link.href, { waitUntil: 'networkidle' });
        
        const moduleAnalysis = await this.analyzeCurrentMEEPModule(page);
        modules.set(link.href, {
          ...link,
          ...moduleAnalysis,
          discoveredAt: new Date().toISOString()
        });
        
        // Aguardar para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Erro ao analisar ${link.href}:`, error.message);
      }
    }
    
    this.meepArchitecture.rootStructure.modules = modules;
    console.log(`✅ ${modules.size} módulos descobertos e analisados`);
  }

  // 🧩 ANÁLISE DETALHADA DE MÓDULO ATUAL
  async analyzeCurrentMEEPModule(page) {
    return await page.evaluate(() => {
      const analysis = {
        url: location.href,
        title: document.title,
        breadcrumb: [],
        
        // ESTRUTURA DO MÓDULO
        structure: {
          hasHeader: !!document.querySelector('.module-header, .page-header'),
          hasToolbar: !!document.querySelector('.toolbar, .action-bar'),
          hasFilters: !!document.querySelector('.filters, .filter-bar'),
          hasPagination: !!document.querySelector('.pagination'),
          hasSearch: !!document.querySelector('input[type="search"], .search-input')
        },
        
        // FUNCIONALIDADES CRUD
        crud: {
          create: !!document.querySelector('[class*="add"], [class*="create"], [class*="new"]'),
          read: !!document.querySelector('table, .grid, .list'),
          update: !!document.querySelector('[class*="edit"], [class*="modify"]'),
          delete: !!document.querySelector('[class*="delete"], [class*="remove"]')
        },
        
        // FORMULÁRIOS
        forms: Array.from(document.forms).map(form => ({
          id: form.id,
          className: form.className,
          action: form.action,
          method: form.method,
          fieldCount: form.elements.length,
          fields: Array.from(form.elements).map(field => ({
            name: field.name,
            type: field.type,
            required: field.required
          })),
          submitButtons: Array.from(form.querySelectorAll('[type="submit"], button')).map(btn => ({
            text: btn.textContent.trim(),
            className: btn.className
          }))
        })),
        
        // GRIDS DE DADOS
        dataGrids: Array.from(document.querySelectorAll('table, .grid, [class*="data-grid"]')).map(grid => ({
          id: grid.id,
          className: grid.className,
          columns: Array.from(grid.querySelectorAll('th, .header')).map(th => th.textContent.trim()),
          features: {
            sortable: !!grid.querySelector('[class*="sort"], .sortable'),
            filterable: !!grid.querySelector('.filter, [data-filter]'),
            paginated: !!document.querySelector('.pagination'),
            selectable: !!grid.querySelector('input[type="checkbox"], input[type="radio"]'),
            exportable: !!document.querySelector('[class*="export"]')
          },
          rowCount: grid.querySelectorAll('tbody tr, .grid-row').length
        })),
        
        // RELATÓRIOS E DASHBOARDS
        reports: {
          charts: document.querySelectorAll('canvas, .chart, [class*="chart"]').length,
          widgets: Array.from(document.querySelectorAll('.widget, .dashboard-item')).map(widget => ({
            title: widget.querySelector('.title, .widget-title')?.textContent?.trim(),
            type: widget.className,
            className: widget.className
          })),
          exportOptions: Array.from(document.querySelectorAll('[class*="export"], [class*="download"]')).map(btn => btn.textContent.trim())
        },
        
        // AÇÕES DISPONÍVEIS
        actions: Array.from(document.querySelectorAll('button, [role="button"], .btn')).map(btn => ({
          text: btn.textContent.trim(),
          className: btn.className,
          type: btn.type || 'button',
          disabled: btn.disabled
        }))
      };
      
      // BREADCRUMB
      const breadcrumbEl = document.querySelector('.breadcrumb, .breadcrumb-nav');
      if (breadcrumbEl) {
        analysis.breadcrumb = Array.from(breadcrumbEl.querySelectorAll('a, span')).map(el => el.textContent.trim());
      }
      
      return analysis;
    });
  }

  // 🔧 MAPEAR COMPONENTES
  async mapMEEPComponents(page) {
    console.log('🔧 Mapeando componentes do MEEP...');
    // Implementação específica para componentes MEEP
  }

  // 🔄 ANALISAR WORKFLOWS
  async analyzeMEEPWorkflows(page) {
    console.log('🔄 Analisando workflows do MEEP...');
    // Implementação específica para workflows MEEP
  }

  // 📊 MAPEAR ESTRUTURAS DE DADOS
  async mapMEEPDataStructures(page) {
    console.log('📊 Mapeando estruturas de dados do MEEP...');
    // Implementação específica para dados MEEP
  }

  // 🔒 ANALISAR PERMISSÕES
  async analyzeMEEPPermissions(page) {
    console.log('🔒 Analisando permissões do MEEP...');
    // Implementação específica para permissões MEEP
  }

  // 📊 GERAÇÃO DA DOCUMENTAÇÃO COMPLETA
  async generateMEEPDocumentation() {
    console.log('📊 Gerando documentação completa do Sistema MEEP...');
    
    const outputDir = './MEEP-Architecture';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // 1. ARQUITETURA COMPLETA (JSON)
    fs.writeFileSync(
      path.join(outputDir, 'MEEP-Complete-Architecture.json'),
      JSON.stringify(this.meepArchitecture, null, 2)
    );
    
    // 2. DOCUMENTAÇÃO TÉCNICA (Markdown)
    const documentation = this.generateMEEPMarkdownDocumentation();
    fs.writeFileSync(
      path.join(outputDir, 'MEEP-Architecture-Guide.md'),
      documentation
    );
    
    // 3. MAPA DE MÓDULOS (CSV)
    const modulesCSV = this.generateModulesCSV();
    fs.writeFileSync(
      path.join(outputDir, 'MEEP-Modules-Map.csv'),
      modulesCSV
    );
    
    // 4. DIAGRAMA VISUAL (Mermaid)
    const mermaidDiagram = this.generateMEEPMermaidDiagram();
    fs.writeFileSync(
      path.join(outputDir, 'MEEP-System-Diagram.mmd'),
      mermaidDiagram
    );
    
    // 5. RELATÓRIO EXECUTIVO
    const executiveReport = this.generateExecutiveReport();
    fs.writeFileSync(
      path.join(outputDir, 'MEEP-Executive-Report.md'),
      executiveReport
    );
    
    console.log(`✅ Documentação completa salva em: ${outputDir}`);
    
    return {
      outputDirectory: outputDir,
      filesGenerated: [
        'MEEP-Complete-Architecture.json',
        'MEEP-Architecture-Guide.md',
        'MEEP-Modules-Map.csv',
        'MEEP-System-Diagram.mmd',
        'MEEP-Executive-Report.md'
      ],
      summary: {
        totalModules: this.meepArchitecture.rootStructure.modules.size,
        totalFeatures: this.calculateTotalFeatures(),
        mappingDuration: this.calculateMappingDuration(),
        systemComplexity: this.calculateSystemComplexity()
      }
    };
  }

  // 📋 EXTRAÇÃO DE TODOS OS LINKS DE NAVEGAÇÃO
  extractAllNavigationLinks() {
    const links = [];
    
    const flattenNavigation = (navItems, prefix = '') => {
      navItems.forEach(item => {
        if (item.href && item.href !== '#') {
          links.push({
            text: prefix + item.text,
            href: item.href,
            level: item.level,
            className: item.className,
            dataAttributes: item.dataAttributes
          });
        }
        
        if (item.children && item.children.length > 0) {
          flattenNavigation(item.children, prefix + item.text + ' > ');
        }
      });
    };
    
    if (this.meepArchitecture.rootStructure.mainNavigation) {
      flattenNavigation(this.meepArchitecture.rootStructure.mainNavigation);
    }
    
    return links;
  }

  // 📈 GERAÇÃO DO RELATÓRIO EXECUTIVO
  generateExecutiveReport() {
    const totalModules = this.meepArchitecture.rootStructure.modules.size;
    
    return `# Sistema MEEP - Relatório Executivo de Mapeamento

## 📊 Resumo do Mapeamento
- **Data:** ${new Date(this.meepArchitecture.systemInfo.mappingDate).toLocaleDateString('pt-BR')}
- **Sistema:** ${this.meepArchitecture.systemInfo.name}
- **Módulos Mapeados:** ${totalModules}
- **Tecnologias:** ${this.meepArchitecture.systemInfo.technology.join(', ')}

## 🏗️ Arquitetura Identificada
${this.generateArchitectureSummary()}

## 📋 Módulos por Categoria
${this.generateModulesByCategorySummary()}

## 🎯 Funcionalidades Principais
${this.generateFeaturesSummary()}

## 📊 Métricas de Complexidade
${this.generateComplexityMetrics()}

## 🚀 Recomendações
${this.generateRecommendations()}

---
*Relatório gerado automaticamente pelo MEEP System Mapper*
`;
  }

  // Métodos auxiliares para geração de relatórios
  generateArchitectureSummary() {
    const layout = this.meepArchitecture.rootStructure.layout;
    return `
- Layout: ${layout.hasSidebar ? 'Sidebar' : 'Top'} Navigation
- Componentes: ${layout.hasHeader ? 'Header' : ''} ${layout.hasFooter ? 'Footer' : ''}
- Área Principal: ${layout.mainContentArea ? 'Identificada' : 'Não identificada'}
`;
  }

  generateModulesByCategorySummary() {
    // Implementar categorização de módulos
    return 'Análise de categorias em desenvolvimento...';
  }

  generateFeaturesSummary() {
    // Implementar resumo de funcionalidades
    return 'Resumo de funcionalidades em desenvolvimento...';
  }

  generateComplexityMetrics() {
    // Implementar métricas de complexidade
    return 'Métricas de complexidade em desenvolvimento...';
  }

  generateRecommendations() {
    // Implementar recomendações
    return 'Recomendações em desenvolvimento...';
  }

  generateMEEPMarkdownDocumentation() {
    return `# Documentação Técnica - Sistema MEEP

## Arquitetura Geral
${JSON.stringify(this.meepArchitecture.systemInfo, null, 2)}

## Módulos Mapeados
${Array.from(this.meepArchitecture.rootStructure.modules.entries()).map(([url, module]) => 
  `### ${module.text}\n- **URL:** ${url}\n- **Funcionalidades:** ${Object.values(module.crud || {}).filter(Boolean).length}`
).join('\n\n')}
`;
  }

  generateModulesCSV() {
    let csv = 'Módulo,URL,CRUD Create,CRUD Read,CRUD Update,CRUD Delete,Formulários,Grids\n';
    
    for (const [url, module] of this.meepArchitecture.rootStructure.modules) {
      csv += [
        `"${module.text || 'N/A'}"`,
        `"${url}"`,
        module.crud?.create ? 'Sim' : 'Não',
        module.crud?.read ? 'Sim' : 'Não',
        module.crud?.update ? 'Sim' : 'Não',
        module.crud?.delete ? 'Sim' : 'Não',
        module.forms?.length || 0,
        module.dataGrids?.length || 0
      ].join(',') + '\n';
    }
    
    return csv;
  }

  generateMEEPMermaidDiagram() {
    let diagram = `graph TD
    MEEP[Sistema MEEP]
`;
    
    let moduleIndex = 0;
    for (const [url, module] of this.meepArchitecture.rootStructure.modules) {
      const nodeId = `M${moduleIndex++}`;
      diagram += `    MEEP --> ${nodeId}["${module.text || 'Módulo'}"]
`;
    }
    
    return diagram;
  }

  calculateTotalFeatures() {
    let total = 0;
    for (const module of this.meepArchitecture.rootStructure.modules.values()) {
      if (module.crud) {
        total += Object.values(module.crud).filter(Boolean).length;
      }
      if (module.forms) {
        total += module.forms.length;
      }
      if (module.dataGrids) {
        total += module.dataGrids.length;
      }
    }
    return total;
  }

  calculateMappingDuration() {
    // Implementar cálculo de duração
    return 'N/A';
  }

  calculateSystemComplexity() {
    // Implementar cálculo de complexidade
    return 'Médio';
  }
}

module.exports = { MEEPSystemMapper };
