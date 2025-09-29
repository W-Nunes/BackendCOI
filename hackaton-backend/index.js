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
  cors: {
    origin: "*", // Permissivo para o hackaton
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  }
});

// --- CONFIGURAÇÃO DO CORS (À PROVA DE FALHAS PARA PRODUÇÃO) ---
// Substitua o 'app.use(cors());' por todo este bloco
const corsOptions = {
  origin: [
    'http://localhost:5173', // Para desenvolvimento local
    'https://frontend-coi.vercel.app' // A URL do seu frontend na Vercel
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
// Fim do bloco de substituição

app.use(express.json());
app.set('io', io);

// --- LÓGICA DO CHAT EM MEMÓRIA ---
const chatHistories = {};
io.on('connection', (socket) => {
  console.log('✅ Um usuário se conectou:', socket.id);
  socket.on('join_room', (roomName) => { socket.join(roomName); });
  socket.on('request_history', (roomName) => { socket.emit('load_history', chatHistories[roomName] || []); });
  socket.on('send_message', (data) => {
    const { roomName, message } = data;
    if (!chatHistories[roomName]) { chatHistories[roomName] = []; }
    chatHistories[roomName].push(message);
    io.to(roomName).emit('receive_message', message);
  });
  socket.on('disconnect', () => { console.log('❌ Um usuário se desconectou:', socket.id); });
});

// --- ROTAS DA API ---

// Rota de Teste
app.get('/', (req, res) => {
  res.send('API da Saúde Inteligente no ar!');
});

// --- ROTAS DE CIDADÃOS ---
app.post('/citizens', async (req, res) => {
  try {
    const { name, cpf, rg, birthDate, birthCity, birthHealthUnit, fatherName, motherName, address } = req.body;
    const newCitizen = await prisma.citizen.create({
      data: { name, cpf, rg, birthDate: new Date(birthDate), birthCity, birthHealthUnit, fatherName, motherName, address },
    });
    res.status(201).json(newCitizen);
  } catch (error) {
    if (error.code === 'P2002' && error.meta?.target?.includes('cpf')) {
      return res.status(409).json({ error: 'Este CPF já está cadastrado no sistema.' });
    }
    console.error("Erro ao criar cidadão:", error);
    res.status(500).json({ error: 'Ocorreu um erro inesperado no servidor.' });
  }
});

app.get('/citizens', async (req, res) => {
  try {
    const { search } = req.query;
    const where = search ? { name: { contains: search, mode: 'insensitive' } } : {};
    const citizens = await prisma.citizen.findMany({ where });
    res.json(citizens);
  } catch (error) {
    console.error("Erro ao listar cidadãos:", error);
    res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
  }
});

// --- ROTAS DE SOLICITAÇÃO DE EXAME ---
app.post('/solicitacoes-exame', async (req, res) => {
  try {
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
        citizen: { connect: { id: citizenId } },
      },
    });
    res.status(201).json(newRequest);
  } catch (error) {
    console.error("Erro ao criar solicitação de exame:", error);
    res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
  }
});

app.get('/solicitacoes-exame', async (req, res) => {
  try {
    const requests = await prisma.examRequest.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(requests);
  } catch (error) {
    console.error("Erro ao listar solicitações de exame:", error);
    res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
  }
});

// --- ROTAS DE DEMANDAS (KANBAN) ---
app.post('/demands', async (req, res) => {
  try {
    const { title, recipient, startDate, dueDate, address, priority } = req.body;
    const newDemand = await prisma.demand.create({
      data: { title, recipient, startDate: new Date(startDate), dueDate, address, priority },
    });
    res.status(201).json(newDemand);
  } catch (error) {
    console.error("Erro ao criar demanda:", error);
    res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
  }
});

app.get('/demands', async (req, res) => {
  try {
    const demands = await prisma.demand.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(demands);
  } catch (error) {
    console.error("Erro ao listar demandas:", error);
    res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
  }
});

app.put('/demands/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, report, duration } = req.body;
    if (!['TODO', 'IN_PROGRESS', 'DONE'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido.' });
    }
    const updatedDemand = await prisma.demand.update({
      where: { id: parseInt(id) },
      data: { status, report, duration },
    });
    res.json(updatedDemand);
  } catch (error) {
    console.error("Erro ao atualizar status da demanda:", error);
    res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
  }
});

// --- ROTAS DE PROJETOS ESPORTIVOS ---
app.post('/sport-projects', async (req, res) => {
  try {
    const { name, description, minAge, maxAge } = req.body;
    const newProject = await prisma.sportProject.create({
      data: { name, description, minAge: parseInt(minAge), maxAge: parseInt(maxAge) },
    });
    res.status(201).json(newProject);
  } catch (error) {
    console.error("Erro ao criar projeto esportivo:", error);
    res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
  }
});

app.get('/sport-projects', async (req, res) => {
  try {
    const projects = await prisma.sportProject.findMany({
      include: { _count: { select: { enrollments: true } } }
    });
    res.json(projects);
  } catch (error) {
    console.error("Erro ao listar projetos esportivos:", error);
    res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
  }
});

// --- ROTAS DE MATRÍCULAS (ENROLLMENTS) ---
app.post('/enrollments', async (req, res) => {
  try {
    const { citizenId, sportProjectId } = req.body;
    const newEnrollment = await prisma.enrollment.create({
      data: { citizenId: parseInt(citizenId), sportProjectId: parseInt(sportProjectId) },
    });
    res.status(201).json(newEnrollment);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Este cidadão já está matriculado neste projeto.' });
    }
    console.error("Erro ao matricular cidadão:", error);
    res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
  }
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Servidor e Sockets rodando na porta ${PORT}`);
});
