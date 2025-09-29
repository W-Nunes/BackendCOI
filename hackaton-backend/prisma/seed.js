const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o povoamento do banco de dados...');
  console.log('Limpeza de dados antigos...');

  // Ordem de limpeza é importante para evitar erros de chave estrangeira
  await prisma.enrollment.deleteMany({});
  await prisma.demand.deleteMany({});
  await prisma.examRequest.deleteMany({});
  await prisma.sportProject.deleteMany({});
  await prisma.citizen.deleteMany({});
  await prisma.family.deleteMany({});
  console.log('Dados antigos removidos com sucesso.');

  // --- 1. Criação de Famílias ---
  console.log('Criando famílias...');
  const familySilva = await prisma.family.create({ data: { name: 'Família Silva' } });
  const familySouza = await prisma.family.create({ data: { name: 'Família Souza' } });
  const familyPereira = await prisma.family.create({ data: { name: 'Família Pereira' } });

  // --- 2. Criação de Cidadãos ---
  console.log('Criando cidadãos...');
  const maria = await prisma.citizen.create({
    data: { 
        name: 'Maria Joana Silva', cpf: '11122233301', rg: '12345678', birthDate: new Date('1985-05-15'), 
        birthCity: 'Ibiporã', birthHealthUnit: 'Hospital Cristo Rei', motherName: 'Joana da Silva', fatherName: 'José da Silva',
        address: 'Rua das Flores, 123', familyId: familySilva.id 
    },
  });
  const joao = await prisma.citizen.create({
    data: { 
        name: 'João Pedro Silva', cpf: '22233344402', rg: '23456789', birthDate: new Date('2010-08-20'), 
        birthCity: 'Ibiporã', birthHealthUnit: 'Hospital Cristo Rei', motherName: 'Maria Joana Silva', fatherName: 'Carlos Silva',
        address: 'Rua das Flores, 123', familyId: familySilva.id 
    },
  });
   const pedro = await prisma.citizen.create({
    data: { 
        name: 'Pedro Henrique Souza', cpf: '33344455503', rg: '34567890', birthDate: new Date('2012-01-10'), 
        birthCity: 'Londrina', birthHealthUnit: 'Maternidade Municipal', motherName: 'Ana Souza',
        address: 'Av. Principal, 456', familyId: familySouza.id 
    },
  });
   const ana = await prisma.citizen.create({
    data: { 
        name: 'Ana Pereira', cpf: '44455566604', rg: '45678901', birthDate: new Date('1990-11-30'), 
        birthCity: 'Jataizinho', birthHealthUnit: 'Posto Central', motherName: 'Lúcia Pereira',
        address: 'Rua do Comércio, 789' 
    },
  });

  // --- 3. Criação de Projetos Esportivos ---
  console.log('Criando projetos de esporte...');
  const futsal = await prisma.sportProject.create({
    data: { name: 'Escolinha de Futsal Sub-14', description: 'Treinamento para jovens atletas.', minAge: 10, maxAge: 14 },
  });
  const ballet = await prisma.sportProject.create({
    data: { name: 'Ballet Infantil "Primeiros Passos"', description: 'Iniciação à dança clássica.', minAge: 6, maxAge: 10 },
  });
  const xadrez = await prisma.sportProject.create({
    data: { name: 'Clube de Xadrez Municipal', description: 'Aulas e torneios para todas as idades.', minAge: 8, maxAge: 99 },
  });
  
  // --- 4. Matrícula de Cidadãos nos Projetos ---
  console.log('Matriculando cidadãos...');
  await prisma.enrollment.create({ data: { citizenId: joao.id, sportProjectId: futsal.id }});
  await prisma.enrollment.create({ data: { citizenId: pedro.id, sportProjectId: futsal.id }});
  await prisma.enrollment.create({ data: { citizenId: pedro.id, sportProjectId: xadrez.id }}); // Pedro faz duas atividades

  // --- 5. Criação de Solicitações de Exame (Saúde) ---
  console.log('Criando solicitações de exame...');
  await prisma.examRequest.create({
      data: {
          patientName: maria.name,
          description: 'Paciente relata forte dor no peito irradiando para o braço e falta de ar. Histórico familiar de infarto.',
          priorityScore: 23,
          citizenId: maria.id
      }
  });
  await prisma.examRequest.create({
      data: {
          patientName: ana.name,
          description: 'Apresenta tosse persistente e febre alta há 3 dias.',
          priorityScore: 12,
          citizenId: ana.id
      }
  });
  await prisma.examRequest.create({
      data: {
          patientName: joao.name,
          description: 'Exame de rotina, check-up anual solicitado pela família.',
          priorityScore: 2,
          citizenId: joao.id
      }
  });

  // --- 6. Criação de Demandas/Encaminhamentos (Kanban) ---
  console.log('Criando demandas para o Kanban...');
  // Demandas para a Educação, como solicitado
  await prisma.demand.create({ data: { title: 'Verificar necessidade de reforço escolar para aluno Pedro Souza', recipient: 'Mariana Lima (Diretora Pedagógica)', startDate: new Date(), dueDate: '15/10/2025', priority: 'media', status: 'TODO' } });
  await prisma.demand.create({ data: { title: 'Finalizar o planejamento do ano letivo', recipient: 'Equipe Pedagógica', startDate: new Date(), dueDate: '15/09/2025', priority: 'media', status: 'DONE', report: 'Planejamento concluído e calendário de eventos definido. Documento compartilhado na pasta da coordenação.', duration: '22h 5m' } });

  // Outras demandas
  await prisma.demand.create({ data: { title: 'Atualizar software antivírus dos computadores', recipient: 'Ana Clara (TI)', startDate: new Date(), dueDate: '30/09/2025', priority: 'media', status: 'IN_PROGRESS' } });
  await prisma.demand.create({ data: { title: 'Preparar apresentação de resultados trimestrais', recipient: 'Felipe Augusto (Sec. Saúde)', startDate: new Date(), dueDate: '20/09/2025', priority: 'alta', status: 'DONE', report: 'Apresentação finalizada.', duration: '3h 45m' } });


  console.log('Povoamento do banco de dados concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('Ocorreu um erro durante o povoamento:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });