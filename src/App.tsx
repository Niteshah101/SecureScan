/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Scanner from './components/Scanner';
import { Shield, Github, Globe } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-zinc-950 dark:bg-zinc-50 rounded-xl flex items-center justify-center">
              <Shield className="text-zinc-50 dark:text-zinc-950" size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              Secure<span className="text-blue-500">Scan</span>
            </h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            
          </nav>

          <div className="flex items-center gap-3">
            <button className="p-2 text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors">
              <Globe size={20} />
            </button>
            <button className="p-2 text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors">
              <Github size={20} />
            </button>
            <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1" />
            <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-bold transition-all shadow-sm shadow-blue-500/20 active:scale-95">
              Secure Vault
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        <Scanner />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-12 bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-6">
          <div className="flex items-center justify-center gap-2 opacity-50 grayscale">
            <Shield size={20} />
            <span className="font-bold tracking-tighter text-lg underline decoration-blue-500 underline-offset-4">SECURESCAN</span>
          </div>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">
            Advanced vulnerability scanning platform integrating NIST National Vulnerability Database and state-of-the-art Generative AI for proactive security management.
          </p>
          <div className="flex items-center justify-center gap-6 text-xs text-zinc-500 font-mono">
            <span>© 2026 SECURESCAN LABS</span>
            <span>V2.4.0-BETA</span>
            <span>POWERED BY GOOGLE AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

