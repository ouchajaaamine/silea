"use client"

import { usePathname } from "next/navigation"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Login page doesn't need the admin layout wrapper
  if (pathname === "/admin") {
    return <>{children}</>
  }

  return <>{children}</>
}

