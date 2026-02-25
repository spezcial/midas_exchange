import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import { userService } from "@/api/services/userService";
import toast from "react-hot-toast";
import { User, Mail, Phone, Shield, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Profile() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const update_user = useAuthStore((state) => state.update_user);

  const [is_profile_submitting, set_is_profile_submitting] = useState(false);
  const [is_password_submitting, set_is_password_submitting] = useState(false);

  const [profile_form, set_profile_form] = useState({
    first_name: "",
    last_name: "",
    middle_name: "",
    phone: "",
  });

  const [password_form, set_password_form] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    if (user) {
      set_profile_form({
        first_name: (user as any).first_name || "",
        last_name: (user as any).last_name || "",
        middle_name: (user as any).middle_name || "",
        phone: (user as any).phone || "",
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
        phone: profile_form.phone || undefined,
      });
      set_profile_form({
        first_name: (updated as any).first_name || "",
        last_name: (updated as any).last_name || "",
        middle_name: (updated as any).middle_name || "",
        phone: (updated as any).phone || "",
      });
      update_user(updated as any);
      toast.success(t("profile.updateSuccess") || "Profile updated");
    } catch {
      toast.error(t("profile.updateFailed") || "Failed to update profile");
    } finally {
      set_is_profile_submitting(false);
    }
  };

  const handle_password_submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password_form.new_password !== password_form.confirm_password) {
      toast.error(t("profile.passwordMismatch") || "Passwords do not match");
      return;
    }
    try {
      set_is_password_submitting(true);
      await userService.change_password({
        current_password: password_form.current_password,
        new_password: password_form.new_password,
      });
      set_password_form({ current_password: "", new_password: "", confirm_password: "" });
      toast.success(t("profile.passwordChanged") || "Password changed");
    } catch {
      toast.error(t("profile.passwordFailed") || "Failed to change password");
    } finally {
      set_is_password_submitting(false);
    }
  };

  const kyc_labels: Record<number, { label: string; className: string }> = {
    0: { label: "Level 0", className: "bg-gray-100 text-gray-800" },
    1: { label: "Level 1", className: "bg-blue-100 text-blue-800" },
    2: { label: "Level 2", className: "bg-green-100 text-green-800" },
    3: { label: "Level 3", className: "bg-purple-100 text-purple-800" },
  };

  const kyc_level = (user as any)?.kyc_level ?? 0;
  const kyc = kyc_labels[kyc_level] ?? kyc_labels[0];

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900">
        {t("nav.profile") || "Profile"}
      </h1>

      {/* Account info */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            {t("profile.accountInfo") || "Account Information"}
          </h2>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="text-gray-500 w-24">{t("profile.email") || "Email"}</span>
            <span className="font-medium text-gray-900">{user?.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Shield className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="text-gray-500 w-24">{t("profile.kycLevel") || "KYC Level"}</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${kyc.className}`}>
              {kyc.label}
            </span>
          </div>
        </div>

        <form onSubmit={handle_profile_submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="first_name">{t("profile.firstName") || "First Name"}</Label>
              <Input
                id="first_name"
                value={profile_form.first_name}
                onChange={(e) =>
                  set_profile_form((prev) => ({ ...prev, first_name: e.target.value }))
                }
                placeholder={t("profile.firstNamePlaceholder") || "First name"}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="last_name">{t("profile.lastName") || "Last Name"}</Label>
              <Input
                id="last_name"
                value={profile_form.last_name}
                onChange={(e) =>
                  set_profile_form((prev) => ({ ...prev, last_name: e.target.value }))
                }
                placeholder={t("profile.lastNamePlaceholder") || "Last name"}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="middle_name">
              {t("profile.middleName") || "Middle Name"}
              <span className="ml-1 text-xs text-gray-400">({t("common.optional") || "optional"})</span>
            </Label>
            <Input
              id="middle_name"
              value={profile_form.middle_name}
              onChange={(e) =>
                set_profile_form((prev) => ({ ...prev, middle_name: e.target.value }))
              }
              placeholder={t("profile.middleNamePlaceholder") || "Middle name"}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-gray-400" />
                {t("profile.phone") || "Phone"}
              </span>
            </Label>
            <Input
              id="phone"
              value={profile_form.phone}
              onChange={(e) =>
                set_profile_form((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder={t("profile.phonePlaceholder") || "+7 (700) 000-00-00"}
            />
          </div>

          <Button type="submit" disabled={is_profile_submitting}>
            {is_profile_submitting
              ? t("common.saving") || "Saving..."
              : t("profile.saveChanges") || "Save Changes"}
          </Button>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center">
            <KeyRound className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            {t("profile.changePassword") || "Change Password"}
          </h2>
        </div>

        <form onSubmit={handle_password_submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="current_password">
              {t("profile.currentPassword") || "Current Password"}
            </Label>
            <Input
              id="current_password"
              type="password"
              value={password_form.current_password}
              onChange={(e) =>
                set_password_form((prev) => ({ ...prev, current_password: e.target.value }))
              }
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new_password">
              {t("profile.newPassword") || "New Password"}
            </Label>
            <Input
              id="new_password"
              type="password"
              value={password_form.new_password}
              onChange={(e) =>
                set_password_form((prev) => ({ ...prev, new_password: e.target.value }))
              }
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm_password">
              {t("profile.confirmPassword") || "Confirm New Password"}
            </Label>
            <Input
              id="confirm_password"
              type="password"
              value={password_form.confirm_password}
              onChange={(e) =>
                set_password_form((prev) => ({ ...prev, confirm_password: e.target.value }))
              }
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" disabled={is_password_submitting}>
            {is_password_submitting
              ? t("common.saving") || "Saving..."
              : t("profile.changePasswordBtn") || "Change Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
