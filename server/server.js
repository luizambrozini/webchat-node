// server/server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('client'));

// Array para armazenar todas as conexões de clientes
const clients = [];

wss.on('connection', (ws) => {
  // Gere um identificador único para o cliente
  const clientId = generateUniqueId();
  console.log(`Novo cliente conectado. ID: ${clientId}`);

  // Adicione o novo cliente à lista
  clients.push({ id: clientId, connection: ws });

  // Envie uma mensagem de boas-vindas com o ID do cliente
  ws.send(`Bem-vindo ao chat! Seu ID é: ${clientId}`);

  // Configura um ouvinte para mensagens do cliente
  ws.on('message', (message) => {
    // Envia a mensagem para todos os clientes conectados, incluindo o ID do remetente
    broadcast(`${clientId}: ${message}`);
  });

  // Configura um ouvinte para o evento de fechamento da conexão
  ws.on('close', () => {
    console.log(`Cliente desconectado. ID: ${clientId}`);
    // Remove a conexão fechada da lista de clientes
    const index = clients.findIndex((client) => client.id === clientId);
    if (index > -1) {
      clients.splice(index, 1);
    }
  });
});

// Função para enviar uma mensagem para todos os clientes conectados
function broadcast(message) {
  clients.forEach((client) => {
    if (client.connection.readyState === WebSocket.OPEN) {
      client.connection.send(message);
    }
  });
}

// Função para gerar um identificador único
function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9);
}

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
