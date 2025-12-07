"use client"

import { useState } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast.success("Message sent successfully!", {
      description: "We'll get back to you within 24 hours.",
    })

    setFormData({ name: "", email: "", subject: "", message: "" })
    setLoading(false)
  }

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      value: "contact@silea.com",
      href: "mailto:contact@silea.com",
      description: "We respond within 24 hours",
    },
    {
      icon: Phone,
      title: "Phone",
      value: "+212 6 00 00 00 00",
      href: "tel:+212600000000",
      description: "Mon-Sat, 9AM-6PM",
    },
    {
      icon: MapPin,
      title: "Location",
      value: "Beni Mellal, Morocco",
      href: "#",
      description: "Atlas Mountains Region",
    },
  ]

  const businessHours = [
    { day: "Monday – Friday", hours: "9:00 AM – 6:00 PM" },
    { day: "Saturday", hours: "10:00 AM – 4:00 PM" },
    { day: "Sunday", hours: "Closed" },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#556B2F]/10 via-background to-[#D6A64F]/5" />
        <div className="moroccan-pattern" />

        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-block text-sm font-medium tracking-[0.3em] uppercase text-[#D6A64F] mb-4">
            Get in Touch
          </span>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold mb-6">Contact Us</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions about our products or want to learn more? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {contactInfo.map((info, index) => (
              <a
                key={info.title}
                href={info.href}
                className="group opacity-0 animate-in fade-in slide-in-from-bottom-4 fill-mode-forwards"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className="glass-card h-full p-6 text-center transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                  <CardContent className="p-0">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#556B2F]/20 to-[#D6A64F]/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <info.icon className="w-7 h-7 text-[#556B2F]" />
                    </div>
                    <h3 className="font-serif text-lg font-bold mb-1">{info.title}</h3>
                    <p className="font-medium text-[#556B2F] group-hover:text-[#D6A64F] transition-colors">
                      {info.value}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{info.description}</p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-3">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="font-serif text-2xl flex items-center gap-2">
                    <MessageCircle className="w-6 h-6 text-[#D6A64F]" />
                    Send us a Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="input-glass"
                          placeholder="Your name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="input-glass"
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Select
                        value={formData.subject}
                        onValueChange={(value) => setFormData({ ...formData, subject: value })}
                      >
                        <SelectTrigger className="input-glass">
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-white/20">
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="order">Order Question</SelectItem>
                          <SelectItem value="product">Product Information</SelectItem>
                          <SelectItem value="wholesale">Wholesale Inquiry</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        className="input-glass min-h-[150px]"
                        placeholder="How can we help you?"
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full btn-primary" disabled={loading}>
                      {loading ? (
                        "Sending..."
                      ) : (
                        <>
                          Send Message
                          <Send className="ml-2 w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2 space-y-6">
              {/* Business Hours */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="font-serif text-xl flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#D6A64F]" />
                    Business Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {businessHours.map((item) => (
                      <div
                        key={item.day}
                        className="flex items-center justify-between py-2 border-b border-[#556B2F]/10 last:border-0"
                      >
                        <span className="font-medium">{item.day}</span>
                        <span className={`text-sm ${item.hours === "Closed" ? "text-muted-foreground" : "text-[#556B2F]"}`}>
                          {item.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Quick Links */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="font-serif text-xl">Common Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      "How long does shipping take?",
                      "Do you offer international shipping?",
                      "What's your return policy?",
                      "Are your products organic?",
                    ].map((question) => (
                      <a
                        key={question}
                        href="#"
                        className="flex items-center justify-between py-2 text-sm hover:text-[#556B2F] transition-colors group"
                      >
                        <span>{question}</span>
                        <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Map Placeholder */}
              <Card className="glass-card overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-[#556B2F]/20 to-[#D6A64F]/20 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-[#556B2F]/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Beni Mellal, Morocco</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
