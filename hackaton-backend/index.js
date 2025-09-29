const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const http = require('http');
const { Server } = require("socket.io");
const { calcularScoreGravidade } = require('./servicoTriagem.js');

const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST", "PUT"] }
});

app.use(cors());
app.use(express.json());
app.set('io', io);

// --- LÓGICA DO CHAT EM MEMÓRIA ---
const chatHistories = {};

io.on('connection', (socket) => {
  console.log('✅ Um usuário se conectou:', socket.id);

  socket.on('join_room', (roomName) => {
    socket.join(roomName);
    console.log(`Usuário ${socket.id} entrou na sala: ${roomName}`);
  });
  
  socket.on('request_history', (roomName) => {
    socket.emit('load_history', chatHistories[roomName] || []);
  });

  socket.on('send_message', (data) => {
    const { roomName, message } = data;
    if (!chatHistories[roomName]) {
      chatHistories[roomName] = [];
    }
    chatHistories[roomName].push(message);
    
    // Envia a mensagem para todos na sala, incluindo o remetente
    io.to(roomName).emit('receive_message', message);
  });

  socket.on('disconnect', () => {
    console.log('❌ Um usuário se desconectou:', socket.id);
  });
});

// Rota para TESTAR se a API está no ar
app.get('/', (req, res) => {
  res.send('API da Saúde Inteligente no ar!');
});

// Rota para CRIAR uma nova solicitação de exame
app.post('/solicitacoes-exame', async (req, res) => {
  try {
    // Agora esperamos citizenId e patientName, além da descrição
    const { patientName, description, citizenId } = req.body;

    if (!patientName || !description || !citizenId) {
      return res.status(400).json({ error: 'Dados do paciente e descrição são obrigatórios.' });
    }

    const score = calcularScoreGravidade(description);
    
    const newRequest = await prisma.examRequest.create({
      data: {
        patientName,
        description,
        priorityScore: score,
        status: 'TODO',
        // A GRANDE MUDANÇA: Conectamos o exame ao cidadão
        citizen: {
          connect: {
            id: citizenId,
          },
        },
      },
    });

    res.status(201).json(newRequest);
  } catch (error) {
    console.error("Erro ao criar solicitação:", error);
    res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
  }
});

// Rota para LISTAR todas as solicitações
app.get('/solicitacoes-exame', async (req, res) => {
    try {
        const requests = await prisma.examRequest.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(requests);
    } catch (error) {
        console.error("Erro ao listar solicitações:", error);
        res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
    }
});

// Rota para ATUALIZAR O STATUS de uma solicitação
app.put('/solicitacoes-exame/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const io = req.app.get('io');
    if (!['TODO', 'IN_PROGRESS', 'DONE'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido.' });
    }
    const updatedRequest = await prisma.examRequest.update({
      where: { id: parseInt(id) },
      data: { status },
    });
    io.emit('kanban_updated');
    res.json(updatedRequest);
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
  }
});

// Rota para CRIAR uma nova DEMANDA GERAL
app.post('/demands', async (req, res) => {
  try {
    const { title, recipient, startDate, dueDate, address, priority } = req.body;

    const newDemand = await prisma.demand.create({
      data: {
        title,
        recipient,
        startDate: new Date(startDate), // Converte a string de data para o formato Data
        dueDate,
        address,
        priority,
      },
    });

    res.status(201).json(newDemand);
  } catch (error) {
    console.error("Erro ao criar demanda:", error);
    res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
  }
});

// Rota para LISTAR todas as demandas
app.get('/demands', async (req, res) => {
  try {
    const demands = await prisma.demand.findMany({
      orderBy: {
        createdAt: 'desc', // As mais recentes primeiro
      },
    });
    res.json(demands);
  } catch (error) {
    console.error("Erro ao listar demandas:", error);
    res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
  }
});

// Rota para ATUALIZAR O STATUS de uma demanda (VERSÃO FINAL)
app.put('/demands/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, report, duration } = req.body; // Pega os novos campos

    if (!['TODO', 'IN_PROGRESS', 'DONE'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido.' });
    }

    const updatedDemand = await prisma.demand.update({
      where: { id: parseInt(id) },
      data: { 
        status,
        report,   // Salva o relatório se ele for enviado
        duration, // Salva a duração se ela for enviada
      },
    });

    res.json(updatedDemand);
  } catch (error) {
    console.error("Erro ao atualizar status da demanda:", error);
    res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Servidor e Sockets rodando na porta ${PORT}`);
});

// Rota para CRIAR um novo Cidadão
app.post('/citizens', async (req, res) => {
  try {
    const { name, cpf, rg, birthDate, birthCity, birthHealthUnit, fatherName, motherName, address } = req.body;
    const newCitizen = await prisma.citizen.create({
      data: {
        name,
        cpf,
        rg,
        birthDate: new Date(birthDate),
        birthCity,
        birthHealthUnit,
        fatherName,
        motherName,
        address,
      },
    });
    res.status(201).json(newCitizen);
  } catch (error) {
    console.error("Erro ao criar cidadão:", error);
    res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
  }
});

// Rota para LISTAR/BUSCAR cidadãos
app.get('/citizens', async (req, res) => {
  try {
    const { search } = req.query;
    const where = search
      ? { name: { contains: search, mode: 'insensitive' } }
      : {};
    const citizens = await prisma.citizen.findMany({ where });
    res.json(citizens);
  } catch (error) {
    console.error("Erro ao listar cidadãos:", error);
    res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
  }
});

// --- ROTAS DO MÓDULO DE ESPORTES ---

// Rota para CRIAR um novo projeto esportivo
app.post('/sport-projects', async (req, res) => {
  try {
    const { name, description, minAge, maxAge } = req.body;
    const newProject = await prisma.sportProject.create({
      data: {
        name,
        description,
        minAge: parseInt(minAge),
        maxAge: parseInt(maxAge),
      },
    });
    res.status(201).json(newProject);
  } catch (error) {
    console.error("Erro ao criar projeto esportivo:", error);
    res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
  }
});

// Rota para LISTAR todos os projetos esportivos
app.get('/sport-projects', async (req, res) => {
  try {
    const projects = await prisma.sportProject.findMany({
      include: {
        // Incluímos a contagem de matrículas para cada projeto
        _count: { select: { enrollments: true } }
      }
    });
    res.json(projects);
  } catch (error) {
    console.error("Erro ao listar projetos:", error);
    res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
  }
});

// Rota para MATRICULAR um cidadão em um projeto
app.post('/enrollments', async (req, res) => {
  try {
    const { citizenId, sportProjectId } = req.body;
    const newEnrollment = await prisma.enrollment.create({
      data: {
        citizenId: parseInt(citizenId),
        sportProjectId: parseInt(sportProjectId),
      },
    });
    res.status(201).json(newEnrollment);
  } catch (error) {
    // Erro P2002 é de violação de restrição única (já matriculado)
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Este cidadão já está matriculado neste projeto.' });
    }
    console.error("Erro ao matricular cidadão:", error);
    res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
  }
});