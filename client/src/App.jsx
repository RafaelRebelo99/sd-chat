/**
 * App.jsx — Raiz da aplicação
 *
 * Gere a conexão WebSocket com o broker, o estado global e o modo escuro.
 * Decide entre mostrar o ecrã de Login ou o Chat consoante a sessão.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import Login from './components/Login';
import Chat from './components/Chat';

const URL_BROKER = import.meta.env.VITE_BROKER_URL || 'ws://localhost:3001';

export default function App() {
  const [sessao, setSessao] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [utilizadores, setUtilizadores] = useState([]);
  const [brokerStats, setBrokerStats] = useState(null);
  const [brokerLogs, setBrokerLogs] = useState([]);
  const [conectado, setConectado] = useState(false);
  const wsRef = useRef(null);

  // Inicializar dark mode a partir de localStorage ou preferência do sistema
  const [conectando, setConectando] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    const guardado = localStorage.getItem('dc-darkmode');
    if (guardado !== null) return guardado === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Aplicar/remover classe 'dark' no <html> e persistir preferência
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('dc-darkmode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => setDarkMode((d) => !d), []);

  useEffect(() => {
    return () => wsRef.current?.close();
  }, []);

  const entrar = useCallback((username, sala) => {
    // Impedir múltiplas conexões simultâneas
    if (conectando) return;
    wsRef.current?.close();
    setConectando(true);

    const ws = new WebSocket(URL_BROKER);
    wsRef.current = ws;

    ws.onopen = () => {
      setConectado(true);
      setConectando(false);
      ws.send(JSON.stringify({ tipo: 'entrar', username, sala }));
      setSessao({ username, sala });
    };

    ws.onmessage = ({ data }) => {
      const msg = JSON.parse(data);

      switch (msg.tipo) {
        case 'historico':
          setMensagens(msg.mensagens);
          break;
        case 'mensagem':
        case 'sistema':
          setMensagens((prev) => [...prev, msg]);
          break;
        case 'utilizadores_atualizados':
          setUtilizadores(msg.utilizadores);
          break;
        case 'broker_stats':
          setBrokerStats(msg.estatisticas);
          setBrokerLogs(msg.logs || []);
          break;
        default:
          break;
      }
    };

    ws.onclose = () => { setConectado(false); setConectando(false); };
    ws.onerror = () => { setConectado(false); setConectando(false); };
  }, [conectando]);

  const enviarMensagem = useCallback((texto) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ tipo: 'mensagem', texto }));
    }
  }, []);

  const trocarSala = useCallback((novaSala) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    if (!sessao || novaSala === sessao.sala) return;

    wsRef.current.send(JSON.stringify({ tipo: 'trocar_sala', sala: novaSala }));
    setSessao((prev) => ({ ...prev, sala: novaSala }));
    setMensagens([]);
    setUtilizadores([]);
  }, [sessao]);

  if (!sessao) {
    return <Login onEntrar={entrar} conectando={conectando} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />;
  }

  return (
    <Chat
      sessao={sessao}
      mensagens={mensagens}
      utilizadores={utilizadores}
      brokerStats={brokerStats}
      brokerLogs={brokerLogs}
      conectado={conectado}
      darkMode={darkMode}
      onEnviarMensagem={enviarMensagem}
      onTrocarSala={trocarSala}
      onToggleDarkMode={toggleDarkMode}
    />
  );
}
