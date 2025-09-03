const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Modelo de Cardápio (Menu)
const Menu = sequelize.define('Menu', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nome do cardápio (ex: Cardápio royal, CARDÁPIO UNICA CLUB)'
    },
    description: {
        type: DataTypes.TEXT
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    isDuplicated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Indica se é um cardápio duplicado'
    },
    eventId: {
        type: DataTypes.UUID
    },
    createdBy: {
        type: DataTypes.UUID
    }
});

// Modelo de Categoria de Produto
const ProductCategory = sequelize.define('ProductCategory', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    menuId: {
        type: DataTypes.UUID,
        references: {
            model: Menu,
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nome da categoria (ex: BALAS E VARIADOS, BEBIDAS, etc)'
    },
    displayOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    icon: {
        type: DataTypes.STRING
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

// Modelo de Produto Estendido
const ProductExtended = sequelize.define('ProductExtended', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    
    // INFORMAÇÕES BÁSICAS
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nome do produto (ex: HALLS AZUL)'
    },
    description: {
        type: DataTypes.TEXT,
        comment: 'Descrição completa do produto'
    },
    shortName: {
        type: DataTypes.STRING,
        comment: 'Nome curto para displays'
    },
    
    // CATEGORIA E ORGANIZAÇÃO
    categoryId: {
        type: DataTypes.UUID,
        references: {
            model: ProductCategory,
            key: 'id'
        }
    },
    menuId: {
        type: DataTypes.UUID,
        references: {
            model: Menu,
            key: 'id'
        }
    },
    
    // CÓDIGOS E IDENTIFICAÇÃO
    sku: {
        type: DataTypes.STRING,
        unique: true,
        comment: 'Código SKU único do produto'
    },
    barcode: {
        type: DataTypes.STRING,
        comment: 'Código de barras (ex: FD0F08A8-FAB8-4961-8CDD-33F190ED61B0)'
    },
    internalCode: {
        type: DataTypes.STRING,
        comment: 'Código interno (ex: ebbdb91c-f795-4fda)'
    },
    externalCode: {
        type: DataTypes.STRING,
        comment: 'Código externo/fornecedor'
    },
    
    // PREÇOS E VALORES
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Preço de venda'
    },
    cost: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        comment: 'Custo do produto'
    },
    promotionalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        comment: 'Preço promocional'
    },
    
    // TRIBUTAÇÃO
    ncm: {
        type: DataTypes.STRING,
        comment: 'Código NCM (Nomenclatura Comum do Mercosul)'
    },
    cest: {
        type: DataTypes.STRING,
        comment: 'Código CEST (Código Especificador da Substituição Tributária)'
    },
    cfop: {
        type: DataTypes.STRING,
        comment: 'Código Fiscal de Operações e Prestações'
    },
    
    // ESTOQUE
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    minStock: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    maxStock: {
        type: DataTypes.INTEGER
    },
    stockUnit: {
        type: DataTypes.STRING,
        defaultValue: 'UN',
        comment: 'Unidade de medida (UN, KG, L, etc)'
    },
    
    // IMAGEM E APRESENTAÇÃO
    imageUrl: {
        type: DataTypes.STRING,
        comment: 'URL da imagem do produto'
    },
    thumbnailUrl: {
        type: DataTypes.STRING,
        comment: 'URL da imagem miniatura'
    },
    
    // CONFIGURAÇÕES
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    isFeatured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Produto em destaque'
    },
    isDouble: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Produto dobro (ex: HALLS AZUL DOBRO)'
    },
    allowDiscount: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    requiresAge: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Requer verificação de idade (bebidas alcoólicas)'
    },
    minimumAge: {
        type: DataTypes.INTEGER,
        defaultValue: 18
    },
    
    // IMPRESSORA
    printerName: {
        type: DataTypes.STRING,
        comment: 'Impressora designada (ex: BAR Royal0000)'
    },
    printerLocation: {
        type: DataTypes.STRING,
        comment: 'Localização da impressora'
    },
    
    // VARIAÇÕES E COMBOS
    hasVariations: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isCombo: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    comboItems: {
        type: DataTypes.JSON,
        comment: 'Itens que compõem o combo'
    },
    
    // VENDAS E ESTATÍSTICAS
    soldCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Quantidade vendida total'
    },
    rating: {
        type: DataTypes.DECIMAL(2, 1),
        comment: 'Avaliação média do produto'
    },
    
    // OBSERVAÇÕES E NOTAS
    notes: {
        type: DataTypes.TEXT,
        comment: 'Observações internas sobre o produto'
    },
    allergens: {
        type: DataTypes.TEXT,
        comment: 'Informações sobre alérgenos'
    },
    
    // CONTROLE
    displayOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Ordem de exibição no cardápio'
    },
    createdBy: {
        type: DataTypes.UUID
    },
    updatedBy: {
        type: DataTypes.UUID
    }
});

// Modelo de Variação de Produto
const ProductVariation = sequelize.define('ProductVariation', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    productId: {
        type: DataTypes.UUID,
        references: {
            model: ProductExtended,
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nome da variação (ex: Tamanho, Sabor)'
    },
    value: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Valor da variação (ex: Grande, Morango)'
    },
    priceModifier: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        comment: 'Modificador de preço (+/-)'
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    barcode: {
        type: DataTypes.STRING
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

// Associações
Menu.hasMany(ProductCategory, { foreignKey: 'menuId' });
ProductCategory.belongsTo(Menu, { foreignKey: 'menuId' });

ProductCategory.hasMany(ProductExtended, { foreignKey: 'categoryId' });
ProductExtended.belongsTo(ProductCategory, { foreignKey: 'categoryId' });

Menu.hasMany(ProductExtended, { foreignKey: 'menuId' });
ProductExtended.belongsTo(Menu, { foreignKey: 'menuId' });

ProductExtended.hasMany(ProductVariation, { foreignKey: 'productId' });
ProductVariation.belongsTo(ProductExtended, { foreignKey: 'productId' });

module.exports = {
    Menu,
    ProductCategory,
    ProductExtended,
    ProductVariation
};