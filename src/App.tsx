import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock authorization
    if (email && password) {
      alert("Успешный вход! Перенаправляем в личный кабинет...");
      // В реальном приложении здесь будет API запрос
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Вход в аккаунт</h2>
          <p className="mt-2 text-gray-600">Войдите в свой аккаунт для торговли</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Пароль
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-600">Запомнить меня</span>
              </label>
              <a href="#" className="text-sm text-blue-600 hover:underline">
                Забыли пароль?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Войти
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Нет аккаунта?{" "}
              <Link to="/register" className="text-blue-600 hover:underline font-medium">
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("Пароли не совпадают!");
      return;
    }
    
    if (!formData.agreeToTerms) {
      alert("Необходимо принять условия использования!");
      return;
    }
    
    if (formData.email && formData.password) {
      alert("Успешная регистрация! Добро пожаловать в Midas Exchange!");
      navigate("/dashboard");
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Регистрация</h2>
          <p className="mt-2 text-gray-600">Создайте аккаунт для торговли криптовалютой</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Пароль
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Минимум 8 символов, одна заглавная буква и цифра
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Подтвердите пароль
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => updateField("confirmPassword", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Реферальный код (необязательно)
              </label>
              <input
                type="text"
                value={formData.referralCode}
                onChange={(e) => updateField("referralCode", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ABC123XYZ"
              />
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={(e) => updateField("agreeToTerms", e.target.checked)}
                className="mt-1"
                required
              />
              <label className="text-sm text-gray-600">
                Я принимаю{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  условия использования
                </a>{" "}
                и{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  политику конфиденциальности
                </a>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Зарегистрироваться
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Уже есть аккаунт?{" "}
              <Link to="/login" className="text-blue-600 hover:underline font-medium">
                Войти
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mock данные для кошельков
const mockWallets = [
  { currency: "KZT", symbol: "₸", balance: 2450000, usdValue: 5347, color: "bg-green-500" },
  { currency: "USD", symbol: "$", balance: 3250, usdValue: 3250, color: "bg-blue-500" },
  { currency: "BTC", symbol: "₿", balance: 0.15648, usdValue: 6780, color: "bg-orange-500" },
  { currency: "ETH", symbol: "Ξ", balance: 2.4567, usdValue: 5896, color: "bg-purple-500" },
  { currency: "USDT", symbol: "₮", balance: 1850, usdValue: 1850, color: "bg-emerald-500" },
];

// Mock данные для истории транзакций
const mockTransactions = [
  { id: "1", type: "exchange", from: "USD", to: "BTC", fromAmount: 500, toAmount: 0.0115, status: "completed", date: "2024-12-05 10:30", fee: 10 },
  { id: "2", type: "deposit", from: "KZT", to: "KZT", fromAmount: 500000, toAmount: 500000, status: "completed", date: "2024-12-04 15:20", fee: 0 },
  { id: "3", type: "exchange", from: "ETH", to: "USDT", fromAmount: 1.5, toAmount: 3600, status: "completed", date: "2024-12-03 09:15", fee: 72 },
  { id: "4", type: "withdrawal", from: "USD", to: "USD", fromAmount: 1000, toAmount: 1000, status: "processing", date: "2024-12-02 14:45", fee: 15 },
];

// Mock курсы валют
const mockRates = {
  "USD-BTC": 0.000023,
  "BTC-USD": 43478,
  "USD-ETH": 0.00042,
  "ETH-USD": 2380,
  "KZT-USD": 0.0022,
  "USD-KZT": 455,
  "KZT-BTC": 0.00000005,
  "BTC-KZT": 20000000,
  "USDT-USD": 1,
  "USD-USDT": 1,
  "USDT-KZT": 0.0022,
  "KZT-USDT": 455,
};

function DashboardLayout({ children, currentPage, setCurrentPage }: { children: React.ReactNode, currentPage: string, setCurrentPage: (page: string) => void }) {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">M</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Midas Exchange</span>
          </div>
          
          <nav className="space-y-2">
            <button
              onClick={() => setCurrentPage("dashboard")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                currentPage === "dashboard" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="text-xl">🏠</span>
              <span className="font-medium">Панель управления</span>
            </button>
            
            <button
              onClick={() => setCurrentPage("wallets")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                currentPage === "wallets" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="text-xl">💳</span>
              <span className="font-medium">Кошельки</span>
            </button>
            
            <button
              onClick={() => setCurrentPage("exchange")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                currentPage === "exchange" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="text-xl">🔄</span>
              <span className="font-medium">Обмен</span>
            </button>
            
            <button
              onClick={() => setCurrentPage("history")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                currentPage === "history" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="text-xl">📊</span>
              <span className="font-medium">История</span>
            </button>
            
            <button
              onClick={() => setCurrentPage("profile")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                currentPage === "profile" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="text-xl">⚙️</span>
              <span className="font-medium">Профиль</span>
            </button>
          </nav>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t">
          <Link
            to="/"
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <span className="text-xl">🚪</span>
            <span className="font-medium">Выход</span>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}

function DashboardHome() {
  const totalBalance = mockWallets.reduce((sum, wallet) => sum + wallet.usdValue, 0);
  
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Панель управления</h1>
      
      {/* Баланс и статистика */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Общий баланс</h3>
            <button className="text-gray-400 hover:text-gray-600">👁️</button>
          </div>
          <p className="text-3xl font-bold text-blue-600 mb-2">${totalBalance.toLocaleString()}</p>
          <p className="text-sm text-gray-500">≈ {(totalBalance * 455).toLocaleString()} ₸</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Последняя активность</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Обмен USD → BTC</span>
              <span className="text-sm font-medium text-green-600">Завершен</span>
            </div>
            <p className="text-xs text-gray-500">5 декабря, 10:30</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">KYC Статус</h3>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm font-medium text-yellow-600">Базовая верификация</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Лимит: 500,000 ₸/месяц</p>
        </div>
      </div>
      
      {/* Топ кошельки */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Мои кошельки</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {mockWallets.map((wallet) => (
            <div key={wallet.currency} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-10 h-10 ${wallet.color} rounded-full flex items-center justify-center text-white font-bold`}>
                  {wallet.symbol}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{wallet.currency}</h4>
                  <p className="text-xs text-gray-500">${wallet.usdValue.toLocaleString()}</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-800">
                {wallet.balance.toLocaleString()} {wallet.currency}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Последние транзакции */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Последние операции</h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Посмотреть все
          </button>
        </div>
        
        <div className="space-y-4">
          {mockTransactions.slice(0, 3).map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.type === 'exchange' ? 'bg-purple-100 text-purple-600' :
                  tx.type === 'deposit' ? 'bg-green-100 text-green-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {tx.type === 'exchange' ? '🔄' : tx.type === 'deposit' ? '⬇️' : '⬆️'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {tx.type === 'exchange' ? `${tx.from} → ${tx.to}` :
                     tx.type === 'deposit' ? `Пополнение ${tx.from}` :
                     `Вывод ${tx.from}`}
                  </p>
                  <p className="text-sm text-gray-500">{tx.date}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {tx.type === 'withdrawal' ? '-' : '+'}{tx.fromAmount.toLocaleString()} {tx.from}
                </p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  tx.status === 'completed' ? 'bg-green-100 text-green-800' :
                  tx.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {tx.status === 'completed' ? 'Завершено' :
                   tx.status === 'processing' ? 'В обработке' : 'Отклонено'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WalletsPage() {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [action, setAction] = useState<"deposit" | "withdraw" | null>(null);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Кошельки</h1>
        <div className="text-sm text-gray-500">
          Общий баланс: ${mockWallets.reduce((sum, w) => sum + w.usdValue, 0).toLocaleString()}
        </div>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-6">
        {mockWallets.map((wallet) => (
          <div key={wallet.currency} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 ${wallet.color} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                  {wallet.symbol}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{wallet.currency}</h3>
                  <p className="text-sm text-gray-500">${wallet.usdValue.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {wallet.balance.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">{wallet.currency}</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button 
                onClick={() => {
                  setSelectedWallet(wallet.currency);
                  setAction("deposit");
                }}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Пополнить
              </button>
              <button 
                onClick={() => {
                  setSelectedWallet(wallet.currency);
                  setAction("withdraw");
                }}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Вывести
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Модальное окно */}
      {selectedWallet && action && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              {action === "deposit" ? "Пополнение" : "Вывод"} {selectedWallet}
            </h3>
            
            {action === "deposit" ? (
              <div>
                <p className="text-gray-600 mb-4">Адрес для пополнения:</p>
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                  <code className="text-sm break-all">
                    {selectedWallet === "BTC" ? "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" :
                     selectedWallet === "ETH" ? "0x742d35Cc6635C0532925a3b8D4bf72E1D4e3ec3C" :
                     selectedWallet === "USDT" ? "TYASr6M5wWKR4CYGYkGAV8nhG2S9VuPaYw" :
                     "Банковский перевод"}
                  </code>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Минимальная сумма: {selectedWallet === "KZT" ? "5,000 ₸" : selectedWallet === "USD" ? "$10" : "0.001 " + selectedWallet}
                </p>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Адрес получателя</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder={selectedWallet === "KZT" || selectedWallet === "USD" ? "Номер карты" : "Адрес кошелька"}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Сумма</label>
                  <input 
                    type="number" 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Комиссия: {selectedWallet === "KZT" ? "1%" : selectedWallet === "USD" ? "$2" : "0.0005 " + selectedWallet}
                </p>
              </div>
            )}
            
            <div className="flex space-x-3">
              <button 
                onClick={() => {
                  setSelectedWallet(null);
                  setAction(null);
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
              >
                Отмена
              </button>
              <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
                {action === "deposit" ? "Скопировать адрес" : "Отправить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ExchangePage() {
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("BTC");
  const [fromAmount, setFromAmount] = useState(100);
  const [isExchanging, setIsExchanging] = useState(false);
  
  const currencies = ["KZT", "USD", "BTC", "ETH", "USDT"];
  const rateKey = `${fromCurrency}-${toCurrency}` as keyof typeof mockRates;
  const rate = mockRates[rateKey] || 1;
  const fee = 0.02; // 2%
  const toAmount = (fromAmount * rate * (1 - fee));
  
  const handleExchange = async () => {
    setIsExchanging(true);
    // Имитация обмена
    await new Promise(resolve => setTimeout(resolve, 2000));
    alert(`Обмен выполнен успешно! Вы получили ${toAmount.toFixed(8)} ${toCurrency}`);
    setIsExchanging(false);
    setFromAmount(0);
  };
  
  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Обмен валют</h1>
      
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="space-y-6">
          {/* From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Отдаете</label>
            <div className="flex space-x-3">
              <div className="flex-1">
                <input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(parseFloat(e.target.value) || 0)}
                  className="w-full text-2xl font-semibold border border-gray-300 rounded-lg px-4 py-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white font-medium"
              >
                {currencies.map(currency => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Доступно: {mockWallets.find(w => w.currency === fromCurrency)?.balance.toLocaleString() || 0} {fromCurrency}
            </p>
          </div>
          
          {/* Swap button */}
          <div className="flex justify-center">
            <button
              onClick={swapCurrencies}
              className="p-3 border-2 border-gray-200 rounded-full hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>
          
          {/* To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Получаете</label>
            <div className="flex space-x-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={toAmount.toFixed(8)}
                  readOnly
                  className="w-full text-2xl font-semibold border border-gray-300 rounded-lg px-4 py-4 bg-gray-50"
                />
              </div>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white font-medium"
              >
                {currencies.map(currency => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Exchange info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Курс обмена</span>
              <span className="font-medium">1 {fromCurrency} = {rate.toFixed(8)} {toCurrency}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Комиссия</span>
              <span className="font-medium">{(fee * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-200">
              <span>К получению</span>
              <span>{toAmount.toFixed(8)} {toCurrency}</span>
            </div>
          </div>
          
          {/* Exchange button */}
          <button
            onClick={handleExchange}
            disabled={isExchanging || fromAmount <= 0}
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isExchanging ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Обмениваем...</span>
              </span>
            ) : (
              "Обменять"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function HistoryPage() {
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  
  const filteredTransactions = mockTransactions.filter(tx => 
    filter === "all" || tx.type === filter
  );
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">История операций</h1>
        
        <div className="flex space-x-3">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="all">Все операции</option>
            <option value="exchange">Обмен</option>
            <option value="deposit">Пополнение</option>
            <option value="withdrawal">Вывод</option>
          </select>
          
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Экспорт
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Операция
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Сумма
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Комиссия
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                        tx.type === 'exchange' ? 'bg-purple-100' :
                        tx.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <span className="text-lg">
                          {tx.type === 'exchange' ? '🔄' : tx.type === 'deposit' ? '⬇️' : '⬆️'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {tx.type === 'exchange' ? `${tx.from} → ${tx.to}` :
                           tx.type === 'deposit' ? `Пополнение ${tx.from}` :
                           `Вывод ${tx.from}`}
                        </div>
                        <div className="text-sm text-gray-500">ID: {tx.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {tx.fromAmount.toLocaleString()} {tx.from}
                    </div>
                    {tx.type === 'exchange' && (
                      <div className="text-sm text-gray-500">
                        → {tx.toAmount.toLocaleString()} {tx.to}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {tx.fee > 0 ? `${tx.fee} ${tx.from}` : 'Бесплатно'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      tx.status === 'completed' ? 'bg-green-100 text-green-800' :
                      tx.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {tx.status === 'completed' ? 'Завершено' :
                       tx.status === 'processing' ? 'В обработке' : 'Отклонено'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tx.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProfilePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Профиль</h1>
      
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Основная информация</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                value="user@example.com" 
                readOnly 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
              <input 
                type="tel" 
                placeholder="+7 (___) ___-__-__" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                <input 
                  type="text" 
                  placeholder="Ваше имя"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Фамилия</label>
                <input 
                  type="text" 
                  placeholder="Ваша фамилия"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700">
              Сохранить изменения
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Безопасность</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Изменить пароль</h3>
              <div className="space-y-3">
                <input 
                  type="password" 
                  placeholder="Текущий пароль"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                <input 
                  type="password" 
                  placeholder="Новый пароль"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                <input 
                  type="password" 
                  placeholder="Подтвердите новый пароль"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700">
                  Изменить пароль
                </button>
              </div>
            </div>
            
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Двухфакторная аутентификация</h3>
                  <p className="text-sm text-gray-500">Дополнительная защита аккаунта</p>
                </div>
                <button className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700">
                  Включить 2FA
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardPage() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  
  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard": return <DashboardHome />;
      case "wallets": return <WalletsPage />;
      case "exchange": return <ExchangePage />;
      case "history": return <HistoryPage />;
      case "profile": return <ProfilePage />;
      default: return <DashboardHome />;
    }
  };
  
  return (
    <DashboardLayout currentPage={currentPage} setCurrentPage={setCurrentPage}>
      {renderCurrentPage()}
    </DashboardLayout>
  );
}

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">M</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Midas Exchange</span>
            </div>
            
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-blue-600">Главная</a>
              <a href="#" className="text-gray-600 hover:text-blue-600">О нас</a>
              <a href="#" className="text-gray-600 hover:text-blue-600">Как это работает</a>
            </nav>
            
            <div className="flex space-x-3">
              <Link to="/login" className="px-4 py-2 text-blue-600 hover:text-blue-700">
                Вход
              </Link>
              <Link to="/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Регистрация
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Безопасный обмен криптовалют в Казахстане
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Покупайте и продавайте BTC, ETH, USDT за тенге с минимальными комиссиями
          </p>
          
          {/* Exchange Calculator */}
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto mb-12">
            <h2 className="text-2xl font-semibold mb-6">Калькулятор обмена</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-left text-sm font-medium text-gray-700 mb-2">
                  Отдаете
                </label>
                <div className="flex space-x-2">
                  <input 
                    type="number" 
                    placeholder="100" 
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option>USD</option>
                    <option>KZT</option>
                    <option>BTC</option>
                    <option>ETH</option>
                    <option>USDT</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-center">
                <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                  ↕️
                </button>
              </div>
              
              <div>
                <label className="block text-left text-sm font-medium text-gray-700 mb-2">
                  Получаете
                </label>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    value="0.00230" 
                    readOnly
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                  />
                  <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option>BTC</option>
                    <option>ETH</option>
                    <option>USDT</option>
                    <option>USD</option>
                    <option>KZT</option>
                  </select>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Курс:</span>
                  <span>1 USD = 0.00002300 BTC</span>
                </div>
                <div className="flex justify-between">
                  <span>Комиссия:</span>
                  <span>2.0%</span>
                </div>
              </div>
              
              <Link 
                to="/register"
                className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
              >
                Начать обмен
              </Link>
            </div>
          </div>
          
          {/* Features */}
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl">🛡️</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Безопасность</h3>
              <p className="text-gray-600 text-sm">Защита средств холодными кошельками</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Скорость</h3>
              <p className="text-gray-600 text-sm">Мгновенные обмены и выводы</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl">🎧</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Поддержка 24/7</h3>
              <p className="text-gray-600 text-sm">Команда всегда готова помочь</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl">⚖️</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Легальность</h3>
              <p className="text-gray-600 text-sm">Лицензированная деятельность в РК</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
