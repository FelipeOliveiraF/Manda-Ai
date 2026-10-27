import { Peer } from "peerjs";
import { Chess } from "chess.js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { GOOGLE_CLIENT_ID } from "./config";
import { supabaseClient } from "./supabase";
import { callSounds } from "./callSounds";
import { pwaService } from "./pwa";
import { diagnostics } from "./diagnostics";
import { coordinatorRecovery } from "./coordinatorRecovery";

export interface ApplicationServices {
  supabase: SupabaseClient;
  Peer: typeof Peer;
  Chess: typeof Chess;
  mediaDevices: MediaDevices;
  googleClientId: string;
  sounds: typeof callSounds;
  pwa: typeof pwaService;
  diagnostics: typeof diagnostics;
  coordinatorRecovery: typeof coordinatorRecovery;
}

export function createApplicationServices(): ApplicationServices {
  if (!navigator.mediaDevices) throw new Error("Este navegador não oferece suporte aos dispositivos de mídia necessários.");
  diagnostics.configure(supabaseClient);
  return {
    supabase: supabaseClient,
    Peer,
    Chess,
    mediaDevices: navigator.mediaDevices,
    googleClientId: GOOGLE_CLIENT_ID,
    sounds: callSounds,
    pwa: pwaService,
    diagnostics,
    coordinatorRecovery,
  };
}
