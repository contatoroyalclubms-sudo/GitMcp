import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar planos
  const planBasic = await prisma.plan.upsert({
    where: { id: 'plan-basic' },
    update: {},
    create: {
      id: 'plan-basic',
      name: 'Básico',
      description: 'Plano básico para pequenos eventos',
      price: 29.90,
      currency: 'BRL',
      maxEvents: 5,
      maxClients: 500,
      features: {
        dashboard: true,
        events: true,
        clients: true,
        reports: false,
        api: false,
        support: 'email'
      },
      isActive: true
    }
  });

  const planPro = await prisma.plan.upsert({
    where: { id: 'plan-pro' },
    update: {},
    create: {
      id: 'plan-pro',
      name: 'Profissional',
      description: 'Plano profissional para eventos médios',
      price: 79.90,
      currency: 'BRL',
      maxEvents: 20,
      maxClients: 2000,
      features: {
        dashboard: true,
        events: true,
        clients: true,
        reports: true,
        api: true,
        support: 'chat'
      },
      isActive: true
    }
  });

  const planEnterprise = await prisma.plan.upsert({
    where: { id: 'plan-enterprise' },
    update: {},
    create: {
      id: 'plan-enterprise',
      name: 'Enterprise',
      description: 'Plano enterprise para grandes eventos',
      price: 199.90,
      currency: 'BRL',
      maxEvents: -1, // Ilimitado
      maxClients: -1, // Ilimitado
      features: {
        dashboard: true,
        events: true,
        clients: true,
        reports: true,
        api: true,
        analytics: true,
        customization: true,
        support: 'phone'
      },
      isActive: true
    }
  });

  // Criar usuário admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@meep-supremo.com' },
    update: {},
    create: {
      email: 'admin@meep-supremo.com',
      password: hashedPassword,
      name: 'Administrador MEEP',
      role: 'ADMIN',
      planId: planEnterprise.id,
      isActive: true,
      emailVerified: true
    }
  });

  // Criar usuário demo
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@meep-supremo.com' },
    update: {},
    create: {
      email: 'demo@meep-supremo.com',
      password: hashedPassword,
      name: 'Usuário Demo',
      role: 'USER',
      planId: planPro.id,
      isActive: true,
      emailVerified: true
    }
  });

  // Criar evento demo
  const demoEvent = await prisma.event.create({
    data: {
      name: 'Festival de Tecnologia 2024',
      description: 'O maior evento de tecnologia do Brasil',
      startDate: new Date('2024-03-15T09:00:00Z'),
      endDate: new Date('2024-03-17T18:00:00Z'),
      location: 'Centro de Convenções - São Paulo',
      maxTickets: 1000,
      ticketPrice: 150.00,
      status: 'PUBLISHED',
      userId: adminUser.id,
      settings: {
        allowCheckin: true,
        requirePayment: true,
        sendConfirmation: true,
        theme: 'modern'
      }
    }
  });

  // Criar alguns clientes demo
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        name: 'João Silva',
        email: 'joao.silva@email.com',
        phone: '(11) 99999-9999',
        document: '123.456.789-00',
        birthDate: new Date('1990-05-15'),
        userId: adminUser.id,
        eventId: demoEvent.id,
        tags: ['vip', 'speaker'],
        customData: {
          company: 'Tech Corp',
          position: 'CTO'
        }
      }
    }),
    prisma.client.create({
      data: {
        name: 'Maria Santos',
        email: 'maria.santos@email.com',
        phone: '(11) 88888-8888',
        document: '987.654.321-00',
        birthDate: new Date('1985-08-22'),
        userId: adminUser.id,
        eventId: demoEvent.id,
        tags: ['attendee'],
        customData: {
          company: 'Startup Inc',
          position: 'Developer'
        }
      }
    }),
    prisma.client.create({
      data: {
        name: 'Pedro Costa',
        email: 'pedro.costa@email.com',
        phone: '(11) 77777-7777',
        userId: demoUser.id
      }
    })
  ]);

  // Criar algumas transações demo
  await Promise.all([
    prisma.transaction.create({
      data: {
        amount: 150.00,
        currency: 'BRL',
        description: 'Ingresso Festival de Tecnologia 2024',
        type: 'SALE',
        status: 'COMPLETED',
        method: 'CREDIT_CARD',
        userId: adminUser.id,
        clientId: clients[0].id,
        eventId: demoEvent.id,
        metadata: {
          cardBrand: 'visa',
          lastFourDigits: '1234'
        }
      }
    }),
    prisma.transaction.create({
      data: {
        amount: 150.00,
        currency: 'BRL',
        description: 'Ingresso Festival de Tecnologia 2024',
        type: 'SALE',
        status: 'COMPLETED',
        method: 'PIX',
        userId: adminUser.id,
        clientId: clients[1].id,
        eventId: demoEvent.id
      }
    })
  ]);

  // Criar check-ins
  await Promise.all([
    prisma.checkin.create({
      data: {
        clientId: clients[0].id,
        eventId: demoEvent.id,
        method: 'QR_CODE',
        location: 'Portão Principal',
        metadata: {
          attendedSessions: ['keynote', 'workshop-1']
        }
      }
    })
  ]);

  // Criar relatório demo
  await prisma.report.create({
    data: {
      name: 'Relatório de Vendas - Março 2024',
      type: 'SALES',
      userId: adminUser.id,
      data: {
        totalSales: 300.00,
        totalTransactions: 2,
        averageTicket: 150.00,
        period: {
          start: '2024-03-01',
          end: '2024-03-31'
        }
      },
      isPublic: false
    }
  });

  console.log('✅ Seed completado com sucesso!');
  console.log('📊 Dados criados:');
  console.log(`- ${await prisma.plan.count()} planos`);
  console.log(`- ${await prisma.user.count()} usuários`);
  console.log(`- ${await prisma.event.count()} eventos`);
  console.log(`- ${await prisma.client.count()} clientes`);
  console.log(`- ${await prisma.transaction.count()} transações`);
  console.log(`- ${await prisma.checkin.count()} check-ins`);
  console.log(`- ${await prisma.report.count()} relatórios`);
  
  console.log('\n🔑 Login de teste:');
  console.log('Email: admin@meep-supremo.com');
  console.log('Senha: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
