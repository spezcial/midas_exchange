import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, KeyRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { twoFactorService } from "@/api/services/twoFactorService";
import type { ActionType } from "@/types";

interface ActionVerifyModalProps {
  is_open: boolean;
  action: ActionType;
  on_verified: (action_token: string) => void;
  on_close: () => void;
}

type Method = "telegram" | "passkey";

export function ActionVerifyModal({ is_open, action, on_verified, on_close }: ActionVerifyModalProps) {
  const { t } = useTranslation();

  const [method, set_method] = useState<Method>("telegram");
  const [otp, set_otp] = useState("");
  const [error, set_error] = useState("");
  const [is_loading, set_is_loading] = useState(false);
  const [challenge_sent, set_challenge_sent] = useState(false);

  // Request OTP challenge on open
  useEffect(() => {
    if (!is_open) return;
    set_otp("");
    set_error("");
    set_challenge_sent(false);
    set_method("telegram");
    send_challenge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [is_open]);

  const send_challenge = async () => {
    set_is_loading(true);
    set_error("");
    try {
      await twoFactorService.action_challenge(action);
      set_challenge_sent(true);
      set_method("telegram");
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        // No phone – go straight to passkey
        set_method("passkey");
        set_challenge_sent(true);
      } else {
        set_error(t("actionVerify.challengeFailed"));
      }
    } finally {
      set_is_loading(false);
    }
  };

  const handle_telegram = async () => {
    set_error("");
    set_is_loading(true);
    try {
      const { action_token } = await twoFactorService.action_verify_telegram(action, otp.trim());
      on_verified(action_token);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 422) {
        set_error(t("actionVerify.invalidCode"));
      } else {
        set_error(t("actionVerify.invalidCode"));
      }
    } finally {
      set_is_loading(false);
    }
  };

  const handle_passkey = async () => {
    set_error("");
    set_is_loading(true);
    try {
      const { action_token } = await twoFactorService.verify_action_passkey(action);
      on_verified(action_token);
    } catch {
      set_error(t("actionVerify.passkeyFailed"));
    } finally {
      set_is_loading(false);
    }
  };

  const switch_to_passkey = () => {
    set_method("passkey");
    set_error("");
  };

  const switch_to_telegram = async () => {
    set_method("telegram");
    set_error("");
    if (!challenge_sent) {
      await send_challenge();
    }
  };

  return (
    <Dialog open={is_open} onOpenChange={(open) => { if (!open) on_close(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t(`actionVerify.actions.${action}`)}</DialogTitle>
          <DialogDescription>
            {method === "telegram" ? t("actionVerify.subtitle") : t("actionVerify.passkeySubtitle")}
          </DialogDescription>
        </DialogHeader>

        {!challenge_sent && is_loading && (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {challenge_sent && (
          <div className="space-y-4 pt-2">
            {error && <p className="text-sm text-red-600">{error}</p>}

            {method === "telegram" && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="av-otp">{t("actionVerify.code")}</Label>
                  <Input
                    id="av-otp"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder={t("actionVerify.codePlaceholder")}
                    value={otp}
                    onChange={(e) => { set_otp(e.target.value.replace(/\D/g, "")); set_error(""); }}
                    disabled={is_loading}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handle_telegram}
                  disabled={is_loading || otp.length !== 6}
                >
                  {is_loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {is_loading ? t("actionVerify.verifying") : t("actionVerify.submit")}
                </Button>
                <Button variant="ghost" className="w-full text-sm" onClick={switch_to_passkey}>
                  <KeyRound className="mr-2 h-4 w-4" />
                  {t("actionVerify.usePasskey")}
                </Button>
              </>
            )}

            {method === "passkey" && (
              <>
                <Button className="w-full" onClick={handle_passkey} disabled={is_loading}>
                  {is_loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <KeyRound className="mr-2 h-4 w-4" />
                  )}
                  {t("actionVerify.passkeyBtn")}
                </Button>
                <Button variant="ghost" className="w-full text-sm" onClick={switch_to_telegram}>
                  {t("actionVerify.useTelegram")}
                </Button>
              </>
            )}

            <Button variant="outline" className="w-full" onClick={on_close} disabled={is_loading}>
              {t("common.cancel")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
