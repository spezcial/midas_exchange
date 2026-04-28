import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Shield, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import type { TwoFAMethod } from "@/types";

type TelegramPhase = "sending" | "input" | "rate_limited";

export function TwoFactorStep() {
  const { t } = useTranslation();
  const pending_2fa_methods = useAuthStore((s) => s.pending_2fa_methods);
  const is_loading = useAuthStore((s) => s.is_loading);
  const send_2fa_telegram = useAuthStore((s) => s.send_2fa_telegram);
  const complete_2fa_telegram = useAuthStore((s) => s.complete_2fa_telegram);
  const complete_2fa_passkey = useAuthStore((s) => s.complete_2fa_passkey);
  const clear_2fa_state = useAuthStore((s) => s.clear_2fa_state);

  const only_one = pending_2fa_methods.length === 1;
  const [selected, set_selected] = useState<TwoFAMethod | null>(only_one ? pending_2fa_methods[0] : null);
  const [telegram_phase, set_telegram_phase] = useState<TelegramPhase | null>(null);
  const auto_triggered = useRef(false);
  const [otp, set_otp] = useState("");
  const [error, set_error] = useState("");
  const [session_expired, set_session_expired] = useState(false);

  const handle_send_telegram = async () => {
    set_telegram_phase("sending");
    set_error("");
    try {
      await send_2fa_telegram();
      set_telegram_phase("input");
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 429) {
        set_telegram_phase("rate_limited");
      } else if (status === 401) {
        set_session_expired(true);
        clear_2fa_state();
      } else {
        set_error(t("auth.2fa.sendFailed"));
        set_telegram_phase(null);
        set_selected(null);
      }
    }
  };

  const handle_telegram_verify = async () => {
    set_error("");
    try {
      await complete_2fa_telegram(otp.trim());
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        set_session_expired(true);
        clear_2fa_state();
      } else {
        set_error(t("auth.2fa.invalidCode"));
      }
    }
  };

  const handle_passkey = async () => {
    set_error("");
    try {
      await complete_2fa_passkey();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        set_session_expired(true);
        clear_2fa_state();
      } else {
        set_error(t("auth.2fa.passkeyFailed"));
      }
    }
  };

  useEffect(() => {
    if (auto_triggered.current) return;
    auto_triggered.current = true;
    if (only_one && pending_2fa_methods[0] === "passkey") handle_passkey();
    if (only_one && pending_2fa_methods[0] === "telegram") handle_send_telegram();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (session_expired) {
    return (
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <p className="text-sm text-red-600">{t("auth.2fa.sessionExpired")}</p>
            <Button variant="outline" onClick={clear_2fa_state}>
              {t("auth.2fa.back")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Method selector
  if (!selected) {
    return (
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">{t("auth.2fa.title")}</h2>
          <p className="mt-2 text-sm text-gray-600">{t("auth.2fa.chooseMethod")}</p>
        </div>
        <Card>
          <CardContent className="p-6 space-y-3">
            {error && <p className="text-sm text-red-600">{error}</p>}
            {pending_2fa_methods.includes("telegram") && (
              <Button className="w-full" size="lg" onClick={() => { set_selected("telegram"); handle_send_telegram(); }}>
                {t("auth.2fa.useTelegram")}
              </Button>
            )}
            {pending_2fa_methods.includes("passkey") && (
              <Button variant="outline" className="w-full" size="lg" onClick={() => { set_selected("passkey"); handle_passkey(); }}>
                <KeyRound className="mr-2 h-4 w-4" />
                {t("auth.2fa.usePasskey")}
              </Button>
            )}
            <Button variant="ghost" className="w-full" onClick={clear_2fa_state}>
              {t("auth.2fa.back")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Passkey flow
  if (selected === "passkey") {
    return (
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary flex items-center justify-center">
            <KeyRound className="h-6 w-6 text-primary-foreground" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">{t("auth.2fa.title")}</h2>
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button className="w-full" size="lg" onClick={handle_passkey} disabled={is_loading}>
              {is_loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
              {t("auth.2fa.passkeyBtn")}
            </Button>
            {pending_2fa_methods.includes("telegram") && (
              <Button variant="ghost" className="w-full text-sm" onClick={() => { set_selected("telegram"); handle_send_telegram(); }}>
                {t("auth.2fa.useTelegram")}
              </Button>
            )}
            <Button variant="ghost" className="w-full" onClick={clear_2fa_state}>
              {t("auth.2fa.back")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Telegram — sending OTP
  if (telegram_phase === "sending") {
    return (
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">{t("auth.2fa.title")}</h2>
        </div>
        <Card>
          <CardContent className="p-6 flex items-center justify-center gap-3 py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t("auth.2fa.sending")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Telegram — rate limited
  if (telegram_phase === "rate_limited") {
    return (
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">{t("auth.2fa.title")}</h2>
        </div>
        <Card>
          <CardContent className="p-6 space-y-4 text-center">
            <p className="text-sm text-red-600">{t("auth.2fa.rateLimited")}</p>
            <Button variant="outline" className="w-full" onClick={handle_send_telegram}>
              {t("auth.2fa.resend")}
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => { set_selected(null); set_telegram_phase(null); }}>
              {t("auth.2fa.back")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Telegram — OTP input
  return (
    <div className="max-w-md w-full space-y-8">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-primary flex items-center justify-center">
          <Shield className="h-6 w-6 text-primary-foreground" />
        </div>
        <h2 className="mt-6 text-3xl font-bold text-gray-900">{t("auth.2fa.title")}</h2>
        <p className="mt-2 text-sm text-gray-600">{t("auth.2fa.subtitle")}</p>
      </div>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="otp">{t("auth.2fa.code")}</Label>
            <Input
              id="otp"
              inputMode="numeric"
              maxLength={6}
              placeholder={t("auth.2fa.codePlaceholder")}
              value={otp}
              onChange={(e) => { set_otp(e.target.value.replace(/\D/g, "")); set_error(""); }}
              disabled={is_loading}
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>
          <Button
            className="w-full"
            size="lg"
            onClick={handle_telegram_verify}
            disabled={is_loading || otp.length !== 6}
          >
            {is_loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {is_loading ? t("auth.2fa.verifying") : t("auth.2fa.submit")}
          </Button>
          <Button variant="ghost" className="w-full text-sm" onClick={handle_send_telegram} disabled={is_loading}>
            {t("auth.2fa.resend")}
          </Button>
          {pending_2fa_methods.includes("passkey") && (
            <Button variant="ghost" className="w-full text-sm" onClick={() => { set_selected("passkey"); handle_passkey(); }}>
              <KeyRound className="mr-2 h-4 w-4" />
              {t("auth.2fa.usePasskey")}
            </Button>
          )}
          <Button variant="ghost" className="w-full" onClick={clear_2fa_state}>
            {t("auth.2fa.back")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
