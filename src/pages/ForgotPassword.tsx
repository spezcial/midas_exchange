import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/api/services/authService";
import toast from "react-hot-toast";

type Step = 1 | 2 | 3;

export function ForgotPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [step, set_step] = useState<Step>(1);
  const [is_loading, set_is_loading] = useState(false);

  // Step 1
  const [email, set_email] = useState("");

  // Step 2
  const [phone, set_phone] = useState("");
  const [otp, set_otp] = useState("");
  const [step2_error, set_step2_error] = useState("");

  // Step 3
  const [reset_token, set_reset_token] = useState("");
  const [new_password, set_new_password] = useState("");
  const [confirm_password, set_confirm_password] = useState("");
  const [step3_error, set_step3_error] = useState("");

  const handle_step1 = async () => {
    set_is_loading(true);
    try {
      await authService.forgot_password_send(email.trim());
      set_step(2);
    } catch {
      // Always show generic message — never reveal if email exists
      set_step(2);
    } finally {
      set_is_loading(false);
    }
  };

  const handle_step2 = async () => {
    set_step2_error("");
    set_is_loading(true);
    try {
      const { reset_token: token } = await authService.forgot_password_verify(phone.trim(), otp.trim());
      set_reset_token(token);
      set_step(3);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 422) {
        set_step2_error(t("auth.forgotPassword.step2.invalidCode"));
      } else {
        set_step2_error(t("auth.forgotPassword.step2.invalidCode"));
      }
    } finally {
      set_is_loading(false);
    }
  };

  const handle_step3 = async () => {
    set_step3_error("");
    if (new_password !== confirm_password) {
      set_step3_error(t("auth.forgotPassword.step3.mismatch"));
      return;
    }
    set_is_loading(true);
    try {
      await authService.forgot_password_reset(reset_token, new_password);
      toast.success(t("auth.forgotPassword.success"));
      navigate("/login");
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 422) {
        set_step3_error(t("auth.forgotPassword.step3.tokenExpired"));
      } else {
        set_step3_error(t("auth.forgotPassword.step3.tokenExpired"));
      }
    } finally {
      set_is_loading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-primary flex items-center justify-center">
          <Shield className="h-6 w-6 text-primary-foreground" />
        </div>
        <h2 className="mt-6 text-3xl font-bold text-gray-900">{t("auth.forgotPassword.title")}</h2>

        {/* Step indicator */}
        <div className="mt-4 flex justify-center gap-2">
          {([1, 2, 3] as Step[]).map((s) => (
            <div
              key={s}
              className={`h-2 w-8 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-gray-200"}`}
            />
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {/* ── Step 1: email ───────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">{t("auth.forgotPassword.step1.subtitle")}</p>
              <div className="space-y-1.5">
                <Label htmlFor="fp-email">{t("auth.forgotPassword.step1.email")}</Label>
                <Input
                  id="fp-email"
                  type="email"
                  value={email}
                  onChange={(e) => set_email(e.target.value)}
                  placeholder="your@email.com"
                  disabled={is_loading}
                />
              </div>
              <Button className="w-full" size="lg" onClick={handle_step1} disabled={is_loading || !email.trim()}>
                {is_loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {is_loading ? t("auth.forgotPassword.step1.sending") : t("auth.forgotPassword.step1.submit")}
              </Button>
            </div>
          )}

          {/* ── Step 2: phone + OTP ─────────────────────────── */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">{t("auth.forgotPassword.step1.sent")}</p>
              <p className="text-sm text-gray-600">{t("auth.forgotPassword.step2.subtitle")}</p>
              <div className="space-y-1.5">
                <Label htmlFor="fp-phone">{t("auth.forgotPassword.step2.phone")}</Label>
                <Input
                  id="fp-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => set_phone(e.target.value)}
                  placeholder="+77001234567"
                  disabled={is_loading}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fp-otp">{t("auth.forgotPassword.step2.code")}</Label>
                <Input
                  id="fp-otp"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => { set_otp(e.target.value.replace(/\D/g, "")); set_step2_error(""); }}
                  placeholder="000000"
                  disabled={is_loading}
                />
                {step2_error && <p className="text-xs text-red-600">{step2_error}</p>}
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handle_step2}
                disabled={is_loading || !phone.trim() || otp.length !== 6}
              >
                {is_loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {is_loading ? t("auth.forgotPassword.step2.verifying") : t("auth.forgotPassword.step2.submit")}
              </Button>
            </div>
          )}

          {/* ── Step 3: new password ────────────────────────── */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">{t("auth.forgotPassword.step3.subtitle")}</p>
              <div className="space-y-1.5">
                <Label htmlFor="fp-new-pw">{t("auth.forgotPassword.step3.newPassword")}</Label>
                <Input
                  id="fp-new-pw"
                  type="password"
                  value={new_password}
                  onChange={(e) => set_new_password(e.target.value)}
                  placeholder="••••••••"
                  disabled={is_loading}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fp-confirm-pw">{t("auth.forgotPassword.step3.confirmPassword")}</Label>
                <Input
                  id="fp-confirm-pw"
                  type="password"
                  value={confirm_password}
                  onChange={(e) => { set_confirm_password(e.target.value); set_step3_error(""); }}
                  placeholder="••••••••"
                  disabled={is_loading}
                />
                {step3_error && <p className="text-xs text-red-600">{step3_error}</p>}
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handle_step3}
                disabled={is_loading || !new_password || !confirm_password}
              >
                {is_loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {is_loading ? t("auth.forgotPassword.step3.resetting") : t("auth.forgotPassword.step3.submit")}
              </Button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm font-medium text-primary hover:underline">
              {t("auth.forgotPassword.backToLogin")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
