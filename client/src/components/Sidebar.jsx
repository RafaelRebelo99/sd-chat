/**
 * Sidebar.jsx — Painel lateral
 * Mostra as salas disponíveis e os utilizadores online na sala atual.
 */

const SALAS = [
  { id: 'geral',  nome: 'geral' },
  { id: 'random', nome: 'random' },
  { id: 'dev',    nome: 'dev' },
];

function iniciais(username) {
  return (username || '?')
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
    .substring(0, 2) || '?';
}

export default function Sidebar({ utilizadores, salaAtual, username, onTrocarSala }) {
  return (
    <div className="w-60 h-full bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700
                    flex flex-col select-none transition-colors duration-200">

      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
        <h1 className="font-bold text-blue-600 text-base">SD Chat</h1>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Sistema Distribuído para demonstração em aula</p>
      </div>

      {/* Lista de salas */}
      <div className="px-3 py-3 border-b border-gray-100 dark:border-gray-700">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1 mb-1.5">
          Salas
        </p>
        {SALAS.map((sala) => (
          <button
            key={sala.id}
            onClick={() => onTrocarSala(sala.id)}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-colors ${
              sala.id === salaAtual
                ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <span className={sala.id === salaAtual ? 'text-blue-400 dark:text-blue-500' : 'text-gray-400 dark:text-gray-600'}>
              #
            </span>
            {sala.nome}
          </button>
        ))}
      </div>

      {/* Utilizadores online */}
      <div className="px-3 py-3 flex-1 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1 mb-1.5">
          Online — {utilizadores.length}
        </p>

        {utilizadores.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-gray-500 px-1">Nenhum utilizador</p>
        ) : (
          utilizadores.map((user) => (
            <div key={user} className="flex items-center gap-2 px-1 py-1.5">
              <div className="relative flex-shrink-0">
                <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/50
                                text-blue-600 dark:text-blue-400
                                flex items-center justify-center text-xs font-semibold">
                  {iniciais(user)}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                {user}
                {user === username && (
                  <span className="text-gray-400 dark:text-gray-500 text-xs ml-1">(você)</span>
                )}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
