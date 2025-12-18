import { Link } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Shield,
  Award,
  Clock,
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold">Midas Exchange</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Безопасный и надежный обменник криптовалют в Казахстане. 
              Лицензированная деятельность, прозрачные условия.
            </p>
            <div className="flex items-center gap-4">
              <Shield className="h-5 w-5 text-primary" />
              <Award className="h-5 w-5 text-primary" />
              <Clock className="h-5 w-5 text-primary" />
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Компания</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-primary">
                  О нас
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-sm text-muted-foreground hover:text-primary">
                  Как это работает
                </Link>
              </li>
              <li>
                <Link to="/fees" className="text-sm text-muted-foreground hover:text-primary">
                  Комиссии
                </Link>
              </li>
              <li>
                <Link to="/security" className="text-sm text-muted-foreground hover:text-primary">
                  Безопасность
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Правовая информация</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary">
                  Условия использования
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                  Политика конфиденциальности
                </Link>
              </li>
              <li>
                <Link to="/aml" className="text-sm text-muted-foreground hover:text-primary">
                  AML/KYC политика
                </Link>
              </li>
              <li>
                <Link to="/licenses" className="text-sm text-muted-foreground hover:text-primary">
                  Лицензии
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Контакты</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                support@midasexchange.kz
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                +7 (727) 123-45-67
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Алматы, Казахстан
              </li>
            </ul>
            <div className="flex gap-3 mt-4">
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} Midas Exchange. Все права защищены.</p>
          <p className="mt-2">
            ТОО "Midas Exchange" | БИН 123456789012 | Лицензия №123 от 01.01.2024
          </p>
        </div>
      </div>
    </footer>
  );
}