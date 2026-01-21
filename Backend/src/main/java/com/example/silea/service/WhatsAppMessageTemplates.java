package com.example.silea.service;

import com.example.silea.enums.OrderStatus;
import org.springframework.stereotype.Component;

import java.text.NumberFormat;
import java.util.Locale;

@Component
public class WhatsAppMessageTemplates {
    
    private static final String BUSINESS_NAME = "Silea";
    
    /**
     * Order confirmation message (sent when order is created)
     */
    public String getOrderConfirmationMessage(String customerName, String orderNumber, 
                                             Double totalAmount, String itemsSummary, String trackingCode) {
        
        return String.format(
            "🌟 *السلام عليكم ورحمة الله وبركاته* 🌟\n\n" +
            "عزيزنا *%s*،\n" +
            "نشكرك على ثقتك الغالية في سيليا! ✨\n\n" +
            "✅ تم تأكيد طلبك بنجاح\n" +
            "🔖 رقم الطلب: *%s*\n\n" +
            "📦 *المنتجات المطلوبة:*\n%s\n\n" +
            "💰 *المبلغ الإجمالي:* %.2f درهم\n\n" +
            "🔍 *تتبع طلبك:*\n" +
            "http://51.44.37.35:3000/track-order?code=%s\n\n" +
            "سنبقيك على اطلاع بكل مستجدات طلبك 📲\n" +
            "شكراً لاختيارك سيليا 🙏🌿\n\n" +
            "━━━━━━━━━━━━━━━━━━━━\n\n" +
            "🌟 *Bonjour %s!* 🌟\n\n" +
            "Merci infiniment pour votre confiance en Silea! ✨\n\n" +
            "✅ Votre commande est confirmée\n" +
            "🔖 Numéro: *%s*\n\n" +
            "📦 *Articles commandés:*\n%s\n\n" +
            "💰 *Total:* %.2f MAD\n\n" +
            "🔍 *Suivez votre commande:*\n" +
            "http://51.44.37.35:3000/track-order?code=%s\n\n" +
            "Nous vous tiendrons informé à chaque étape! 📲\n" +
            "Merci d'avoir choisi Silea 🙏🌿",
            customerName, orderNumber, itemsSummary, totalAmount, trackingCode,
            customerName, orderNumber, itemsSummary, totalAmount, trackingCode
        );
    }
    
    /**
     * Status update message (generic)
     */
    public String getStatusUpdateMessage(String customerName, String orderNumber, OrderStatus status, String trackingCode) {
        String statusEmoji = getStatusEmoji(status);
        String statusTextAr = getStatusTextInArabic(status);
        String statusTextFr = getStatusTextInFrench(status);
        String statusDescAr = getStatusDescriptionInArabic(status);
        String statusDescFr = getStatusDescription(status);
        
        return String.format(
            "🌟 *السلام عليكم ورحمة الله وبركاته* 🌟\n\n" +
            "عزيزنا *%s*،\n\n" +
            "%s *تحديث حالة طلبك %s*\n\n" +
            "الحالة الجديدة: *%s*\n\n" +
            "%s\n\n" +
            "🔍 *تتبع طلبك:*\n" +
            "http://51.44.37.35:3000/track-order?code=%s\n\n" +
            "نحن دائماً في خدمتك! 🙏🌿\n\n" +
            "━━━━━━━━━━━━━━━━━━━━\n\n" +
            "🌟 *Bonjour %s!* 🌟\n\n" +
            "%s *Mise à jour de votre commande %s*\n\n" +
            "Nouveau statut: *%s*\n\n" +
            "%s\n\n" +
            "🔍 *Suivez votre commande:*\n" +
            "http://51.44.37.35:3000/track-order?code=%s\n\n" +
            "Nous sommes toujours à votre service! 🙏🌿",
            customerName, statusEmoji, orderNumber, statusTextAr, statusDescAr, trackingCode,
            customerName, statusEmoji, orderNumber, statusTextFr, statusDescFr, trackingCode
        );
    }
    
    /**
     * Shipping notification (sent when order is shipped)
     */
    public String getShippingNotificationMessage(String customerName, String orderNumber, 
                                                 String trackingNumber) {
        return String.format(
            "Excellente nouvelle %s! 📦\n\n" +
            "Votre commande %s a été expédiée! 🚚\n\n" +
            "📍 *Numéro de suivi:* %s\n\n" +
            "Votre colis est en route et sera livré dans les prochains jours.\n\n" +
            "Vous recevrez une notification lors de la livraison.\n\n" +
            "Merci pour votre patience! 🙏\n" +
            "- Équipe %s",
            customerName, orderNumber, 
            trackingNumber != null ? trackingNumber : "Disponible prochainement",
            BUSINESS_NAME
        );
    }
    
    /**
     * Delivery confirmation (sent when order is delivered)
     */
    public String getDeliveryConfirmationMessage(String customerName, String orderNumber) {
        return String.format(
            "Bonjour %s! 🎉\n\n" +
            "Votre commande %s a été livrée avec succès! ✅\n\n" +
            "Nous espérons que vous apprécierez vos produits!\n\n" +
            "💬 Votre avis compte beaucoup pour nous. N'hésitez pas à nous faire part " +
            "de votre expérience.\n\n" +
            "Merci d'avoir choisi %s! 🙏\n" +
            "À très bientôt! ✨",
            customerName, orderNumber, BUSINESS_NAME
        );
    }
    
    /**
     * Cancellation message (sent when order is cancelled)
     */
    public String getCancellationMessage(String customerName, String orderNumber, String reason) {
        return String.format(
            "Bonjour %s,\n\n" +
            "Nous vous informons que votre commande %s a été annulée. ❌\n\n" +
            "%s\n\n" +
            "Si vous avez des questions ou souhaitez passer une nouvelle commande, " +
            "n'hésitez pas à nous contacter.\n\n" +
            "Cordialement,\n" +
            "- Équipe %s",
            customerName, orderNumber, 
            reason != null && !reason.isEmpty() ? "Raison: " + reason : 
                "Si vous avez besoin d'aide, notre équipe est à votre disposition.",
            BUSINESS_NAME
        );
    }
    
    /**
     * Processing notification (sent when order starts processing)
     */
    public String getProcessingNotificationMessage(String customerName, String orderNumber) {
        return String.format(
            "Bonjour %s! 👋\n\n" +
            "Votre commande %s est maintenant en cours de traitement! 📦\n\n" +
            "Notre équipe prépare votre commande avec soin.\n" +
            "Vous serez informé(e) dès qu'elle sera expédiée.\n\n" +
            "Merci pour votre patience! 🙏\n" +
            "- Équipe %s",
            customerName, orderNumber, BUSINESS_NAME
        );
    }
    
    /**
     * Payment confirmation message
     */
    public String getPaymentConfirmationMessage(String customerName, String orderNumber, 
                                               Double amount) {
        return String.format(
            "Bonjour %s! 👋\n\n" +
            "Nous avons bien reçu votre paiement de *%.2f MAD* " +
            "pour la commande %s. ✅\n\n" +
            "Votre commande sera traitée dans les plus brefs délais.\n\n" +
            "Merci pour votre confiance! 🙏\n" +
            "- Équipe %s",
            customerName, amount, orderNumber, BUSINESS_NAME
        );
    }
    
    /**
     * Get emoji for each status
     */
    private String getStatusEmoji(OrderStatus status) {
        return switch (status) {
            case PENDING -> "⏳";
            case CONFIRMED -> "✅";
            case PROCESSING -> "📦";
            case PICKUP_REQUESTED -> "📋";
            case PICKED_UP -> "📦";
            case IN_WAREHOUSE -> "🏪";
            case IN_TRANSIT -> "🚚";
            case OUT_FOR_DELIVERY -> "🏃";
            case DELIVERED -> "🎉";
            case PARTIALLY_DELIVERED -> "📦";
            case UNREACHABLE -> "📞";
            case POSTPONED -> "📅";
            case SCHEDULED -> "🗓️";
            case REFUSED -> "❌";
            case CANCELLED -> "❌";
            case REFUNDED -> "💰";
            default -> "📋";
        };
    }
    
    /**
     * Get Arabic text for status
     */
    private String getStatusTextInArabic(OrderStatus status) {
        return switch (status) {
            case PENDING -> "قيد الانتظار";
            case CONFIRMED -> "مؤكد";
            case PROCESSING -> "قيد التحضير";
            case PICKUP_REQUESTED -> "طلب الرفع جاري";
            case PICKED_UP -> "تم الرفع";
            case IN_WAREHOUSE -> "في المستودع";
            case IN_TRANSIT -> "في الطريق";
            case OUT_FOR_DELIVERY -> "في التوصيل";
            case DELIVERED -> "تم التسليم";
            case PARTIALLY_DELIVERED -> "تم التسليم جزئياً";
            case UNREACHABLE -> "لا يمكن الوصول";
            case POSTPONED -> "مؤجل";
            case SCHEDULED -> "مجدول";
            case REFUSED -> "مرفوض";
            case CANCELLED -> "ملغى";
            case REFUNDED -> "تم الإرجاع";
            default -> status.toString();
        };
    }
    
    /**
     * Get French text for status
     */
    private String getStatusTextInFrench(OrderStatus status) {
        return switch (status) {
            case PENDING -> "En attente";
            case CONFIRMED -> "Confirmée";
            case PROCESSING -> "En traitement";
            case PICKUP_REQUESTED -> "Ramassage en cours";
            case PICKED_UP -> "Ramassé";
            case IN_WAREHOUSE -> "Entrepôt";
            case IN_TRANSIT -> "En transit";
            case OUT_FOR_DELIVERY -> "En cours de livraison";
            case DELIVERED -> "Livrée";
            case PARTIALLY_DELIVERED -> "Livré partiellement";
            case UNREACHABLE -> "Injoignable";
            case POSTPONED -> "Reporté";
            case SCHEDULED -> "Programmé";
            case REFUSED -> "Refusés";
            case CANCELLED -> "Annulée";
            case REFUNDED -> "Remboursée";
            default -> status.toString();
        };
    }
    
    /**
     * Get Arabic description for each status
     */
    private String getStatusDescriptionInArabic(OrderStatus status) {
        return switch (status) {
            case PENDING -> "طلبك في انتظار التأكيد من فريقنا المتخصص 🔄";
            case CONFIRMED -> "رائع! تم تأكيد طلبك وسنبدأ بتحضيره قريباً جداً ✨";
            case PROCESSING -> "فريقنا يحضر طلبك بعناية فائقة وحب 💚";
            case PICKUP_REQUESTED -> "طلبنا من شركة التوصيل رفع الطرد 📦";
            case PICKED_UP -> "تم رفع الطرد من قبل شركة التوصيل! 🚛";
            case IN_WAREHOUSE -> "طلبك في مستودع شركة التوصيل 🏪";
            case IN_TRANSIT -> "طلبك في الطريق إليك! سيصلك قريباً إن شاء الله 🚚💨";
            case OUT_FOR_DELIVERY -> "المندوب في طريقه إليك الآن! 🏃‍♂️📦";
            case DELIVERED -> "تم التسليم بنجاح! نتمنى أن تستمتع بمنتجاتنا 🎁✨";
            case PARTIALLY_DELIVERED -> "تم تسليم جزء من الطلب. سنتواصل معك للتفاصيل 📦";
            case UNREACHABLE -> "لم نتمكن من الوصول إليك. يرجى التواصل معنا 📞";
            case POSTPONED -> "تم تأجيل التوصيل حسب طلبك 📅";
            case SCHEDULED -> "تم جدولة التوصيل في الوقت المتفق عليه 🗓️";
            case REFUSED -> "تم رفض الطلب. تواصل معنا للتفاصيل 🔄";
            case CANCELLED -> "تم إلغاء الطلب. تواصل معنا لأي استفسار 📞";
            case REFUNDED -> "تم إرجاع المبلغ بنجاح 💰";
            default -> "تحديث جديد لطلبك 📋";
        };
    }
    
    /**
     * Get French description for each status
     */
    private String getStatusDescription(OrderStatus status) {
        return switch (status) {
            case PENDING -> "Votre commande attend notre confirmation 🔄";
            case CONFIRMED -> "Parfait! Commande confirmée, préparation imminente ✨";
            case PROCESSING -> "Notre équipe prépare votre commande avec amour et soin 💚";
            case PICKUP_REQUESTED -> "Nous avons demandé au livreur de récupérer votre colis 📦";
            case PICKED_UP -> "Le colis a été récupéré par le livreur! 🚛";
            case IN_WAREHOUSE -> "Votre commande est dans l'entrepôt du livreur 🏪";
            case IN_TRANSIT -> "Votre colis est en route vers vous! 🚚💨";
            case OUT_FOR_DELIVERY -> "Le livreur est en route vers vous maintenant! 🏃‍♂️📦";
            case DELIVERED -> "Livraison réussie! Profitez de vos produits 🎁✨";
            case PARTIALLY_DELIVERED -> "Une partie de la commande a été livrée. Nous vous contacterons 📦";
            case UNREACHABLE -> "Impossible de vous joindre. Veuillez nous contacter 📞";
            case POSTPONED -> "Livraison reportée selon votre demande 📅";
            case SCHEDULED -> "Livraison programmée à l'heure convenue 🗓️";
            case REFUSED -> "Commande refusée. Contactez-nous pour les détails 🔄";
            case CANCELLED -> "Commande annulée. Contactez-nous pour toute question 📞";
            case REFUNDED -> "Remboursement effectué avec succès 💰";
            default -> "Nouvelle mise à jour de votre commande 📋";
        };
    }
    
    /**
     * Delivery status update message (for Sendit tracking updates)
     */
    public String getDeliveryStatusUpdateMessage(String customerName, String orderNumber, 
                                                 OrderStatus oldStatus, OrderStatus newStatus,
                                                 String senditTrackingCode) {
        String statusEmoji = getStatusEmoji(newStatus);
        String statusTextAr = getStatusTextInArabic(newStatus);
        String statusTextFr = getStatusTextInFrench(newStatus);
        String statusDescAr = getStatusDescriptionInArabic(newStatus);
        String statusDescFr = getStatusDescription(newStatus);
        
        return String.format(
            "🌟 *السلام عليكم ورحمة الله وبركاته* 🌟\n\n" +
            "عزيزنا *%s*،\n\n" +
            "%s *تحديث توصيل طلبك %s*\n\n" +
            "الحالة الجديدة: *%s*\n\n" +
            "%s\n\n" +
            "🔍 *رمز التتبع Sendit:* %s\n\n" +
            "نحن دائماً في خدمتك! 🙏🌿\n\n" +
            "━━━━━━━━━━━━━━━━━━━━\n\n" +
            "🌟 *Bonjour %s!* 🌟\n\n" +
            "%s *Mise à jour de livraison %s*\n\n" +
            "Nouveau statut: *%s*\n\n" +
            "%s\n\n" +
            "🔍 *Code de suivi Sendit:* %s\n\n" +
            "Nous sommes toujours à votre service! 🙏🌿",
            customerName, statusEmoji, orderNumber, statusTextAr, statusDescAr, senditTrackingCode,
            customerName, statusEmoji, orderNumber, statusTextFr, statusDescFr, senditTrackingCode
        );
    }
    
    /**
     * Message sent when Sendit tracking code is linked to order
     */
    public String getSenditTrackingLinkedMessage(String customerName, String orderNumber, 
                                                  String sileaTrackingCode, String senditTrackingCode) {
        return String.format(
            "🌟 *السلام عليكم ورحمة الله وبركاته* 🌟\n\n" +
            "عزيزنا *%s*،\n\n" +
            "📦 *طلبك %s الآن مع شركة التوصيل!*\n\n" +
            "تم تسجيل طلبك في نظام التوصيل Sendit\n" +
            "يمكنك الآن تتبع طلبك مباشرة! 🚚\n\n" +
            "🔍 *رموز التتبع:*\n" +
            "📋 رمز سيليا: %s\n" +
            "🚚 رمز Sendit: %s\n\n" +
            "يمكنك استخدام أي من الرمزين للتتبع:\n" +
            "http://51.44.37.35:3000/track-order\n\n" +
            "سنبقيك على إطلاع بكل التحديثات 📲\n\n" +
            "━━━━━━━━━━━━━━━━━━━━\n\n" +
            "🌟 *Bonjour %s!* 🌟\n\n" +
            "📦 *Votre commande %s est maintenant avec le livreur!*\n\n" +
            "Votre commande a été enregistrée dans le système Sendit\n" +
            "Vous pouvez maintenant suivre votre livraison! 🚚\n\n" +
            "🔍 *Codes de suivi:*\n" +
            "📋 Code Silea: %s\n" +
            "🚚 Code Sendit: %s\n\n" +
            "Utilisez l'un des deux codes pour suivre:\n" +
            "http://51.44.37.35:3000/track-order\n\n" +
            "Nous vous tiendrons informé de chaque étape! 📲",
            customerName, orderNumber, sileaTrackingCode, senditTrackingCode,
            customerName, orderNumber, sileaTrackingCode, senditTrackingCode
        );
    }
}
