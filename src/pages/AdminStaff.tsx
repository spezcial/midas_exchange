import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { staffService, STAFF_ROLE_OPTIONS } from "@/api/services/staffService";
import type { StaffUser, CreateStaffPayload, UpdateStaffPayload } from "@/api/services/staffService";
import type { UserRole } from "@/api/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { CheckCircle2, XCircle, Plus, Pencil, UserX } from "lucide-react";

interface CreateModalProps {
  onClose: () => void;
  onCreated: (staffUser: StaffUser | undefined, temp_password: string | undefined) => void;
}

function CreateStaffModal({ onClose, onCreated }: CreateModalProps) {
  const { t } = useTranslation();
  const [form, set_form] = useState<CreateStaffPayload>({
    email: "",
    first_name: "",
    last_name: "",
    role: "operator",
  });
  const [is_submitting, set_is_submitting] = useState(false);

  const handle_submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      set_is_submitting(true);
      const result = await staffService.create(form);
      onCreated(result.staff, result.temp_password);
    } catch {
      toast.error(t("admin.staff.createFailed") || "Failed to create staff member");
    } finally {
      set_is_submitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t("admin.staff.createTitle") || "Create Staff Member"}</h2>
        <form onSubmit={handle_submit} className="space-y-4">
          <div>
            <Label htmlFor="email">{t("admin.staff.email") || "Email"}</Label>
            <Input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => set_form({ ...form, email: e.target.value })}
              placeholder="staff@example.com"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="first_name">{t("admin.staff.firstName") || "First Name"}</Label>
            <Input
              id="first_name"
              required
              value={form.first_name}
              onChange={(e) => set_form({ ...form, first_name: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="last_name">{t("admin.staff.lastName") || "Last Name"}</Label>
            <Input
              id="last_name"
              required
              value={form.last_name}
              onChange={(e) => set_form({ ...form, last_name: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="role">{t("admin.staff.role") || "Role"}</Label>
            <select
              id="role"
              required
              value={form.role}
              onChange={(e) => set_form({ ...form, role: e.target.value as UserRole })}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STAFF_ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={is_submitting} className="flex-1">
              {is_submitting ? (t("common.submitting") || "Submitting...") : (t("admin.staff.create") || "Create")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface TempPasswordModalProps {
  staff: StaffUser | undefined;
  temp_password: string | undefined;
  onClose: () => void;
}

function TempPasswordModal({ staff, temp_password, onClose }: TempPasswordModalProps) {
  const { t } = useTranslation();
  const [copied, set_copied] = useState(false);

  const handle_copy = () => {
    navigator.clipboard.writeText(temp_password ?? "");
    set_copied(true);
    setTimeout(() => set_copied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 mb-2">{t("admin.staff.tempPasswordTitle") || "Staff Member Created"}</h2>
        <p className="text-gray-600 text-sm mb-4">
          {t("admin.staff.tempPasswordWarning") || "This password is shown only once and cannot be retrieved again. Copy it now."}
        </p>
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          {staff && (
            <>
              <p className="text-xs text-gray-500 mb-1">{t("admin.staff.email") || "Email"}: <span className="font-medium text-gray-800">{staff.email}</span></p>
              <p className="text-xs text-gray-500 mb-2">{t("admin.staff.role") || "Role"}: <span className="font-medium text-gray-800">{staff.role}</span></p>
            </>
          )}
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-white border border-gray-200 rounded px-3 py-2 text-sm font-mono break-all">
              {temp_password ?? "—"}
            </code>
            <Button variant="outline" size="sm" onClick={handle_copy}>
              {copied ? (t("common.copied") || "Copied!") : (t("common.copy") || "Copy")}
            </Button>
          </div>
        </div>
        <Button onClick={onClose} className="w-full">
          {t("admin.staff.confirmedCopy") || "I have copied the password"}
        </Button>
      </div>
    </div>
  );
}

interface EditModalProps {
  staff: StaffUser;
  onClose: () => void;
  onUpdated: (updated: StaffUser) => void;
}

function EditStaffModal({ staff, onClose, onUpdated }: EditModalProps) {
  const { t } = useTranslation();
  const [form, set_form] = useState<UpdateStaffPayload>({
    first_name: staff.first_name,
    last_name: staff.last_name,
    role: staff.role,
    is_active: staff.is_active,
  });
  const [is_submitting, set_is_submitting] = useState(false);

  const handle_submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      set_is_submitting(true);
      const updated = await staffService.update(staff.id, form);
      onUpdated(updated);
      toast.success(t("admin.staff.updateSuccess") || "Staff member updated");
      onClose();
    } catch {
      toast.error(t("admin.staff.updateFailed") || "Failed to update staff member");
    } finally {
      set_is_submitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t("admin.staff.editTitle") || "Edit Staff Member"}</h2>
        <form onSubmit={handle_submit} className="space-y-4">
          <div>
            <Label htmlFor="edit_first_name">{t("admin.staff.firstName") || "First Name"}</Label>
            <Input
              id="edit_first_name"
              required
              value={form.first_name}
              onChange={(e) => set_form({ ...form, first_name: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="edit_last_name">{t("admin.staff.lastName") || "Last Name"}</Label>
            <Input
              id="edit_last_name"
              required
              value={form.last_name}
              onChange={(e) => set_form({ ...form, last_name: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="edit_role">{t("admin.staff.role") || "Role"}</Label>
            <select
              id="edit_role"
              required
              value={form.role}
              onChange={(e) => set_form({ ...form, role: e.target.value as UserRole })}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STAFF_ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="edit_is_active"
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => set_form({ ...form, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="edit_is_active">{t("admin.staff.isActive") || "Active"}</Label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={is_submitting} className="flex-1">
              {is_submitting ? (t("common.saving") || "Saving...") : (t("common.save"))}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AdminStaff() {
  const { t } = useTranslation();
  const [staff_list, set_staff_list] = useState<StaffUser[]>([]);
  const [total, set_total] = useState(0);
  const [is_loading, set_is_loading] = useState(false);
  const [email_filter, set_email_filter] = useState("");
  const [show_create_modal, set_show_create_modal] = useState(false);
  const [temp_password_data, set_temp_password_data] = useState<{ staff: StaffUser | undefined; password: string | undefined } | null>(null);
  const [edit_staff, set_edit_staff] = useState<StaffUser | null>(null);

  const fetch_staff = async () => {
    try {
      set_is_loading(true);
      const params: { email?: string } = {};
      if (email_filter.trim()) params.email = email_filter.trim();
      const result = await staffService.list(params);
      set_staff_list(result.staff ?? []);
      set_total(result.total);
    } catch {
      toast.error(t("admin.staff.loadFailed") || "Failed to load staff");
    } finally {
      set_is_loading(false);
    }
  };

  useEffect(() => {
    fetch_staff();
  }, [email_filter]);

  const handle_created = (staffUser: StaffUser | undefined, temp_password: string | undefined) => {
    set_show_create_modal(false);
    set_temp_password_data({ staff: staffUser, password: temp_password });
    fetch_staff();
  };

  const handle_updated = (updated: StaffUser) => {
    set_staff_list((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handle_deactivate = async (staff: StaffUser) => {
    if (!confirm(`${t("admin.staff.deactivateConfirm") || "Deactivate"} ${staff.email}?`)) return;
    try {
      await staffService.deactivate(staff.id);
      set_staff_list((prev) => prev.map((s) => s.id === staff.id ? { ...s, is_active: false } : s));
      toast.success(t("admin.staff.deactivateSuccess") || "Staff member deactivated");
    } catch {
      toast.error(t("admin.staff.deactivateFailed") || "Failed to deactivate staff member");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("admin.staff.title") || "Staff Management"}</h1>
          <p className="text-gray-600 mt-2">{t("admin.staff.subtitle") || "Manage staff members and their roles"}</p>
        </div>
        <Button onClick={() => set_show_create_modal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t("admin.staff.createBtn") || "Create Staff"}
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1 max-w-xs">
            <Label htmlFor="email-filter">{t("admin.users.searchByEmail") || "Search by Email"}</Label>
            <Input
              id="email-filter"
              type="email"
              value={email_filter}
              onChange={(e) => set_email_filter(e.target.value)}
              placeholder="staff@example.com"
              className="mt-1"
            />
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          {t("admin.staff.total") || "Total"}: {total}
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("admin.staff.email") || "Email"}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("admin.staff.name") || "Name"}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("admin.staff.role") || "Role"}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("admin.users.status") || "Status"}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("admin.users.actions") || "Actions"}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {is_loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">{t("common.loading")}</td>
                </tr>
              ) : staff_list.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">{t("admin.staff.noStaff") || "No staff members found"}</td>
                </tr>
              ) : (
                staff_list.map((staff) => (
                  <tr key={staff.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{staff.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{staff.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {staff.first_name && staff.last_name ? `${staff.first_name} ${staff.last_name}` : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {staff.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {staff.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle2 className="h-3 w-3" />
                          {t("admin.users.active") || "Active"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="h-3 w-3" />
                          {t("admin.users.blocked") || "Inactive"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                          onClick={() => set_edit_staff(staff)}
                        >
                          <Pencil className="h-4 w-4" />
                          {t("common.edit")}
                        </Button>
                        {staff.is_active && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-800"
                            onClick={() => handle_deactivate(staff)}
                          >
                            <UserX className="h-4 w-4" />
                            {t("admin.staff.deactivate") || "Deactivate"}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {show_create_modal && (
        <CreateStaffModal
          onClose={() => set_show_create_modal(false)}
          onCreated={handle_created}
        />
      )}

      {temp_password_data && (
        <TempPasswordModal
          staff={temp_password_data.staff}
          temp_password={temp_password_data.password}
          onClose={() => set_temp_password_data(null)}
        />
      )}

      {edit_staff && (
        <EditStaffModal
          staff={edit_staff}
          onClose={() => set_edit_staff(null)}
          onUpdated={handle_updated}
        />
      )}
    </div>
  );
}
