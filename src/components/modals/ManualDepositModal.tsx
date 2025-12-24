import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminUsersService } from "@/api/services/adminUsersService";
import { PlusCircle } from "lucide-react";
import toast from "react-hot-toast";

interface ManualDepositModalProps {
  is_open: boolean;
  user_id: number;
  currency_code: string;
  on_close: () => void;
  on_success: () => void;
}

const deposit_schema = z.object({
  amount: z.string().min(1, "Amount is required").refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    { message: "Amount must be greater than 0" }
  ),
  tx_hash: z.string().optional(),
  description: z.string().optional(),
});

type DepositFormData = z.infer<typeof deposit_schema>;

export function ManualDepositModal({
  is_open,
  user_id,
  currency_code,
  on_close,
  on_success,
}: ManualDepositModalProps) {
  const { t } = useTranslation();
  const [is_submitting, set_is_submitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DepositFormData>({
    resolver: zodResolver(deposit_schema),
  });

  const handle_close = () => {
    reset();
    on_close();
  };

  const on_submit = async (data: DepositFormData) => {
    try {
      set_is_submitting(true);

      await adminUsersService.manual_deposit({
        user_id,
        currency_code,
        amount: parseFloat(data.amount),
        tx_hash: data.tx_hash || undefined,
        description: data.description || undefined,
      });

      toast.success(
        t("admin.userDetail.depositSuccess") || "Deposit completed successfully"
      );

      reset();
      on_success();
    } catch (error: any) {
      console.error("Failed to deposit:", error);
      const error_message =
        error.response?.data?.error ||
        t("admin.userDetail.depositFailed") ||
        "Failed to deposit";
      toast.error(error_message);
    } finally {
      set_is_submitting(false);
    }
  };

  return (
    <Dialog open={is_open} onOpenChange={handle_close}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-green-600" />
            <DialogTitle>
              {t("admin.userDetail.manualDeposit") || "Manual Deposit"}
            </DialogTitle>
          </div>
          <DialogDescription>
            {t("admin.userDetail.depositDescription") ||
              `Add funds to user's ${currency_code} wallet`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(on_submit)} className="space-y-4">
          <div className="space-y-4 py-4">
            {/* Currency Display */}
            <div>
              <Label>{t("admin.userDetail.currency") || "Currency"}</Label>
              <Input value={currency_code} disabled className="mt-2" />
            </div>

            {/* Amount Input */}
            <div>
              <Label htmlFor="amount">
                {t("admin.userDetail.amount") || "Amount"} *
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.00000001"
                placeholder="0.00"
                {...register("amount")}
                className="mt-2"
                disabled={is_submitting}
              />
              {errors.amount && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.amount.message}
                </p>
              )}
            </div>

            {/* Transaction Hash Input (Optional) */}
            <div>
              <Label htmlFor="tx_hash">
                {t("admin.userDetail.txHash") || "Transaction Hash"}{" "}
                <span className="text-gray-400">
                  ({t("common.optional") || "Optional"})
                </span>
              </Label>
              <Input
                id="tx_hash"
                type="text"
                placeholder="0x..."
                {...register("tx_hash")}
                className="mt-2"
                disabled={is_submitting}
              />
              {errors.tx_hash && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.tx_hash.message}
                </p>
              )}
            </div>

            {/* Description Input (Optional) */}
            <div>
              <Label htmlFor="description">
                {t("admin.userDetail.description") || "Description"}{" "}
                <span className="text-gray-400">
                  ({t("common.optional") || "Optional"})
                </span>
              </Label>
              <Textarea
                id="description"
                placeholder={
                  t("admin.userDetail.descriptionPlaceholder") ||
                  "Enter a description for this deposit"
                }
                {...register("description")}
                className="mt-2"
                rows={3}
                disabled={is_submitting}
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Warning Note */}
            <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200">
              <p className="text-sm font-medium text-yellow-900 mb-1">
                {t("admin.userDetail.warning") || "Warning"}
              </p>
              <p className="text-sm text-yellow-800">
                {t("admin.userDetail.depositWarning") ||
                  "This will immediately add funds to the user's wallet. Please verify all details before submitting."}
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              onClick={handle_close}
              variant="outline"
              disabled={is_submitting}
            >
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button type="submit" disabled={is_submitting}>
              {is_submitting
                ? t("common.submitting") || "Submitting..."
                : t("admin.userDetail.confirmDeposit") || "Confirm Deposit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
