package com.example.silea.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
public class MailConfig {
    
    private final EmailConfig emailConfig;
    
    public MailConfig(EmailConfig emailConfig) {
        this.emailConfig = emailConfig;
    }
    
    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        
        mailSender.setHost(emailConfig.getHost());
        mailSender.setPort(emailConfig.getPort());
        mailSender.setUsername(emailConfig.getUsername());
        mailSender.setPassword(emailConfig.getPassword());
        
        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.smtp.auth", emailConfig.isSmtpAuth());
        props.put("mail.smtp.starttls.enable", emailConfig.isSmtpStartTlsEnable());
        props.put("mail.smtp.starttls.required", emailConfig.isSmtpStartTlsRequired());
        props.put("mail.smtp.connectiontimeout", "5000");
        props.put("mail.smtp.timeout", "5000");
        props.put("mail.smtp.writetimeout", "5000");
        
        return mailSender;
    }
}
