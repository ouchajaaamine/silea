"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTranslation } from "@/lib/translation-context"

interface PolicyModalProps {
  type: "privacy" | "terms" | "cookies"
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PolicyModal({ type, open, onOpenChange }: PolicyModalProps) {
  const { t, language } = useTranslation()
  const isRTL = language === 'ar'

  const content = {
    privacy: {
      title: language === 'ar' ? 'سياسة الخصوصية' : (language === 'fr' ? 'Politique de Confidentialité' : 'Privacy Policy'),
      sections: [
        {
          title: language === 'ar' ? 'المعلومات التي نجمعها' : (language === 'fr' ? 'Informations que nous collectons' : 'Information We Collect'),
          content: language === 'ar' 
            ? 'نحن نجمع المعلومات التي تقدمها لنا مباشرة عند إنشاء حساب، أو تقديم طلب، أو الاتصال بنا. يتضمن ذلك اسمك وعنوان بريدك الإلكتروني ورقم هاتفك وعنوان الشحن ومعلومات الدفع.'
            : (language === 'fr' 
              ? 'Nous collectons les informations que vous nous fournissez directement lorsque vous créez un compte, passez une commande ou nous contactez. Cela inclut votre nom, adresse e-mail, numéro de téléphone, adresse de livraison et informations de paiement.'
              : 'We collect information you provide directly to us when you create an account, place an order, or contact us. This includes your name, email address, phone number, shipping address, and payment information.')
        },
        {
          title: language === 'ar' ? 'كيف نستخدم معلوماتك' : (language === 'fr' ? 'Comment nous utilisons vos informations' : 'How We Use Your Information'),
          content: language === 'ar'
            ? 'نستخدم المعلومات التي نجمعها لمعالجة طلباتك، والتواصل معك بشأن طلبك، وتحسين منتجاتنا وخدماتنا، وإرسال تحديثات ترويجية (بموافقتك).'
            : (language === 'fr'
              ? 'Nous utilisons les informations que nous collectons pour traiter vos commandes, communiquer avec vous concernant votre commande, améliorer nos produits et services, et envoyer des mises à jour promotionnelles (avec votre consentement).'
              : 'We use the information we collect to process your orders, communicate with you about your order, improve our products and services, and send promotional updates (with your consent).')
        },
        {
          title: language === 'ar' ? 'حماية البيانات' : (language === 'fr' ? 'Protection des données' : 'Data Protection'),
          content: language === 'ar'
            ? 'نحن نتخذ تدابير أمنية معقولة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو الاستخدام أو الإفصاح. معلومات الدفع الخاصة بك آمنة ومشفرة.'
            : (language === 'fr'
              ? 'Nous prenons des mesures de sécurité raisonnables pour protéger vos informations personnelles contre tout accès, utilisation ou divulgation non autorisés. Vos informations de paiement sont sécurisées et cryptées.'
              : 'We take reasonable security measures to protect your personal information from unauthorized access, use, or disclosure. Your payment information is secure and encrypted.')
        },
        {
          title: language === 'ar' ? 'حقوقك' : (language === 'fr' ? 'Vos droits' : 'Your Rights'),
          content: language === 'ar'
            ? 'يحق لك الوصول إلى معلوماتك الشخصية وتصحيحها أو حذفها. يمكنك أيضًا إلغاء الاشتراك في الاتصالات التسويقية في أي وقت. اتصل بنا على official@siléa.com لممارسة حقوقك.'
            : (language === 'fr'
              ? 'Vous avez le droit d\'accéder, de corriger ou de supprimer vos informations personnelles. Vous pouvez également vous désinscrire des communications marketing à tout moment. Contactez-nous à official@siléa.com pour exercer vos droits.'
              : 'You have the right to access, correct, or delete your personal information. You can also opt out of marketing communications at any time. Contact us at official@siléa.com to exercise your rights.')
        }
      ]
    },
    terms: {
      title: language === 'ar' ? 'شروط الخدمة' : (language === 'fr' ? 'Conditions de Service' : 'Terms of Service'),
      sections: [
        {
          title: language === 'ar' ? 'قبول الشروط' : (language === 'fr' ? 'Acceptation des conditions' : 'Acceptance of Terms'),
          content: language === 'ar'
            ? 'باستخدام موقعنا الإلكتروني أو تقديم طلب، فإنك توافق على الالتزام بشروط الخدمة هذه. إذا كنت لا توافق على هذه الشروط، يرجى عدم استخدام خدماتنا.'
            : (language === 'fr'
              ? 'En utilisant notre site Web ou en passant une commande, vous acceptez d\'être lié par ces conditions de service. Si vous n\'acceptez pas ces conditions, veuillez ne pas utiliser nos services.'
              : 'By using our website or placing an order, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.')
        },
        {
          title: language === 'ar' ? 'معلومات المنتج والأسعار' : (language === 'fr' ? 'Informations sur les produits et prix' : 'Product Information & Pricing'),
          content: language === 'ar'
            ? 'نحن نبذل قصارى جهدنا لعرض ووصف منتجاتنا بدقة. ومع ذلك، لا نضمن أن أوصاف المنتجات أو الألوان أو المعلومات الأخرى دقيقة أو كاملة أو خالية من الأخطاء. نحتفظ بالحق في تغيير الأسعار في أي وقت.'
            : (language === 'fr'
              ? 'Nous nous efforçons d\'afficher et de décrire nos produits avec précision. Cependant, nous ne garantissons pas que les descriptions de produits, couleurs ou autres informations sont exactes, complètes ou sans erreur. Nous nous réservons le droit de modifier les prix à tout moment.'
              : 'We strive to display and describe our products accurately. However, we do not warrant that product descriptions, colors, or other information are accurate, complete, or error-free. We reserve the right to change prices at any time.')
        },
        {
          title: language === 'ar' ? 'الطلبات والدفع' : (language === 'fr' ? 'Commandes et paiement' : 'Orders & Payment'),
          content: language === 'ar'
            ? 'بتقديم طلب، فإنك تقدم عرضًا لشراء المنتجات. نحتفظ بالحق في قبول أو رفض أي طلب لأي سبب. الدفع مستحق عند تقديم الطلب ويجب أن يتم عن طريق النقد عند التسليم.'
            : (language === 'fr'
              ? 'En passant une commande, vous faites une offre d\'achat des produits. Nous nous réservons le droit d\'accepter ou de refuser toute commande pour quelque raison que ce soit. Le paiement est dû au moment de la commande et doit être effectué en espèces à la livraison.'
              : 'By placing an order, you are making an offer to purchase the products. We reserve the right to accept or refuse any order for any reason. Payment is due at the time of order and must be made by cash on delivery.')
        },
        {
          title: language === 'ar' ? 'الشحن والتسليم' : (language === 'fr' ? 'Expédition et livraison' : 'Shipping & Delivery'),
          content: language === 'ar'
            ? 'نقوم بالشحن داخل المغرب فقط. أوقات التسليم تقريبية وليست مضمونة. نحن لسنا مسؤولين عن التأخير الناجم عن ظروف خارجة عن سيطرتنا.'
            : (language === 'fr'
              ? 'Nous livrons uniquement au Maroc. Les délais de livraison sont approximatifs et ne sont pas garantis. Nous ne sommes pas responsables des retards dus à des circonstances indépendantes de notre volonté.'
              : 'We ship within Morocco only. Delivery times are approximate and not guaranteed. We are not responsible for delays caused by circumstances beyond our control.')
        },
        {
          title: language === 'ar' ? 'الإرجاع والاستبدال' : (language === 'fr' ? 'Retours et échanges' : 'Returns & Exchanges'),
          content: language === 'ar'
            ? 'نقبل الإرجاع خلال 7 أيام من التسليم للمنتجات غير المفتوحة وفي حالتها الأصلية. يرجى الاتصال بنا على official@siléa.com لبدء الإرجاع.'
            : (language === 'fr'
              ? 'Nous acceptons les retours dans les 7 jours suivant la livraison pour les produits non ouverts et dans leur état d\'origine. Veuillez nous contacter à official@siléa.com pour initier un retour.'
              : 'We accept returns within 7 days of delivery for unopened products in their original condition. Please contact us at official@siléa.com to initiate a return.')
        }
      ]
    },
    cookies: {
      title: language === 'ar' ? 'سياسة ملفات تعريف الارتباط' : (language === 'fr' ? 'Politique des Cookies' : 'Cookie Policy'),
      sections: [
        {
          title: language === 'ar' ? 'ما هي ملفات تعريف الارتباط' : (language === 'fr' ? 'Que sont les cookies' : 'What Are Cookies'),
          content: language === 'ar'
            ? 'ملفات تعريف الارتباط هي ملفات نصية صغيرة يتم تخزينها على جهازك عند زيارة موقعنا الإلكتروني. تساعدنا على تذكر تفضيلاتك وتحسين تجربة التصفح الخاصة بك.'
            : (language === 'fr'
              ? 'Les cookies sont de petits fichiers texte stockés sur votre appareil lorsque vous visitez notre site Web. Ils nous aident à mémoriser vos préférences et à améliorer votre expérience de navigation.'
              : 'Cookies are small text files stored on your device when you visit our website. They help us remember your preferences and improve your browsing experience.')
        },
        {
          title: language === 'ar' ? 'ملفات تعريف الارتباط التي نستخدمها' : (language === 'fr' ? 'Cookies que nous utilisons' : 'Cookies We Use'),
          content: language === 'ar'
            ? 'نستخدم ملفات تعريف الارتباط الضرورية (لوظائف الموقع الأساسية)، وملفات تعريف الارتباط التحليلية (لفهم كيفية استخدامك لموقعنا)، وملفات تعريف الارتباط الوظيفية (لتذكر تفضيلات اللغة ومحتويات سلة التسوق).'
            : (language === 'fr'
              ? 'Nous utilisons des cookies essentiels (pour les fonctionnalités de base du site), des cookies analytiques (pour comprendre comment vous utilisez notre site) et des cookies fonctionnels (pour mémoriser vos préférences linguistiques et le contenu du panier).'
              : 'We use essential cookies (for core site functionality), analytics cookies (to understand how you use our site), and functional cookies (to remember your language preferences and cart contents).')
        },
        {
          title: language === 'ar' ? 'إدارة ملفات تعريف الارتباط' : (language === 'fr' ? 'Gestion des cookies' : 'Managing Cookies'),
          content: language === 'ar'
            ? 'يمكنك التحكم في ملفات تعريف الارتباط وحذفها من خلال إعدادات المتصفح الخاص بك. لاحظ أن تعطيل ملفات تعريف الارتباط قد يؤثر على وظائف موقعنا الإلكتروني.'
            : (language === 'fr'
              ? 'Vous pouvez contrôler et supprimer les cookies via les paramètres de votre navigateur. Notez que la désactivation des cookies peut affecter les fonctionnalités de notre site Web.'
              : 'You can control and delete cookies through your browser settings. Note that disabling cookies may affect the functionality of our website.')
        },
        {
          title: language === 'ar' ? 'ملفات تعريف ارتباط الطرف الثالث' : (language === 'fr' ? 'Cookies tiers' : 'Third-Party Cookies'),
          content: language === 'ar'
            ? 'قد نستخدم خدمات الطرف الثالث التي تضع ملفات تعريف الارتباط على جهازك. نحن لسنا مسؤولين عن ملفات تعريف الارتباط التابعة للأطراف الثالثة وسياسات الخصوصية الخاصة بها.'
            : (language === 'fr'
              ? 'Nous pouvons utiliser des services tiers qui placent des cookies sur votre appareil. Nous ne sommes pas responsables des cookies tiers et de leurs politiques de confidentialité.'
              : 'We may use third-party services that place cookies on your device. We are not responsible for third-party cookies and their privacy policies.')
        }
      ]
    }
  }

  const selectedContent = content[type]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif gradient-text">
            {selectedContent.title}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              {language === 'ar' 
                ? 'آخر تحديث: 7 يناير 2026'
                : (language === 'fr' 
                  ? 'Dernière mise à jour : 7 janvier 2026'
                  : 'Last Updated: January 7, 2026')}
            </p>
            {selectedContent.sections.map((section, index) => (
              <div key={index} className="space-y-2">
                <h3 className="font-semibold text-lg text-[#556B2F]">{section.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
            <div className="pt-4 border-t border-[#556B2F]/10">
              <p className="text-sm text-muted-foreground">
                {language === 'ar'
                  ? 'إذا كانت لديك أي أسئلة حول هذه السياسة، يرجى الاتصال بنا على'
                  : (language === 'fr'
                    ? 'Si vous avez des questions concernant cette politique, veuillez nous contacter à'
                    : 'If you have any questions about this policy, please contact us at')}{' '}
                <a href="mailto:official@siléa.com" className="text-[#556B2F] hover:underline">
                  official@siléa.com
                </a>
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
