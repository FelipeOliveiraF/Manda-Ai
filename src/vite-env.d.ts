/// <reference types="vite/client" />

import type { Peer } from "peerjs";
import type { SupabaseClientOptions } from "@supabase/supabase-js";

declare global {
  interface Window {
    Peer: typeof Peer;
    supabase: {
      createClient: (url: string, key: string, options?: SupabaseClientOptions<"public">) => unknown;
    };
    google?: unknown;
    __MOSTRA_AI_REACT__?: boolean;
  }
}

export {};
