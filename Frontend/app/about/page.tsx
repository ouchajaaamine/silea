"use client"

import Header from "@/components/header"
import Footer from "@/components/footer"
import { MapPin, Users, Leaf, Heart, Shield, Award, Mountain, Droplets, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/translation-context"
import { useCategoryDialog } from "@/lib/category-dialog-context"

export default function About() {
  const { t, language } = useTranslation()
  const { openDialog } = useCategoryDialog()
  
  const values = [
    {
      icon: Leaf,
      title: t.about.values.purity.title,
      description: t.about.values.purity.description,
    },
    {
      icon: Users,
      title: t.about.values.community.title,
      description: t.about.values.community.description,
    },
    {
      icon: Shield,
      title: t.about.values.heritage.title,
      description: t.about.values.heritage.description,
    },
  ]

  const features = [
    {
      icon: Mountain,
      title: t.about.features.mountainSourced.title,
      description: t.about.features.mountainSourced.description,
    },
    {
      icon: Heart,
      title: t.about.features.handcrafted.title,
      description: t.about.features.handcrafted.description,
    },
    {
      icon: Award,
      title: t.about.features.premium.title,
      description: t.about.features.premium.description,
    },
    {
      icon: Droplets,
      title: t.about.features.coldPressed.title,
      description: t.about.features.coldPressed.description,
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#556B2F]/10 via-background to-[#D6A64F]/5" />
        <div className="moroccan-pattern" />

        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-block text-sm font-medium uppercase text-[#D6A64F] mb-4">
            {t.about.hero.title}
          </span>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold mb-6">{t.common.about}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.about.hero.subtitle}
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="relative max-w-lg mx-auto">
              <div className="relative rounded-2xl overflow-hidden glass-card">
                <img
                  src="/honeyabout.jpg"
                  alt="Pure Moroccan Honey from Beni Mellal"
                  className="w-full h-auto"
                />
              </div>
              {/* Floating Card */}
              <div className="absolute -bottom-6 -right-6 p-4 rounded-xl bg-gradient-to-br from-[#556B2F] to-[#6B8E23] text-white shadow-xl hidden md:block">
                <p className="text-3xl font-serif font-bold mb-1">30+</p>
                <p className="text-xs opacity-80">{t.home.story.yearsOfTradition}</p>
              </div>
            </div>

            {/* Content */}
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold leading-tight mb-4">{t.about.story.title}</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {t.about.story.p1}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t.about.story.tagline}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 premium-section">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block text-sm font-medium uppercase text-[#D6A64F] mb-4">
              {language === 'ar' ? 'ما نؤمن به' : language === 'fr' ? 'Nos Principes' : 'What We Stand For'}
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 leading-tight">
              {language === 'ar' ? 'قيمنا' : language === 'fr' ? 'Nos Valeurs' : 'Our Values'}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {language === 'ar' 
                ? 'كل منتج نصنعه يسترشد بالتزامنا بالنقاء والمجتمع والتراث' 
                : language === 'fr'
                ? 'Chaque produit que nous créons est guidé par notre engagement envers la pureté, la communauté et le patrimoine'
                : 'Every product we create is guided by our commitment to purity, community, and heritage'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <Card
                key={value.title}
                className="glass-card text-center p-6"
              >
                <CardContent className="p-0">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#556B2F]/20 to-[#D6A64F]/20 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-8 h-8 text-[#556B2F]" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold mb-4">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#556B2F]/5 to-[#D6A64F]/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <Card
                key={feature.title}
                className="glass-card p-4 opacity-0 animate-in fade-in zoom-in fill-mode-forwards"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-0">
                  <div className="w-10 h-10 rounded-lg bg-[#556B2F]/10 flex items-center justify-center mb-3">
                    <feature.icon className="w-5 h-5 text-[#556B2F]" />
                  </div>
                  <h3 className="font-serif font-bold mb-1 text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="glass-card p-6 md:p-8 text-center">
            <CardContent className="p-0">
              <h2 className="text-2xl md:text-3xl font-serif font-bold mb-3">
                {t.about.hero.subtitle}
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                {language === 'ar' 
                  ? 'اكتشف منتجاتنا الأصيلة من العسل والزيوت' 
                  : language === 'fr'
                  ? 'Découvrez nos produits authentiques de miel et huiles'
                  : 'Discover our authentic honey and oil products'}
              </p>
              <div className="flex justify-center">
                <Button 
                  onClick={openDialog}
                  className="btn-primary text-lg px-10 py-6 group"
                >
                  {language === 'ar' ? 'تسوق الآن' : language === 'fr' ? 'Acheter maintenant' : 'Shop Now'}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  )
}
