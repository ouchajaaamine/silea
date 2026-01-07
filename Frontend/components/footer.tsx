"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Facebook, Instagram, Mail, MapPin, Phone, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { publicCategoriesApi, type Category } from "@/lib/api"
import { useTranslation } from "@/lib/translation-context"
import { useCategoryDialog } from "@/lib/category-dialog-context"

export default function Footer() {
  const { t, language } = useTranslation()
  const { openDialog } = useCategoryDialog()
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await publicCategoriesApi.getActive()
        setCategories(data)
      } catch (err) {
        console.error("Failed to fetch categories for footer:", err)
      }
    }
    fetchCategories()
  }, [])

  return (
    <footer className="relative mt-24 overflow-hidden">
      {/* Moroccan Pattern Background */}
      <div className="moroccan-pattern opacity-3" />
      
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#556B2F]/5 via-background to-[#D6A64F]/5" />

      {/* Call to Action Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="glass-card p-8 md:p-12 rounded-3xl bg-gradient-to-br from-[#556B2F]/10 to-[#D6A64F]/10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="font-serif text-3xl md:text-4xl font-bold mb-3 gradient-text">
                {t.footer.cta.title}
              </h3>
              <p className="text-muted-foreground text-lg">
                {t.footer.cta.description}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={openDialog}
                className="flex-1 w-full btn-primary h-14 text-base"
              >
                {t.footer.cta.shopNow}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Link href="/about" className="flex-1">
                <Button variant="outline" className="w-full btn-secondary h-14 text-base">
                  {t.footer.cta.learnMore}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#556B2F]/10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center">
              <img
                src="/logo.png"
                alt="Silea Logo"
                className="h-16 w-auto object-contain"
              />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.footer.brandDescription}
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-xl glass-card flex items-center justify-center hover:bg-[#556B2F]/10 transition-all duration-300 group"
              >
                <Facebook className="w-4 h-4 text-muted-foreground group-hover:text-[#556B2F] transition-colors" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl glass-card flex items-center justify-center hover:bg-[#556B2F]/10 transition-all duration-300 group"
              >
                <Instagram className="w-4 h-4 text-muted-foreground group-hover:text-[#556B2F] transition-colors" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-serif font-semibold text-lg mb-6 text-[#556B2F]">{t.footer.shop}</h4>
            <ul className="space-y-3">
              {categories.length > 0 && (
                <li>
                  <Link
                    href={`/category/${categories[0]?.slug || 'honey'}`}
                    className="text-sm text-muted-foreground hover:text-[#556B2F] transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-[#D6A64F] transition-all duration-300" />
                    {t.footer.allProducts}
                  </Link>
                </li>
              )}
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/category/${category.slug}`}
                    className="text-sm text-muted-foreground hover:text-[#556B2F] transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-[#D6A64F] transition-all duration-300" />
                    {language === 'ar' && category.nameAr ? category.nameAr : category.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-[#556B2F] transition-colors duration-300 flex items-center gap-2 group"
                >
                  <span className="w-0 group-hover:w-2 h-px bg-[#D6A64F] transition-all duration-300" />
                  {t.footer.giftSets}
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-[#556B2F] transition-colors duration-300 flex items-center gap-2 group"
                >
                  <span className="w-0 group-hover:w-2 h-px bg-[#D6A64F] transition-all duration-300" />
                  {t.footer.newArrivals}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-serif font-semibold text-lg mb-6 text-[#556B2F]">{t.footer.support}</h4>
            <ul className="space-y-3">
              {[
                { label: t.common.about, href: "/about" },
                { label: t.common.contact, href: "/contact" },
                { label: t.footer.trackOrder, href: "/track-order" },
                { label: t.footer.shippingInfo, href: "#" },
                { label: t.footer.returns, href: "#" },
                { label: t.footer.faq, href: "#" },
              ].map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-[#556B2F] transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-[#D6A64F] transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-serif font-semibold text-lg mb-6 text-[#556B2F]">{t.footer.contact}</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-[#D6A64F]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#D6A64F]/20 transition-colors">
                  <Mail className="w-4 h-4 text-[#D6A64F]" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t.common.email}</p>
                  <a
                    href="mailto:official@siléa.com"
                    className="text-sm font-medium hover:text-[#556B2F] transition-colors"
                  >
                    official@siléa.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-[#D6A64F]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#D6A64F]/20 transition-colors">
                  <Phone className="w-4 h-4 text-[#D6A64F]" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t.common.phone}</p>
                  <a
                    href="tel:+212664389712"
                    className="text-sm font-medium hover:text-[#556B2F] transition-colors"
                    dir="ltr"
                  >
                    +212 664-389712
                  </a>
                </div>
              </div>


            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#556B2F]/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground text-center md:text-left">
              {t.footer.copyright}
            </p>
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <a href="#" className="hover:text-[#556B2F] transition-colors">
                {t.footer.privacy}
              </a>
              <a href="#" className="hover:text-[#556B2F] transition-colors">
                {t.footer.terms}
              </a>
              <a href="#" className="hover:text-[#556B2F] transition-colors">
                {t.footer.cookies}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
