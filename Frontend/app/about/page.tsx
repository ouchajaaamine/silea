"use client"

import Header from "@/components/header"
import Footer from "@/components/footer"
import { MapPin, Users, Leaf, Heart, Shield, Award, Mountain, Droplets } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function About() {
  const values = [
    {
      icon: Leaf,
      title: "Purity",
      description: "100% natural products with no additives, preservatives, or artificial ingredients. Just pure nature.",
    },
    {
      icon: Users,
      title: "Community",
      description: "We work directly with local producers, supporting families and traditions in Beni Mellal for generations.",
    },
    {
      icon: Shield,
      title: "Heritage",
      description: "We honor centuries of traditional knowledge passed down through generations of mountain families.",
    },
  ]

  const features = [
    {
      icon: Mountain,
      title: "Mountain Sourced",
      description: "Our products come from the pristine Atlas Mountains of Beni Mellal, where nature remains untouched.",
    },
    {
      icon: Heart,
      title: "Handcrafted with Love",
      description: "Every jar and bottle is carefully prepared using traditional methods that preserve natural qualities.",
    },
    {
      icon: Award,
      title: "Premium Quality",
      description: "We verify quality at every stage, from harvesting to bottling, ensuring the finest products.",
    },
    {
      icon: Droplets,
      title: "Cold Pressed",
      description: "Our oils are cold-pressed using traditional stone mills to preserve nutrients and flavor.",
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#556B2F]/10 via-background to-[#D6A64F]/5" />
        <div className="moroccan-pattern" />

        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-block text-sm font-medium tracking-[0.3em] uppercase text-[#D6A64F] mb-4">
            Our Story
          </span>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold mb-6">About Silea</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Preserving the heritage of Beni Mellal through authentic, natural products crafted with care and tradition
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden aspect-[4/5] glass-card">
                <img
                  src="/placeholder.svg?height=600&width=480&query=moroccan mountains beni mellal olive groves sunset"
                  alt="Mountains of Beni Mellal"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating Card */}
              <div className="absolute -bottom-8 -right-8 p-6 rounded-2xl bg-gradient-to-br from-[#556B2F] to-[#6B8E23] text-white shadow-2xl hidden md:block">
                <p className="text-4xl font-serif font-bold mb-1">30+</p>
                <p className="text-sm opacity-80">Years of Tradition</p>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-serif font-bold mb-6">Our Story</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Silea was born from a passion for preserving the authentic flavors and traditions of the Beni Mellal region in Morocco. For generations, the mountains of Beni Mellal have produced some of the world's finest honey and oils through traditional, sustainable methods.
                  </p>
                  <p>
                    We believe that true luxury lies in purity and authenticity. Every product in our collection is carefully sourced directly from local producers who share our commitment to quality, sustainability, and tradition.
                  </p>
                  <p>
                    The name "Silea" represents purity in our hearts – and that's exactly what we deliver. Pure products, pure tradition, pure treasures from the mountains.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-r from-[#556B2F]/10 to-[#D6A64F]/10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#556B2F] flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold mb-1">Our Location</h3>
                    <p className="text-muted-foreground">
                      Nestled in the heart of Morocco, Beni Mellal is known for its fertile valleys, mountain springs, and centuries-old agricultural traditions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 premium-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-medium tracking-[0.3em] uppercase text-[#D6A64F] mb-4">
              What We Stand For
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Our Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every product we create is guided by our commitment to purity, community, and heritage
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card
                key={value.title}
                className="glass-card text-center p-8 opacity-0 animate-in fade-in slide-in-from-bottom-4 fill-mode-forwards"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-0">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#556B2F]/20 to-[#D6A64F]/20 flex items-center justify-center mx-auto mb-6">
                    <value.icon className="w-10 h-10 text-[#556B2F]" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold mb-4">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How We Source */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <div className="order-2 lg:order-1">
              <span className="inline-block text-sm font-medium tracking-[0.3em] uppercase text-[#D6A64F] mb-4">
                Our Process
              </span>
              <h2 className="text-4xl font-serif font-bold mb-6">How We Source</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Every jar of Silea honey begins in the pristine mountains of Beni Mellal. Our beekeepers maintain their hives in harmony with nature, allowing bees to pollinate the wildflowers, thyme, and other mountain flora that give our honey its unique character.
                </p>
                <p>
                  Our oils are cold-pressed using traditional methods that have been refined over centuries. We work with local farmers who cultivate olive trees on terraced mountainsides, preserving both the land and the quality of the fruit.
                </p>
                <p>
                  Every step – from harvesting to bottling – is done with care and intention. We verify quality at every stage to ensure that what reaches your table is nothing less than pure, authentic treasure from Beni Mellal.
                </p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="order-1 lg:order-2 grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <Card
                  key={feature.title}
                  className="glass-card p-6 opacity-0 animate-in fade-in zoom-in fill-mode-forwards"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-0">
                    <div className="w-12 h-12 rounded-xl bg-[#556B2F]/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-[#556B2F]" />
                    </div>
                    <h3 className="font-serif font-bold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Beni Mellal */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#556B2F]/10 via-background to-[#D6A64F]/5">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block text-sm font-medium tracking-[0.3em] uppercase text-[#D6A64F] mb-4">
            Why Beni Mellal
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">The Heart of Morocco</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Beni Mellal, nestled at the foothills of the Middle Atlas Mountains, is blessed with a unique microclimate that produces exceptional honey and oils. The region's diverse flora, pure mountain water, and centuries of agricultural wisdom make it the perfect source for our products.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { value: "1000m+", label: "Altitude" },
              { value: "300+", label: "Days of Sunshine" },
              { value: "100+", label: "Local Producers" },
            ].map((stat) => (
              <div key={stat.label} className="p-6 rounded-2xl glass-card">
                <p className="text-3xl font-serif font-bold text-[#556B2F] mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="glass-card p-8 md:p-12 text-center">
            <CardContent className="p-0">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                Experience the Difference
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Discover why thousands of customers trust Silea for authentic Moroccan honey and oils.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/category/honey" className="btn-primary inline-flex items-center justify-center px-8 py-4">
                  Shop Honey
                </a>
                <a href="/category/oils" className="btn-secondary inline-flex items-center justify-center px-8 py-4">
                  Shop Oils
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  )
}
