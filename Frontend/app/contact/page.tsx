"use client"

import Header from "@/components/header"
import Footer from "@/components/footer"
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useTranslation } from "@/lib/translation-context"

export default function Contact() {
  const { t, language } = useTranslation()

  const contactInfo = [
    {
      icon: Mail,
      title: t.contact.info.email,
      value: "official@siléa.com",
      href: "mailto:official@siléa.com",
      description: t.contact.form.successMessage,
    },
    {
      icon: MessageCircle,
      title: t.contact.whatsapp,
      value: "+212 664-389712",
      href: "https://wa.me/212664389712",
      description: "Chat instantly",
      isPhone: true,
    },
  ]

  const faqs = [
    {
      question: t.contact.faq.shipping.question,
      answer: t.contact.faq.shipping.answer,
    },
    {
      question: t.contact.faq.delivery.question,
      answer: t.contact.faq.delivery.answer,
    },
    {
      question: t.contact.faq.payment.question,
      answer: t.contact.faq.payment.answer,
    },
    {
      question: t.contact.faq.returns.question,
      answer: t.contact.faq.returns.answer,
    },
    {
      question: t.contact.faq.tracking.question,
      answer: t.contact.faq.tracking.answer,
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero */}
      <section className="relative pt-24 pb-6 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#556B2F]/10 via-background to-[#D6A64F]/5" />
        <div className="moroccan-pattern" />
        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-block text-sm font-semibold uppercase text-[#D6A64F] mb-3">
            {t.contact.title}
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3">{t.common.contact}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.contact.subtitle}
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {contactInfo.map((info, index) => (
              <a
                key={info.title}
                href={info.href}
                className="group"
              >
                <Card className="glass-card h-full p-4 text-center transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                  <CardContent className="p-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#556B2F]/20 to-[#D6A64F]/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <info.icon className="w-5 h-5 text-[#556B2F]" />
                    </div>
                    <h3 className="font-serif text-base font-bold mb-1">{info.title}</h3>
                    <p className="text-sm font-medium text-[#556B2F] group-hoveAr:text-[#D6A64F] transition-colors" dir="ltr">
                      {info.value}
                    </p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="pt-0 pb-6 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="font-serif text-2xl font-bold mb-2">{t.contact.faqTitle}</h2>
            <p className="text-sm text-muted-foreground">{t.contact.faqSubtitle}</p>
          </div>
          
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="glass-card rounded-lg px-6 border-none">
                <AccordionTrigger className="font-serif text-left hover:no-underline py-4">
                  <span className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#D6A64F]/20 flex items-center justify-center shrink-0 text-sm">
                      <span className="text-[#D6A64F] font-bold">{index + 1}</span>
                    </span>
                    <span className="flex-1">{faq.question}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pl-9 pb-4 text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Still have questions? */}
          <div className="mt-6 text-center">
            <Card className="glass-card">
              <CardContent className="py-5">
                <h3 className="font-serif text-lg font-semibold mb-2">{t.contact.whatsapp}</h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  {language === 'ar' 
                    ? 'فريقنا متاح للإجابة على أسئلتك' 
                    : language === 'fr'
                    ? 'Notre équipe est disponible pour répondre à vos questions'
                    : 'Our team is available to answer your questions'}
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <a
                    href="https://wa.me/212664389712"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-lg transition-colors text-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href="mailto:official@siléa.com"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#556B2F] hover:bg-[#6B8E3C] text-white rounded-lg transition-colors text-sm"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </a>
                  <a
                    href="/track-order"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D6A64F] hover:bg-[#C89640] text-white rounded-lg transition-colors text-sm"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>{language === 'ar' ? 'تتبع الطلب' : language === 'fr' ? 'Suivre commande' : 'Track Order'}</span>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
