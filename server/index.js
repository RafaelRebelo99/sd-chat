/**
 * BROKER / MIDDLEWARE — DistribuídoChat
 * Instituto Piaget — Sistemas Distribuídos
 *
 * Este servidor atua como broker centralizado implementando o padrão
 * Publish/Subscribe. Os clientes nunca comunicam diretamente entre si —
 * toda a mensagem passa obrigatoriamente por este intermediário.
 */

const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORTA = 3001;
const MAX_MENSAGENS_POR_SALA = 50;
const MAX_LOGS = 100;

// ─── Estado em memória do broker ─────────────────────────────────────────────

// Salas disponíveis com as suas mensagens e subscritores (Map<ws → {username}>)
const salas = {
  geral:  { mensagens: [], subscritores: new Map() },
  random: { mensagens: [], subscritores: new Map() },
  dev:    { mensagens: [], subscritores: new Map() },
};

// Registo de cada conexão WebSocket ativa: Map<ws → { username, sala }>
const conexoes = new Map();

// Fila de logs de eventos do broker
const registoEventos = [];

// ─── Utilitários internos do broker ──────────────────────────────────────────

function registarEvento(evento, dados) {
  const entrada = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    evento,
    dados,
  };
  registoEventos.unshift(entrada);
  if (registoEventos.length > MAX_LOGS) registoEventos.pop();
  console.log(`[BROKER] ${evento}:`, JSON.stringify(dados));
  return entrada;
}

function estatisticasBroker() {
  const stats = {};
  for (const [nome, sala] of Object.entries(salas)) {
    stats[nome] = {
      subscritores: sala.subscritores.size,
      mensagensEmFila: sala.mensagens.length,
    };
  }
  return stats;
}

// Transmitir para TODOS os clientes conectados (usado para stats globais)
function transmitirParaTodos(msg) {
  const payload = JSON.stringify(msg);
  for (const cliente of wss.clients) {
    if (cliente.readyState === cliente.OPEN) {
      cliente.send(payload);
    }
  }
}

// Publicar mensagem para todos os subscritores de uma sala
// Se `excluir` for definido, esse WebSocket não recebe (ex: notificações próprias)
function publicarNaSala(nomeSala, msg, excluir = null) {
  const sala = salas[nomeSala];
  if (!sala) return;
  const payload = JSON.stringify(msg);
  for (const [ws] of sala.subscritores) {
    if (ws !== excluir && ws.readyState === ws.OPEN) {
      ws.send(payload);
    }
  }
}

// Enviar lista atualizada de utilizadores a todos os membros de uma sala
function sincronizarUtilizadores(nomeSala) {
  const sala = salas[nomeSala];
  if (!sala) return;
  const lista = Array.from(sala.subscritores.values()).map((u) => u.username);
  publicarNaSala(nomeSala, {
    tipo: 'utilizadores_atualizados',
    sala: nomeSala,
    utilizadores: lista,
  });
}

// Propagar estatísticas e logs do broker a todos os clientes
function difundirEstatisticas() {
  transmitirParaTodos({
    tipo: 'broker_stats',
    estatisticas: estatisticasBroker(),
    logs: registoEventos.slice(0, 15),
  });
}

// ─── Gestão de conexões WebSocket ────────────────────────────────────────────

wss.on('connection', (ws) => {
  registarEvento('NOVA_CONEXAO', { totalClientes: wss.clients.size });

  ws.on('message', (rawData) => {
    let msg;
    try {
      msg = JSON.parse(rawData.toString());
    } catch {
      return; // ignorar mensagens malformadas
    }

    switch (msg.tipo) {

      // ── Cliente anuncia entrada numa sala ──────────────────────────────────
      case 'entrar': {
        const { username, sala: nomeSala } = msg;

        if (!username?.trim() || !salas[nomeSala]) {
          ws.send(JSON.stringify({ tipo: 'erro', mensagem: 'Parâmetros inválidos' }));
          return;
        }

        // Registar a conexão no broker
        const nomeUtilizador = username.trim();
        conexoes.set(ws, { username: nomeUtilizador, sala: nomeSala });
        salas[nomeSala].subscritores.set(ws, { username: nomeUtilizador });

        registarEvento('UTILIZADOR_ENTROU', { username: nomeUtilizador, sala: nomeSala });

        // 1. Enviar histórico da sala ao novo subscritor
        ws.send(JSON.stringify({
          tipo: 'historico',
          sala: nomeSala,
          mensagens: salas[nomeSala].mensagens,
        }));

        // 2. Atualizar lista de utilizadores para todos na sala
        sincronizarUtilizadores(nomeSala);

        // 3. Notificar os outros membros da sala (excluir o próprio)
        publicarNaSala(nomeSala, {
          tipo: 'sistema',
          sala: nomeSala,
          texto: `${nomeUtilizador} entrou na sala`,
          timestamp: new Date().toISOString(),
        }, ws);

        difundirEstatisticas();
        break;
      }

      // ── Cliente publica uma mensagem na sala ───────────────────────────────
      case 'mensagem': {
        const info = conexoes.get(ws);
        if (!info || !msg.texto?.trim()) return;

        const { username, sala: nomeSala } = info;

        // Construir objeto canónico da mensagem
        const mensagem = {
          tipo: 'mensagem',
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          sala: nomeSala,
          username,
          texto: msg.texto.trim(),
          timestamp: new Date().toISOString(),
        };

        // Persistir em buffer circular (máximo 50 mensagens por sala)
        salas[nomeSala].mensagens.push(mensagem);
        if (salas[nomeSala].mensagens.length > MAX_MENSAGENS_POR_SALA) {
          salas[nomeSala].mensagens.shift();
        }

        registarEvento('MENSAGEM_PUBLICADA', {
          username,
          sala: nomeSala,
          preview: mensagem.texto.substring(0, 60),
        });

        // Redistribuir para TODOS os subscritores da sala (incluindo o remetente)
        // → demonstra o papel do broker como único canal de comunicação
        publicarNaSala(nomeSala, mensagem);

        difundirEstatisticas();
        break;
      }

      // ── Cliente muda de sala ───────────────────────────────────────────────
      case 'trocar_sala': {
        const info = conexoes.get(ws);
        if (!info || !salas[msg.sala] || msg.sala === info.sala) return;

        const { username, sala: salaAnterior } = info;
        const novaSala = msg.sala;

        // Remover da sala anterior e notificar restantes membros
        salas[salaAnterior].subscritores.delete(ws);
        sincronizarUtilizadores(salaAnterior);
        publicarNaSala(salaAnterior, {
          tipo: 'sistema',
          sala: salaAnterior,
          texto: `${username} mudou para #${novaSala}`,
          timestamp: new Date().toISOString(),
        });

        // Registar na nova sala
        info.sala = novaSala;
        salas[novaSala].subscritores.set(ws, { username });

        registarEvento('TROCA_SALA', { username, de: salaAnterior, para: novaSala });

        // Enviar histórico da nova sala
        ws.send(JSON.stringify({
          tipo: 'historico',
          sala: novaSala,
          mensagens: salas[novaSala].mensagens,
        }));

        // Atualizar utilizadores e notificar na nova sala
        sincronizarUtilizadores(novaSala);
        publicarNaSala(novaSala, {
          tipo: 'sistema',
          sala: novaSala,
          texto: `${username} entrou na sala`,
          timestamp: new Date().toISOString(),
        }, ws);

        difundirEstatisticas();
        break;
      }

      default:
        break;
    }
  });

  ws.on('close', () => {
    const info = conexoes.get(ws);

    if (info) {
      const { username, sala: nomeSala } = info;

      // Remover subscritor e notificar a sala
      salas[nomeSala].subscritores.delete(ws);
      conexoes.delete(ws);

      registarEvento('UTILIZADOR_SAIU', { username, sala: nomeSala });

      sincronizarUtilizadores(nomeSala);
      publicarNaSala(nomeSala, {
        tipo: 'sistema',
        sala: nomeSala,
        texto: `${username} saiu da sala`,
        timestamp: new Date().toISOString(),
      });

      difundirEstatisticas();
    }

    registarEvento('CONEXAO_FECHADA', { totalClientes: wss.clients.size });
  });

  ws.on('error', (erro) => {
    console.error('[BROKER] Erro WebSocket:', erro.message);
  });
});

// ─── Endpoint de saúde (útil para verificar o estado do broker) ──────────────

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    estado: 'online',
    conexoesAtivas: wss.clients.size,
    salas: estatisticasBroker(),
    ultimosEventos: registoEventos.slice(0, 5),
  });
});

// ─── Iniciar servidor ─────────────────────────────────────────────────────────

server.listen(PORTA, () => {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   DistribuídoChat — Broker/Middleware    ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log(`\n[BROKER] WebSocket ativo em ws://localhost:${PORTA}`);
  console.log(`[BROKER] Health check em http://localhost:${PORTA}/health`);
  console.log(`[BROKER] Salas: ${Object.keys(salas).join(', ')}\n`);
});
