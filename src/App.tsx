import React, { useState } from 'react';
import { Copy, Terminal, Server, Cpu, Database, Check, AlertTriangle, ExternalLink, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ConfigCard = ({ title, icon: Icon, config, language = 'yaml' }: { title: string, icon: any, config: string, language?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(config);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-6"
    >
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
            <Icon size={20} />
          </div>
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
        <button 
          onClick={handleCopy}
          className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copiado!' : 'Copiar'}
        </button>
      </div>
      <div className="p-0">
        <pre className="p-6 overflow-x-auto bg-gray-900 text-gray-300 text-sm font-mono leading-relaxed">
          <code>{config}</code>
        </pre>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'config' | 'tips' | 'guide'>('config');
  const forkUrl = "https://github.com/marciohmc/HavocV1.git";

  const dockerfile = `
# Build Stage
FROM golang:1.22-alpine AS builder

# Instalar dependências de compilação essenciais
RUN apk add --no-cache git build-base python3-dev pkgconfig

WORKDIR /app

# Clonar o repositório diretamente (opcional, se já estiver no repo use COPY .)
COPY . .

# Compilar o Teamserver com otimização de tamanho
WORKDIR /app/teamserver
RUN go mod download
RUN go build -ldflags="-s -w" -o havoc-teamserver main.go

# Runtime Stage - Usando Alpine para footprint mínimo
FROM alpine:latest
RUN apk add --no-cache python3 py3-pip bash

WORKDIR /app
COPY --from=builder /app/teamserver/havoc-teamserver .
COPY --from=builder /app/data ./data
COPY --from=builder /app/profiles ./profiles

# Otimização Crítica para 512MB RAM
ENV GOMEMLIMIT=450MiB
ENV GOGC=40
ENV MALLOC_ARENA_MAX=1

EXPOSE 40056

# Iniciando com o perfil padrão
CMD ["./havoc-teamserver", "server", "--profile", "./profiles/havoc.yaotl", "-v"]
  `.trim();

  const renderYaml = `
/**
 * Render Blueprint para HavocV1 Framework
 * Otimizado para o plano Free (512MB RAM)
 */
services:
  - type: web
    name: havoc-v1-teamserver
    env: docker
    plan: free
    region: ohio
    dockerContext: .
    dockerFilePath: ./Dockerfile
    healthCheckPath: /
    envVars:
      - key: HAVOC_TEAMSERVER_PASSWORD
        generateValue: true
      - key: GOMEMLIMIT
        value: 450MiB
    disk:
      name: havoc-v1-data
      mountPath: /app/data
      sizeGB: 1

databases:
  - name: havoc-v1-db
    plan: free
    region: ohio
  `.trim();

  const havocProfile = `
/**
 * Perfil Mínimo para Render
 */
Teamserver {
    Host = "0.0.0.0"
    Port = 40056

    Build {
        Compiler64 = "/usr/bin/x86_64-w64-mingw32-gcc"
        Compiler86 = "/usr/bin/i686-w64-mingw32-gcc"
    }
}
  `.trim();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-indigo-200 shadow-lg">
              <Shield size={22} fill="currentColor" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              HavocV1 Render Config
            </h1>
          </div>
          <nav className="flex gap-1 p-1 bg-gray-100 rounded-xl">
            {[
              { id: 'config', label: 'Configs', icon: Terminal },
              { id: 'tips', label: 'Otimização', icon: Cpu },
              { id: 'guide', label: 'Guia', icon: ExternalLink }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AnimatePresence mode="wait">
          {activeTab === 'config' && (
            <motion.div
              key="config"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="mb-8 p-6 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Repositório: HavocV1</h2>
                  <p className="text-gray-600 font-mono text-sm">{forkUrl}</p>
                </div>
                <a 
                  href={forkUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  Ver no GitHub <ExternalLink size={14} />
                </a>
              </div>
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Arquivos de Configuração</h2>
                <p className="text-gray-600">Copie estes arquivos para a raiz do seu repositório <strong>HavocV1</strong> para implantação no Render.</p>
              </div>

              <ConfigCard title="Dockerfile (Otimizado para RAM)" icon={Terminal} config={dockerfile} language="dockerfile" />
              <ConfigCard title="render.yaml (Blueprint)" icon={Server} config={renderYaml} />
              <ConfigCard title="havoc.yaotl (Perfil do Teamserver)" icon={Shield} config={havocProfile} />
            </motion.div>
          )}

          {activeTab === 'tips' && (
            <motion.div
              key="tips"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-6"
            >
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-5 items-start">
                <div className="p-3 bg-amber-100 rounded-xl text-amber-600 shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-amber-900 mb-1">Desafio de 512MB de RAM</h3>
                  <p className="text-amber-800 leading-relaxed">
                    O Havoc é um framework pesado. Rodar o Teamserver em 512MB requer configurações agressivas do runtime Go e limitação de carregamento de scripts externos.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                    <Cpu size={24} />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">GOMEMLIMIT</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Configuramos <code className="bg-gray-100 px-1.5 py-0.5 rounded">GOMEMLIMIT=450MiB</code> para forçar o coletor de lixo (GC) a agir antes que o Render encerre o container por falta de memória.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
                    <Database size={24} />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Multi-Server (DB Externo)</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Usar o PostgreSQL nativo do Render (em uma instância separada) libera cerca de 100-150MB de RAM no container do Teamserver que seriam usados pelo SQLite ou DB local.
                  </p>
                </div>
              </div>

              <div className="bg-indigo-900 text-white p-8 rounded-2xl shadow-xl overflow-hidden relative">
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-4">Estratégia Recomendada</h3>
                  <ul className="space-y-4">
                    <li className="flex gap-3">
                      <div className="w-6 h-6 bg-indigo-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</div>
                      <p className="text-indigo-100">Use instâncias separadas para o Teamserver e o Banco de Dados.</p>
                    </li>
                    <li className="flex gap-3">
                      <div className="w-6 h-6 bg-indigo-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</div>
                      <p className="text-indigo-100">Mantenha os Artifacts de compilação (payloads) sob demanda para evitar bloating.</p>
                    </li>
                    <li className="flex gap-3">
                      <div className="w-6 h-6 bg-indigo-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</div>
                      <p className="text-indigo-100">Se possível, use o plano "Starter" ($7) no Render para ter 512MB estáveis, já que o plano Free pode sofrer "sleep" que corrompe sessões persistentes.</p>
                    </li>
                  </ul>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Shield size={160} />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'guide' && (
            <motion.div
              key="guide"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex gap-5 items-start">
                <div className="p-3 bg-red-100 rounded-xl text-red-600 shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-900 mb-1">Erro Comum: Dockerfile not found</h3>
                  <p className="text-red-800 text-sm leading-relaxed">
                    Se você recebeu o erro <code className="bg-red-100 px-1 rounded">failed to read dockerfile</code>, certifique-se de que o arquivo no seu GitHub se chama exatamente <strong className="underline">Dockerfile</strong> (sem .txt, sem .havoc) e está na pasta raiz.
                  </p>
                </div>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm prose prose-indigo max-w-none">
                <h2 className="text-gray-900">Como preencher o formulário no Render</h2>
                <div className="space-y-4 not-prose">
                  <div className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors rounded-xl">
                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">1</div>
                    <div>
                      <p className="font-bold text-gray-900">Name</p>
                      <p className="text-sm text-gray-600">Use <code className="bg-gray-100 px-1 rounded">havoc-v1-teamserver</code></p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors rounded-xl">
                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">2</div>
                    <div>
                      <p className="font-bold text-gray-900">Runtime / Language</p>
                      <p className="text-sm text-gray-600">Escolha obrigatoriamente <strong className="text-indigo-600">Docker</strong></p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors rounded-xl">
                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">3</div>
                    <div>
                      <p className="font-bold text-gray-900">Build & Start Command</p>
                      <p className="text-sm text-gray-600 italic">Deixe em branco (o Dockerfile gerencia isso automaticamente)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl border-2 border-indigo-100 shadow-md">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Check size={20} className="text-green-500" /> 
                  Checklist do Formulário Render
                </h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-1">Runtime / Language</p>
                      <p className="text-gray-900 font-bold">Docker</p>
                      <p className="text-xs text-amber-600 mt-1">⚠️ Não use Node/Go diretamente</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-1">Region</p>
                      <p className="text-gray-900 font-bold">Ohio (US East)</p>
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <p className="text-sm font-bold text-indigo-900 mb-3">Variáveis de Ambiente (CRÍTICO p/ 512MB)</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-mono bg-white p-2 rounded border border-indigo-100">
                        <span className="text-gray-500">GOMEMLIMIT</span>
                        <span className="text-indigo-600 font-bold">450MiB</span>
                      </div>
                      <div className="flex justify-between text-sm font-mono bg-white p-2 rounded border border-indigo-100">
                        <span className="text-gray-500">GOGC</span>
                        <span className="text-indigo-600 font-bold">40</span>
                      </div>
                      <div className="flex justify-between text-sm font-mono bg-white p-2 rounded border border-indigo-100">
                        <span className="text-gray-500">MALLOC_ARENA_MAX</span>
                        <span className="text-indigo-600 font-bold">1</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <p className="text-sm font-bold text-amber-900 mb-1">Nota sobre Discos (Persistent Storage)</p>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      O plano <strong>Free</strong> não suporta "Disks". Seus arquivos serão deletados ao reiniciar. 
                      Para salvar logs e payloads permanentemente, use o plano <strong>Starter ($7)</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p className="text-sm font-medium mb-2 uppercase tracking-wider text-gray-500">Links Úteis</p>
                <div className="flex flex-wrap gap-4">
                  <a href="https://havocframework.com/docs" target="_blank" className="flex items-center gap-1.5 text-indigo-600 hover:underline">
                    Documentação Oficial <ExternalLink size={14} />
                  </a>
                  <a href="https://render.com/docs/docker" target="_blank" className="flex items-center gap-1.5 text-indigo-600 hover:underline">
                    Deploying Docker on Render <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-200 mt-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            Configuração gerada via Google AI Studio para otimização de infraestrutura.
          </p>
          <div className="flex gap-6">
            <span className="text-xs font-mono text-gray-400">v1.0.0</span>
            <span className="text-xs font-mono text-gray-400">RAM_LIMIT: 512MB</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
