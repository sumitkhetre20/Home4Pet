package com.home4pet.config;

import com.stripe.Stripe;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "stripe")
public class StripeProperties {

    private String secretKey;
    private String webhookSecret;
    private String successUrl;
    private String cancelUrl;

    @PostConstruct
    public void init() {
        Stripe.apiKey = secretKey;
    }
}
