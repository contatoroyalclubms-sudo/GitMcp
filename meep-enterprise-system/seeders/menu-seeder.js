const { Menu, ProductCategory, ProductExtended } = require('../models/ProductMenu');

async function seedMenuData() {
    try {
        console.log('🍔 Criando cardápio MEEP...');
        
        // Criar cardápio principal
        const mainMenu = await Menu.create({
            name: 'CARDÁPIO UNICA CLUB',
            description: 'Cardápio principal do estabelecimento UNICA CLUB',
            isActive: true
        });
        
        // Criar cardápio royal
        const royalMenu = await Menu.create({
            name: 'Cardápio royal',
            description: 'Cardápio especial Royal',
            isActive: true
        });
        
        // Criar categorias
        const categories = {};
        
        // Categoria BALAS E VARIADOS
        categories.balas = await ProductCategory.create({
            menuId: mainMenu.id,
            name: 'BALAS E VARIADOS',
            displayOrder: 1
        });
        
        // Categoria BEBIDAS
        categories.bebidas = await ProductCategory.create({
            menuId: mainMenu.id,
            name: 'BEBIDAS',
            displayOrder: 2
        });
        
        // Categoria CERVEJAS
        categories.cervejas = await ProductCategory.create({
            menuId: mainMenu.id,
            name: 'CERVEJAS',
            displayOrder: 3
        });
        
        // Categoria DESTILADOS
        categories.destilados = await ProductCategory.create({
            menuId: mainMenu.id,
            name: 'DESTILADOS',
            displayOrder: 4
        });
        
        // Categoria ENERGÉTICOS
        categories.energeticos = await ProductCategory.create({
            menuId: mainMenu.id,
            name: 'ENERGÉTICOS',
            displayOrder: 5
        });
        
        // Produtos da categoria BALAS E VARIADOS
        const balasProducts = [
            {
                name: 'HALLS AZUL',
                price: 5.00,
                cost: 2.00,
                barcode: 'ebbdb91c-f795-4fda-8ea3-eb0e6490e83e3',
                internalCode: 'ebbdb91c-f795-4fda',
                sku: 'FD0F08A8-FAB8-4961-8CDD-33F190ED61B0',
                printerName: 'BAR Royal0000',
                stock: 100,
                categoryId: categories.balas.id,
                menuId: mainMenu.id
            },
            {
                name: 'HALLS AZUL (DOBRO)',
                price: 10.00,
                cost: 4.00,
                barcode: 'fd0f08a8-fabb-4961-8cdd-33f190ed61b0',
                internalCode: 'FD0F08A8-FABB',
                sku: '4961-8CDD-33F190ED61B0',
                printerName: 'BAR Royal0000',
                stock: 50,
                isDouble: true,
                categoryId: categories.balas.id,
                menuId: mainMenu.id
            },
            {
                name: 'HALLS CEREJA',
                price: 5.00,
                cost: 2.00,
                barcode: 'fe383952-70f8-4036-825c-2c20f37025df',
                internalCode: 'FE383952-70F8-4036',
                sku: '825C-2C20F37025DF',
                printerName: 'BAR Royal0000',
                stock: 80,
                categoryId: categories.balas.id,
                menuId: mainMenu.id
            },
            {
                name: 'HALLS CEREJA (DOBRO)',
                price: 10.00,
                cost: 4.00,
                barcode: 'fe383952-70f8-4036-825c-2c20f37025df-d',
                printerName: 'BAR Royal0000',
                stock: 40,
                isDouble: true,
                categoryId: categories.balas.id,
                menuId: mainMenu.id
            },
            {
                name: 'TRIDENT MORANGO',
                price: 5.00,
                cost: 2.50,
                stock: 120,
                categoryId: categories.balas.id,
                menuId: mainMenu.id,
                printerName: 'BAR Royal0000'
            },
            {
                name: 'TRIDENT MENTA',
                price: 5.00,
                cost: 2.50,
                stock: 100,
                categoryId: categories.balas.id,
                menuId: mainMenu.id,
                printerName: 'BAR Royal0000'
            },
            {
                name: 'CHICLETE BUBBALOO',
                price: 1.00,
                cost: 0.40,
                stock: 200,
                categoryId: categories.balas.id,
                menuId: mainMenu.id,
                printerName: 'BAR Royal0000'
            }
        ];
        
        // Produtos de BEBIDAS
        const bebidasProducts = [
            {
                name: 'COCA-COLA LATA',
                price: 8.00,
                cost: 3.50,
                stock: 200,
                categoryId: categories.bebidas.id,
                menuId: mainMenu.id,
                printerName: 'BAR Royal0000'
            },
            {
                name: 'COCA-COLA 600ML',
                price: 10.00,
                cost: 4.50,
                stock: 100,
                categoryId: categories.bebidas.id,
                menuId: mainMenu.id,
                printerName: 'BAR Royal0000'
            },
            {
                name: 'GUARANÁ ANTARCTICA LATA',
                price: 8.00,
                cost: 3.50,
                stock: 150,
                categoryId: categories.bebidas.id,
                menuId: mainMenu.id,
                printerName: 'BAR Royal0000'
            },
            {
                name: 'ÁGUA MINERAL 500ML',
                price: 5.00,
                cost: 1.50,
                stock: 300,
                categoryId: categories.bebidas.id,
                menuId: mainMenu.id,
                printerName: 'BAR Royal0000'
            },
            {
                name: 'SUCO DEL VALLE LATA',
                price: 8.00,
                cost: 3.00,
                stock: 80,
                categoryId: categories.bebidas.id,
                menuId: mainMenu.id,
                printerName: 'BAR Royal0000'
            }
        ];
        
        // Produtos de CERVEJAS
        const cervejasProducts = [
            {
                name: 'HEINEKEN LONG NECK',
                price: 12.00,
                cost: 5.00,
                stock: 200,
                requiresAge: true,
                minimumAge: 18,
                categoryId: categories.cervejas.id,
                menuId: mainMenu.id,
                printerName: 'BAR Royal0000'
            },
            {
                name: 'BUDWEISER LONG NECK',
                price: 10.00,
                cost: 4.00,
                stock: 250,
                requiresAge: true,
                minimumAge: 18,
                categoryId: categories.cervejas.id,
                menuId: mainMenu.id,
                printerName: 'BAR Royal0000'
            },
            {
                name: 'STELLA ARTOIS LONG NECK',
                price: 12.00,
                cost: 5.50,
                stock: 150,
                requiresAge: true,
                minimumAge: 18,
                categoryId: categories.cervejas.id,
                menuId: mainMenu.id,
                printerName: 'BAR Royal0000'
            },
            {
                name: 'CORONA LONG NECK',
                price: 14.00,
                cost: 6.00,
                stock: 100,
                requiresAge: true,
                minimumAge: 18,
                categoryId: categories.cervejas.id,
                menuId: mainMenu.id,
                printerName: 'BAR Royal0000'
            }
        ];
        
        // Produtos de DESTILADOS
        const destiladosProducts = [
            {
                name: 'DOSE WHISKY JACK DANIELS',
                price: 25.00,
                cost: 10.00,
                stock: 50,
                requiresAge: true,
                minimumAge: 18,
                categoryId: categories.destilados.id,
                menuId: mainMenu.id,
                printerName: 'BAR Royal0000'
            },
            {
                name: 'DOSE VODKA ABSOLUT',
                price: 20.00,
                cost: 8.00,
                stock: 60,
                requiresAge: true,
                minimumAge: 18,
                categoryId: categories.destilados.id,
                menuId: mainMenu.id,
                printerName: 'BAR Royal0000'
            },
            {
                name: 'DOSE GIN TANQUERAY',
                price: 22.00,
                cost: 9.00,
                stock: 40,
                requiresAge: true,
                minimumAge: 18,
                categoryId: categories.destilados.id,
                menuId: mainMenu.id,
                printerName: 'BAR Royal0000'
            },
            {
                name: 'CAIPIRINHA',
                price: 15.00,
                cost: 5.00,
                stock: 100,
                requiresAge: true,
                minimumAge: 18,
                categoryId: categories.destilados.id,
                menuId: mainMenu.id,
                printerName: 'BAR Royal0000'
            }
        ];
        
        // Produtos de ENERGÉTICOS
        const energeticosProducts = [
            {
                name: 'RED BULL TRADICIONAL',
                price: 15.00,
                cost: 7.00,
                stock: 100,
                categoryId: categories.energeticos.id,
                menuId: mainMenu.id,
                printerName: 'BAR Royal0000'
            },
            {
                name: 'RED BULL SUGARFREE',
                price: 15.00,
                cost: 7.00,
                stock: 80,
                categoryId: categories.energeticos.id,
                menuId: mainMenu.id,
                printerName: 'BAR Royal0000'
            },
            {
                name: 'MONSTER ENERGY',
                price: 12.00,
                cost: 5.50,
                stock: 120,
                categoryId: categories.energeticos.id,
                menuId: mainMenu.id,
                printerName: 'BAR Royal0000'
            },
            {
                name: 'BURN ENERGY',
                price: 10.00,
                cost: 4.50,
                stock: 90,
                categoryId: categories.energeticos.id,
                menuId: mainMenu.id,
                printerName: 'BAR Royal0000'
            }
        ];
        
        // Inserir todos os produtos
        const allProducts = [
            ...balasProducts,
            ...bebidasProducts,
            ...cervejasProducts,
            ...destiladosProducts,
            ...energeticosProducts
        ];
        
        for (const product of allProducts) {
            await ProductExtended.create({
                ...product,
                isActive: true,
                ncm: '', // Seria preenchido com o código real
                cest: '', // Seria preenchido com o código real
                cfop: '', // Seria preenchido com o código real
            });
        }
        
        console.log('✅ Cardápio MEEP criado com sucesso!');
        console.log(`   - ${Object.keys(categories).length} categorias`);
        console.log(`   - ${allProducts.length} produtos`);
        
    } catch (error) {
        console.error('❌ Erro ao criar cardápio:', error);
        throw error;
    }
}

module.exports = seedMenuData;