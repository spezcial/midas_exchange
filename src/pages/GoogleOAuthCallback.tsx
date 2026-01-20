import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2, AlertCircle, Mail } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

type ErrorType = "generic" | "email_registered" | null;

export function GoogleOAuthCallback() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const complete_google_login = useAuthStore((state) => state.complete_google_login);
  const is_authenticated = useAuthStore((state) => state.is_authenticated);
  const user = useAuthStore((state) => state.user);

  const [error, setError] = useState<string | null>(null);
  const [error_type, setErrorType] = useState<ErrorType>(null);
  const [is_processing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const error_param = searchParams.get("error");
      const stored_state = sessionStorage.getItem("oauth_state");

      // Clear stored state
      sessionStorage.removeItem("oauth_state");

      // Check for error from Google
      if (error_param) {
        setError(t("auth.google.errorFromGoogle"));
        setErrorType("generic");
        setIsProcessing(false);
        return;
      }

      // Validate state to prevent CSRF
      if (!state || state !== stored_state) {
        setError(t("auth.google.invalidState"));
        setErrorType("generic");
        setIsProcessing(false);
        return;
      }

      if (!code) {
        setError(t("auth.google.noCode"));
        setErrorType("generic");
        setIsProcessing(false);
        return;
      }

      try {
        await complete_google_login(code, state);
      } catch (err: unknown) {
        const api_error = err as { response?: { data?: { error?: string } } };
        const error_message = api_error?.response?.data?.error || "";

        // Check if it's the "email already registered" error
        if (error_message.toLowerCase().includes("email already registered")) {
          setError(t("auth.google.emailAlreadyRegistered"));
          setErrorType("email_registered");
        } else {
          setError(error_message || t("auth.google.authFailed"));
          setErrorType("generic");
        }
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, complete_google_login, t]);

  // Redirect to appropriate page after successful authentication
  useEffect(() => {
    if (is_authenticated && user) {
      if (user.role === "admin") {
        navigate("/admin/exchanges", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [is_authenticated, user, navigate]);

  // Special view for "email already registered" error
  if (error_type === "email_registered") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-amber-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {t("auth.google.emailRegisteredTitle")}
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button asChild className="w-full">
              <Link to="/login">{t("auth.google.loginWithPassword")}</Link>
            </Button>
            <p className="mt-4 text-sm text-gray-500">
              {t("auth.google.emailRegisteredHint")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Generic error view
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {t("auth.google.errorTitle")}
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button asChild className="w-full">
              <Link to="/login">{t("auth.google.backToLogin")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-6 text-center">
          {is_processing && (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-gray-600">{t("auth.google.authenticating")}</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
