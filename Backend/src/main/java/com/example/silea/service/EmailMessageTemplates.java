package com.example.silea.service;

import com.example.silea.enums.OrderStatus;
import org.springframework.stereotype.Component;

@Component
public class EmailMessageTemplates {
    
    private static final String BUSINESS_NAME = "Silea";
    private static final String BUSINESS_LOGO = "https://xn--sila-dpa.com/logo.png";
    private static final String TRACKING_URL = "https://xn--sila-dpa.com/track-order";
    
    /**
     * Get HTML email header
     */
    private String getEmailHeader() {
        return """
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
                    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; }
                    .content { padding: 30px 20px; }
                    .section { margin-bottom: 25px; }
                    .section-title { color: #667eea; font-size: 18px; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid #667eea; padding-bottom: 5px; }
                    .info-box { background-color: #f8f9ff; border-left: 4px solid #667eea; padding: 15px; margin: 10px 0; border-radius: 5px; }
                    .button { display: inline-block; background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 15px 0; font-weight: bold; }
                    .button:hover { background-color: #764ba2; }
                    .footer { background-color: #f8f9ff; padding: 20px; text-align: center; color: #666; font-size: 14px; }
                    .status-badge { display: inline-block; padding: 8px 15px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
                    .status-confirmed { background-color: #d4edda; color: #155724; }
                    .status-processing { background-color: #cfe2ff; color: #084298; }
                    .status-transit { background-color: #fff3cd; color: #664d03; }
                    .status-delivered { background-color: #d1e7dd; color: #0f5132; }
                    .status-cancelled { background-color: #f8d7da; color: #842029; }
                    .divider { border-top: 2px dashed #e0e0e0; margin: 30px 0; }
                    .french-section { direction: ltr; text-align: left; }
                    .emoji { font-size: 24px; }
                </style>
            </head>
            <body>
            """;
    }
    
    /**
     * Get HTML email footer
     */
    private String getEmailFooter() {
        return """
            <div class="footer">
                <p><strong>🌿 Silea - سيليا 🌿</strong></p>
                <p>Merci de votre confiance | شكراً لثقتكم</p>
                <p style="font-size: 12px; color: #999;">
                    Cet email a été envoyé automatiquement, veuillez ne pas répondre directement.<br>
                    تم إرسال هذا البريد الإلكتروني تلقائياً، يرجى عدم الرد مباشرة.
                </p>
            </div>
            </body>
            </html>
            """;
    }
    
    /**
     * Order confirmation email (sent when order is created)
     */
    public String getOrderConfirmationSubject(String orderNumber) {
        return String.format("✅ تأكيد الطلب %s | Confirmation de commande %s", orderNumber, orderNumber);
    }
    
    public String getOrderConfirmationMessage(String customerName, String orderNumber, 
                                             Double totalAmount, String itemsSummary, String trackingCode) {
        return getEmailHeader() + String.format("""
            <div class="container">
                <div class="header">
                    <h1>🌟 تأكيد الطلب | Confirmation de commande 🌟</h1>
                </div>
                
                <div class="content">
                    <!-- Arabic Section -->
                    <div class="section">
                        <h2>السلام عليكم ورحمة الله وبركاته</h2>
                        <p>عزيزنا <strong>%s</strong>،</p>
                        <p>نشكرك على ثقتك الغالية في سيليا! ✨</p>
                        
                        <div class="info-box">
                            <p><strong>✅ تم تأكيد طلبك بنجاح</strong></p>
                            <p>🔖 <strong>رقم الطلب:</strong> %s</p>
                        </div>
                        
                        <div class="section-title">📦 المنتجات المطلوبة</div>
                        <div style="padding: 10px;">%s</div>
                        
                        <div class="info-box">
                            <p style="font-size: 20px;"><strong>💰 المبلغ الإجمالي: %.2f درهم</strong></p>
                        </div>
                        
                        <div class="section-title">🔍 تتبع طلبك</div>
                        <div style="text-align: center;">
                            <a href="https://xn--sila-dpa.com/track-order?code=%s" class="button">
                                تتبع الطلب الآن
                            </a>
                            <p style="font-size: 12px; color: #666;">رمز التتبع: %s</p>
                        </div>
                        
                        <p>سنبقيك على اطلاع بكل مستجدات طلبك 📲</p>
                        <p>شكراً لاختيارك سيليا 🙏🌿</p>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <!-- French Section -->
                    <div class="section french-section">
                        <h2>Bonjour %s!</h2>
                        <p>Merci infiniment pour votre confiance en Silea! ✨</p>
                        
                        <div class="info-box">
                            <p><strong>✅ Votre commande est confirmée</strong></p>
                            <p>🔖 <strong>Numéro:</strong> %s</p>
                        </div>
                        
                        <div class="section-title">📦 Articles commandés</div>
                        <div style="padding: 10px;">%s</div>
                        
                        <div class="info-box">
                            <p style="font-size: 20px;"><strong>💰 Total: %.2f MAD</strong></p>
                        </div>
                        
                        <div class="section-title">🔍 Suivez votre commande</div>
                        <div style="text-align: center;">
                            <a href="https://xn--sila-dpa.com/track-order?code=%s" class="button">
                                Suivre maintenant
                            </a>
                            <p style="font-size: 12px; color: #666;">Code de suivi: %s</p>
                        </div>
                        
                        <p>Nous vous tiendrons informé à chaque étape! 📲</p>
                        <p>Merci d'avoir choisi Silea 🙏🌿</p>
                    </div>
                </div>
                
                %s
            </div>
            """, customerName, orderNumber, itemsSummary, totalAmount, trackingCode, trackingCode,
                customerName, orderNumber, itemsSummary, totalAmount, trackingCode, trackingCode,
                getEmailFooter());
    }
    
    /**
     * Status update email (generic)
     */
    public String getStatusUpdateSubject(String orderNumber, OrderStatus status) {
        return String.format("%s تحديث الطلب %s | Mise à jour commande %s %s", 
            getStatusEmoji(status), orderNumber, orderNumber, getStatusEmoji(status));
    }
    
    public String getStatusUpdateMessage(String customerName, String orderNumber, OrderStatus status, String trackingCode) {
        String statusEmoji = getStatusEmoji(status);
        String statusTextAr = getStatusTextInArabic(status);
        String statusTextFr = getStatusTextInFrench(status);
        String statusDescAr = getStatusDescriptionInArabic(status);
        String statusDescFr = getStatusDescription(status);
        String statusClass = getStatusClass(status);
        
        return getEmailHeader() + String.format("""
            <div class="container">
                <div class="header">
                    <h1>%s تحديث حالة الطلب | Mise à jour de statut %s</h1>
                </div>
                
                <div class="content">
                    <!-- Arabic Section -->
                    <div class="section">
                        <h2>السلام عليكم ورحمة الله وبركاته</h2>
                        <p>عزيزنا <strong>%s</strong>،</p>
                        
                        <div class="info-box">
                            <p>%s <strong>تحديث حالة طلبك %s</strong></p>
                        </div>
                        
                        <div style="text-align: center; margin: 20px 0;">
                            <span class="status-badge %s">%s %s</span>
                        </div>
                        
                        <p style="background-color: #f8f9ff; padding: 15px; border-radius: 5px;">
                            %s
                        </p>
                        
                        <div style="text-align: center; margin: 20px 0;">
                            <a href="https://xn--sila-dpa.com/track-order?code=%s" class="button">
                                🔍 تتبع طلبك
                            </a>
                        </div>
                        
                        <p>نحن دائماً في خدمتك! 🙏🌿</p>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <!-- French Section -->
                    <div class="section french-section">
                        <h2>Bonjour %s!</h2>
                        
                        <div class="info-box">
                            <p>%s <strong>Mise à jour de votre commande %s</strong></p>
                        </div>
                        
                        <div style="text-align: center; margin: 20px 0;">
                            <span class="status-badge %s">%s %s</span>
                        </div>
                        
                        <p style="background-color: #f8f9ff; padding: 15px; border-radius: 5px;">
                            %s
                        </p>
                        
                        <div style="text-align: center; margin: 20px 0;">
                            <a href="https://xn--sila-dpa.com/track-order?code=%s" class="button">
                                🔍 Suivre votre commande
                            </a>
                        </div>
                        
                        <p>Nous sommes toujours à votre service! 🙏🌿</p>
                    </div>
                </div>
                
                %s
            </div>
            """, statusEmoji, statusEmoji,
                customerName, statusEmoji, orderNumber, statusClass, statusEmoji, statusTextAr, statusDescAr, trackingCode,
                customerName, statusEmoji, orderNumber, statusClass, statusEmoji, statusTextFr, statusDescFr, trackingCode,
                getEmailFooter());
    }
    
    /**
     * Sendit tracking linked email
     */
    public String getSenditTrackingLinkedSubject(String orderNumber) {
        return String.format("🚚 طلبك مع شركة التوصيل | Commande %s expédiée", orderNumber);
    }
    
    public String getSenditTrackingLinkedMessage(String customerName, String orderNumber, 
                                                  String sileaTrackingCode, String senditTrackingCode) {
        return getEmailHeader() + String.format("""
            <div class="container">
                <div class="header">
                    <h1>📦 طلبك الآن مع شركة التوصيل | Votre commande est en livraison</h1>
                </div>
                
                <div class="content">
                    <!-- Arabic Section -->
                    <div class="section">
                        <h2>السلام عليكم ورحمة الله وبركاته</h2>
                        <p>عزيزنا <strong>%s</strong>،</p>
                        
                        <div class="info-box">
                            <p style="font-size: 18px;"><strong>📦 طلبك %s الآن مع شركة التوصيل!</strong></p>
                        </div>
                        
                        <p>تم تسجيل طلبك في نظام التوصيل Sendit</p>
                        <p>يمكنك الآن تتبع طلبك مباشرة! 🚚</p>
                        
                        <div class="section-title">🔍 رموز التتبع</div>
                        <div class="info-box">
                            <p>📋 <strong>رمز سيليا:</strong> <code style="background: #fff; padding: 5px 10px; border-radius: 3px;">%s</code></p>
                            <p>🚚 <strong>رمز Sendit:</strong> <code style="background: #fff; padding: 5px 10px; border-radius: 3px; font-weight: bold; color: #667eea;">%s</code></p>
                        </div>
                        
                        <div style="text-align: center; margin: 25px 0;">
                            <a href="https://xn--sila-dpa.com/track-order" class="button">
                                🔍 تتبع طلبك الآن
                            </a>
                        </div>
                        
                        <p>سنبقيك على إطلاع بكل التحديثات 📲</p>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <!-- French Section -->
                    <div class="section french-section">
                        <h2>Bonjour %s!</h2>
                        
                        <div class="info-box">
                            <p style="font-size: 18px;"><strong>📦 Votre commande %s est maintenant avec le livreur!</strong></p>
                        </div>
                        
                        <p>Votre commande a été enregistrée dans le système Sendit</p>
                        <p>Vous pouvez maintenant suivre votre livraison! 🚚</p>
                        
                        <div class="section-title">🔍 Codes de suivi</div>
                        <div class="info-box">
                            <p>📋 <strong>Code Silea:</strong> <code style="background: #fff; padding: 5px 10px; border-radius: 3px;">%s</code></p>
                            <p>🚚 <strong>Code Sendit:</strong> <code style="background: #fff; padding: 5px 10px; border-radius: 3px; font-weight: bold; color: #667eea;">%s</code></p>
                        </div>
                        
                        <div style="text-align: center; margin: 25px 0;">
                            <a href="https://xn--sila-dpa.com/track-order" class="button">
                                🔍 Suivre maintenant
                            </a>
                        </div>
                        
                        <p>Nous vous tiendrons informé de chaque étape! 📲</p>
                    </div>
                </div>
                
                %s
            </div>
            """, customerName, orderNumber, sileaTrackingCode, senditTrackingCode,
                customerName, orderNumber, sileaTrackingCode, senditTrackingCode,
                getEmailFooter());
    }
    
    /**
     * Cancellation email
     */
    public String getCancellationSubject(String orderNumber) {
        return String.format("❌ إلغاء الطلب %s | Annulation commande %s", orderNumber, orderNumber);
    }
    
    public String getCancellationMessage(String customerName, String orderNumber, String reason) {
        return getEmailHeader() + String.format("""
            <div class="container">
                <div class="header" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                    <h1>❌ إلغاء الطلب | Annulation de commande</h1>
                </div>
                
                <div class="content">
                    <!-- Arabic Section -->
                    <div class="section">
                        <p>عزيزنا <strong>%s</strong>،</p>
                        
                        <div class="info-box" style="border-left-color: #f5576c;">
                            <p><strong>❌ تم إلغاء الطلب %s</strong></p>
                            %s
                        </div>
                        
                        <p>إذا كان لديك أي أسئلة أو ترغب في تقديم طلب جديد، لا تتردد في التواصل معنا.</p>
                        <p>نحن دائماً في خدمتك 🙏</p>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <!-- French Section -->
                    <div class="section french-section">
                        <p>Cher(e) <strong>%s</strong>,</p>
                        
                        <div class="info-box" style="border-left-color: #f5576c;">
                            <p><strong>❌ Votre commande %s a été annulée</strong></p>
                            %s
                        </div>
                        
                        <p>Si vous avez des questions ou souhaitez passer une nouvelle commande, n'hésitez pas à nous contacter.</p>
                        <p>Cordialement,<br>L'équipe Silea</p>
                    </div>
                </div>
                
                %s
            </div>
            """, customerName, orderNumber, 
                reason != null && !reason.isEmpty() ? "<p><strong>السبب:</strong> " + reason + "</p>" : "",
                customerName, orderNumber,
                reason != null && !reason.isEmpty() ? "<p><strong>Raison:</strong> " + reason + "</p>" : "",
                getEmailFooter());
    }
    
    /**
     * Delivery status update email (for Sendit tracking updates)
     */
    public String getDeliveryStatusUpdateSubject(String orderNumber, OrderStatus newStatus) {
        return String.format("%s تحديث التوصيل %s | Livraison %s %s", 
            getStatusEmoji(newStatus), orderNumber, orderNumber, getStatusEmoji(newStatus));
    }
    
    public String getDeliveryStatusUpdateMessage(String customerName, String orderNumber, 
                                                 OrderStatus oldStatus, OrderStatus newStatus,
                                                 String senditTrackingCode) {
        String statusEmoji = getStatusEmoji(newStatus);
        String statusTextAr = getStatusTextInArabic(newStatus);
        String statusTextFr = getStatusTextInFrench(newStatus);
        String statusDescAr = getStatusDescriptionInArabic(newStatus);
        String statusDescFr = getStatusDescription(newStatus);
        String statusClass = getStatusClass(newStatus);
        
        return getEmailHeader() + String.format("""
            <div class="container">
                <div class="header">
                    <h1>%s تحديث توصيل الطلب | Mise à jour de livraison %s</h1>
                </div>
                
                <div class="content">
                    <!-- Arabic Section -->
                    <div class="section">
                        <h2>السلام عليكم ورحمة الله وبركاته</h2>
                        <p>عزيزنا <strong>%s</strong>،</p>
                        
                        <div class="info-box">
                            <p>%s <strong>تحديث توصيل طلبك %s</strong></p>
                        </div>
                        
                        <div style="text-align: center; margin: 20px 0;">
                            <span class="status-badge %s">%s %s</span>
                        </div>
                        
                        <p style="background-color: #f8f9ff; padding: 15px; border-radius: 5px;">
                            %s
                        </p>
                        
                        <div class="info-box">
                            <p>🔍 <strong>رمز التتبع Sendit:</strong> <code style="background: #fff; padding: 5px 10px; border-radius: 3px;">%s</code></p>
                        </div>
                        
                        <p>نحن دائماً في خدمتك! 🙏🌿</p>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <!-- French Section -->
                    <div class="section french-section">
                        <h2>Bonjour %s!</h2>
                        
                        <div class="info-box">
                            <p>%s <strong>Mise à jour de livraison %s</strong></p>
                        </div>
                        
                        <div style="text-align: center; margin: 20px 0;">
                            <span class="status-badge %s">%s %s</span>
                        </div>
                        
                        <p style="background-color: #f8f9ff; padding: 15px; border-radius: 5px;">
                            %s
                        </p>
                        
                        <div class="info-box">
                            <p>🔍 <strong>Code de suivi Sendit:</strong> <code style="background: #fff; padding: 5px 10px; border-radius: 3px;">%s</code></p>
                        </div>
                        
                        <p>Nous sommes toujours à votre service! 🙏🌿</p>
                    </div>
                </div>
                
                %s
            </div>
            """, statusEmoji, statusEmoji,
                customerName, statusEmoji, orderNumber, statusClass, statusEmoji, statusTextAr, statusDescAr, senditTrackingCode,
                customerName, statusEmoji, orderNumber, statusClass, statusEmoji, statusTextFr, statusDescFr, senditTrackingCode,
                getEmailFooter());
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
     * Get CSS class for status badge
     */
    private String getStatusClass(OrderStatus status) {
        return switch (status) {
            case CONFIRMED, DELIVERED -> "status-delivered";
            case PROCESSING, PICKUP_REQUESTED, PICKED_UP, IN_WAREHOUSE -> "status-processing";
            case IN_TRANSIT, OUT_FOR_DELIVERY, SCHEDULED -> "status-transit";
            case CANCELLED, REFUSED -> "status-cancelled";
            default -> "status-confirmed";
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
}
