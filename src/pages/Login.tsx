import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuthStore } from "@/store/authStore";

type LoginFormValues = {
  email: string;
  password: string;
  remember_me?: boolean;
};

export function Login() {
  const { t } = useTranslation();
  const login = useAuthStore((state) => state.login);
  const is_loading = useAuthStore((state) => state.is_loading);

  const login_schema = z.object({
    email: z
      .string()
      .min(1, t("errors.required"))
      .email(t("errors.email")),
    password: z.string().min(1, t("errors.required")),
    remember_me: z.boolean().optional(),
  });

  const [show_password, set_show_password] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(login_schema),
    defaultValues: {
      email: "",
      password: "",
      remember_me: false,
    },
  });

  const on_submit = async (values: LoginFormValues) => {
    try {
      await login(values.email, values.password, values.remember_me ? values.remember_me : false);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-primary flex items-center justify-center">
          <Shield className="h-6 w-6 text-primary-foreground" />
        </div>
        <h2 className="mt-6 text-3xl font-bold text-gray-900">{t("auth.login.title")}</h2>
        <p className="mt-2 text-sm text-gray-600">
          {t("auth.login.subtitle")}
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(on_submit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth.login.email")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="your@email.com"
                        type="email"
                        autoComplete="email"
                        disabled={is_loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth.login.password")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="••••••••"
                          type={show_password ? "text" : "password"}
                          autoComplete="current-password"
                          disabled={is_loading}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => set_show_password(!show_password)}
                          disabled={is_loading}
                        >
                          {show_password ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="remember_me"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={is_loading}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">
                          {t("auth.login.rememberMe")}
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {t("auth.login.forgotPassword")}
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={is_loading}
              >
                {is_loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t("auth.login.submit")}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t("auth.login.noAccount")}{" "}
              <Link
                to="/register"
                className="font-medium text-primary hover:underline"
              >
                {t("auth.login.register")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
