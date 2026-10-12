import { Peer } from "peerjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import { GOOGLE_CLIENT_ID } from "./config";
import { supabaseClient } from "./supabase";
import { callSounds } from "./callSounds";
import { pwaService } from "./pwa";

export interface ApplicationServices {
  supabase: SupabaseClient;
  Peer: typeof Peer;
  mediaDevices: MediaDevices;
  googleClientId: string;
  sounds: typeof callSounds;
  pwa: typeof pwaService;
}

export function createApplicationServices(): ApplicationServices {
  if (!navigator.mediaDevices) throw new Error("Este navegador não oferece suporte aos dispositivos de mídia necessários.");
  return {
    supabase: supabaseClient,
    Peer,
    mediaDevices: navigator.mediaDevices,
    googleClientId: GOOGLE_CLIENT_ID,
    sounds: callSounds,
    pwa: pwaService,
  };
}
