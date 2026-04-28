import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import { userService } from "@/api/services/userService";
import { twoFactorService } from "@/api/services/twoFactorService";
import { ActionVerifyModal } from "@/components/modals/ActionVerifyModal";
import toast from "react-hot-toast";
import { User, Mail, Phone, Shield, KeyRound, Fingerprint, Trash2, Plus, CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Passkey } from "@/types";

type PhoneStep = "idle" | "send" | "verify";

export function Profile() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const update_user = useAuthStore((state) => state.update_user);

  // ── Profile form ────────────────────────────────────────────────────────
  const [is_profile_submitting, set_is_profile_submitting] = useState(false);
  const [profile_form, set_profile_form] = useState({
    first_name: "",
    last_name: "",
    middle_name: "",
  });

  useEffect(() => {
    if (user) {
      set_profile_form({
        first_name: (user as any).first_name || "",
        last_name: (user as any).last_name || "",
        middle_name: (user as any).middle_name || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handle_profile_submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      set_is_profile_submitting(true);
      const updated = await userService.update_profile({
        first_name: profile_form.first_name || undefined,
        last_name: profile_form.last_name || undefined,
        middle_name: profile_form.middle_name || undefined,
      });
      set_profile_form({
        first_name: (updated as any).first_name || "",
        last_name: (updated as any).last_name || "",
        middle_name: (updated as any).middle_name || "",
      });
      update_user(updated as any);
      toast.success(t("profile.updateSuccess"));
    } catch {
      toast.error(t("profile.updateFailed"));
    } finally {
      set_is_profile_submitting(false);
    }
  };

  // ── Change password (action-token gated) ───────────────────────────────
  const [is_password_submitting, set_is_password_submitting] = useState(false);
  const [show_pw_verify, set_show_pw_verify] = useState(false);
  const [password_form, set_password_form] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const handle_password_submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password_form.new_password !== password_form.confirm_password) {
      toast.error(t("profile.passwordMismatch"));
      return;
    }
    set_show_pw_verify(true);
  };

  const on_pw_verified = async (action_token: string) => {
    set_show_pw_verify(false);
    set_is_password_submitting(true);
    try {
      await userService.change_password({
        current_password: password_form.current_password,
        new_password: password_form.new_password,
        action_token,
      });
      set_password_form({ current_password: "", new_password: "", confirm_password: "" });
      toast.success(t("profile.passwordChanged"));
    } catch {
      toast.error(t("profile.passwordFailed"));
    } finally {
      set_is_password_submitting(false);
    }
  };

  // ── Phone management ────────────────────────────────────────────────────
  const [phone_step, set_phone_step] = useState<PhoneStep>("idle");
  const [phone_input, set_phone_input] = useState("");
  const [phone_otp, set_phone_otp] = useState("");
  const [phone_loading, set_phone_loading] = useState(false);
  const [phone_error, set_phone_error] = useState("");

  const handle_phone_send = async () => {
    set_phone_error("");
    set_phone_loading(true);
    try {
      await twoFactorService.phone_send_otp(phone_input.trim());
      set_phone_step("verify");
      toast.success(t("profile.phone.codeSent"));
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 429) {
        set_phone_error(t("profile.phone.rateLimited"));
      } else if (status === 400) {
        set_phone_error(t("profile.phone.alreadyInUse"));
      } else {
        set_phone_error(t("profile.phone.rateLimited"));
      }
    } finally {
      set_phone_loading(false);
    }
  };

  const handle_phone_verify = async () => {
    set_phone_error("");
    set_phone_loading(true);
    try {
      await twoFactorService.phone_verify(phone_input.trim(), phone_otp.trim());
      update_user({ phone: phone_input.trim(), phone_verified: true, two_factor_enabled: true });
      set_phone_step("idle");
      set_phone_input("");
      set_phone_otp("");
      toast.success(t("profile.phone.verified_toast"));
    } catch {
      set_phone_error(t("profile.phone.invalidCode"));
    } finally {
      set_phone_loading(false);
    }
  };

  const handle_phone_remove = async () => {
    set_phone_loading(true);
    try {
      await twoFactorService.phone_remove();
      update_user({ phone: undefined, phone_verified: false, two_factor_enabled: false });
      toast.success(t("profile.phone.removed_toast"));
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        toast.error(t("profile.phone.removeBlocked"));
      } else {
        toast.error(t("profile.phone.removeFailed"));
      }
    } finally {
      set_phone_loading(false);
    }
  };

  // ── Passkey management ──────────────────────────────────────────────────
  const [passkeys, set_passkeys] = useState<Passkey[]>([]);
  const [passkeys_loading, set_passkeys_loading] = useState(false);
  const [show_add_passkey, set_show_add_passkey] = useState(false);
  const [passkey_name, set_passkey_name] = useState("");
  const [passkey_registering, set_passkey_registering] = useState(false);
  const passkeys_fetched = useRef(false);

  useEffect(() => {
    if (passkeys_fetched.current) return;
    passkeys_fetched.current = true;
    load_passkeys();
  }, []);

  const load_passkeys = async (): Promise<Passkey[]> => {
    set_passkeys_loading(true);
    try {
      const list = await twoFactorService.passkeys_list();
      set_passkeys(list);
      return list;
    } catch {
      return passkeys;
    } finally {
      set_passkeys_loading(false);
    }
  };

  const handle_register_passkey = async () => {
    set_passkey_registering(true);
    try {
      await twoFactorService.register_passkey(passkey_name.trim() || "My device");
      toast.success(t("profile.passkeys.added"));
      set_show_add_passkey(false);
      set_passkey_name("");
      update_user({ passkey_enabled: true });
      await load_passkeys();
    } catch {
      toast.error(t("profile.passkeys.registrationFailed"));
    } finally {
      set_passkey_registering(false);
    }
  };

  const handle_delete_passkey = async (id: number) => {
    try {
      await twoFactorService.passkey_delete(id);
      toast.success(t("profile.passkeys.deleted"));
      const remaining = await load_passkeys();
      update_user({ passkey_enabled: remaining.length > 0 });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        toast.error(t("profile.passkeys.deleteBlocked"));
      } else {
        toast.error(t("profile.passkeys.deleteBlocked"));
      }
    }
  };

  // ── KYC badge ──────────────────────────────────────────────────────────
  const kyc_labels: Record<number, { label: string; className: string }> = {
    0: { label: "Level 0", className: "bg-gray-100 text-gray-800" },
    1: { label: "Level 1", className: "bg-blue-100 text-blue-800" },
    2: { label: "Level 2", className: "bg-green-100 text-green-800" },
    3: { label: "Level 3", className: "bg-purple-100 text-purple-800" },
  };
  const kyc_level = (user as any)?.kyc_level ?? 0;
  const kyc = kyc_labels[kyc_level] ?? kyc_labels[0];

  const current_phone: string | undefined = (user as any)?.phone;
  const phone_verified: boolean = (user as any)?.phone_verified ?? false;
  const two_factor_enabled: boolean = (user as any)?.two_factor_enabled ?? false;
  const passkey_enabled: boolean = (user as any)?.passkey_enabled ?? false;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900">{t("nav.profile")}</h1>

      {/* ── 2FA setup required banner ─────────────────────────────────── */}
      {!two_factor_enabled && !passkey_enabled && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">{t("profile.2faSetup.title")}</p>
            <p className="text-sm text-amber-700 mt-0.5">{t("profile.2faSetup.subtitle")}</p>
          </div>
        </div>
      )}

      {/* ── Account info ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{t("profile.accountInfo")}</h2>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="text-gray-500 w-24">{t("profile.email")}</span>
            <span className="font-medium text-gray-900">{user?.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Shield className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="text-gray-500 w-24">{t("profile.kycLevel")}</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${kyc.className}`}>
              {kyc.label}
            </span>
          </div>
        </div>

        <form onSubmit={handle_profile_submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="first_name">{t("profile.firstName")}</Label>
              <Input
                id="first_name"
                value={profile_form.first_name}
                onChange={(e) => set_profile_form((prev) => ({ ...prev, first_name: e.target.value }))}
                placeholder={t("profile.firstNamePlaceholder")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="last_name">{t("profile.lastName")}</Label>
              <Input
                id="last_name"
                value={profile_form.last_name}
                onChange={(e) => set_profile_form((prev) => ({ ...prev, last_name: e.target.value }))}
                placeholder={t("profile.lastNamePlaceholder")}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="middle_name">
              {t("profile.middleName")}
              <span className="ml-1 text-xs text-gray-400">({t("common.optional")})</span>
            </Label>
            <Input
              id="middle_name"
              value={profile_form.middle_name}
              onChange={(e) => set_profile_form((prev) => ({ ...prev, middle_name: e.target.value }))}
              placeholder={t("profile.middleNamePlaceholder")}
            />
          </div>
          <Button type="submit" disabled={is_profile_submitting}>
            {is_profile_submitting ? t("common.saving") : t("profile.saveChanges")}
          </Button>
        </form>
      </div>

      {/* ── Phone number ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center">
            <Phone className="h-5 w-5 text-green-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{t("profile.phone.section")}</h2>
        </div>

        {phone_step === "idle" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                {current_phone ? (
                  <>
                    <span className="font-medium text-gray-900">{current_phone}</span>
                    {phone_verified ? (
                      <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                        <CheckCircle className="h-3.5 w-3.5" />
                        {t("profile.phone.verified")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-medium">
                        <XCircle className="h-3.5 w-3.5" />
                        {t("profile.phone.unverified")}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-gray-400">{t("profile.phone.noPhone")}</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { set_phone_step("send"); set_phone_input(current_phone || ""); }}
                >
                  {current_phone ? t("profile.phone.change") : t("profile.phone.add")}
                </Button>
                {current_phone && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handle_phone_remove}
                    disabled={phone_loading}
                  >
                    {phone_loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("profile.phone.remove")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {phone_step === "send" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone-input">{t("profile.phone.newPhone")}</Label>
              <Input
                id="phone-input"
                type="tel"
                value={phone_input}
                onChange={(e) => { set_phone_input(e.target.value); set_phone_error(""); }}
                placeholder="+77001234567"
                disabled={phone_loading}
              />
              {phone_error && <p className="text-xs text-red-600">{phone_error}</p>}
            </div>
            <div className="flex gap-2">
              <Button onClick={handle_phone_send} disabled={phone_loading || !phone_input.trim()}>
                {phone_loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {phone_loading ? t("profile.phone.sending") : t("profile.phone.sendCode")}
              </Button>
              <Button variant="outline" onClick={() => { set_phone_step("idle"); set_phone_error(""); }}>
                {t("common.cancel")}
              </Button>
            </div>
          </div>
        )}

        {phone_step === "verify" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {t("profile.phone.codeSentTo", { phone: phone_input })}
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="phone-otp">{t("profile.phone.otp")}</Label>
              <Input
                id="phone-otp"
                inputMode="numeric"
                maxLength={6}
                value={phone_otp}
                onChange={(e) => { set_phone_otp(e.target.value.replace(/\D/g, "")); set_phone_error(""); }}
                placeholder={t("profile.phone.otpPlaceholder")}
                disabled={phone_loading}
              />
              {phone_error && <p className="text-xs text-red-600">{phone_error}</p>}
            </div>
            <div className="flex gap-2">
              <Button onClick={handle_phone_verify} disabled={phone_loading || phone_otp.length !== 6}>
                {phone_loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {phone_loading ? t("profile.phone.verifying") : t("profile.phone.verify")}
              </Button>
              <Button variant="outline" onClick={() => { set_phone_step("send"); set_phone_otp(""); set_phone_error(""); }}>
                {t("common.back")}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Passkeys ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-purple-50 rounded-full flex items-center justify-center">
              <Fingerprint className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t("profile.passkeys.section")}</h2>
              <p className="text-xs text-gray-400">{t("profile.passkeys.subtitle")}</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={() => set_show_add_passkey(true)}>
            <Plus className="mr-1 h-4 w-4" />
            {t("profile.passkeys.add")}
          </Button>
        </div>

        {passkeys_loading && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!passkeys_loading && passkeys.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">{t("profile.passkeys.empty")}</p>
        )}

        {!passkeys_loading && passkeys.length > 0 && (
          <ul className="space-y-2">
            {passkeys.map((pk) => (
              <li key={pk.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{pk.name}</p>
                  <p className="text-xs text-gray-400">{new Date(pk.created_at).toLocaleDateString()}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => handle_delete_passkey(pk.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        {show_add_passkey && (
          <div className="mt-4 space-y-3 border-t pt-4">
            <div className="space-y-1.5">
              <Label htmlFor="passkey-name">{t("profile.passkeys.nameLabel")}</Label>
              <Input
                id="passkey-name"
                value={passkey_name}
                onChange={(e) => set_passkey_name(e.target.value)}
                placeholder={t("profile.passkeys.namePlaceholder")}
                disabled={passkey_registering}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handle_register_passkey} disabled={passkey_registering}>
                {passkey_registering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {passkey_registering ? t("profile.passkeys.registering") : t("profile.passkeys.register")}
              </Button>
              <Button variant="outline" onClick={() => { set_show_add_passkey(false); set_passkey_name(""); }}>
                {t("common.cancel")}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Change password ───────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center">
            <KeyRound className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{t("profile.changePassword")}</h2>
        </div>

        <form onSubmit={handle_password_submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="current_password">{t("profile.currentPassword")}</Label>
            <Input
              id="current_password"
              type="password"
              value={password_form.current_password}
              onChange={(e) => set_password_form((prev) => ({ ...prev, current_password: e.target.value }))}
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new_password">{t("profile.newPassword")}</Label>
            <Input
              id="new_password"
              type="password"
              value={password_form.new_password}
              onChange={(e) => set_password_form((prev) => ({ ...prev, new_password: e.target.value }))}
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm_password">{t("profile.confirmPassword")}</Label>
            <Input
              id="confirm_password"
              type="password"
              value={password_form.confirm_password}
              onChange={(e) => set_password_form((prev) => ({ ...prev, confirm_password: e.target.value }))}
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" disabled={is_password_submitting}>
            {is_password_submitting ? t("common.saving") : t("profile.changePasswordBtn")}
          </Button>
        </form>
      </div>

      {/* Action-token verify modal for password change */}
      <ActionVerifyModal
        is_open={show_pw_verify}
        action="change_password"
        on_verified={on_pw_verified}
        on_close={() => set_show_pw_verify(false)}
      />
    </div>
  );
}
