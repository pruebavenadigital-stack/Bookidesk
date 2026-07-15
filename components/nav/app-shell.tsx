"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Library, Heart, ArrowLeftRight, Sparkles, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { BookiWordmark } from "@/components/brand/wordmark";
import { UserMenu } from "@/components/nav/user-menu";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/biblioteca", label: "Biblioteca", icon: Library },
  { href: "/deseos", label: "Deseos", icon: Heart },
  { href: "/prestamos", label: "Préstamos", icon: ArrowLeftRight },
  { href: "/recomendar", label: "Recomendar", icon: Sparkles },
];

type ProfileInfo = {
  displayName: string;
  avatarColor: string;
  email: string;
};

export function AppShell({
  children,
  profile,
}: {
  children: React.ReactNode;
  profile: ProfileInfo;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="min-h-dvh md:flex">
      {/* ---- Sidebar (escritorio) ---- */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r bg-sidebar md:flex">
        <div className="p-5">
          <Link href="/biblioteca">
            <BookiWordmark className="text-2xl" />
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(href)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3">
          <Button asChild className="w-full">
            <Link href="/agregar">
              <Plus className="h-4 w-4" />
              Agregar libro
            </Link>
          </Button>
        </div>
        <div className="flex items-center justify-between gap-2 border-t p-3">
          <span className="truncate text-sm font-medium">
            {profile.displayName}
          </span>
          <UserMenu
            displayName={profile.displayName}
            avatarColor={profile.avatarColor}
            email={profile.email}
          />
        </div>
      </aside>

      {/* ---- Columna principal ---- */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Barra superior (móvil) */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:hidden">
          <Link href="/biblioteca">
            <BookiWordmark className="text-xl" />
          </Link>
          <UserMenu
            displayName={profile.displayName}
            avatarColor={profile.avatarColor}
            email={profile.email}
          />
        </header>

        <main className="flex-1 pb-24 md:pb-10">{children}</main>
      </div>

      {/* ---- Barra inferior (móvil) con FAB central ---- */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5 items-center px-2">
          {[NAV[0], NAV[1]].map(({ href, label, icon: Icon }) => (
            <BottomLink
              key={href}
              href={href}
              label={label}
              Icon={Icon}
              active={isActive(href)}
            />
          ))}
          <div className="flex justify-center">
            <Link
              href="/agregar"
              aria-label="Agregar libro"
              className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-background transition-transform active:scale-95"
            >
              <Plus className="h-6 w-6" />
            </Link>
          </div>
          {[NAV[2], NAV[3]].map(({ href, label, icon: Icon }) => (
            <BottomLink
              key={href}
              href={href}
              label={label}
              Icon={Icon}
              active={isActive(href)}
            />
          ))}
        </div>
      </nav>
    </div>
  );
}

function BottomLink({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      <Icon className="h-[22px] w-[22px]" />
      {label}
    </Link>
  );
}
