/**
 * Login.jsx — Ecrã de entrada
 * Recolhe o username e a sala antes de estabelecer conexão com o broker.
 */

import { useState } from 'react';

const SALAS_DISPONIVEIS = ['geral', 'random', 'dev'];

function IconeSol() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function IconeLua() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );
}

export default function Login({ onEntrar, darkMode, toggleDarkMode }) {
  const [username, setUsername] = useState('');
  const [sala, setSala] = useState('geral');

  const handleSubmit = (e) => {
    e.preventDefault();
    const nome = username.trim();
    if (nome) onEntrar(nome, sala);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 relative transition-colors duration-200">

          {/* Botão dark mode */}
          <button
            onClick={toggleDarkMode}
            title={darkMode ? 'Modo claro' : 'Modo escuro'}
            className="absolute top-4 right-4 p-1.5 text-gray-400 dark:text-gray-500
                       hover:text-gray-600 dark:hover:text-gray-300
                       hover:bg-gray-100 dark:hover:bg-gray-700
                       rounded-lg transition-colors"
          >
            {darkMode ? <IconeSol /> : <IconeLua />}
          </button>

          {/* Cabeçalho */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-blue-600 mb-1">
              SD Chat
            </h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              Join a workspace to start collaborating
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Campo username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Nome de usuário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johndoe"
                  maxLength={30}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                             rounded-xl text-sm placeholder-gray-400 dark:placeholder-gray-500
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             transition-colors"
                />
              </div>
            </div>

            {/* Seleção de sala */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Room Select
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 font-bold text-sm">
                  #
                </div>
                <select
                  value={sala}
                  onChange={(e) => setSala(e.target.value)}
                  className="w-full appearance-none pl-8 pr-10 py-3
                             border border-gray-200 dark:border-gray-600
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                             rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                             focus:border-transparent transition-colors"
                >
                  {SALAS_DISPONIVEIS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Botão entrar */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4
                         rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              Entrar
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
