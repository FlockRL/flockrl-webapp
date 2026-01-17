"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Upload, Menu, LayoutGrid, Info } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Gallery", icon: LayoutGrid },
  { href: "/submit", label: "Submit", icon: Upload },
  { href: "/about", label: "About", icon: Info },
]

export function Header() {
  const pathname = usePathname()

  return (
    <header className="flex h-16 items-center justify-between border-b border-border glass px-4 md:px-6">
      {/* Logo */}
      <Link href="/" className="group flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary glow-sm group-hover:glow-md transition-all duration-300">
          <span className="text-sm font-bold text-primary-foreground">F</span>
        </div>
        <span className="text-lg font-semibold tracking-tight gradient-text">FlockRL Gallery</span>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300",
                isActive
                  ? "bg-primary text-primary-foreground glow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground hover:glow-sm",
              )}
            >
              <Icon className={cn("h-4 w-4 transition-transform duration-300", isActive ? "" : "group-hover:scale-110")} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Mobile Menu */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 glass border-border p-0">
            <div className="flex h-16 items-center border-b border-border px-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary glow-sm">
                  <span className="text-sm font-bold text-primary-foreground">F</span>
                </div>
                <span className="text-lg font-semibold gradient-text">FlockRL</span>
              </Link>
            </div>
            <nav className="flex flex-col gap-1 p-4">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300",
                      isActive
                        ? "bg-primary text-primary-foreground glow-sm"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
