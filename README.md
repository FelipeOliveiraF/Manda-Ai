# Mostra aí

Aplicação web para salas privadas com compartilhamento de tela, câmera, áudio e chat.

## Stack — etapa 1.5

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
- Radix UI, Lucide e Framer Motion como base do novo sistema de componentes
- Supabase para autenticação, dados, Realtime e Storage
- PeerJS/WebRTC para mídia entre participantes
- Worker ESM para publicação no Sites

## Arquitetura de migração

A interface já é montada pelo React. Para preservar integralmente o comportamento validado, a etapa 1.5 mantém a lógica existente em uma camada temporária de compatibilidade:

1. `worker/page.js`, `worker/styles.js` e `worker/app.js` continuam sendo a referência do produto atual.
2. `scripts/prepare-react.mjs` transforma a marcação e os estilos em módulos consumidos pelo React.
3. `src/LegacySurface.tsx` preserva os IDs e seletores usados pela lógica atual.
4. `src/components/ui/` contém os componentes primitivos da nova interface.
5. Nas próximas etapas, cada área da `LegacySurface` será substituída por componentes React nativos sem uma reescrita arriscada de Supabase ou WebRTC.

## Desenvolvimento

```bash
npm install
npm run build
npm run check
npm run preview
```

O preview local fica em `http://127.0.0.1:4173/`.

## Build

O Vite gera os bundles modernos e `scripts/package-react-worker.mjs` os empacota no artefato esperado pelo Sites:

```text
dist/
├── .openai/
│   └── hosting.json
└── server/
    └── index.js
```

O arquivo em `dist/` é gerado e não deve ser editado manualmente.
