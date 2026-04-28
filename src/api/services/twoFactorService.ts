import { apiClient } from "../client";
import type { BackendUser } from "./authService";
import type { Passkey, ActionType } from "@/types";

export interface LoginOkPayload {
  access_token: string;
  refresh_token: string;
  user: BackendUser;
  two_factor_enabled: boolean;
  passkey_enabled: boolean;
}

// ── WebAuthn helpers ────────────────────────────────────────────────────────

function to_buffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function to_base64url(buffer: ArrayBuffer | null | undefined): string | null {
  if (!buffer) return null;
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function decode_assertion_options(opts: Record<string, unknown>): PublicKeyCredentialRequestOptions {
  return {
    ...opts,
    challenge: to_buffer(opts.challenge as string),
    allowCredentials: (opts.allowCredentials as Array<{ id: string; type: string }> | undefined)?.map((c) => ({
      ...c,
      id: to_buffer(c.id),
    })),
  } as PublicKeyCredentialRequestOptions;
}

function decode_creation_options(opts: Record<string, unknown>): PublicKeyCredentialCreationOptions {
  const user = opts.user as { id: string; name: string; displayName: string };
  return {
    ...opts,
    challenge: to_buffer(opts.challenge as string),
    user: { ...user, id: to_buffer(user.id) },
  } as PublicKeyCredentialCreationOptions;
}

function serialize_assertion(cred: PublicKeyCredential): Record<string, unknown> {
  const r = cred.response as AuthenticatorAssertionResponse;
  return {
    id: cred.id,
    rawId: to_base64url(cred.rawId),
    type: cred.type,
    response: {
      clientDataJSON: to_base64url(r.clientDataJSON),
      authenticatorData: to_base64url(r.authenticatorData),
      signature: to_base64url(r.signature),
      userHandle: to_base64url(r.userHandle),
    },
  };
}

function serialize_attestation(cred: PublicKeyCredential): Record<string, unknown> {
  const r = cred.response as AuthenticatorAttestationResponse;
  return {
    id: cred.id,
    rawId: to_base64url(cred.rawId),
    type: cred.type,
    response: {
      clientDataJSON: to_base64url(r.clientDataJSON),
      attestationObject: to_base64url(r.attestationObject),
    },
  };
}

// ── Service ─────────────────────────────────────────────────────────────────

export const twoFactorService = {
  // ── 2FA login via Telegram OTP ──────────────────────────────────────────

  send_telegram_otp: async (temp_token: string): Promise<void> => {
    await apiClient.post("/auth/2fa/telegram/send", { temp_token });
  },

  complete_telegram: async (temp_token: string, code: string): Promise<LoginOkPayload> => {
    const response = await apiClient.post("/auth/2fa/telegram/verify", { temp_token, code });
    const raw = response.data;
    return (raw.data ?? raw) as LoginOkPayload;
  },

  // ── 2FA login via Passkey (full WebAuthn round-trip) ───────────────────

  complete_passkey_login: async (temp_token: string): Promise<LoginOkPayload> => {
    const begin_res = await apiClient.post("/auth/2fa/passkey/begin", { temp_token });
    const { session_id, assertion_options } = begin_res.data.data;
    const pk_opts = (assertion_options.publicKey ?? assertion_options) as Record<string, unknown>;
    const cred = await navigator.credentials.get({ publicKey: decode_assertion_options(pk_opts) });
    if (!cred) throw new Error("No credential returned");
    const finish_res = await apiClient.post(
      `/auth/2fa/passkey/finish?session_id=${session_id}&temp_token=${temp_token}`,
      serialize_assertion(cred as PublicKeyCredential)
    );
    const raw = finish_res.data;
    return (raw.data ?? raw) as LoginOkPayload;
  },

  // ── Phone management ────────────────────────────────────────────────────

  phone_send_otp: async (phone: string): Promise<void> => {
    await apiClient.post("/profile/phone/send-otp", { phone });
  },

  phone_verify: async (phone: string, code: string): Promise<void> => {
    await apiClient.post("/profile/phone/verify", { phone, code });
  },

  phone_remove: async (): Promise<void> => {
    await apiClient.delete("/profile/phone");
  },

  // ── Passkey management ──────────────────────────────────────────────────

  passkeys_list: async (): Promise<Passkey[]> => {
    const response = await apiClient.get("/profile/passkeys");
    const raw = response.data;
    return (raw.data ?? raw) as Passkey[];
  },

  register_passkey: async (name: string): Promise<Passkey> => {
    const begin_res = await apiClient.post("/profile/passkeys/register/begin", { name });
    const { session_id, creation_options } = begin_res.data.data;
    const pk_opts = (creation_options.publicKey ?? creation_options) as Record<string, unknown>;
    const cred = await navigator.credentials.create({ publicKey: decode_creation_options(pk_opts) });
    if (!cred) throw new Error("No credential returned");
    const finish_res = await apiClient.post(
      `/profile/passkeys/register/finish?session_id=${session_id}`,
      serialize_attestation(cred as PublicKeyCredential)
    );
    const raw = finish_res.data;
    return (raw.data ?? raw) as Passkey;
  },

  passkey_delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/profile/passkeys/${id}`);
  },

  // ── Action token – Telegram ─────────────────────────────────────────────

  action_challenge: async (action: ActionType): Promise<void> => {
    await apiClient.post("/auth/action-challenge", { action });
  },

  action_verify_telegram: async (action: ActionType, code: string): Promise<{ action_token: string }> => {
    const response = await apiClient.post("/auth/action-verify/telegram", { action, code });
    const raw = response.data;
    return (raw.data ?? raw) as { action_token: string };
  },

  // ── Action token – Passkey (full WebAuthn round-trip) ──────────────────

  verify_action_passkey: async (action: ActionType): Promise<{ action_token: string }> => {
    const begin_res = await apiClient.post("/auth/action-verify/passkey/begin", { action });
    const { session_id, assertion_options } = begin_res.data.data;
    const pk_opts = (assertion_options.publicKey ?? assertion_options) as Record<string, unknown>;
    const cred = await navigator.credentials.get({ publicKey: decode_assertion_options(pk_opts) });
    if (!cred) throw new Error("No credential returned");
    const finish_res = await apiClient.post("/auth/action-verify/passkey/finish", {
      action,
      session_id,
      ...serialize_assertion(cred as PublicKeyCredential),
    });
    const raw = finish_res.data;
    return (raw.data ?? raw) as { action_token: string };
  },
};
