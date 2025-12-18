import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuthStore } from "@/store/authStore";

type RegisterFormValues = {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  confirm_password: string;
  referral_code?: string;
  agree_to_terms: boolean;
};

export function Register() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const register = useAuthStore((state) => state.register);
  const is_loading = useAuthStore((state) => state.is_loading);

  const register_schema = z.object({
    email: z
      .string()
      .min(1, t("errors.required"))
      .email(t("errors.email")),
    first_name: z.string(),
    last_name: z.string(),
    password: z
      .string()
      .min(8, t("errors.passwordMinLength"))
      .regex(/[A-Z]/, t("errors.passwordUppercase"))
      .regex(/[0-9]/, t("errors.passwordNumber")),
    confirm_password: z.string(),
    referral_code: z.string().optional(),
    agree_to_terms: z.boolean().refine(val => val === true, {
      message: t("errors.termsRequired"),
    }),
  }).refine((data) => data.password === data.confirm_password, {
    message: t("errors.passwordMatch"),
    path: ["confirm_password"],
  });

  const [show_password, set_show_password] = useState(false);
  const [show_confirm_password, set_show_confirm_password] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(register_schema),
    defaultValues: {
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      confirm_password: "",
      referral_code: searchParams.get("ref") || "",
      agree_to_terms: false,
    },
  });

  const on_submit = async (values: RegisterFormValues) => {
    try {
      await register(values.email, values.first_name, values.last_name, values.password, values.referral_code);
      // No manual navigation needed - PublicRoute will redirect automatically
    } catch (error) {
      // Error is already handled by the store and toast
      console.error("Registration failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {t("auth.register.title")}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t("auth.register.subtitle")}
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
                      <FormLabel>{t("auth.register.email")}</FormLabel>
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
                    name="first_name"
                    render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("auth.register.first_name")}</FormLabel>
                          <FormControl>
                            <Input
                                placeholder=""
                                type="text"
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
                    name="last_name"
                    render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("auth.register.last_name")}</FormLabel>
                          <FormControl>
                            <Input
                                placeholder=""
                                type="text"
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
                      <FormLabel>{t("auth.register.password")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="••••••••"
                            type={show_password ? "text" : "password"}
                            autoComplete="new-password"
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
                      <FormDescription>
                        {t("auth.register.passwordRequirements")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirm_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("auth.register.confirmPassword")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="••••••••"
                            type={show_confirm_password ? "text" : "password"}
                            autoComplete="new-password"
                            disabled={is_loading}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => set_show_confirm_password(!show_confirm_password)}
                            disabled={is_loading}
                          >
                            {show_confirm_password ? (
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

                {/*<FormField
                  control={form.control}
                  name="referral_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("auth.register.referralCode")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ABC123XYZ"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />*/}

                <FormField
                  control={form.control}
                  name="agree_to_terms"
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
                          {t("auth.register.terms")}{" "}
                          <Link
                            to="/terms"
                            className="text-primary hover:underline"
                          >
                            {t("auth.register.termsText")}
                          </Link>{" "}
                          {t("auth.register.andText")}{" "}
                          <Link
                            to="/privacy"
                            className="text-primary hover:underline"
                          >
                            {t("auth.register.privacyText")}
                          </Link>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={is_loading}
                >
                  {is_loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("auth.register.submit")}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {t("auth.register.haveAccount")}{" "}
                <Link
                  to="/login"
                  className="font-medium text-primary hover:underline"
                >
                  {t("auth.register.login")}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}