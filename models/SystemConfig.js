const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SystemConfig = sequelize.define('SystemConfig', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    
    // CONFIGURAÇÕES DO LOCAL
    localCode: {
        type: DataTypes.STRING,
        defaultValue: 'NOVA UNICA CLUB'
    },
    localName: {
        type: DataTypes.STRING,
        defaultValue: 'UNICA CLUB'
    },
    establishmentType: {
        type: DataTypes.ENUM('Boate/Casas Noturnas', 'Bar/Restaurante', 'Festival', 'Evento Corporativo'),
        defaultValue: 'Boate/Casas Noturnas'
    },
    
    // CONFIGURAÇÕES DE IMPRESSÃO
    printReceipt: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    printerName: {
        type: DataTypes.STRING,
        defaultValue: 'BAR Royal0000'
    },
    logoUrl: {
        type: DataTypes.STRING
    },
    
    // CONFIGURAÇÕES CASHLESS
    maxCashlessValue: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 5000.00
    },
    maxDiscount: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 10.00
    },
    clearPrePaidBalance: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    
    // TEXTOS CUSTOMIZADOS
    receiptFooterText: {
        type: DataTypes.TEXT,
        defaultValue: 'Proibido a venda de bebidas alcoólicas para menores de 18 anos'
    },
    clearButtonText: {
        type: DataTypes.STRING,
        defaultValue: 'Texto exibido no botão de limpar a compra.'
    },
    cashlessButtonText: {
        type: DataTypes.STRING,
        defaultValue: 'Texto exibido no botão de venda cashless.'
    },
    
    // TEMPO E OCIOSIDADE
    commandTimeout: {
        type: DataTypes.INTEGER,
        defaultValue: 300, // segundos
        comment: 'Tempo de ociosidade da Comanda Eletrônica'
    },
    totemInactivityTime: {
        type: DataTypes.INTEGER,
        defaultValue: 60, // segundos
        comment: 'Tempo de inatividade para voltar a tela inicial no totem'
    },
    
    // CONFIGURAÇÕES DE VENDA
    syncAfterSale: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Obrigatório sincronizar pedido após cada venda'
    },
    hasCashback: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    calculateChange: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Exibir cálculo de troco para venda em dinheiro'
    },
    requestCPF: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Solicitar CPF (Cartão Rotativo)'
    },
    
    // SISTEMA PRÉ-PAGO
    prePaidOnline: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Trabalha com pré-pago cashless online'
    },
    deactivateCardOnTransfer: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Desativar cartão ao zerar saldo (Pré-Pago Cashless)'
    },
    deactivateCommandOnTransfer: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Desativar comanda/cartão ao realizar transferência'
    },
    
    // IMPRESSÃO ADICIONAL
    printFullOrder: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Imprimir pedido completo (Servidor de Impressão)'
    },
    duplicatePrint: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Duplicar impressão (Servidor de Impressão)'
    },
    disableCancellationPrint: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Desativar impressão de cancelamento na impressora Remota'
    },
    enableExtractPrint: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Habilitar impressão de extrato na impressora Remota'
    },
    blockCashlessAfterPayment: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Bloquear consumo cashless após pagamento no TOTEM'
    },
    
    // CONTROLE DE VERSÃO
    posVersion: {
        type: DataTypes.STRING,
        defaultValue: 'Controle Versão POS'
    },
    
    // CONSUMO MÍNIMO
    minimumConsumption: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        comment: 'Agendamento consumo mínimo'
    },
    
    // TIPO DE SISTEMA
    systemType: {
        type: DataTypes.ENUM('pre-paid-token', 'pre-paid-cashless', 'post-paid-command'),
        defaultValue: 'pre-paid-cashless'
    },
    
    // IDENTIFICAÇÃO DE CLIENTE OBRIGATÓRIA
    requireName: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    requireCPF: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    requirePhone: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    requireBirthDate: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    requireEmail: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    requireIdentifier: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    requireTag: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    
    // CUSTOMIZAÇÃO DE LABELS
    customLabels: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    
    // SOLICITAÇÃO DE MESA
    requestTableForConsumption: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Deve solicitar mesa venda consumo?'
    }
});

module.exports = SystemConfig;