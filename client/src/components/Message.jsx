/**
 * Message.jsx — Componente de mensagem individual
 *
 * Mensagens próprias aparecem à direita (azul).
 * Mensagens de outros aparecem à esquerda com avatar e nome.
 * Mensagens de sistema aparecem centradas como notificações.
 */

function iniciais(username) {
  return (username || '?')
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
    .substring(0, 2) || '?';
}

function formatarHora(timestamp) {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleTimeString('pt-PT', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function mesmoGrupo(msg, anterior) {
  if (!anterior || anterior.tipo === 'sistema') return false;
  if (msg.username !== anterior.username) return false;
  return new Date(msg.timestamp) - new Date(anterior.timestamp) < 5 * 60 * 1000;
}

export default function Message({ mensagem, minha, anterior }) {
  if (mensagem.tipo === 'sistema') {
    return (
      <div className="flex justify-center py-2">
        <span className="text-xs text-gray-400 dark:text-gray-500 bg-slate-100 dark:bg-gray-700/60 px-3 py-1 rounded-full">
          {mensagem.texto}
        </span>
      </div>
    );
  }

  const agrupada = mesmoGrupo(mensagem, anterior);
  const margem = agrupada ? 'mt-0.5' : 'mt-4';

  // Mensagem própria — bolha azul à direita
  if (minha) {
    return (
      <div className={`flex justify-end ${margem}`}>
        <div className="max-w-[72%]">
          <div className="bg-blue-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm leading-relaxed">
            {mensagem.texto}
          </div>
          {!agrupada && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-right pr-1">
              {formatarHora(mensagem.timestamp)}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Mensagem de outro utilizador — avatar e bolha à esquerda
  return (
    <div className={`flex gap-2.5 ${margem}`}>
      <div className="w-8 flex-shrink-0 mt-0.5">
        {!agrupada && (
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-gray-600 text-slate-600 dark:text-gray-300
                          flex items-center justify-center text-xs font-semibold select-none">
            {iniciais(mensagem.username)}
          </div>
        )}
      </div>

      <div className="min-w-0 max-w-[72%]">
        {!agrupada && (
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {mensagem.username}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {formatarHora(mensagem.timestamp)}
            </span>
          </div>
        )}

        <div className="bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600
                        px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
          {mensagem.texto}
        </div>
      </div>
    </div>
  );
}
