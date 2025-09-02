const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { Menu, ProductCategory, ProductExtended, ProductVariation } = require('../models/ProductMenu');

// ============= GESTÃO DE CARDÁPIOS =============

// Listar todos os cardápios
router.get('/menus', async (req, res) => {
    try {
        const menus = await Menu.findAll({
            where: { isActive: true },
            include: [{
                model: ProductCategory,
                attributes: ['id', 'name', 'displayOrder']
            }],
            order: [['name', 'ASC']]
        });
        
        res.json(menus);
    } catch (error) {
        console.error('Get menus error:', error);
        res.status(500).json({ error: 'Erro ao buscar cardápios' });
    }
});

// Criar novo cardápio
router.post('/menus', async (req, res) => {
    try {
        const { name, description, eventId } = req.body;
        
        const menu = await Menu.create({
            name,
            description,
            eventId,
            createdBy: req.user?.id
        });
        
        // Criar categorias padrão
        const defaultCategories = [
            'BALAS E VARIADOS',
            'BEBIDAS',
            'CERVEJAS',
            'DESTILADOS',
            'ENERGÉTICOS',
            'REFRIGERANTES',
            'ÁGUAS',
            'COMBOS',
            'LANCHES',
            'DOCES'
        ];
        
        for (let i = 0; i < defaultCategories.length; i++) {
            await ProductCategory.create({
                menuId: menu.id,
                name: defaultCategories[i],
                displayOrder: i
            });
        }
        
        res.status(201).json({
            message: 'Cardápio criado com sucesso',
            menu
        });
    } catch (error) {
        console.error('Create menu error:', error);
        res.status(500).json({ error: 'Erro ao criar cardápio' });
    }
});

// Duplicar cardápio
router.post('/menus/:id/duplicate', async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { id } = req.params;
        const { newName } = req.body;
        
        const originalMenu = await Menu.findByPk(id, {
            include: [{
                model: ProductCategory,
                include: [ProductExtended]
            }]
        });
        
        if (!originalMenu) {
            throw new Error('Cardápio não encontrado');
        }
        
        // Criar novo cardápio
        const newMenu = await Menu.create({
            name: newName || `${originalMenu.name} (Duplicado)`,
            description: originalMenu.description,
            isDuplicated: true,
            eventId: originalMenu.eventId,
            createdBy: req.user?.id
        }, { transaction });
        
        // Duplicar categorias e produtos
        for (const category of originalMenu.ProductCategories) {
            const newCategory = await ProductCategory.create({
                menuId: newMenu.id,
                name: category.name,
                displayOrder: category.displayOrder,
                icon: category.icon
            }, { transaction });
            
            // Duplicar produtos da categoria
            for (const product of category.ProductExtendeds) {
                await ProductExtended.create({
                    ...product.toJSON(),
                    id: undefined,
                    categoryId: newCategory.id,
                    menuId: newMenu.id,
                    createdAt: undefined,
                    updatedAt: undefined
                }, { transaction });
            }
        }
        
        await transaction.commit();
        
        res.json({
            message: 'Cardápio duplicado com sucesso',
            menu: newMenu
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Duplicate menu error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============= GESTÃO DE CATEGORIAS =============

// Listar categorias de um cardápio
router.get('/menus/:menuId/categories', async (req, res) => {
    try {
        const { menuId } = req.params;
        
        const categories = await ProductCategory.findAll({
            where: { menuId, isActive: true },
            include: [{
                model: ProductExtended,
                where: { isActive: true },
                required: false
            }],
            order: [
                ['displayOrder', 'ASC'],
                [ProductExtended, 'displayOrder', 'ASC']
            ]
        });
        
        res.json(categories);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Erro ao buscar categorias' });
    }
});

// Criar nova categoria
router.post('/categories', async (req, res) => {
    try {
        const { menuId, name, icon } = req.body;
        
        const maxOrder = await ProductCategory.max('displayOrder', {
            where: { menuId }
        });
        
        const category = await ProductCategory.create({
            menuId,
            name,
            icon,
            displayOrder: (maxOrder || 0) + 1
        });
        
        res.status(201).json(category);
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ error: 'Erro ao criar categoria' });
    }
});

// ============= GESTÃO DE PRODUTOS =============

// Buscar produtos
router.get('/products/search', async (req, res) => {
    try {
        const { 
            query, 
            categoryId, 
            menuId,
            minPrice,
            maxPrice,
            inStock
        } = req.query;
        
        const whereClause = { isActive: true };
        
        if (query) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${query}%` } },
                { description: { [Op.like]: `%${query}%` } },
                { barcode: query },
                { sku: query }
            ];
        }
        
        if (categoryId) whereClause.categoryId = categoryId;
        if (menuId) whereClause.menuId = menuId;
        
        if (minPrice || maxPrice) {
            whereClause.price = {};
            if (minPrice) whereClause.price[Op.gte] = minPrice;
            if (maxPrice) whereClause.price[Op.lte] = maxPrice;
        }
        
        if (inStock === 'true') {
            whereClause.stock = { [Op.gt]: 0 };
        }
        
        const products = await ProductExtended.findAll({
            where: whereClause,
            include: [
                { model: ProductCategory, attributes: ['name'] },
                { model: Menu, attributes: ['name'] }
            ],
            order: [['name', 'ASC']]
        });
        
        res.json(products);
    } catch (error) {
        console.error('Search products error:', error);
        res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
});

// Criar novo produto
router.post('/products', async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const productData = req.body;
        
        // Gerar códigos únicos se não fornecidos
        if (!productData.sku) {
            productData.sku = `SKU-${Date.now()}`;
        }
        
        if (!productData.internalCode) {
            const uuid = require('uuid').v4();
            productData.internalCode = uuid.substring(0, 18);
        }
        
        productData.createdBy = req.user?.id;
        
        const product = await ProductExtended.create(productData, { transaction });
        
        // Se tem variações, criar as variações
        if (productData.variations && productData.variations.length > 0) {
            for (const variation of productData.variations) {
                await ProductVariation.create({
                    ...variation,
                    productId: product.id
                }, { transaction });
            }
        }
        
        await transaction.commit();
        
        res.status(201).json({
            message: 'Produto criado com sucesso',
            product
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Erro ao criar produto' });
    }
});

// Atualizar produto
router.put('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const product = await ProductExtended.findByPk(id);
        
        if (!product) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        
        updateData.updatedBy = req.user?.id;
        
        await product.update(updateData);
        
        res.json({
            message: 'Produto atualizado com sucesso',
            product
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
});

// Importar produtos em lote
router.post('/products/import', async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { menuId, categoryId, products } = req.body;
        
        const imported = [];
        const errors = [];
        
        for (const productData of products) {
            try {
                // Adicionar informações padrão
                productData.menuId = menuId;
                productData.categoryId = categoryId;
                productData.createdBy = req.user?.id;
                
                // Gerar SKU se não existir
                if (!productData.sku) {
                    productData.sku = `SKU-${Date.now()}-${Math.random().toString(36).substring(7)}`;
                }
                
                const product = await ProductExtended.create(productData, { transaction });
                imported.push(product);
            } catch (error) {
                errors.push({
                    product: productData.name,
                    error: error.message
                });
            }
        }
        
        await transaction.commit();
        
        res.json({
            message: `${imported.length} produtos importados com sucesso`,
            imported: imported.length,
            errors: errors.length,
            errorDetails: errors
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Import products error:', error);
        res.status(500).json({ error: 'Erro ao importar produtos' });
    }
});

// Exportar cardápio
router.get('/menus/:id/export', async (req, res) => {
    try {
        const { id } = req.params;
        
        const menu = await Menu.findByPk(id, {
            include: [{
                model: ProductCategory,
                include: [{
                    model: ProductExtended,
                    include: [ProductVariation]
                }]
            }]
        });
        
        if (!menu) {
            return res.status(404).json({ error: 'Cardápio não encontrado' });
        }
        
        // Formatar dados para exportação
        const exportData = {
            menu: {
                name: menu.name,
                description: menu.description,
                createdAt: menu.createdAt
            },
            categories: menu.ProductCategories.map(cat => ({
                name: cat.name,
                products: cat.ProductExtendeds.map(prod => ({
                    name: prod.name,
                    price: prod.price,
                    cost: prod.cost,
                    barcode: prod.barcode,
                    sku: prod.sku,
                    ncm: prod.ncm,
                    cest: prod.cest,
                    cfop: prod.cfop,
                    stock: prod.stock,
                    variations: prod.ProductVariations
                }))
            })),
            totalProducts: menu.ProductCategories.reduce((sum, cat) => 
                sum + cat.ProductExtendeds.length, 0
            )
        };
        
        res.json(exportData);
    } catch (error) {
        console.error('Export menu error:', error);
        res.status(500).json({ error: 'Erro ao exportar cardápio' });
    }
});

// Filtros avançados para produtos
router.post('/products/advanced-filter', async (req, res) => {
    try {
        const {
            categories,
            priceRange,
            hasStock,
            featured,
            requiresAge,
            searchTerm,
            sortBy,
            sortOrder
        } = req.body;
        
        const whereClause = { isActive: true };
        
        if (categories && categories.length > 0) {
            whereClause.categoryId = { [Op.in]: categories };
        }
        
        if (priceRange) {
            whereClause.price = {
                [Op.between]: [priceRange.min || 0, priceRange.max || 99999]
            };
        }
        
        if (hasStock !== undefined) {
            whereClause.stock = hasStock ? { [Op.gt]: 0 } : 0;
        }
        
        if (featured !== undefined) {
            whereClause.isFeatured = featured;
        }
        
        if (requiresAge !== undefined) {
            whereClause.requiresAge = requiresAge;
        }
        
        if (searchTerm) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${searchTerm}%` } },
                { description: { [Op.like]: `%${searchTerm}%` } }
            ];
        }
        
        const order = [[sortBy || 'name', sortOrder || 'ASC']];
        
        const products = await ProductExtended.findAll({
            where: whereClause,
            include: [
                { model: ProductCategory, attributes: ['name'] }
            ],
            order
        });
        
        res.json({
            total: products.length,
            products
        });
    } catch (error) {
        console.error('Advanced filter error:', error);
        res.status(500).json({ error: 'Erro ao filtrar produtos' });
    }
});

// Estatísticas de produtos
router.get('/products/stats', async (req, res) => {
    try {
        const { menuId } = req.query;
        
        const whereClause = {};
        if (menuId) whereClause.menuId = menuId;
        
        const [
            totalProducts,
            activeProducts,
            outOfStock,
            categories,
            avgPrice
        ] = await Promise.all([
            ProductExtended.count({ where: whereClause }),
            ProductExtended.count({ where: { ...whereClause, isActive: true } }),
            ProductExtended.count({ where: { ...whereClause, stock: 0 } }),
            ProductCategory.count({ where: menuId ? { menuId } : {} }),
            ProductExtended.findOne({
                where: whereClause,
                attributes: [[sequelize.fn('AVG', sequelize.col('price')), 'avgPrice']]
            })
        ]);
        
        res.json({
            totalProducts,
            activeProducts,
            outOfStock,
            categories,
            averagePrice: avgPrice?.dataValues?.avgPrice || 0,
            stockAlert: outOfStock > 0
        });
    } catch (error) {
        console.error('Product stats error:', error);
        res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
});

module.exports = router;