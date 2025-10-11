import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";

import { useAuth, type Role } from "@/auth/AuthContext";
import Drawer from "@/components/Drawer";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  BadgePercent,
  Box,
  LayoutDashboard,
  Layers,
  Menu,
  PackageCheck,
  Package,
  Receipt,
  Settings,
  Sparkles,
  Star,
  Store,
  Truck, // Added Truck icon
  Users,
} from "lucide-react";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const adminNavItems: NavItem[] = [
  {
    to: "/dashboard/analytics",
    label: "Panel",
    icon: LayoutDashboard,
    end: true,
  },
  { to: "/dashboard/admin/users", label: "Usuarios", icon: Users },
  { to: "/dashboard/admin/stores", label: "Tiendas", icon: Store },
  { to: "/dashboard/admin/products", label: "Productos", icon: Box },
  { to: "/dashboard/admin/categories", label: "Categorias", icon: Layers },
  { to: "/dashboard/admin/taxes", label: "Impuestos", icon: Receipt },
  { to: "/dashboard/admin/orders", label: "Pedidos", icon: PackageCheck },
  { to: "/dashboard/admin/reviews", label: "Resenas", icon: Star },
  { to: "/dashboard/admin/settings", label: "Configuracion", icon: Settings },
];

const supportNavItems: NavItem[] = [
  {
    to: "/dashboard/analytics",
    label: "Panel",
    icon: LayoutDashboard,
    end: true,
  },
  { to: "/dashboard/admin/users", label: "Usuarios", icon: Users },
  { to: "/dashboard/admin/stores", label: "Tiendas", icon: Store },
  { to: "/dashboard/admin/orders", label: "Pedidos", icon: Package },
  { to: "/dashboard/admin/reviews", label: "Resenas", icon: Star },
];

const sellerNavItems: NavItem[] = [
  {
    to: "/dashboard/seller",
    label: "Resumen",
    icon: LayoutDashboard,
    end: true,
  },
  { to: "/dashboard/seller/products", label: "Productos", icon: Package },
  { to: "/dashboard/seller/orders", label: "Pedidos", icon: PackageCheck },
  {
    to: "/dashboard/seller/promotions",
    label: "Promociones",
    icon: BadgePercent,
  },
  { to: "/dashboard/seller/discounts", label: "Descuentos", icon: Receipt },
  { to: "/dashboard/seller/taxes", label: "Impuestos", icon: Receipt },
  { to: "/dashboard/seller/shipping", label: "Envíos", icon: Truck },
  { to: "/dashboard/seller/store", label: "Mi tienda", icon: Store },
];

const buyerNavItems: NavItem[] = [
  { to: "/dashboard/buyer", label: "Inicio", icon: LayoutDashboard, end: true },
  { to: "/dashboard/buyer/orders", label: "Mis ordenes", icon: Package },
  { to: "/dashboard/buyer/profile", label: "Perfil", icon: Sparkles },
];

const navItemsByRole: Record<Role, NavItem[]> = {
  admin: adminNavItems,
  support: supportNavItems,
  seller: sellerNavItems,
  buyer: buyerNavItems,
};

const roleLabel: Record<Role, string> = {
  admin: "Administrador",
  support: "Soporte",
  seller: "Vendedor",
  buyer: "Comprador",
};

const profileRouteByRole: Record<Role, string> = {
  admin: "/dashboard/account",
  support: "/dashboard/account",
  seller: "/dashboard/account",
  buyer: "/dashboard/account",
};

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navItems = user ? navItemsByRole[user.role] ?? [] : [];
  const displayName = (
    user?.displayName ??
    user?.firstName ??
    user?.email.split("@")[0] ??
    "Cuenta"
  ).trim();
  const initial = displayName.charAt(0).toUpperCase() || "C";
  const roleText = user ? roleLabel[user.role] : "";
  const profilePath = user
    ? profileRouteByRole[user.role] ?? "/dashboard"
    : "/dashboard";

  const renderNavList = (onNavigate?: () => void) => (
    <nav className="flex-1 space-y-1 px-3 pb-6">
      {navItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end ?? false}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )
          }
        >
          <Icon className="h-4 w-4" aria-hidden />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <aside className="hidden border-r border-border bg-card shadow-lg lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:overflow-y-auto">
        <div className="px-6 py-6 text-lg font-semibold tracking-tight">
          CommerceHub
        </div>
        {renderNavList()}
        <div className="px-4 pb-6">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {initial}
            </div>
            <div className="flex flex-1 flex-col text-sm">
              <span className="font-medium text-foreground">{displayName}</span>
              <span className="text-muted-foreground">{roleText}</span>
            </div>
          </div>
        </div>
      </aside>

      <Drawer
        open={mobileNavOpen}
        setOpen={setMobileNavOpen}
        drawerClass="h-[100dvh]"
        width="w-72"
        header={false}
      >
        <div className="flex h-full flex-col space-y-4">
          <div className="px-6 py-3 text-lg font-semibold tracking-tight border-b border-border">
            CommerceHub
          </div>
          {renderNavList(() => setMobileNavOpen(false))}
        </div>
      </Drawer>

      <div className="flex min-h-screen flex-col lg:ml-64">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="lg:hidden"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menu</span>
            </Button>
            <Button variant="ghost" asChild className="lg:hidden">
              <Link to="/dashboard">CommerceHub</Link>
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary focus:outline-none"
                aria-label="Abrir menu de usuario"
              >
                {initial}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5 text-sm">
                <p className="font-medium text-foreground">{displayName}</p>
                <p className="text-xs text-muted-foreground">{roleText}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={profilePath}>Ver perfil</Link>
              </DropdownMenuItem>
              {user?.role === "seller" && (
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/seller/store">Editar tienda</Link>
                </DropdownMenuItem>
              )}
              {user?.role === "admin" && (
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/admin/settings">
                    Gestion administrativa
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()}>
                Cerrar sesion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-10 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
