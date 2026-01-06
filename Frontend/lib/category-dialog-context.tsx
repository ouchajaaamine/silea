"use client"

import React, { createContext, useContext, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useTranslation } from "@/lib/translation-context"

interface CategoryDialogContextType {
  isOpen: boolean
  openDialog: () => void
  closeDialog: () => void
}

const CategoryDialogContext = createContext<CategoryDialogContextType | undefined>(undefined)

export function CategoryDialogProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslation()

  const openDialog = () => setIsOpen(true)
  const closeDialog = () => setIsOpen(false)

  return (
    <CategoryDialogContext.Provider value={{ isOpen, openDialog, closeDialog }}>
      {children}
      
      {/* The Single Shared Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-4xl bg-gradient-to-br from-[#faf9f6] via-white to-[#f8f6f1] border-2 border-[#D6A64F]/20 shadow-2xl">
          {/* Floating decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-4 left-8 w-2 h-2 rounded-full bg-[#D6A64F]/40 animate-pulse" />
            <div className="absolute top-12 right-12 w-3 h-3 rounded-full bg-[#556B2F]/30 animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-8 left-16 w-2 h-2 rounded-full bg-[#D6A64F]/50 animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-16 right-8 w-3 h-3 rounded-full bg-[#556B2F]/40 animate-pulse" style={{ animationDelay: '1.5s' }} />
          </div>

          <DialogHeader>
            <DialogTitle className="text-3xl font-serif text-center text-[#2d3a1f] mb-2">
              {t.home.categories.title}
            </DialogTitle>
            <p className="text-center text-muted-foreground">
              {t.home.categories.subtitle}
            </p>
          </DialogHeader>
          
          <div className="flex flex-col sm:flex-row justify-center items-stretch gap-6 max-w-5xl mx-auto px-8 py-6">
            {/* Honey Card */}
            <Link 
              href="/category/miels" 
              className="flex-1 min-w-[280px] sm:max-w-md group"
              onClick={closeDialog}
            >
              <div className="relative h-full p-10 rounded-2xl bg-gradient-to-br from-white to-[#FAF7F0] border-2 border-[#D6A64F]/30 hover:border-[#D6A64F] transition-all duration-300 hover:shadow-2xl hover:shadow-[#D6A64F]/20 hover:-translate-y-1">
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#D6A64F]/0 to-[#D6A64F]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10 flex flex-col items-center text-center h-full">
                  {/* Icon */}
                  <div className="relative mb-6 w-28 h-28 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <div className="absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[#D6A64F]/30" />
                    <img
                      src="/honeyIcon.png"
                      alt="Honey"
                      className="w-24 h-24 object-contain relative z-10 drop-shadow-md"
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-2 mb-6">
                    <h3 className="text-xl font-serif font-bold text-[#2d3a1f] group-hover:text-[#D6A64F] transition-colors">
                      {t.nav.categories.honey}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t.home.categories.honeyDesc}
                    </p>
                  </div>
                  
                  {/* CTA */}
                  <div className="mt-auto">
                    <Button 
                      variant="outline" 
                      className="group/btn border-[#D6A64F] text-[#D6A64F] hover:bg-[#D6A64F] hover:text-white transition-all duration-300"
                    >
                      {t.home.categories.explore}
                      <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </div>
            </Link>

            {/* Oils Card */}
            <Link 
              href="/category/huiles-olive" 
              className="flex-1 min-w-[280px] sm:max-w-md group"
              onClick={closeDialog}
            >
              <div className="relative h-full p-10 rounded-2xl bg-gradient-to-br from-white to-[#F0F7F0] border-2 border-[#556B2F]/30 hover:border-[#556B2F] transition-all duration-300 hover:shadow-2xl hover:shadow-[#556B2F]/20 hover:-translate-y-1">
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#556B2F]/0 to-[#556B2F]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10 flex flex-col items-center text-center h-full">
                  {/* Icon */}
                  <div className="relative mb-6 w-28 h-28 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <div className="absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[#556B2F]/30" />
                    <img
                      src="/oilIcon.png"
                      alt="Oils"
                      className="w-24 h-24 object-contain relative z-10 drop-shadow-md"
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-2 mb-6">
                    <h3 className="text-xl font-serif font-bold text-[#2d3a1f] group-hover:text-[#556B2F] transition-colors">
                      {t.nav.categories.oils}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t.home.categories.oilsDesc}
                    </p>
                  </div>
                  
                  {/* CTA */}
                  <div className="mt-auto">
                    <Button 
                      variant="outline" 
                      className="group/btn border-[#556B2F] text-[#556B2F] hover:bg-[#556B2F] hover:text-white transition-all duration-300"
                    >
                      {t.home.categories.explore}
                      <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </CategoryDialogContext.Provider>
  )
}

export function useCategoryDialog() {
  const context = useContext(CategoryDialogContext)
  if (context === undefined) {
    throw new Error('useCategoryDialog must be used within a CategoryDialogProvider')
  }
  return context
}
