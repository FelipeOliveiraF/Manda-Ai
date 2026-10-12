/// <reference types="vite/client" />

declare global {
  interface Window {
    google?: unknown;
    __MOSTRA_AI_REACT__?: boolean;
  }
}

export {};
