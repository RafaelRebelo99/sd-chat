/**
 * Chat.jsx — Interface principal de chat
 * Layout responsivo: sidebar (salas/utilizadores) + área de mensagens + painel do broker.
 */

import { useState, useRef, useEffect } from 'react';
import Message from './Message';
import Sidebar from './Sidebar';
import BrokerPanel from './BrokerPanel';

function IconeSol() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function IconeLua() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );
}

export default function Chat({
  sessao,
  mensagens,
  utilizadores,
  brokerStats,
  brokerLogs,
  conectado,
  darkMode,
  onEnviarMensagem,
  onTrocarSala,
  onToggleDarkMode,
}) {
  const [inputTexto, setInputTexto] = useState('');
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [brokerAberto, setBrokerAberto] = useState(false);
  const refMensagens = useRef(null);

  useEffect(() => {
    if (refMensagens.current) {
      refMensagens.current.scrollTop = refMensagens.current.scrollHeight;
    }
  }, [mensagens]);

  const handleEnviar = (e) => {
    e.preventDefault();
    const texto = inputTexto.trim();
    if (texto && conectado) {
      onEnviarMensagem(texto);
      setInputTexto('');
    }
  };

  return (
    <div className="flex h-dvh bg-slate-50 dark:bg-gray-900 overflow-hidden transition-colors duration-200">

      {/* Overlay (mobile) */}
      {sidebarAberta && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarAberta(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-30 lg:z-auto h-full
        transition-transform duration-200 ease-in-out
        ${sidebarAberta ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar
          utilizadores={utilizadores}
          salaAtual={sessao.sala}
          username={sessao.username}
          onTrocarSala={(sala) => {
            onTrocarSala(sala);
            setSidebarAberta(false);
          }}
        />
      </div>

      {/* Coluna principal */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Cabeçalho */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700
                           px-4 py-3 flex items-center justify-between flex-shrink-0 transition-colors duration-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarAberta(true)}
              className="lg:hidden p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1 text-sm">
                <span className="text-gray-400 dark:text-gray-500 font-normal">#</span>
                {sessao.sala}
              </h2>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {utilizadores.length} connected {utilizadores.length === 1 ? 'user' : 'users'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Pesquisa (visual) */}
            <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300
                               hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Painel do broker */}
            <button
              onClick={() => setBrokerAberto(!brokerAberto)}
              title="Painel do Broker / Middleware"
              className={`p-2 rounded-lg transition-colors ${
                brokerAberto
                  ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            {/* Toggle dark mode */}
            <button
              onClick={onToggleDarkMode}
              title={darkMode ? 'Modo claro' : 'Modo escuro'}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300
                         hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {darkMode ? <IconeSol /> : <IconeLua />}
            </button>

            {/* Indicador de conexão */}
            <div
              title={conectado ? 'Ligado ao broker' : 'Desligado'}
              className={`w-2 h-2 rounded-full ml-1 ${conectado ? 'bg-green-500' : 'bg-red-400'}`}
            />
          </div>
        </header>

        {/* Corpo */}
        <div className="flex flex-1 min-h-0">

          {/* Área de mensagens */}
          <div className="flex-1 flex flex-col min-w-0">
            <div
              ref={refMensagens}
              className="flex-1 overflow-y-auto px-4 py-4"
            >
              {mensagens.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center">
                    Nenhuma mensagem ainda.<br />Começa a conversar!
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center mb-4">
                    <span className="text-xs text-gray-400 dark:text-gray-500 bg-slate-100 dark:bg-gray-700/60 px-3 py-1 rounded-full">
                      HOJE
                    </span>
                  </div>
                  {mensagens.map((msg, idx) => (
                    <Message
                      key={msg.id || idx}
                      mensagem={msg}
                      minha={msg.username === sessao.username}
                      anterior={idx > 0 ? mensagens[idx - 1] : null}
                    />
                  ))}
                </>
              )}
            </div>

            {/* Input */}
            <div className="flex-shrink-0 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 transition-colors duration-200">
              <form onSubmit={handleEnviar} className="flex gap-2">
                <input
                  type="text"
                  value={inputTexto}
                  onChange={(e) => setInputTexto(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) handleEnviar(e);
                  }}
                  placeholder={`Message #${sessao.sala}`}
                  maxLength={500}
                  disabled={!conectado}
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-gray-700
                             border border-gray-200 dark:border-gray-600
                             text-gray-900 dark:text-gray-100
                             placeholder-gray-400 dark:placeholder-gray-500
                             rounded-xl text-sm focus:outline-none focus:ring-2
                             focus:ring-blue-500 focus:border-transparent
                             disabled:opacity-50 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputTexto.trim() || !conectado}
                  className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl
                             hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Enviar
                </button>
              </form>
            </div>
          </div>

          {/* Painel do Broker */}
          {brokerAberto && (
            <aside className="w-72 border-l border-gray-100 dark:border-gray-700
                              bg-white dark:bg-gray-800 overflow-y-auto flex-shrink-0 transition-colors duration-200">
              <BrokerPanel stats={brokerStats} logs={brokerLogs} />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
