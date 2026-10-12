import { Peer } from "peerjs";
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
    mediaDevices: navigator.mediaDevices,
    googleClientId: GOOGLE_CLIENT_ID,
    sounds: callSounds,
    pwa: pwaService,
    diagnostics,
    coordinatorRecovery,
  };
}
