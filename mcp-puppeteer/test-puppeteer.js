import puppeteer from 'puppeteer';

(async () => {
  console.log('🚀 Iniciando teste do Puppeteer...');
  
  try {
    // Lançar navegador
    const browser = await puppeteer.launch({ 
      headless: true, // modo headless para teste
      devtools: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });
    
    console.log('✅ Navegador iniciado com sucesso!');
    
    // Nova página
    const page = await browser.newPage();
    console.log('📄 Nova página criada');
    
    // Navegar para um site
    await page.goto('https://example.com');
    console.log('🌐 Navegou para example.com');
    
    // Extrair título da página
    const title = await page.title();
    console.log(`📝 Título da página: ${title}`);
    
    // Tirar screenshot
    await page.screenshot({ path: 'teste-puppeteer.png' });
    console.log('📸 Screenshot salvo como teste-puppeteer.png');
    
    // Fechar navegador
    await browser.close();
    console.log('🏁 Navegador fechado. Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    process.exit(1);
  }
})();
