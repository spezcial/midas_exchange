import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { ArrowLeft, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { otcService, type SendOTCOfferPayload } from "@/api/services/otcService";
import { useAuthStore } from "@/store/authStore";
import type { OTCOrderDetail as OTCOrderDetailType, OTCOrderStatus, OTCMessage } from "@/types";

const TERMINAL_STATUSES: OTCOrderStatus[] = ["completed", "cancelled", "expired"];
const CANCELLABLE_STATUSES: OTCOrderStatus[] = ["awaiting_review", "negotiating"];

function StatusBadge({ status }: { status: OTCOrderStatus }) {
  const { t } = useTranslation();
  const cfg: Record<OTCOrderStatus, string> = {
    awaiting_review: "bg-yellow-100 text-yellow-800",
    negotiating: "bg-blue-100 text-blue-800",
    awaiting_payment: "bg-purple-100 text-purple-800",
    payment_received: "bg-cyan-100 text-cyan-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-gray-100 text-gray-800",
    expired: "bg-red-100 text-red-800",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg[status]}`}>
      {t(`otc.statuses.${status}`)}
    </span>
  );
}

function PaymentCountdown({ deadline }: { deadline: string }) {
  const { t } = useTranslation();
  const [remaining, set_remaining] = useState(0);

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, new Date(deadline).getTime() - Date.now());
      set_remaining(diff);
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  if (remaining === 0) {
    return <span className="text-red-600 font-medium">{t("otc.countdown.expired")}</span>;
  }

  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  return (
    <span className={`font-mono font-bold ${mins < 5 ? "text-red-600" : "text-purple-700"}`}>
      {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
    </span>
  );
}

function OfferCard({
  msg,
  current_user_id,
  order_uid,
  on_action,
  from_code,
  to_code,
}: {
  msg: OTCMessage;
  current_user_id: number;
  order_uid: string;
  on_action: () => void;
  from_code: string;
  to_code: string;
}) {
  const { t } = useTranslation();
  const [loading, set_loading] = useState(false);
  const is_mine = msg.sender_id === current_user_id;

  const handle = async (action: "accept" | "reject") => {
    try {
      set_loading(true);
      if (action === "accept") {
        await otcService.accept_offer(order_uid, msg.id);
        toast.success(t("otc.messages.offerAccepted"));
      } else {
        await otcService.reject_offer(order_uid, msg.id);
        toast.success(t("otc.messages.offerRejected"));
      }
      on_action();
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? t("messages.loadFailed"));
    } finally {
      set_loading(false);
    }
  };

  const status_label: Record<string, string> = {
    accepted: t("otc.chat.accepted"),
    rejected: t("otc.chat.rejected"),
  };

  return (
    <div className={`max-w-sm ${is_mine ? "ml-auto" : "mr-auto"}`}>
      <div className="border rounded-xl p-4 bg-white shadow-sm">
        <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
          {t("otc.chat.sendOffer")}
        </div>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">{t("otc.chat.offerRate")}:</span>
            <span className="font-medium">
              1 {from_code} = {msg.offer_rate} {to_code}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">{t("otc.fields.fromAmount")}:</span>
            <span className="font-medium">
              {msg.offer_from_amount?.toLocaleString()} {from_code}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">{t("otc.chat.offerReceive")}:</span>
            <span className="font-semibold text-green-700">
              {msg.offer_to_amount?.toLocaleString()} {to_code}
            </span>
          </div>
        </div>

        {msg.offer_status === "pending" && !is_mine && (
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              className="flex-1"
              onClick={() => handle("accept")}
              disabled={loading}
            >
              {t("otc.chat.accept")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => handle("reject")}
              disabled={loading}
            >
              {t("otc.chat.reject")}
            </Button>
          </div>
        )}

        {msg.offer_status && msg.offer_status !== "pending" && (
          <div
            className={`mt-2 text-xs font-medium text-center ${
              msg.offer_status === "accepted" ? "text-green-600" : "text-gray-500"
            }`}
          >
            {status_label[msg.offer_status]}
          </div>
        )}
      </div>
      <div className={`text-xs text-gray-400 mt-1 ${is_mine ? "text-right" : "text-left"}`}>
        {format(new Date(msg.created_at), "HH:mm")}
      </div>
    </div>
  );
}

export function OTCOrderDetail() {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const access_token = useAuthStore((state) => state.access_token);

  const chat_bottom_ref = useRef<HTMLDivElement>(null);

  const [order, set_order] = useState<OTCOrderDetailType | null>(null);
  const [is_loading, set_is_loading] = useState(true);

  // Chat
  const [text, set_text] = useState("");
  const [is_sending, set_is_sending] = useState(false);

  // Offer dialog
  const [offer_open, set_offer_open] = useState(false);
  const [offer_form, set_offer_form] = useState<SendOTCOfferPayload>({ offer_rate: 0, offer_from_amount: 0 });
  const [is_offer_submitting, set_is_offer_submitting] = useState(false);

  // Cancel dialog
  const [cancel_open, set_cancel_open] = useState(false);
  const [cancel_reason, set_cancel_reason] = useState("");
  const [is_cancelling, set_is_cancelling] = useState(false);

  const fetch_order = async () => {
    if (!uid) return;
    try {
      const data = await otcService.get_order(uid);
      set_order(data);
    } catch (err: any) {
      if (err?.response?.status === 404 || err?.response?.status === 403) {
        navigate("/otc");
      }
    } finally {
      set_is_loading(false);
    }
  };

  useEffect(() => {
    fetch_order();
  }, [uid]);

  // Scroll chat to bottom whenever messages change
  useEffect(() => {
    chat_bottom_ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [order?.messages?.length]);

  // WebSocket for real-time chat messages
  useEffect(() => {
    if (!uid || !order || !access_token) return;
    if (TERMINAL_STATUSES.includes(order.status)) return;

    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";
    const WS_BASE = API_BASE.replace(/^http/, "ws").replace(/\/api\/v1.*$/, "");
    const ws = new WebSocket(`${WS_BASE}/ws/otc/${uid}?token=${access_token}`);

    // Refetch on every incoming message — this also marks new messages as read on the backend.
    ws.onmessage = () => {
      fetch_order();
    };

    return () => ws.close();
  }, [uid, order?.status, access_token]);

  const send_message = async () => {
    if (!text.trim() || !uid) return;
    try {
      set_is_sending(true);
      await otcService.send_message(uid, text.trim());
      set_text("");
      fetch_order();
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? t("messages.loadFailed"));
    } finally {
      set_is_sending(false);
    }
  };

  const send_offer = async () => {
    if (!uid || offer_form.offer_rate <= 0 || offer_form.offer_from_amount <= 0) {
      toast.error(t("errors.invalidAmount"));
      return;
    }
    try {
      set_is_offer_submitting(true);
      await otcService.send_offer(uid, offer_form);
      toast.success(t("otc.messages.offerSent"));
      set_offer_open(false);
      fetch_order();
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? t("messages.loadFailed"));
    } finally {
      set_is_offer_submitting(false);
    }
  };

  const cancel_order = async () => {
    if (!uid) return;
    try {
      set_is_cancelling(true);
      await otcService.cancel_order(uid, cancel_reason);
      toast.success(t("otc.messages.orderCancelled"));
      set_cancel_open(false);
      fetch_order();
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? t("messages.loadFailed"));
    } finally {
      set_is_cancelling(false);
    }
  };

  if (is_loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">{t("common.loading")}</div>
    );
  }

  if (!order) return null;

  const can_cancel = CANCELLABLE_STATUSES.includes(order.status);
  const can_chat = order.status === "negotiating" || order.status === "awaiting_payment";
  const from_code = order.from_currency?.code ?? `#${order.from_currency_id}`;
  const to_code = order.to_currency?.code ?? `#${order.to_currency_id}`;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/otc" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("otc.orderDetail")} #{order.id}
          </h1>
          <p className="text-sm font-mono text-gray-500">{order.uid}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Order info card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-500">{t("otc.fields.fromCurrency")}</div>
            <div className="font-semibold mt-0.5">
              {order.from_currency?.name ?? from_code} ({from_code})
            </div>
          </div>
          <div>
            <div className="text-gray-500">{t("otc.fields.toCurrency")}</div>
            <div className="font-semibold mt-0.5">
              {order.to_currency?.name ?? to_code} ({to_code})
            </div>
          </div>
          <div>
            <div className="text-gray-500">{t("otc.fields.fromAmount")}</div>
            <div className="font-semibold mt-0.5">
              {order.from_amount.toLocaleString()} {from_code}
            </div>
          </div>
          <div>
            <div className="text-gray-500">{t("otc.fields.proposedRate")}</div>
            <div className="font-semibold mt-0.5">
              1 {from_code} = {order.proposed_rate} {to_code}
            </div>
          </div>
          {order.agreed_rate && (
            <div>
              <div className="text-gray-500">{t("otc.fields.agreedRate")}</div>
              <div className="font-semibold mt-0.5 text-green-700">
                1 {from_code} = {order.agreed_rate} {to_code}
              </div>
            </div>
          )}
          {order.to_amount && (
            <div>
              <div className="text-gray-500">{t("otc.fields.toAmount")}</div>
              <div className="font-semibold mt-0.5 text-green-700">
                {order.to_amount.toLocaleString()} {to_code}
              </div>
            </div>
          )}
          {order.comment && (
            <div className="col-span-2 md:col-span-3">
              <div className="text-gray-500">{t("otc.fields.comment")}</div>
              <div className="font-medium mt-0.5">{order.comment}</div>
            </div>
          )}
          {order.cancel_reason && (
            <div className="col-span-2 md:col-span-3">
              <div className="text-gray-500">{t("otc.fields.cancelReason")}</div>
              <div className="font-medium mt-0.5 text-red-700">
                {order.cancel_reason} ({order.cancelled_by})
              </div>
            </div>
          )}
        </div>

        {/* Payment deadline countdown */}
        {order.status === "awaiting_payment" && order.payment_deadline && (
          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <span className="text-sm text-gray-600">{t("otc.countdown.label")}:</span>
            <PaymentCountdown deadline={order.payment_deadline} />
          </div>
        )}

        {/* Actions */}
        {can_cancel && (
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50" onClick={() => set_cancel_open(true)}>
              <X className="h-4 w-4 mr-1" />
              {t("otc.actions.cancel")}
            </Button>
          </div>
        )}
      </div>

      {/* Chat section */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center gap-3">
          <h2 className="font-semibold text-gray-900">{t("otc.chat.title")}</h2>
          {order.unread_count > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white min-w-[20px]">
              {order.unread_count}
            </span>
          )}
        </div>

        {/* Messages */}
        <div className="p-6 space-y-4 min-h-48 max-h-[480px] overflow-y-auto">
          {(order.messages ?? []).length === 0 && (
            <p className="text-center text-gray-400 text-sm">{t("otc.noOrders")}</p>
          )}
          {(order.messages ?? []).map((msg) => {
            const is_mine = msg.sender_id === user?.id;
            if (msg.message_type === "offer") {
              return (
                <OfferCard
                  key={msg.id}
                  msg={msg}
                  current_user_id={user?.id ?? 0}
                  order_uid={order.uid}
                  on_action={fetch_order}
                  from_code={from_code}
                  to_code={to_code}
                />
              );
            }
            return (
              <div key={msg.id} className={`flex flex-col ${is_mine ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                    is_mine ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-xs text-gray-400 mt-1">
                  {msg.sender_role} · {format(new Date(msg.created_at), "HH:mm")}
                </span>
              </div>
            );
          })}
          <div ref={chat_bottom_ref} />
        </div>

        {/* Input area */}
        {can_chat && (
          <div className="border-t">
            {order.status === "awaiting_payment" && (
              <div className="px-6 py-3 bg-purple-50 text-sm text-purple-700">
                {t("otc.chat.awaitingPaymentNote")}
              </div>
            )}
            <div className="px-6 py-4 bg-gray-50">
              <div className="flex gap-2">
                {order.status === "negotiating" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => {
                      set_offer_form({ offer_rate: 0, offer_from_amount: 0 });
                      set_offer_open(true);
                    }}
                  >
                    {t("otc.chat.sendOffer")}
                  </Button>
                )}
                <Input
                  value={text}
                  onChange={(e) => set_text(e.target.value)}
                  placeholder={t("otc.chat.messagePlaceholder")}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send_message()}
                  className="flex-1"
                />
                <Button size="sm" onClick={send_message} disabled={is_sending || !text.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Send Offer Dialog */}
      <Dialog open={offer_open} onOpenChange={set_offer_open}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("otc.chat.sendOffer")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>
                {t("otc.chat.offerRate")}
                <span className="ml-2 text-xs text-gray-500">
                  1 {from_code} = ? {to_code}
                </span>
              </Label>
              <Input
                type="number"
                min="0"
                step="any"
                className="mt-1.5"
                value={offer_form.offer_rate || ""}
                onChange={(e) => set_offer_form((f) => ({ ...f, offer_rate: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label>{t("otc.chat.offerAmount")} ({from_code})</Label>
              <Input
                type="number"
                min="0"
                step="any"
                className="mt-1.5"
                value={offer_form.offer_from_amount || ""}
                onChange={(e) => set_offer_form((f) => ({ ...f, offer_from_amount: Number(e.target.value) }))}
              />
            </div>
            {offer_form.offer_rate > 0 && offer_form.offer_from_amount > 0 && (
              <div className="bg-gray-50 rounded-lg p-3 text-sm flex justify-between">
                <span className="text-gray-600">{t("otc.chat.offerReceive")}:</span>
                <span className="font-semibold text-green-700">
                  {(offer_form.offer_from_amount * offer_form.offer_rate).toLocaleString()} {to_code}
                </span>
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => set_offer_open(false)}>
                {t("common.cancel")}
              </Button>
              <Button className="flex-1" onClick={send_offer} disabled={is_offer_submitting}>
                {is_offer_submitting ? t("common.saving") : t("common.submit")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancel_open} onOpenChange={set_cancel_open}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("otc.actions.cancel")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>{t("otc.actions.cancelReason")}</Label>
              <Input
                type="text"
                className="mt-1.5"
                value={cancel_reason}
                onChange={(e) => set_cancel_reason(e.target.value)}
                placeholder={t("common.optional")}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => set_cancel_open(false)}>
                {t("common.close")}
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={cancel_order}
                disabled={is_cancelling}
              >
                {is_cancelling ? t("common.saving") : t("otc.actions.cancel")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
