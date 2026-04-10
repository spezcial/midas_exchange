import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format, subDays } from "date-fns";
import toast from "react-hot-toast";
import { ArrowLeft, TrendingUp, CheckCircle, XCircle, Clock } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { otcService } from "@/api/services/otcService";
import type { OTCAnalytics } from "@/types";

function StatCard({
  label,
  value,
  sub,
  color,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex items-start gap-4">
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-2xl font-bold text-gray-900 mt-0.5">{value}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

export function AdminOTCAnalytics() {
  const { t } = useTranslation();
  const [analytics, set_analytics] = useState<OTCAnalytics | null>(null);
  const [is_loading, set_is_loading] = useState(true);
  const [granularity, set_granularity] = useState<"day" | "week" | "month">("day");
  const [from_date, set_from_date] = useState(format(subDays(new Date(), 29), "yyyy-MM-dd"));
  const [to_date, set_to_date] = useState(format(new Date(), "yyyy-MM-dd"));

  const load = async () => {
    try {
      set_is_loading(true);
      const data = await otcService.admin_get_analytics({ from: from_date, to: to_date, granularity });
      set_analytics(data);
    } catch {
      toast.error(t("messages.loadFailed"));
    } finally {
      set_is_loading(false);
    }
  };

  useEffect(() => {
    load();
  }, [from_date, to_date, granularity]);

  const summary = analytics?.summary;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/otc" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("otc.admin.analytics.title")}</h1>
          <p className="text-gray-600 mt-1">{t("otc.admin.analytics.subtitle")}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label>{t("otc.admin.filters.fromDate")}</Label>
            <Input
              type="date"
              className="mt-2"
              value={from_date}
              onChange={(e) => set_from_date(e.target.value)}
            />
          </div>
          <div>
            <Label>{t("otc.admin.filters.toDate")}</Label>
            <Input
              type="date"
              className="mt-2"
              value={to_date}
              onChange={(e) => set_to_date(e.target.value)}
            />
          </div>
          <div>
            <Label>{t("otc.admin.analytics.granularity")}</Label>
            <Select value={granularity} onValueChange={(v) => set_granularity(v as "day" | "week" | "month")}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">{t("otc.admin.analytics.granularities.day")}</SelectItem>
                <SelectItem value="week">{t("otc.admin.analytics.granularities.week")}</SelectItem>
                <SelectItem value="month">{t("otc.admin.analytics.granularities.month")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <Button size="sm" onClick={load} disabled={is_loading}>
            {is_loading ? t("common.loading") : t("common.filter")}
          </Button>
        </div>
      </div>

      {is_loading && !analytics ? (
        <div className="text-center py-12 text-gray-500">{t("common.loading")}</div>
      ) : !summary ? null : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label={t("otc.admin.analytics.totalOrders")}
              value={summary.total_orders}
              icon={TrendingUp}
              color="bg-blue-500"
            />
            <StatCard
              label={t("otc.admin.analytics.completed")}
              value={summary.completed}
              sub={`${summary.conversion_rate.toFixed(1)}% ${t("otc.admin.analytics.conversionRate")}`}
              icon={CheckCircle}
              color="bg-green-500"
            />
            <StatCard
              label={t("otc.admin.analytics.cancelledExpired")}
              value={summary.cancelled + summary.expired}
              sub={`${summary.cancelled} / ${summary.expired}`}
              icon={XCircle}
              color="bg-red-400"
            />
            <StatCard
              label={t("otc.admin.analytics.avgSpread")}
              value={`${summary.avg_spread_pct.toFixed(2)}%`}
              sub={`${t("otc.admin.analytics.totalVolume")}: ${summary.total_volume.toLocaleString()}`}
              icon={Clock}
              color="bg-purple-500"
            />
          </div>

          {/* Volume over time */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">{t("otc.admin.analytics.volumeOverTime")}</h2>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={analytics!.by_period} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="vol_gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#3b82f6"
                  fill="url(#vol_gradient)"
                  strokeWidth={2}
                  name={t("otc.admin.analytics.volume")}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Orders breakdown over time */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">{t("otc.admin.analytics.ordersBreakdown")}</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={analytics!.by_period} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" stackId="a" fill="#22c55e" name={t("otc.statuses.completed")} />
                <Bar dataKey="cancelled" stackId="a" fill="#9ca3af" name={t("otc.statuses.cancelled")} />
                <Bar dataKey="expired" stackId="a" fill="#ef4444" name={t("otc.statuses.expired")} />
                <Bar
                  dataKey="other"
                  stackId="a"
                  fill="#60a5fa"
                  name={t("otc.admin.analytics.other")}
                  hide
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
