import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AuthLayout() {
  const { i18n } = useTranslation();

  const languages = [
    { code: "ru", name: "Русский", flag: "🇷🇺" },
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "kk", name: "Қазақша", flag: "🇰🇿" },
  ];

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 relative">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Globe className="h-4 w-4" />
              <span>{languages.find((l) => l.code === i18n.language)?.flag}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={i18n.language === lang.code ? "bg-accent" : ""}
              >
                <span className="mr-2">{lang.flag}</span>
                {lang.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Outlet />
    </div>
  );
}
