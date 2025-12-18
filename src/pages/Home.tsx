import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  ArrowDownUp, 
  Shield, 
  Zap, 
  HeadphonesIcon, 
  Scale,
  TrendingUp,
  Users,
  Activity,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useExchangeStore } from "@/store/exchangeStore";
import { format_number } from "@/lib/utils";
import type { Currency } from "@/types";

const mock_rates = [
  { from: "USD" as Currency, to: "BTC" as Currency, rate: 0.000023, fee: 0.02, min: 10, max: 100000, updated_at: new Date() },
  { from: "BTC" as Currency, to: "USD" as Currency, rate: 43478, fee: 0.02, min: 0.0001, max: 10, updated_at: new Date() },
  { from: "USD" as Currency, to: "ETH" as Currency, rate: 0.00042, fee: 0.02, min: 10, max: 100000, updated_at: new Date() },
  { from: "ETH" as Currency, to: "USD" as Currency, rate: 2380, fee: 0.02, min: 0.001, max: 100, updated_at: new Date() },
  { from: "KZT" as Currency, to: "BTC" as Currency, rate: 0.00000005, fee: 0.025, min: 5000, max: 50000000, updated_at: new Date() },
  { from: "BTC" as Currency, to: "KZT" as Currency, rate: 20000000, fee: 0.025, min: 0.0001, max: 10, updated_at: new Date() },
  { from: "KZT" as Currency, to: "USDT" as Currency, rate: 0.0022, fee: 0.015, min: 5000, max: 50000000, updated_at: new Date() },
  { from: "USDT" as Currency, to: "KZT" as Currency, rate: 455, fee: 0.015, min: 10, max: 100000, updated_at: new Date() },
];

export function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    from_currency,
    to_currency,
    from_amount,
    to_amount,
    rate,
    fee,
    set_from_currency,
    set_to_currency,
    set_from_amount,
    set_rates,
    swap_currencies,
  } = useExchangeStore();

  useEffect(() => {
    set_rates(mock_rates);
  }, [set_rates]);

  const currencies: Currency[] = ["KZT", "USD", "BTC", "ETH", "USDT"];

  const get_currency_icon = (currency: Currency) => {
    const icons = {
      KZT: "₸",
      USD: "$",
      BTC: "₿",
      ETH: "Ξ",
      USDT: "₮",
    };
    return icons[currency];
  };

  const features = [
    {
      icon: Shield,
      title: t("home.features.security.title"),
      description: t("home.features.security.description"),
    },
    {
      icon: Zap,
      title: t("home.features.speed.title"),
      description: t("home.features.speed.description"),
    },
    {
      icon: HeadphonesIcon,
      title: t("home.features.support.title"),
      description: t("home.features.support.description"),
    },
    {
      icon: Scale,
      title: t("home.features.legal.title"),
      description: t("home.features.legal.description"),
    },
  ];

  const stats = [
    { label: t("home.stats.users"), value: "50,000+", icon: Users },
    { label: t("home.stats.volume"), value: "$100M+", icon: TrendingUp },
    { label: t("home.stats.transactions"), value: "1M+", icon: Activity },
    { label: t("home.stats.uptime"), value: "99.9%", icon: Shield },
  ];

  const faq_items = [
    {
      question: "Как быстро проходят транзакции?",
      answer: "Обмен криптовалют происходит мгновенно после подтверждения в блокчейне. Вывод на банковские карты занимает от 5 до 30 минут.",
    },
    {
      question: "Какие комиссии за обмен?",
      answer: "Комиссия зависит от типа операции и составляет от 1.5% до 2.5%. Точную комиссию вы видите в калькуляторе обмена.",
    },
    {
      question: "Нужна ли верификация?",
      answer: "Для небольших сумм (до 50,000 ₸) верификация не требуется. Для больших объемов необходимо пройти KYC процедуру.",
    },
    {
      question: "Безопасно ли хранить средства на бирже?",
      answer: "Мы используем холодные кошельки для хранения 95% средств. Рекомендуем выводить средства на личные кошельки для долгосрочного хранения.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/5 to-background py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t("home.hero.title")}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("home.hero.subtitle")}
            </p>
          </div>

          {/* Exchange Calculator */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>{t("home.calculator.title")}</CardTitle>
              <CardDescription>
                Мгновенный расчет с актуальными курсами
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>{t("home.calculator.from")}</Label>
                  <div className="flex gap-2 mt-2">
                    <div className="flex-1">
                      <Input
                        type="number"
                        value={from_amount}
                        onChange={(e) => set_from_amount(parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                    <Select value={from_currency} onValueChange={(value) => set_from_currency(value as Currency)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            <span className="mr-2">{get_currency_icon(currency)}</span>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={swap_currencies}
                    className="rounded-full"
                  >
                    <ArrowDownUp className="h-4 w-4" />
                  </Button>
                </div>

                <div>
                  <Label>{t("home.calculator.to")}</Label>
                  <div className="flex gap-2 mt-2">
                    <div className="flex-1">
                      <Input
                        type="number"
                        value={to_amount.toFixed(8)}
                        readOnly
                        placeholder="0.00"
                        className="bg-muted"
                      />
                    </div>
                    <Select value={to_currency} onValueChange={(value) => set_to_currency(value as Currency)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            <span className="mr-2">{get_currency_icon(currency)}</span>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2 p-4 bg-muted rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>{t("home.calculator.rate")}</span>
                  <span className="font-medium">
                    1 {from_currency} = {format_number(rate, "ru-RU", 8)} {to_currency}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t("home.calculator.fee")}</span>
                  <span className="font-medium">{(fee * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-2 border-t">
                  <span>{t("home.calculator.total")}</span>
                  <span>
                    {format_number(to_amount, "ru-RU", 8)} {to_currency}
                  </span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={() => navigate("/register")}
              >
                {t("home.hero.cta")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t("home.features.title")}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-primary mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exchange Rates */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t("home.rates.title")}
          </h2>
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-4">{t("home.rates.pair")}</th>
                      <th className="text-right p-4">{t("home.rates.buy")}</th>
                      <th className="text-right p-4">{t("home.rates.sell")}</th>
                      <th className="text-right p-4">{t("home.rates.change")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-4 font-medium">BTC/USD</td>
                      <td className="text-right p-4">$43,478</td>
                      <td className="text-right p-4">$43,250</td>
                      <td className="text-right p-4 text-green-600 flex items-center justify-end">
                        <ChevronUp className="h-4 w-4" />
                        +2.5%
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">ETH/USD</td>
                      <td className="text-right p-4">$2,380</td>
                      <td className="text-right p-4">$2,365</td>
                      <td className="text-right p-4 text-green-600 flex items-center justify-end">
                        <ChevronUp className="h-4 w-4" />
                        +1.8%
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">USDT/KZT</td>
                      <td className="text-right p-4">₸455</td>
                      <td className="text-right p-4">₸453</td>
                      <td className="text-right p-4 text-red-600 flex items-center justify-end">
                        <ChevronDown className="h-4 w-4" />
                        -0.3%
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4 font-medium">BTC/KZT</td>
                      <td className="text-right p-4">₸20,000,000</td>
                      <td className="text-right p-4">₸19,850,000</td>
                      <td className="text-right p-4 text-green-600 flex items-center justify-end">
                        <ChevronUp className="h-4 w-4" />
                        +2.2%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t("home.faq.title")}
          </h2>
          <Accordion type="single" collapsible className="max-w-2xl mx-auto">
            {faq_items.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Готовы начать торговать?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Присоединяйтесь к тысячам пользователей Midas Exchange
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate("/register")}
            >
              Создать аккаунт
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/login")}
              className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              Войти
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}