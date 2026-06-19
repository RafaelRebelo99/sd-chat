# DistribuídoChat — Message Broker em Sistemas Distribuídos

Projeto académico para o **Instituto Piaget** que demonstra o padrão **Message Broker / Middleware** em Sistemas Distribuídos através de uma aplicação de chat em tempo real.

---

## Arquitetura

```
┌─────────┐              ┌──────────────────────────────┐              ┌─────────┐
│         │  WebSocket   │                              │  WebSocket   │         │
│ Cliente │ ───────────► │    BROKER / MIDDLEWARE       │ ───────────► │ Cliente │
│    A    │              │        (Node.js + ws)        │              │    B    │
└─────────┘              │                              │              └─────────┘
                         │  • Publish / Subscribe       │
┌─────────┐              │  • Gestão de salas           │              ┌─────────┐
│         │  WebSocket   │  • Histórico em memória      │  WebSocket   │         │
│ Cliente │ ───────────► │  • Lista de utilizadores     │ ───────────► │ Cliente │
│    C    │              │  • Log de eventos             │              │    D    │
└─────────┘              └──────────────────────────────┘              └─────────┘
```

> **Os clientes nunca comunicam diretamente entre si.**  
> Toda a mensagem passa obrigatoriamente pelo broker.

---

## Tecnologias

| Camada           | Tecnologia                     |
|------------------|--------------------------------|
| Broker/Servidor  | Node.js + Express + `ws`       |
| Cliente          | React 18 + Vite + Tailwind CSS |
| Protocolo        | WebSocket (full-duplex)        |
| Persistência     | Array em memória (buffer ≤ 50) |

---

## Instalação e Execução

### Pré-requisitos
- Node.js 18+
- npm

### 1. Iniciar o Broker

```bash
cd server
npm install
npm start
```

O broker fica disponível em `ws://localhost:3001`.  
Health check: `http://localhost:3001/health`

### 2. Iniciar o Cliente

Numa nova janela de terminal:

```bash
cd client
npm install
npm run dev
```

Acede em `http://localhost:5173`.

---

## Como Testar com Múltiplas Abas

1. Garante que o broker está a correr (`cd server && npm start`)
2. Abre `http://localhost:5173` em **duas ou mais abas** do browser
3. Em cada aba, entra com um **username diferente** na mesma sala (ex: `geral`)
4. Envia mensagens numa aba — chegam a todas as outras **em tempo real**
5. Clica no ícone **ⓘ** (canto superior direito) para ver o **Painel do Broker**
6. Experimenta trocar de sala pela sidebar e observa como os utilizadores online se atualizam

---

## Fluxo de Mensagens

```
1. Cliente A abre conexão WebSocket → broker regista-o como subscritor de #geral

2. Broker envia histórico de mensagens da sala para o Cliente A

3. Cliente A envia: { tipo: 'mensagem', texto: 'Olá!' }

4. Broker armazena a mensagem no buffer da sala (máx. 50)

5. Broker publica para TODOS os subscritores de #geral:
       → Cliente A (remetente confirma envio)
       → Cliente B, C, D... (recebem em tempo real)

6. Clientes exibem a mensagem com base no username:
       → username == próprio → bolha azul à direita
       → username != próprio → bolha cinza à esquerda
```

---

## Conceitos Demonstrados

### Message Broker
O servidor é o broker que:
- **Recebe** mensagens dos clientes (publishers)
- **Armazena** temporariamente (buffer circular de 50 msg/sala)
- **Redistribui** para todos os subscritores do tópico (sala)

### Padrão Publish/Subscribe
- A sala funciona como **tópico**
- Clientes escolhem em que tópico subscrever
- Publisher não sabe quem são os subscritores — o broker abstrai isso

### Middleware
O broker é **middleware** porque:
- Abstrai a comunicação entre clientes (desacoplamento total)
- Adiciona funcionalidades transversais: histórico, lista de utilizadores, logs
- Os clientes dependem apenas do broker, nunca uns dos outros

### Escalabilidade
- Novos clientes ligam-se sem alterar os existentes
- Novas salas podem ser adicionadas no broker sem tocar nos clientes

---

## Estrutura do Projeto

```
SD_CHAT/
├── server/
│   ├── index.js          ← Broker/Middleware — toda a lógica de distribuição
│   └── package.json
│
├── client/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx          ← Ponto de entrada React
│       ├── App.jsx           ← Raiz: gere WebSocket e estado global
│       ├── index.css         ← Tailwind CSS
│       └── components/
│           ├── Login.jsx     ← Ecrã de entrada (username + sala)
│           ├── Chat.jsx      ← Interface principal com layout responsivo
│           ├── Message.jsx   ← Mensagem individual (própria vs outros)
│           ├── Sidebar.jsx   ← Lista de salas e utilizadores online
│           └── BrokerPanel.jsx ← Monitorização do broker em tempo real
│
└── README.md
```

---

## Endpoints do Broker

| Tipo   | URL                            | Descrição                         |
|--------|--------------------------------|-----------------------------------|
| HTTP   | `GET /health`                  | Estado do broker e estatísticas   |
| WS     | `ws://localhost:3001`          | Conexão WebSocket principal       |

### Protocolo de mensagens (WebSocket)

| Tipo (cliente → broker) | Campos                          |
|-------------------------|---------------------------------|
| `entrar`                | `username`, `sala`              |
| `mensagem`              | `texto`                         |
| `trocar_sala`           | `sala`                          |

| Tipo (broker → cliente) | Descrição                                  |
|-------------------------|--------------------------------------------|
| `historico`             | Array das últimas 50 mensagens da sala     |
| `mensagem`              | Nova mensagem publicada na sala            |
| `sistema`               | Notificação de entrada/saída              |
| `utilizadores_atualizados` | Lista de utilizadores online na sala    |
| `broker_stats`          | Estatísticas e log de eventos em tempo real |
