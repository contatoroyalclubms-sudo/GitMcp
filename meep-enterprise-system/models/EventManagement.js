const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// =============== EVENTOS ===============
const Event = sequelize.define('Event', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    
    // INFORMAÇÕES BÁSICAS
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nome do evento'
    },
    slug: {
        type: DataTypes.STRING,
        unique: true,
        comment: 'URL amigável do evento'
    },
    description: {
        type: DataTypes.TEXT,
        comment: 'Descrição completa do evento'
    },
    eventType: {
        type: DataTypes.ENUM(
            'show', 
            'festival', 
            'balada', 
            'corporativo', 
            'casamento', 
            'formatura',
            'feira',
            'conferencia',
            'workshop'
        ),
        defaultValue: 'show'
    },
    
    // DATAS E HORÁRIOS
    startDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    doorsOpen: {
        type: DataTypes.TIME,
        comment: 'Horário de abertura dos portões'
    },
    
    // LOCAL
    venue: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nome do local'
    },
    address: {
        type: DataTypes.STRING
    },
    city: {
        type: DataTypes.STRING
    },
    state: {
        type: DataTypes.STRING
    },
    zipCode: {
        type: DataTypes.STRING
    },
    latitude: {
        type: DataTypes.DECIMAL(10, 8)
    },
    longitude: {
        type: DataTypes.DECIMAL(11, 8)
    },
    
    // CAPACIDADE
    capacity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Capacidade total'
    },
    soldTickets: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Ingressos vendidos'
    },
    checkedIn: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Pessoas que fizeram check-in'
    },
    
    // IMAGENS E MÍDIA
    coverImage: {
        type: DataTypes.STRING,
        comment: 'Imagem de capa'
    },
    thumbnailImage: {
        type: DataTypes.STRING,
        comment: 'Imagem miniatura'
    },
    gallery: {
        type: DataTypes.JSON,
        comment: 'Galeria de imagens'
    },
    videoUrl: {
        type: DataTypes.STRING,
        comment: 'URL do vídeo promocional'
    },
    
    // STATUS E CONTROLE
    status: {
        type: DataTypes.ENUM(
            'draft',
            'published',
            'ongoing',
            'completed',
            'cancelled',
            'postponed'
        ),
        defaultValue: 'draft'
    },
    featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Evento em destaque'
    },
    private: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Evento privado'
    },
    
    // CLASSIFICAÇÃO
    ageRestriction: {
        type: DataTypes.INTEGER,
        defaultValue: 18,
        comment: 'Idade mínima'
    },
    tags: {
        type: DataTypes.JSON,
        comment: 'Tags do evento'
    },
    
    // FINANCEIRO
    revenue: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        comment: 'Receita total'
    },
    costs: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        comment: 'Custos totais'
    },
    profit: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        comment: 'Lucro líquido'
    },
    
    // CONFIGURAÇÕES
    settings: {
        type: DataTypes.JSON,
        defaultValue: {
            allowTransfer: true,
            requireDocument: true,
            sendConfirmationEmail: true,
            enableWaitlist: false,
            maxTicketsPerPerson: 10
        }
    },
    
    // SEO
    metaTitle: {
        type: DataTypes.STRING
    },
    metaDescription: {
        type: DataTypes.TEXT
    },
    metaKeywords: {
        type: DataTypes.STRING
    }
});

// =============== INGRESSOS ===============
const TicketType = sequelize.define('TicketType', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    eventId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Event,
            key: 'id'
        }
    },
    
    // INFORMAÇÕES BÁSICAS
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nome do tipo de ingresso (Pista, VIP, Camarote)'
    },
    description: {
        type: DataTypes.TEXT
    },
    
    // PREÇOS
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    serviceFee: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        comment: 'Taxa de serviço'
    },
    
    // QUANTIDADE
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Quantidade total disponível'
    },
    sold: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Quantidade vendida'
    },
    reserved: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Quantidade reservada'
    },
    
    // DATAS DE VENDA
    salesStartDate: {
        type: DataTypes.DATE
    },
    salesEndDate: {
        type: DataTypes.DATE
    },
    
    // LOTES
    batch: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        comment: 'Número do lote'
    },
    
    // BENEFÍCIOS
    benefits: {
        type: DataTypes.JSON,
        comment: 'Lista de benefícios inclusos'
    },
    
    // RESTRIÇÕES
    minPurchase: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    maxPurchase: {
        type: DataTypes.INTEGER,
        defaultValue: 10
    },
    
    // STATUS
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    isFeatured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    
    // CORES PARA UI
    color: {
        type: DataTypes.STRING,
        defaultValue: '#00ffcc'
    },
    icon: {
        type: DataTypes.STRING
    }
});

// =============== TICKETS VENDIDOS ===============
const Ticket = sequelize.define('Ticket', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    
    // REFERÊNCIAS
    eventId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Event,
            key: 'id'
        }
    },
    ticketTypeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: TicketType,
            key: 'id'
        }
    },
    orderId: {
        type: DataTypes.UUID
    },
    
    // CÓDIGO ÚNICO
    code: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        comment: 'Código único do ingresso'
    },
    qrCode: {
        type: DataTypes.TEXT,
        comment: 'QR Code em base64'
    },
    
    // COMPRADOR
    buyerName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    buyerEmail: {
        type: DataTypes.STRING,
        allowNull: false
    },
    buyerPhone: {
        type: DataTypes.STRING
    },
    buyerDocument: {
        type: DataTypes.STRING
    },
    
    // PARTICIPANTE (pode ser diferente do comprador)
    attendeeName: {
        type: DataTypes.STRING
    },
    attendeeDocument: {
        type: DataTypes.STRING
    },
    
    // VALORES
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    discount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    finalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    
    // STATUS
    status: {
        type: DataTypes.ENUM(
            'pending',
            'paid',
            'used',
            'cancelled',
            'transferred',
            'expired'
        ),
        defaultValue: 'pending'
    },
    
    // CHECK-IN
    checkedIn: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    checkedInAt: {
        type: DataTypes.DATE
    },
    checkedInBy: {
        type: DataTypes.UUID
    },
    checkInGate: {
        type: DataTypes.STRING,
        comment: 'Portão de entrada'
    },
    
    // DATAS
    purchasedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    validUntil: {
        type: DataTypes.DATE
    },
    
    // TRANSFERÊNCIA
    transferable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    transferHistory: {
        type: DataTypes.JSON,
        comment: 'Histórico de transferências'
    }
});

// =============== ARTISTAS/BANDAS ===============
const Artist = sequelize.define('Artist', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    
    // INFORMAÇÕES BÁSICAS
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    artisticName: {
        type: DataTypes.STRING
    },
    bio: {
        type: DataTypes.TEXT
    },
    genre: {
        type: DataTypes.STRING,
        comment: 'Gênero musical'
    },
    
    // CONTATO
    email: {
        type: DataTypes.STRING
    },
    phone: {
        type: DataTypes.STRING
    },
    manager: {
        type: DataTypes.STRING,
        comment: 'Nome do empresário'
    },
    managerPhone: {
        type: DataTypes.STRING
    },
    
    // MÍDIA
    photo: {
        type: DataTypes.STRING
    },
    coverPhoto: {
        type: DataTypes.STRING
    },
    
    // REDES SOCIAIS
    instagram: {
        type: DataTypes.STRING
    },
    facebook: {
        type: DataTypes.STRING
    },
    youtube: {
        type: DataTypes.STRING
    },
    spotify: {
        type: DataTypes.STRING
    },
    website: {
        type: DataTypes.STRING
    },
    
    // ESTATÍSTICAS
    followers: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    monthlyListeners: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    
    // FINANCEIRO
    cachet: {
        type: DataTypes.DECIMAL(10, 2),
        comment: 'Cachê padrão'
    },
    
    // RIDER TÉCNICO
    technicalRider: {
        type: DataTypes.JSON,
        comment: 'Requisitos técnicos'
    },
    
    // STATUS
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

// =============== LINE-UP ===============
const EventLineup = sequelize.define('EventLineup', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    eventId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Event,
            key: 'id'
        }
    },
    artistId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Artist,
            key: 'id'
        }
    },
    
    // PROGRAMAÇÃO
    performanceDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    startTime: {
        type: DataTypes.TIME,
        allowNull: false
    },
    endTime: {
        type: DataTypes.TIME
    },
    stage: {
        type: DataTypes.STRING,
        comment: 'Palco/Local da apresentação'
    },
    
    // HIERARQUIA
    headliner: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Atração principal'
    },
    orderPosition: {
        type: DataTypes.INTEGER,
        comment: 'Ordem de apresentação'
    },
    
    // FINANCEIRO
    cachet: {
        type: DataTypes.DECIMAL(10, 2),
        comment: 'Cachê acordado'
    },
    paid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    
    // STATUS
    confirmed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    cancelled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

// =============== CHECK-IN ===============
const CheckIn = sequelize.define('CheckIn', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    
    // REFERÊNCIAS
    eventId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Event,
            key: 'id'
        }
    },
    ticketId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Ticket,
            key: 'id'
        }
    },
    
    // DADOS DO CHECK-IN
    checkInTime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    gate: {
        type: DataTypes.STRING,
        comment: 'Portão de entrada'
    },
    terminal: {
        type: DataTypes.STRING,
        comment: 'Terminal/Dispositivo usado'
    },
    
    // QUEM FEZ O CHECK-IN
    staffId: {
        type: DataTypes.UUID,
        comment: 'ID do funcionário'
    },
    staffName: {
        type: DataTypes.STRING
    },
    
    // DADOS DO PARTICIPANTE
    attendeeName: {
        type: DataTypes.STRING
    },
    attendeeDocument: {
        type: DataTypes.STRING
    },
    attendeePhoto: {
        type: DataTypes.TEXT,
        comment: 'Foto em base64 (se necessário)'
    },
    
    // VALIDAÇÕES
    documentVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    ageVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    
    // PULSEIRA/CREDENCIAL
    wristbandCode: {
        type: DataTypes.STRING,
        comment: 'Código da pulseira'
    },
    credentialType: {
        type: DataTypes.STRING
    },
    
    // STATUS
    status: {
        type: DataTypes.ENUM(
            'success',
            'denied',
            'pending_verification'
        ),
        defaultValue: 'success'
    },
    denialReason: {
        type: DataTypes.STRING
    },
    
    // LOCALIZAÇÃO
    latitude: {
        type: DataTypes.DECIMAL(10, 8)
    },
    longitude: {
        type: DataTypes.DECIMAL(11, 8)
    }
});

// =============== ZONAS/SETORES ===============
const EventZone = sequelize.define('EventZone', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    eventId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Event,
            key: 'id'
        }
    },
    
    // INFORMAÇÕES
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nome da zona (Pista, VIP, Camarote)'
    },
    description: {
        type: DataTypes.TEXT
    },
    
    // CAPACIDADE
    capacity: {
        type: DataTypes.INTEGER
    },
    currentOccupancy: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    
    // ACESSO
    accessLevel: {
        type: DataTypes.STRING,
        comment: 'Nível de acesso necessário'
    },
    ticketTypes: {
        type: DataTypes.JSON,
        comment: 'Tipos de ingresso permitidos'
    },
    
    // LOCALIZAÇÃO
    mapCoordinates: {
        type: DataTypes.JSON,
        comment: 'Coordenadas no mapa do evento'
    },
    
    // CORES E VISUAL
    color: {
        type: DataTypes.STRING
    },
    icon: {
        type: DataTypes.STRING
    },
    
    // STATUS
    isOpen: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    openTime: {
        type: DataTypes.TIME
    },
    closeTime: {
        type: DataTypes.TIME
    }
});

// =============== ASSOCIAÇÕES ===============

// Event -> TicketType
Event.hasMany(TicketType, { foreignKey: 'eventId' });
TicketType.belongsTo(Event, { foreignKey: 'eventId' });

// Event -> Ticket
Event.hasMany(Ticket, { foreignKey: 'eventId' });
Ticket.belongsTo(Event, { foreignKey: 'eventId' });

// TicketType -> Ticket
TicketType.hasMany(Ticket, { foreignKey: 'ticketTypeId' });
Ticket.belongsTo(TicketType, { foreignKey: 'ticketTypeId' });

// Event -> EventLineup -> Artist
Event.belongsToMany(Artist, { through: EventLineup, foreignKey: 'eventId' });
Artist.belongsToMany(Event, { through: EventLineup, foreignKey: 'artistId' });

// Event -> CheckIn
Event.hasMany(CheckIn, { foreignKey: 'eventId' });
CheckIn.belongsTo(Event, { foreignKey: 'eventId' });

// Ticket -> CheckIn
Ticket.hasOne(CheckIn, { foreignKey: 'ticketId' });
CheckIn.belongsTo(Ticket, { foreignKey: 'ticketId' });

// Event -> EventZone
Event.hasMany(EventZone, { foreignKey: 'eventId' });
EventZone.belongsTo(Event, { foreignKey: 'eventId' });

module.exports = {
    Event,
    TicketType,
    Ticket,
    Artist,
    EventLineup,
    CheckIn,
    EventZone
};