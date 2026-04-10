import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { adminUsersService } from "@/api/services/adminUsersService";
import type { UserProfile, UserProfilePayload } from "@/types";
import toast from "react-hot-toast";
import { ArrowLeft, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function AdminUserProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [profile, set_profile] = useState<UserProfile | null>(null);
  const [is_loading, set_is_loading] = useState(true);
  const [is_submitting, set_is_submitting] = useState(false);
  const [profile_exists, set_profile_exists] = useState(false);
  const [form_data, set_form_data] = useState<UserProfilePayload>({
    first_name: "",
    last_name: "",
    middle_name: "",
    phone: "",
    kyc_level: 0,
  });

  useEffect(() => {
    const fetch_profile = async () => {
      if (!id) return;
      try {
        set_is_loading(true);
        const data = await adminUsersService.get_user_profile(parseInt(id));
        set_profile(data);
        set_profile_exists(true);
        set_form_data({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          middle_name: data.middle_name || "",
          phone: (data as any).phone || "",
          kyc_level: data.kyc_level,
        });
      } catch (error: any) {
        if (error?.response?.status === 404) {
          set_profile_exists(false);
        } else {
          toast.error(t("messages.loadProfileFailed"));
        }
      } finally {
        set_is_loading(false);
      }
    };

    fetch_profile();
  }, [id, t]);

  const handle_submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const payload: UserProfilePayload = {
      first_name: form_data.first_name,
      last_name: form_data.last_name,
      middle_name: form_data.middle_name || undefined,
      phone: form_data.phone || undefined,
      kyc_level: form_data.kyc_level,
    };

    try {
      set_is_submitting(true);
      const saved = profile_exists
        ? await adminUsersService.update_user_profile(parseInt(id), payload)
        : await adminUsersService.create_user_profile(parseInt(id), payload);

      set_profile(saved);
      set_profile_exists(true);
      set_form_data({
        first_name: saved.first_name || "",
        last_name: saved.last_name || "",
        middle_name: saved.middle_name || "",
        phone: (saved as any).phone || "",
        kyc_level: saved.kyc_level,
      });
      toast.success(profile_exists ? t("messages.profileUpdated") : t("messages.profileCreated"));
    } catch {
      toast.error(t("messages.saveProfileFailed"));
    } finally {
      set_is_submitting(false);
    }
  };

  const kyc_levels = [
    { value: "0", label: "Level 0" },
    { value: "1", label: "Level 1" },
    { value: "2", label: "Level 2" },
    { value: "3", label: "Level 3" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          onClick={() => navigate(`/admin/users/${id}`)}
          variant="ghost"
          size="sm"
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("common.back")}
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {t("admin.userProfile.title")}
        </h1>
      </div>

      {/* Tab navigation */}
      <div className="flex border-b border-gray-200">
        <Link
          to={`/admin/users/${id}`}
          className={cn(
            "px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
            "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          )}
        >
          {t("admin.userDetail.tabs.details")}
        </Link>
        <Link
          to={`/admin/users/${id}/profile`}
          className={cn(
            "px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
            "border-blue-600 text-blue-600"
          )}
        >
          {t("admin.userDetail.tabs.profile")}
        </Link>
      </div>

      {/* Profile form */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {t("admin.userProfile.information")}
            </h2>
            {profile && (
              <p className="text-sm text-gray-500">{profile.email}</p>
            )}
          </div>
          {!profile_exists && !is_loading && (
            <span className="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              {t("admin.userProfile.noProfile")}
            </span>
          )}
        </div>

        {is_loading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-gray-500">{t("common.loading")}</p>
          </div>
        ) : (
          <form onSubmit={handle_submit} className="space-y-5 max-w-md">
            <div className="space-y-1.5">
              <Label htmlFor="first_name">
                {t("admin.userProfile.firstName")}
              </Label>
              <Input
                id="first_name"
                value={form_data.first_name}
                onChange={(e) =>
                  set_form_data((prev) => ({ ...prev, first_name: e.target.value }))
                }
                placeholder={t("admin.userProfile.firstNamePlaceholder")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="last_name">
                {t("admin.userProfile.lastName")}
              </Label>
              <Input
                id="last_name"
                value={form_data.last_name}
                onChange={(e) =>
                  set_form_data((prev) => ({ ...prev, last_name: e.target.value }))
                }
                placeholder={t("admin.userProfile.lastNamePlaceholder")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="middle_name">
                {t("admin.userProfile.middleName")}
                <span className="ml-1 text-xs text-gray-400">
                  ({t("common.optional")})
                </span>
              </Label>
              <Input
                id="middle_name"
                value={form_data.middle_name}
                onChange={(e) =>
                  set_form_data((prev) => ({ ...prev, middle_name: e.target.value }))
                }
                placeholder={t("admin.userProfile.middleNamePlaceholder")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  {t("admin.userProfile.phone")}
                  <span className="text-xs text-gray-400">({t("common.optional")})</span>
                </span>
              </Label>
              <Input
                id="phone"
                value={form_data.phone}
                onChange={(e) =>
                  set_form_data((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder={t("admin.userProfile.phonePlaceholder")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="kyc_level">
                {t("admin.userProfile.kycLevel")}
              </Label>
              <Select
                value={form_data.kyc_level.toString()}
                onValueChange={(val) =>
                  set_form_data((prev) => ({
                    ...prev,
                    kyc_level: parseInt(val) as 0 | 1 | 2 | 3,
                  }))
                }
              >
                <SelectTrigger id="kyc_level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {kyc_levels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={is_submitting}>
                {is_submitting
                  ? t("common.saving")
                  : profile_exists
                  ? t("admin.userProfile.update")
                  : t("admin.userProfile.create")}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
