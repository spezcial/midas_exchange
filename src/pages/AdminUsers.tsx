import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { adminUsersService } from "@/api/services/adminUsersService";
import type { User } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { Eye, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminUsers() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [users, set_users] = useState<User[]>([]);
  const [is_loading, set_is_loading] = useState(false);
  const [email_filter, set_email_filter] = useState<string>("");
  const [total, set_total] = useState<number>(0);

  useEffect(() => {
    const fetch_users = async () => {
      try {
        set_is_loading(true);
        const params: any = {};
        if (email_filter.trim()) {
          params.email = email_filter.trim();
        }

        const response = await adminUsersService.get_all_users(params);
        set_users(response.data.users ?? []);
        set_total(response.data.total);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast.error(t("messages.loadUsersFailed") || "Failed to load users");
      } finally {
        set_is_loading(false);
      }
    };

    fetch_users();
  }, [email_filter, t]);

  const handle_email_filter_change = (value: string) => {
    set_email_filter(value);
  };

  const handle_email_filter_submit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handle_view_user = (user_id: number) => {
    navigate(`/admin/users/${user_id}`);
  };

  const get_kyc_badge = (kyc_level: number) => {
    const badges = [
      { label: "Level 0", className: "bg-gray-100 text-gray-800" },
      { label: "Level 1", className: "bg-blue-100 text-blue-800" },
      { label: "Level 2", className: "bg-green-100 text-green-800" },
      { label: "Level 3", className: "bg-purple-100 text-purple-800" },
    ];

    const badge = badges[kyc_level] || badges[0];

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t("admin.users.title") || "Users"}</h1>
        <p className="text-gray-600 mt-2">{t("admin.users.subtitle") || "Manage all users and their accounts"}</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email-filter">{t("admin.users.searchByEmail") || "Search by Email"}</Label>
            <form onSubmit={handle_email_filter_submit} className="flex gap-2 mt-2">
              <Input
                id="email-filter"
                type="email"
                value={email_filter}
                onChange={(e) => handle_email_filter_change(e.target.value)}
                placeholder="user@example.com"
                className="flex-1"
              />
            </form>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          {t("admin.users.totalUsers") || "Total Users"}: {total}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("admin.users.id") || "ID"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("admin.users.email") || "Email"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("admin.users.name") || "Name"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("admin.users.kycLevel") || "KYC Level"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("admin.users.status") || "Status"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("admin.users.registeredAt") || "Registered"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("admin.users.actions") || "Actions"}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {is_loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    {t("common.loading") || "Loading..."}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    {t("admin.users.noUsers") || "No users found"}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{user.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.first_name && user.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {get_kyc_badge(user.kyc_level)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.is_blocked ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="h-3 w-3" />
                          {t("admin.users.blocked") || "Blocked"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle2 className="h-3 w-3" />
                          {t("admin.users.active") || "Active"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {format(new Date(user.created_at), "dd.MM.yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Button
                        onClick={() => handle_view_user(user.id)}
                        variant="ghost"
                        size="sm"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="h-4 w-4" />
                        {t("admin.users.view") || "View"}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
