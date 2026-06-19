/**
 * BrokerPanel.jsx — Painel de monitorização do broker em tempo real
 *
 * Mostra as estatísticas de cada sala (subscritores e mensagens em fila)
 * e o log de eventos do broker. Abre com o ícone ⓘ no cabeçalho.
 */

const COR_EVENTO = {
  UTILIZADOR_ENTROU:  'text-green-600 dark:text-green-400',
  UTILIZADOR_SAIU:    'text-red-500 dark:text-red-400',
  MENSAGEM_PUBLICADA: 'text-blue-600 dark:text-blue-400',
  TROCA_SALA:         'text-amber-600 dark:text-amber-400',
  NOVA_CONEXAO:       'text-purple-600 dark:text-purple-400',
  CONEXAO_FECHADA:    'text-slate-400 dark:text-slate-500',
};

function corEvento(evento) {
  return COR_EVENTO[evento] || 'text-gray-500 dark:text-gray-400';
}

export default function BrokerPanel({ stats, logs }) {
  return (
    <div className="p-4 h-full flex flex-col gap-4">

      {/* Cabeçalho */}
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Broker / Middleware
        </h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Monitorização em tempo real</p>
      </div>

      {/* Diagrama do fluxo */}
      <div className="p-3 bg-slate-50 dark:bg-gray-700/60 rounded-xl text-xs text-gray-500 dark:text-gray-400 font-mono text-center leading-6">
        <div>Cliente A &nbsp;·&nbsp; Cliente B</div>
        <div className="text-gray-300 dark:text-gray-500">↓ WebSocket ↓</div>
        <div className="bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 font-bold rounded-lg py-1 my-0.5 text-xs">
          [ BROKER ]
        </div>
        <div className="text-gray-300 dark:text-gray-500">↓ Publish/Subscribe ↓</div>
        <div>Todos os subscritores</div>
      </div>

      {/* Estatísticas por sala */}
      <div>
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
          Salas Ativas
        </p>
        {stats ? (
          Object.entries(stats).map(([sala, info]) => (
            <div key={sala} className="mb-2 px-3 py-2 bg-slate-50 dark:bg-gray-700/60 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300"># {sala}</span>
              <div className="flex gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                <span>👥 {info.subscritores} subs</span>
                <span>📨 {info.mensagensEmFila} msgs</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-gray-400 dark:text-gray-500">A aguardar dados do broker...</p>
        )}
      </div>

      {/* Log de eventos */}
      <div className="flex-1 min-h-0 flex flex-col">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
          Log de Eventos
        </p>
        <div className="flex-1 overflow-y-auto space-y-1">
          {logs.length > 0 ? (
            logs.map((log, i) => (
              <div key={log.id || i} className="px-2 py-1.5 bg-slate-50 dark:bg-gray-700/60 rounded-lg">
                <div className={`text-xs font-semibold ${corEvento(log.evento)}`}>
                  {log.evento}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {new Date(log.timestamp).toLocaleTimeString('pt-PT')}
                  {log.dados?.username && (
                    <span className="text-gray-500 dark:text-gray-400 ml-1">· {log.dados.username}</span>
                  )}
                  {log.dados?.sala && (
                    <span className="text-gray-400 dark:text-gray-500 ml-1">#{log.dados.sala}</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-500">Sem eventos ainda</p>
          )}
        </div>
      </div>
    </div>
  );
}
