"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  Home,
  Settings,
  Menu,
  X,
  LogOut,
  Building2,
  Users,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/api/users";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    title: "Início",
    href: "/",
    icon: Home,
  },
  {
    title: "Imóveis",
    href: "/imoveis",
    icon: Building2,
  },
  {
    title: "Usuários",
    href: "/usuarios",
    icon: Users,
  },
  {
    title: "Configurações",
    href: "/configuracoes",
    icon: Settings,
  },
];

function UserInfoSection() {
  const { data: userData, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const user = userData?.data;

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: "Administrador",
      standard: "Padrão",
    };
    return labels[role] || role;
  };

  if (isLoading) {
    return (
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="p-4 border-t border-gray-200">
      <div className="p-3 bg-gray-50 rounded-lg">
        <p className="text-sm font-semibold text-black truncate">
          {user.full_name}
        </p>
        <p className="text-xs text-gray-600 truncate">{user.email}</p>
        <p className="text-xs text-gray-500 mt-1">
          {getRoleLabel(user.role)}
        </p>
      </div>
    </div>
  );
}

function LogoutButtonSidebar() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Erro ao fazer logout:", error);
      } else {
        router.push("/login");
        router.refresh();
      }
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={loading}
      variant="outline"
      className="w-full bg-[#FFCC00] hover:bg-[#FFCC00]/90 text-black border-black"
    >
      <LogOut className="h-4 w-4 mr-2" />
      {loading ? "Saindo..." : "Sair"}
    </Button>
  );
}

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Buscar dados do usuário atual para verificar o role
  const { data: userData } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  const userRole = userData?.data?.role;

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  // Filtrar itens de navegação baseado no role
  const filteredNavItems = navItems.filter((item) => {
    // Se for usuário padrão, esconder apenas "Usuários"
    if (userRole === "standard") {
      return item.href !== "/usuarios";
    }
    // Admin vê todos os itens
    return true;
  });

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-[#FFCC00] text-black hover:bg-[#FFCC00]/90 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-white text-black border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header com logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center">
                <Image
                  src="https://bdxoocqlcrurivdxkxao.supabase.co/storage/v1/object/public/project/logo_black.png"
                  alt="Kazavel CRM"
                  width={120}
                  height={40}
                  className="h-auto w-auto"
                  priority
                />
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="lg:hidden text-gray-600 hover:text-black"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {filteredNavItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                      isActive(item.href)
                        ? "bg-[#FFCC00] text-black font-semibold"
                        : "text-gray-700 hover:bg-gray-100 hover:text-black"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Informações do usuário */}
          <UserInfoSection />

          {/* Footer com logout */}
          <div className="p-4 border-t border-gray-200">
            <LogoutButtonSidebar />
          </div>
        </div>
      </aside>
    </>
  );
}
