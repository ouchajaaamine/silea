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
            case SHIPPED -> "🚚";
            case DELIVERED -> "🎉";
            case CANCELLED -> "❌";
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
            case SHIPPED -> "تم الشحن";
            case DELIVERED -> "تم التسليم";
            case CANCELLED -> "ملغى";
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
            case SHIPPED -> "Expédiée";
            case DELIVERED -> "Livrée";
            case CANCELLED -> "Annulée";
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
            case SHIPPED -> "طلبك في الطريق إليك! سيصلك قريباً إن شاء الله 🚚💨";
            case DELIVERED -> "تم التسليم بنجاح! نتمنى أن تستمتع بمنتجاتنا 🎁✨";
            case CANCELLED -> "تم إلغاء الطلب. تواصل معنا لأي استفسار 📞";
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
            case SHIPPED -> "Votre colis est en route vers vous! 🚚💨";
            case DELIVERED -> "Livraison réussie! Profitez de vos produits 🎁✨";
            case CANCELLED -> "Commande annulée. Contactez-nous pour toute question 📞";
            default -> "Nouvelle mise à jour de votre commande 📋";
        };
    }
}
