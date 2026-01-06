export type Language = 'en' | 'fr' | 'ar'

export interface Translations {
  // Common
  common: {
    home: string
    about: string
    contact: string
    shop: string
    cart: string
    checkout: string
    continue: string
    back: string
    save: string
    cancel: string
    delete: string
    edit: string
    add: string
    remove: string
    search: string
    loading: string
    error: string
    success: string
    close: string
    next: string
    previous: string
    viewAll: string
    readMore: string
    learnMore: string
    subscribe: string
    email: string
    phone: string
    address: string
    name: string
    quantity: string
    price: string
    total: string
    subtotal: string
    shipping: string
    free: string
    secure: string
    fastDelivery: string
    addToCart: string
    buyNow: string
    inStock: string
    outOfStock: string
    selectSize: string
    reviews: string
    description: string
    benefits: string
    share: string
    category: string
    featured: string
    new: string
    sale: string
  }

  // Header
  header: {
    searchPlaceholder: string
    cart: string
    account: string
    menu: string
    items: string
    item: string
    inCart: string
    emptyCart: string
    viewCart: string
    checkout: string
    continueShopping: string
  }

  nav: {
    categories: {
      honey: string
      oils: string
    }
  }

  // Homepage
  home: {
    hero: {
      title: string
      subtitle: string
      cta: string
      scrollDown: string
    }
    featured: {
      title: string
      subtitle: string
      viewAll: string
    }
    categories: {
      title: string
      subtitle: string
      explore: string
      honeyDesc: string
      oilsDesc: string
    }
    story: {
      badge: string
      heading: string
      p1: string
      p2: string
      p3: string
      cta: string
      yearsOfTradition: string
    }
    testimonials: {
      label: string
      title: string
      description: string
    }
    chooseSize: string
    features: {
      title: string
      subtitle: string
      natural: {
        title: string
        description: string
      }
      traditional: {
        title: string
        description: string
      }
      premium: {
        title: string
        description: string
      }
      coldPressed: {
        title: string
        description: string
      }
    }
    trust: {
      noPreservatives: string
      directSource: string
      fromBeniMellal: string
    }
  }

  // Cart
  cart: {
    title: string
    subtitle: string
    empty: {
      title: string
      description: string
      startShopping: string
    }
    orderSummary: string
    items: string
    item: string
    removeItem: string
    updateQuantity: string
    proceedToCheckout: string
    continueShopping: string
    freeShippingMessage: string
    addMoreForFreeShipping: string
    steps: {
      cart: string
      details: string
      payment: string
      done: string
    }
    shippingDetails: {
      title: string
      subtitle: string
      personalInfo: string
      fullName: string
      phoneNumber: string
      emailAddress: string
      emailHint: string
      shippingAddress: string
      streetAddress: string
      city: string
      cityTangier: string
      cityOther: string
      shippingDependsOnCity: string
      additionalNotes: string
      optional: string
      notesPlaceholder: string
    }
    payment: {
      title: string
      subtitle: string
      method: string
      cashOnDelivery: string
      cashOnDeliveryDesc: string
      recommended: string
      bankTransfer: string
      bankTransferDesc: string
      comingSoon: string
      orderReview: string
      deliveryDetails: string
      estimatedDelivery: string
      days: string
      placeOrder: string
      processing: string
      securityNote: string
    }
    success: {
      thankYou: string
      orderPlaced: string
      orderNumber: string
      trackingCode: string
      totalToPay: string
      estimatedDelivery: string
      saveTrackingCode: string
      trackingHint: string
      trackOrder: string
      continueShopping: string
      orderConfirmed: string
      order: string
      tracking: string
      emailConfirmation: string
      close: string
    }
    labels: {
      required: string
    }
    placeholders: {
      fullName: string
      phoneNumber: string
      emailAddress: string
      streetAddress: string
      city: string
      additionalNotes: string
    }
  }

  // Product
  product: {
    addedToCart: string
    inCart: string
    addToWishlist: string
    selectSize: string
    each: string
    save: string
    savePercent: string
    freeShipping: string
    securePayment: string
    natural: string
    aboutProduct: string
    healthBenefits: string
    origin: string
    ingredients: string
    pureNoAdditives: string
    youMightAlsoLike: string
    hoverToZoom: string
    viewSizes: string
    startingFrom: string
    unavailable: string
    unavailableStatus: string
    productNotFound: string
    productNotFoundDesc: string
    backToHome: string
    categoryBreadcrumb: string
    rating: string
    description: string
    benefits: string
    reviews: string
    reviewsCount: string
    quantity: string
    relatedProducts: string
  }

  // About
  about: {
    hero: {
      title: string
      subtitle: string
    }
    story: {
      title: string
      p1: string
      p2: string
      p3: string
      tagline: string
    }
    values: {
      title: string
      purity: {
        title: string
        description: string
      }
      community: {
        title: string
        description: string
      }
      heritage: {
        title: string
        description: string
      }
    }
    features: {
      title: string
      mountainSourced: {
        title: string
        description: string
      }
      handcrafted: {
        title: string
        description: string
      }
      premium: {
        title: string
        description: string
      }
      coldPressed: {
        title: string
        description: string
      }
    }
  }

  // Contact
  contact: {
    title: string
    subtitle: string
    whatsapp: string
    faqTitle: string
    faqSubtitle: string
    faq: {
      shipping: {
        question: string
        answer: string
      }
      delivery: {
        question: string
        answer: string
      }
      payment: {
        question: string
        answer: string
      }
      returns: {
        question: string
        answer: string
      }
      tracking: {
        question: string
        answer: string
      }
    }
    form: {
      name: string
      namePlaceholder: string
      email: string
      emailPlaceholder: string
      subject: string
      subjectPlaceholder: string
      message: string
      messagePlaceholder: string
      send: string
      sending: string
      success: string
      successMessage: string
    }
    info: {
      title: string
      email: string
      phone: string
      location: string
      hours: string
      weekdays: string
      weekend: string
    }
  }

  // Footer
  footer: {
    cta: {
      title: string
      description: string
      shopNow: string
      learnMore: string
    }
    shop: string
    allProducts: string
    giftSets: string
    newArrivals: string
    support: string
    trackOrder: string
    shippingInfo: string
    returns: string
    faq: string
    contact: string
    location: string
    copyright: string
    brandDescription: string
    privacy: string
    terms: string
    cookies: string
  }

  // Category
  category: {
    filters: string
    sortBy: string
    price: string
    availability: string
    inStock: string
    outOfStock: string
    all: string
    lowToHigh: string
    highToLow: string
    nameAZ: string
    nameZA: string
    clearFilters: string
    noProducts: string
    showing: string
    of: string
    results: string
    filtersAndSort: string
    sortPlaceholder: string
    refine: string
    productsLabel: string
    naturalLabel: string
    ratingLabel: string
    hundredPercent: string
    fiveStars: string
  }

  // Track Order
  trackOrder: {
    title: string
    subtitle: string
    badge: string
    orderNumber: string
    trackingCode: string
    searchPlaceholder: string
    searchPlaceholderTracking: string
    trackButton: string
    searching: string
    tryAgain: string
    orderNotFound: string
    orderNotFoundMessage: string
    cancelled: string
    cancelOrder: string
    cancelConfirm: string
    cancelReason: string
    cancelPlaceholder: string
    keepOrder: string
    cancelling: string
    status: {
      pending: string
      pendingDesc: string
      confirmed: string
      confirmedDesc: string
      processing: string
      processingDesc: string
      shipped: string
      shippedDesc: string
      outForDelivery: string
      outForDeliveryDesc: string
      delivered: string
      deliveredDesc: string
      cancelled: string
      cancelledDesc: string
      refunded: string
      refundedDesc: string
    }
    orderDate: string
    estDelivery: string
    total: string
    shippingAddress: string
    orderItems: string
    each: string
    trackingHistory: string
    noTracking: string
    checkBack: string
    needHelp: string
    needHelpDesc: string
    contactUs: string
    orderTip: string
    orderTipDesc: string
    trackingTip: string
    trackingTipDesc: string
  }
}

export const translations: Record<Language, Translations> = {
  en: {
    common: {
      home: 'Home',
      about: 'About',
      contact: 'Contact',
      shop: 'Discover',
      cart: 'Cart',
      checkout: 'Checkout',
      continue: 'Continue',
      back: 'Back',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      remove: 'Remove',
      search: 'Search',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      close: 'Close',
      next: 'Next',
      previous: 'Previous',
      viewAll: 'View All',
      readMore: 'Read More',
      learnMore: 'Learn More',
      subscribe: 'Subscribe',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      name: 'Name',
      quantity: 'Quantity',
      price: 'Price',
      total: 'Total',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      free: 'Free',
      secure: 'Secure',
      fastDelivery: 'Fast Delivery',
      addToCart: 'Add to Cart',
      buyNow: 'Buy Now',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      selectSize: 'Select Size',
      reviews: 'Reviews',
      description: 'Description',
      benefits: 'Benefits',
      share: 'Share',
      category: 'Category',
      featured: 'Featured',
      new: 'New',
      sale: 'Sale',
    },
    header: {
      searchPlaceholder: 'Search products...',
      cart: 'Cart',
      account: 'Account',
      menu: 'Menu',
      items: 'items',
      item: 'item',
      inCart: 'in your cart',
      emptyCart: 'Your cart is empty',
      viewCart: 'View Cart',
      checkout: 'Checkout',
      continueShopping: 'Continue Shopping',
    },
    nav: {
      categories: {
        honey: 'Honey',
        oils: 'Oils',
      },
    },
    home: {
      hero: {
        title: 'Pure Treasures from Beni Mellal',
        subtitle: 'Discover authentic Moroccan honey and mountain oils, sourced directly from the pristine Atlas Mountains.',
        cta: 'Choose Your Path',
        scrollDown: 'Scroll down to unveil stories',
      },
      featured: {
        title: 'Featured Products',
        subtitle: 'Handpicked premium selections from our collection',
        viewAll: 'View All Products',
      },
      categories: {
        title: 'Curated Routes',
        subtitle: 'Let the whispers of the Atlas lead you through each harvest.',
        explore: 'Reveal the Collection',
        honeyDesc: 'Pure and natural from the mountains',
        oilsDesc: 'Traditional and authentic quality',
      },
      story: {
        badge: 'Our Story',
        heading: 'From the Mountains of Beni Mellal to Your Table',
        p1: 'Silea was born from a deep respect for the land and traditions of Beni Mellal. For generations, we have produced some of the world\'s finest honey and oils using methods passed down through centuries.',
        p2: 'We are the direct producers. From our own trees and beehives to your table, we handle every step with care, ensuring that every jar of honey and every bottle of oil meets the highest standards of purity and authenticity.',
        p3: 'The name "Silea" represents purity in our hearts – and that\'s exactly what we deliver. Pure products, pure tradition, pure treasures from the mountains.',
        cta: 'Learn More About Us',
        yearsOfTradition: 'Years of Tradition',
      },
      testimonials: {
        label: 'Testimonials',
        title: 'What Customers Say',
        description: 'Join thousands of satisfied customers worldwide',
      },
      chooseSize: 'Choose Size',
      features: {
        title: 'Why Choose Silea',
        subtitle: 'Authentic quality you can trust',
        natural: {
          title: '100% Natural',
          description: 'Pure products with no additives or preservatives',
        },
        traditional: {
          title: 'Best Techniques',
          description: 'We rely on the finest contemporary techniques without falling back on outdated shortcuts',
        },
        premium: {
          title: 'Premium Quality',
          description: 'Verified quality at every stage',
        },
        coldPressed: {
          title: 'Cold-Pressed Goodness',
          description: 'Fresh extractions that preserve every layer of flavor',
        },
      },
      trust: {
        noPreservatives: 'No preservatives',
        directSource: 'Direct Source',
        fromBeniMellal: 'From Beni Mellal',
      },
    },
    cart: {
      title: 'Shopping Cart',
      subtitle: 'Review your items before checkout',
      empty: {
        title: 'Your cart is empty',
        description: 'Discover our premium Moroccan products and add them to your cart.',
        startShopping: 'Start Shopping',
      },
      orderSummary: 'Order Summary',
      items: 'items',
      item: 'item',
      removeItem: 'Remove item',
      updateQuantity: 'Update quantity',
      proceedToCheckout: 'Proceed to Checkout',
      continueShopping: 'Continue Shopping',
      freeShippingMessage: 'Free shipping on orders over 200 MAD',
      addMoreForFreeShipping: 'Add {amount} MAD more for free shipping!',
      steps: {
        cart: 'Cart',
        details: 'Details',
        payment: 'Payment',
        done: 'Done',
      },
      shippingDetails: {
        title: 'Shipping Details',
        subtitle: 'Where should we deliver your order?',
        personalInfo: 'Personal Information',
        fullName: 'Full Name',
        phoneNumber: 'Phone Number',
        emailAddress: 'Email Address',
        emailHint: "We'll send order confirmation and tracking updates to this email",
        shippingAddress: 'Shipping Address',
        streetAddress: 'Street Address',
        city: 'City',
        cityTangier: 'Tangier',
        cityOther: 'Other city',
        shippingDependsOnCity: '20 MAD in Tangier • 35 MAD other cities',
        additionalNotes: 'Additional Notes',
        optional: 'Optional',
        notesPlaceholder: 'Any special instructions for delivery? (e.g., ring doorbell, leave at door...)',
      },
      payment: {
        title: 'Payment',
        subtitle: 'Select your preferred payment method',
        method: 'Payment Method',
        cashOnDelivery: 'Cash on Delivery',
        cashOnDeliveryDesc: 'Pay when you receive your order',
        recommended: 'Recommended',
        bankTransfer: 'Bank Transfer',
        bankTransferDesc: 'Pay via bank transfer',
        comingSoon: 'Coming Soon',
        orderReview: 'Order Review',
        deliveryDetails: 'Delivery Details',
        estimatedDelivery: 'Estimated Delivery',
        days: '3-5 business days',
        placeOrder: 'Place Order',
        processing: 'Processing...',
        securityNote: 'Your information is secure and encrypted',
      },
      success: {
        thankYou: 'Thank You!',
        orderPlaced: 'Your order has been placed successfully',
        orderNumber: 'Order Number',
        trackingCode: 'Tracking Code',
        totalToPay: 'Total Paid',
        estimatedDelivery: 'Est. Delivery',
        saveTrackingCode: 'Save your tracking code:',
        trackingHint: 'You can use it anytime to track your order status',
        trackOrder: 'Track Order',
        continueShopping: 'Continue Shopping',
        orderConfirmed: 'Order Confirmed!',
        order: 'Order',
        tracking: 'Tracking',
        emailConfirmation: "We'll send order details and tracking updates to your email.",
        close: 'Close',
      },
      labels: {
        required: '*',
      },
      placeholders: {
        fullName: 'Enter your full name',
        phoneNumber: 'Enter your phone number',
        emailAddress: 'Enter your email address',
        streetAddress: 'Enter your street address',
        city: 'Enter your city',
        additionalNotes: 'Any special instructions for delivery? (e.g., ring doorbell, leave at door...)',
      },
    },
    product: {
      addedToCart: 'added to cart',
      inCart: 'in cart',
      addToWishlist: 'Add to Wishlist',
      selectSize: 'Select Size:',
      each: 'each',
      save: 'Save',
      savePercent: 'Save 15%',
      freeShipping: 'Free Shipping',
      securePayment: 'Secure Payment',
      natural: '100% Natural',
      aboutProduct: 'About This Product',
      healthBenefits: 'Health Benefits',
      origin: 'Origin',
      ingredients: 'Ingredients',
      pureNoAdditives: '100% Pure, No Additives',
      youMightAlsoLike: 'You Might Also Like',
      hoverToZoom: 'Hover to zoom',
      viewSizes: 'View sizes & prices',
        startingFrom: 'Starting from',
      unavailable: 'Unavailable',
      unavailableStatus: 'Out of stock',
      rating: '5.0 (24 reviews)',
      reviewsCount: '(24)',
      productNotFound: 'Product Not Found',
      productNotFoundDesc: "The product you're looking for doesn't exist or has been removed.",
      backToHome: 'Back to Home',
      quantity: 'Quantity',
      description: 'Description',
      benefits: 'Benefits',
      reviews: 'Reviews',
      categoryBreadcrumb: 'Home',
      relatedProducts: 'Related Products',
    },
    about: {
      hero: {
        title: 'Our Story',
        subtitle: 'Bringing authentic Moroccan treasures to your table',
      },
      story: {
        title: 'From the Mountains to Your Home',
        p1: 'Silea was born from a deep love for the natural treasures of Beni Mellal, a region nestled in the heart of Morocco\'s Atlas Mountains. For generations, we have harvested the finest honey and pressed the purest oils using traditional methods passed down through centuries.',
        p2: 'We are the producers. From our own trees and beehives, we handle every step of the process to ensure that every product maintains its authentic character and natural benefits. Our commitment is to bring you products that are not just natural, but truly exceptional.',
        p3: 'Every jar of honey and bottle of oil tells a story of tradition, care, and the pristine mountain environment where it was created.',
        tagline: 'The name "Silea" represents purity in our hearts – and that\'s exactly what we deliver. Pure products, pure tradition, pure treasures from the mountains.',
      },
      values: {
        title: 'Our Values',
        purity: {
          title: 'Purity',
          description: '100% natural products with no additives, preservatives, or artificial ingredients. Just pure nature.',
        },
        community: {
          title: 'Community',
          description: 'We are the direct producers. From our trees and beehives to your table, we handle everything with care and tradition.',
        },
        heritage: {
          title: 'Heritage',
          description: 'We honor centuries of traditional knowledge passed down through generations of mountain families.',
        },
      },
      features: {
        title: 'What Makes Us Different',
        mountainSourced: {
          title: 'Mountain Sourced',
          description: 'Our products come from the pristine Atlas Mountains of Beni Mellal, where nature remains untouched.',
        },
        handcrafted: {
          title: 'Handcrafted with Love',
          description: 'Every jar and bottle is carefully prepared using traditional methods that preserve natural qualities.',
        },
        premium: {
          title: 'Premium Quality',
          description: 'We verify quality at every stage, from harvesting to bottling, ensuring the finest products.',
        },
        coldPressed: {
          title: 'Cold Pressed',
          description: 'Our oils are cold-pressed using traditional stone mills to preserve nutrients and flavor.',
        },
      },
    },
    contact: {
      title: 'Get in Touch',
      subtitle: 'Have questions? We\'re here to help! Reach out via email or WhatsApp.',
      whatsapp: 'Get in Touch',
      faqTitle: 'Frequently Asked Questions',
      faqSubtitle: 'Quick answers to common questions',
      faq: {
        shipping: {
          question: 'How much does shipping cost?',
          answer: 'Shipping is completely FREE for all orders across Morocco! We deliver to your doorstep at no extra cost.',
        },
        delivery: {
          question: 'How long does delivery take?',
          answer: 'We deliver within 48 hours or less to most cities in Morocco. Express delivery is available for urgent orders.',
        },
        payment: {
          question: 'What payment methods do you accept?',
          answer: 'We accept cash on delivery (COD) for your convenience. Pay when you receive your order at your door.',
        },
        returns: {
          question: 'What is your return policy?',
          answer: 'We offer a 7-day return policy. If you\'re not satisfied with your order, contact us within 7 days for a full refund or exchange.',
        },
        tracking: {
          question: 'How can I track my order?',
          answer: 'After placing your order, you\'ll receive a tracking code via WhatsApp. Use it on our Track Order page to see real-time updates.',
        },
      },
      form: {
        name: 'Full Name',
        namePlaceholder: 'Enter your name',
        email: 'Email Address',
        emailPlaceholder: 'your.email@example.com',
        subject: 'Subject',
        subjectPlaceholder: 'What is this regarding?',
        message: 'Message',
        messagePlaceholder: 'Tell us how we can help...',
        send: 'Send Message',
        sending: 'Sending...',
        success: 'Message sent successfully!',
        successMessage: 'We\'ll get back to you within 24 hours.',
      },
      info: {
        title: 'Contact Information',
        email: 'Email',
        phone: 'Phone',
        location: 'Location',
        hours: 'Business Hours',
        weekdays: 'Monday - Friday: 9:00 AM - 6:00 PM',
        weekend: 'Saturday: 10:00 AM - 4:00 PM',
      },
    },
    footer: {
      cta: {
        title: 'Experience Pure Moroccan Treasures',
        description: 'Discover authentic honey and oils from the Atlas Mountains of Beni Mellal',
        shopNow: 'Shop Now',
        learnMore: 'Learn More',
      },
      shop: 'Shop',
      allProducts: 'All Products',
      giftSets: 'Gift Sets',
      newArrivals: 'New Arrivals',
      support: 'Support',
      trackOrder: 'Track Order',
      shippingInfo: 'Shipping Info',
      returns: 'Returns & Refunds',
      faq: 'FAQ',
      contact: 'Contact',
      location: 'Location',
      copyright: '© 2025 Silea. All rights reserved. Pure treasures from the mountains of Beni Mellal.',
      brandDescription: 'Pure treasures from the mountains of Beni Mellal. Authentic, traditional, and crafted with care for generations.',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      cookies: 'Cookie Policy',
    },
    category: {
      filters: 'Filters',
      sortBy: 'Sort By',
      price: 'Price',
      availability: 'Availability',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      all: 'All',
      lowToHigh: 'Price: Low to High',
      highToLow: 'Price: High to Low',
      nameAZ: 'Name: A-Z',
      nameZA: 'Name: Z-A',
      clearFilters: 'Clear Filters',
      noProducts: 'No products found',
      showing: 'Showing',
      of: 'of',
      results: 'results',
      filtersAndSort: 'Filters & Sort',
      sortPlaceholder: 'Sort by',
      refine: 'Refine your search',
      productsLabel: 'Products',
      naturalLabel: 'Natural',
      ratingLabel: 'Rating',
      hundredPercent: '100%',
      fiveStars: '5★',
    },
    trackOrder: {
      title: 'Track Your Order',
      subtitle: 'Enter your order number or tracking code to see delivery updates',
      badge: 'Order Tracking',
      orderNumber: 'Order Number',
      trackingCode: 'Tracking Code',
      searchPlaceholder: 'e.g., CMD001',
      searchPlaceholderTracking: 'e.g., SL-251205-XXXX',
      trackButton: 'Track Order',
      searching: 'Searching...',
      tryAgain: 'Try Again',
      orderNotFound: 'Order Not Found',
      orderNotFoundMessage: 'Please check your order number or tracking code',
      cancelled: 'Cancelled',
      cancelOrder: 'Cancel',
      cancelConfirm: 'Are you sure you want to cancel this order? This action cannot be undone.',
      cancelReason: 'Reason for cancellation (optional)',
      cancelPlaceholder: 'Tell us why you\'re cancelling this order...',
      keepOrder: 'Keep Order',
      cancelling: 'Cancelling...',
      status: {
        pending: 'Pending',
        pendingDesc: 'Your order has been received and is awaiting confirmation',
        confirmed: 'Confirmed',
        confirmedDesc: 'Your order has been confirmed and is being prepared',
        processing: 'Processing',
        processingDesc: 'Your order is being carefully packed',
        shipped: 'Shipped',
        shippedDesc: 'Your order is on its way to you',
        outForDelivery: 'Out for Delivery',
        outForDeliveryDesc: 'Your order is out for delivery today',
        delivered: 'Delivered',
        deliveredDesc: 'Your order has been delivered successfully',
        cancelled: 'Cancelled',
        cancelledDesc: 'This order has been cancelled',
        refunded: 'Refunded',
        refundedDesc: 'This order has been refunded',
      },
      orderDate: 'Order Date',
      estDelivery: 'Est. Delivery',
      total: 'Total',
      shippingAddress: 'Shipping Address',
      orderItems: 'Order Items',
      each: 'each',
      trackingHistory: 'Tracking History',
      noTracking: 'No tracking updates yet',
      checkBack: 'Check back soon for delivery updates',
      needHelp: 'Need Help?',
      needHelpDesc: 'Our customer service team is here to assist you',
      contactUs: 'Contact Us',
      orderTip: 'Order Number',
      orderTipDesc: 'Find your order number in the confirmation email we sent you (e.g., CMD001)',
      trackingTip: 'Tracking Code',
      trackingTipDesc: 'Use your unique tracking code to get real-time delivery updates (e.g., SL-251205-XXXX)',
    },
  },
  fr: {
    common: {
      home: 'Accueil',
      about: 'À propos',
      contact: 'Contact',
      shop: 'Découvrir',
      cart: 'Panier',
      checkout: 'Commande',
      continue: 'Continuer',
      back: 'Retour',
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      add: 'Ajouter',
      remove: 'Retirer',
      search: 'Rechercher',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      close: 'Fermer',
      next: 'Suivant',
      previous: 'Précédent',
      viewAll: 'Voir tout',
      readMore: 'Lire plus',
      learnMore: 'En savoir plus',
      subscribe: 'S\'abonner',
      email: 'Email',
      phone: 'Téléphone',
      address: 'Adresse',
      name: 'Nom',
      quantity: 'Quantité',
      price: 'Prix',
      total: 'Total',
      subtotal: 'Sous-total',
      shipping: 'Livraison',
      free: 'Gratuit',
      secure: 'Sécurisé',
      fastDelivery: 'Livraison rapide',
      addToCart: 'Ajouter au panier',
      buyNow: 'Acheter maintenant',
      inStock: 'En stock',
      outOfStock: 'Rupture de stock',
      selectSize: 'Choisir la taille',
      reviews: 'Avis',
      description: 'Description',
      benefits: 'Avantages',
      share: 'Partager',
      category: 'Catégorie',
      featured: 'En vedette',
      new: 'Nouveau',
      sale: 'Promotion',
    },
    header: {
      searchPlaceholder: 'Rechercher des produits...',
      cart: 'Panier',
      account: 'Compte',
      menu: 'Menu',
      items: 'articles',
      item: 'article',
      inCart: 'dans votre panier',
      emptyCart: 'Votre panier est vide',
      viewCart: 'Voir le panier',
      checkout: 'Commander',
      continueShopping: 'Continuer les achats',
    },
    nav: {
      categories: {
        honey: 'Miels',
        oils: "Huiles d'olive",
      },
    },
    home: {
      hero: {
        title: 'Trésors purs de Beni Mellal',
        subtitle: 'Découvrez le miel marocain authentique et les huiles de montagne, directement issus des montagnes de l\'Atlas.',
        cta: 'Choisissez votre route',
        scrollDown: 'Faites défiler pour révéler les histoires',
      },
      featured: {
        title: 'Produits vedettes',
        subtitle: 'Sélections premium soigneusement choisies de notre collection',
        viewAll: 'Voir tous les produits',
      },
      categories: {
        title: 'Parcours choisis',
        subtitle: 'Laissez les murmures de l\'Atlas guider chaque récolte.',
        explore: 'Révélez la collection',
        honeyDesc: 'Pur et naturel des montagnes',
        oilsDesc: 'Qualité traditionnelle et authentique',
      },
      story: {
        badge: 'Notre histoire',
        heading: 'Des montagnes de Beni Mellal jusqu\'à votre table',
        p1: 'Silea est née d\'un profond respect pour la terre et les traditions de Beni Mellal. Depuis des générations, nous produisons certains des meilleurs miels et huiles du monde, en utilisant des méthodes transmises de génération en génération.',
        p2: 'Nous sommes les producteurs directs. De nos propres arbres et ruches jusqu\'à votre table, nous gérons chaque étape avec soin, garantissant que chaque pot de miel et chaque bouteille d\'huile respecte les plus hauts standards de pureté et d\'authenticité.',
        p3: 'Le nom « Silea » incarne la pureté dans nos cœurs – et c\'est exactement ce que nous livrons : des produits purs, une tradition pure, des trésors purs venus des montagnes.',
        cta: 'En savoir plus sur nous',
        yearsOfTradition: 'Années de tradition',
      },
      testimonials: {
        label: 'Témoignages',
        title: 'Ce que disent les clients',
        description: 'Rejoignez des milliers de clients satisfaits dans le monde entier',
      },
      chooseSize: 'Choisir la taille',
      features: {
        title: 'Pourquoi choisir Silea',
        subtitle: 'Qualité authentique en laquelle vous pouvez avoir confiance',
        natural: {
          title: '100% Naturel',
          description: 'Produits purs sans additifs ni conservateurs',
        },
        traditional: {
          title: 'Meilleures techniques',
          description: 'Nous utilisons les meilleures techniques contemporaines sans céder aux habitudes dépassées',
        },
        premium: {
          title: 'Qualité premium',
          description: 'Sélection méticuleuse pour une expérience raffinée',
        },
        coldPressed: {
          title: 'Pressé à froid',
          description: 'Extractions fraîches qui conservent les nutriments essentiels',
        },
      },
      trust: {
        noPreservatives: 'Sans conservateurs',
        directSource: 'Source directe',
        fromBeniMellal: 'De Beni Mellal',
      },
    },
    cart: {
      title: 'Panier d\'achat',
      subtitle: 'Vérifiez vos articles avant la commande',
      empty: {
        title: 'Votre panier est vide',
        description: 'Découvrez nos produits marocains premium et ajoutez-les à votre panier.',
        startShopping: 'Commencer à magasiner',
      },
      orderSummary: 'Résumé de la commande',
      items: 'articles',
      item: 'article',
      removeItem: 'Retirer l\'article',
      updateQuantity: 'Modifier la quantité',
      proceedToCheckout: 'Passer à la commande',
      continueShopping: 'Continuer les achats',
      freeShippingMessage: 'Livraison gratuite pour les commandes de plus de 200 MAD',
      addMoreForFreeShipping: 'Ajoutez {amount} MAD de plus pour la livraison gratuite !',
      steps: {
        cart: 'Panier',
        details: 'Détails',
        payment: 'Paiement',
        done: 'Terminé',
      },
      shippingDetails: {
        title: 'Détails de livraison',
        subtitle: 'Où devons-nous livrer votre commande ?',
        personalInfo: 'Informations personnelles',
        fullName: 'Nom complet',
        phoneNumber: 'Numéro de téléphone',
        emailAddress: 'Adresse e-mail',
        emailHint: 'Nous enverrons la confirmation de commande et les mises à jour de suivi à cet e-mail',
        shippingAddress: 'Adresse de livraison',
        streetAddress: 'Adresse',
        city: 'Ville',
        cityTangier: 'Tanger',
        cityOther: 'Autre ville',
        shippingDependsOnCity: '20 MAD à Tanger • 35 MAD autres villes',
        additionalNotes: 'Notes supplémentaires',
        optional: 'Optionnel',
        notesPlaceholder: 'Des instructions spéciales pour la livraison ? (ex. : sonner à la porte, laisser à la porte...)',
      },
      payment: {
        title: 'Paiement',
        subtitle: 'Sélectionnez votre méthode de paiement préférée',
        method: 'Méthode de paiement',
        cashOnDelivery: 'Paiement à la livraison',
        cashOnDeliveryDesc: 'Payez lorsque vous recevez votre commande',
        recommended: 'Recommandé',
        bankTransfer: 'Virement bancaire',
        bankTransferDesc: 'Payer par virement bancaire',
        comingSoon: 'Bientôt disponible',
        orderReview: 'Révision de la commande',
        deliveryDetails: 'Détails de livraison',
        estimatedDelivery: 'Livraison estimée',
        days: '3-5 jours ouvrables',
        placeOrder: 'Passer la commande',
        processing: 'Traitement...',
        securityNote: 'Vos informations sont sécurisées et cryptées',
      },
      success: {
        thankYou: 'Merci !',
        orderPlaced: 'Votre commande a été passée avec succès',
        orderNumber: 'Numéro de commande',
        trackingCode: 'Code de suivi',
        totalToPay: 'Total payé',
        estimatedDelivery: 'Livraison estimée',
        saveTrackingCode: 'Enregistrez votre code de suivi :',
        trackingHint: 'Vous pouvez l\'utiliser à tout moment pour suivre le statut de votre commande',
        trackOrder: 'Suivre la commande',
        continueShopping: 'Continuer les achats',
        orderConfirmed: 'Commande confirmée !',
        order: 'Commande',
        tracking: 'Suivi',
        emailConfirmation: 'Nous enverrons les détails de la commande et les mises à jour de suivi à votre e-mail.',
        close: 'Fermer',
      },
      labels: {
        required: '*',
      },
      placeholders: {
        fullName: 'Entrez votre nom complet',
        phoneNumber: 'Entrez votre numéro de téléphone',
        emailAddress: 'Entrez votre adresse e-mail',
        streetAddress: 'Entrez votre adresse',
        city: 'Entrez votre ville',
        additionalNotes: 'Des instructions spéciales pour la livraison ? (ex. : sonner à la porte, laisser à la porte...)',
      },
    },
    product: {
      addedToCart: 'ajouté au panier',
      inCart: 'dans le panier',
      addToWishlist: 'Ajouter à la liste de souhaits',
      selectSize: 'Choisir la taille :',
      each: 'chacun',
      save: 'Économiser',
      savePercent: 'Économiser 15%',
      freeShipping: 'Livraison gratuite',
      securePayment: 'Paiement sécurisé',
      natural: '100% Naturel',
      aboutProduct: 'À propos de ce produit',
      healthBenefits: 'Avantages pour la santé',
      origin: 'Origine',
      ingredients: 'Ingrédients',
      pureNoAdditives: '100% Pur, sans additifs',
      youMightAlsoLike: 'Vous pourriez aussi aimer',
      hoverToZoom: 'Survolez pour zoomer',
      viewSizes: 'Voir les tailles et tarifs',
      startingFrom: 'À partir de',
      unavailable: 'Indisponible',
      unavailableStatus: 'Rupture de stock',
      rating: '5.0 (24 avis)',
      reviewsCount: '(24)',
      productNotFound: 'Produit introuvable',
      productNotFoundDesc: "Le produit que vous recherchez n'existe pas ou a été supprimé.",
      backToHome: "Retour à l'accueil",
      quantity: 'Quantité',
      description: 'Description',
      benefits: 'Avantages',
      reviews: 'Avis',
      categoryBreadcrumb: 'Accueil',
      relatedProducts: 'Produits associés',
    },
    about: {
      hero: {
        title: 'Notre histoire',
        subtitle: 'Apporter les trésors marocains authentiques à votre table',
      },
      story: {
        title: 'Des montagnes à votre foyer',
        p1: 'Silea est née d\'un profond amour pour les trésors naturels de Beni Mellal, une région nichée au cœur des montagnes de l\'Atlas au Maroc. Depuis des générations, nous récoltons le meilleur miel et pressons les huiles les plus pures en utilisant des méthodes traditionnelles transmises depuis des siècles.',
        p2: 'Nous sommes les producteurs. De nos propres arbres et ruches, nous gérons chaque étape du processus pour garantir que chaque produit conserve son caractère authentique et ses bienfaits naturels. Notre engagement est de vous apporter des produits qui ne sont pas seulement naturels, mais vraiment exceptionnels.',
        p3: 'Chaque pot de miel et chaque bouteille d\'huile raconte une histoire de tradition, de soin et de l\'environnement montagnard immaculé où il a été créé.',
        tagline: 'Le nom « Silea » incarne la pureté dans nos cœurs – et c\'est exactement ce que nous livrons : des produits purs, une tradition pure, des trésors purs venus des montagnes.',
      },
      values: {
        title: 'Nos valeurs',
        purity: {
          title: 'Pureté',
          description: 'Produits 100% naturels sans additifs, conservateurs ou ingrédients artificiels. Juste la nature pure.',
        },
        community: {
          title: 'Communauté',
          description: 'Nous sommes les producteurs directs. De nos arbres et ruches jusqu\'à votre table, nous gérons tout avec soin et tradition.',
        },
        heritage: {
          title: 'Héritage',
          description: 'Nous honorons des siècles de savoir traditionnel transmis de génération en génération par les familles de montagne.',
        },
      },
      features: {
        title: 'Ce qui nous différencie',
        mountainSourced: {
          title: 'Issu des montagnes',
          description: 'Nos produits proviennent des montagnes immaculées de l\'Atlas de Beni Mellal, où la nature reste intacte.',
        },
        handcrafted: {
          title: 'Fabriqué avec amour',
          description: 'Chaque pot et chaque bouteille sont soigneusement préparés en utilisant des méthodes traditionnelles qui préservent les qualités naturelles.',
        },
        premium: {
          title: 'Qualité premium',
          description: 'Nous vérifions la qualité à chaque étape, de la récolte à la mise en bouteille, garantissant les meilleurs produits.',
        },
        coldPressed: {
          title: 'Pressé à froid',
          description: 'Nos huiles sont pressées à froid en utilisant des moulins à pierre traditionnels pour préserver les nutriments et la saveur.',
        },
      },
    },
    contact: {
      title: 'Contactez-nous',
      subtitle: 'Des questions ? Nous sommes là pour vous aider ! Contactez-nous par e-mail ou WhatsApp.',
      whatsapp: 'Contactez-nous',
      faqTitle: 'Questions Fréquemment Posées',
      faqSubtitle: 'Réponses rapides aux questions courantes',
      faq: {
        shipping: {
          question: 'Combien coûte la livraison ?',
          answer: 'La livraison est entièrement GRATUITE pour toutes les commandes au Maroc ! Nous livrons à votre porte sans frais supplémentaires.',
        },
        delivery: {
          question: 'Combien de temps prend la livraison ?',
          answer: 'Nous livrons en 48 heures ou moins dans la plupart des villes du Maroc. La livraison express est disponible pour les commandes urgentes.',
        },
        payment: {
          question: 'Quels modes de paiement acceptez-vous ?',
          answer: 'Nous acceptons le paiement à la livraison (COD) pour votre commodité. Payez lorsque vous recevez votre commande.',
        },
        returns: {
          question: 'Quelle est votre politique de retour ?',
          answer: 'Nous offrons une politique de retour de 7 jours. Si vous n\'êtes pas satisfait, contactez-nous dans les 7 jours pour un remboursement ou un échange.',
        },
        tracking: {
          question: 'Comment puis-je suivre ma commande ?',
          answer: 'Après avoir passé votre commande, vous recevrez un code de suivi via WhatsApp. Utilisez-le sur notre page de suivi pour voir les mises à jour en temps réel.',
        },
      },
      form: {
        name: 'Nom complet',
        namePlaceholder: 'Entrez votre nom',
        email: 'Adresse e-mail',
        emailPlaceholder: 'votre.email@exemple.com',
        subject: 'Sujet',
        subjectPlaceholder: 'De quoi s\'agit-il ?',
        message: 'Message',
        messagePlaceholder: 'Dites-nous comment nous pouvons vous aider...',
        send: 'Envoyer le message',
        sending: 'Envoi...',
        success: 'Message envoyé avec succès !',
        successMessage: 'Nous vous répondrons dans les 24 heures.',
      },
      info: {
        title: 'Informations de contact',
        email: 'Email',
        phone: 'Téléphone',
        location: 'Emplacement',
        hours: 'Heures d\'ouverture',
        weekdays: 'Lundi - Vendredi : 9h00 - 18h00',
        weekend: 'Samedi : 10h00 - 16h00',
      },
    },
    footer: {
      cta: {
        title: 'Découvrez les Trésors Marocains Purs',
        description: 'Découvrez le miel et les huiles authentiques des montagnes de l\'Atlas de Beni Mellal',
        shopNow: 'Acheter maintenant',
        learnMore: 'En savoir plus',
      },
      shop: 'Boutique',
      allProducts: 'Tous les produits',
      giftSets: 'Coffrets cadeaux',
      newArrivals: 'Nouveautés',
      support: 'Support',
      trackOrder: 'Suivre la commande',
      shippingInfo: 'Informations de livraison',
      returns: 'Retours et remboursements',
      faq: 'FAQ',
      contact: 'Contact',
      location: 'Emplacement',
      copyright: '© 2025 Silea. Tous droits réservés. Trésors purs des montagnes de Beni Mellal.',
      brandDescription: 'Trésors purs des montagnes de Beni Mellal. Authentiques, traditionnels et façonnés avec soin depuis des générations.',
      privacy: 'Politique de confidentialité',
      terms: 'Conditions de service',
      cookies: 'Politique des cookies',
    },
    category: {
      filters: 'Filtres',
      sortBy: 'Trier par',
      price: 'Prix',
      availability: 'Disponibilité',
      inStock: 'En stock',
      outOfStock: 'Rupture de stock',
      all: 'Tout',
      lowToHigh: 'Prix : croissant',
      highToLow: 'Prix : décroissant',
      nameAZ: 'Nom : A-Z',
      nameZA: 'Nom : Z-A',
      clearFilters: 'Effacer les filtres',
      noProducts: 'Aucun produit trouvé',
      showing: 'Affichage de',
      of: 'sur',
      results: 'résultats',
      filtersAndSort: 'Filtres et tri',
      sortPlaceholder: 'Trier par',
      refine: 'Affinez votre recherche',
      productsLabel: 'Produits',
      naturalLabel: 'Naturel',
      ratingLabel: 'Évaluation',
      hundredPercent: '100%',
      fiveStars: '5★',
    },
    trackOrder: {
      title: 'Suivre votre commande',
      subtitle: 'Entrez votre numéro de commande ou votre code de suivi pour voir les mises à jour de livraison',
      badge: 'Suivi de commande',
      orderNumber: 'Numéro de commande',
      trackingCode: 'Code de suivi',
      searchPlaceholder: 'ex. : CMD001',
      searchPlaceholderTracking: 'ex. : SL-251205-XXXX',
      trackButton: 'Suivre la commande',
      searching: 'Recherche...',
      tryAgain: 'Réessayer',
      orderNotFound: 'Commande introuvable',
      orderNotFoundMessage: 'Veuillez vérifier votre numéro de commande ou votre code de suivi',
      cancelled: 'Annulée',
      cancelOrder: 'Annuler',
      cancelConfirm: 'Êtes-vous sûr de vouloir annuler cette commande ? Cette action ne peut pas être annulée.',
      cancelReason: 'Raison de l\'annulation (facultatif)',
      cancelPlaceholder: 'Dites-nous pourquoi vous annulez cette commande...',
      keepOrder: 'Conserver la commande',
      cancelling: 'Annulation...',
      status: {
        pending: 'En attente',
        pendingDesc: 'Votre commande a été reçue et attend confirmation',
        confirmed: 'Confirmée',
        confirmedDesc: 'Votre commande a été confirmée et est en préparation',
        processing: 'En traitement',
        processingDesc: 'Votre commande est soigneusement emballée',
        shipped: 'Expédiée',
        shippedDesc: 'Votre commande est en route vers vous',
        outForDelivery: 'En cours de livraison',
        outForDeliveryDesc: 'Votre commande est en cours de livraison aujourd\'hui',
        delivered: 'Livrée',
        deliveredDesc: 'Votre commande a été livrée avec succès',
        cancelled: 'Annulée',
        cancelledDesc: 'Cette commande a été annulée',
        refunded: 'Remboursée',
        refundedDesc: 'Cette commande a été remboursée',
      },
      orderDate: 'Date de commande',
      estDelivery: 'Livraison est.',
      total: 'Total',
      shippingAddress: 'Adresse de livraison',
      orderItems: 'Articles de la commande',
      each: 'chacun',
      trackingHistory: 'Historique de suivi',
      noTracking: 'Pas encore de mises à jour de suivi',
      checkBack: 'Revenez bientôt pour les mises à jour de livraison',
      needHelp: 'Besoin d\'aide ?',
      needHelpDesc: 'Notre équipe du service client est là pour vous aider',
      contactUs: 'Nous contacter',
      orderTip: 'Numéro de commande',
      orderTipDesc: 'Trouvez votre numéro de commande dans l\'e-mail de confirmation que nous vous avons envoyé (ex. : CMD001)',
      trackingTip: 'Code de suivi',
      trackingTipDesc: 'Utilisez votre code de suivi unique pour obtenir des mises à jour de livraison en temps réel (ex. : SL-251205-XXXX)',
    },
  },
  ar: {
    common: {
      home: 'الرئيسية',
      about: 'من نحن',
      contact: 'اتصل بنا',
      shop: 'اكتشف',
      cart: 'السلة',
      checkout: 'الدفع',
      continue: 'متابعة',
      back: 'رجوع',
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      add: 'إضافة',
      remove: 'إزالة',
      search: 'بحث',
      loading: 'جاري التحميل...',
      error: 'خطأ',
      success: 'نجح',
      close: 'إغلاق',
      next: 'التالي',
      previous: 'السابق',
      viewAll: 'عرض الكل',
      readMore: 'اقرأ المزيد',
      learnMore: 'اعرف المزيد',
      subscribe: 'اشترك',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      address: 'العنوان',
      name: 'الاسم',
      quantity: 'الكمية',
      price: 'السعر',
      total: 'المجموع',
      subtotal: 'المجموع الفرعي',
      shipping: 'الشحن',
      free: 'مجاني',
      secure: 'آمن',
      fastDelivery: 'توصيل سريع',
      addToCart: 'أضف إلى السلة',
      buyNow: 'اشتري الآن',
      inStock: 'متوفر',
      outOfStock: 'غير متوفر',
      selectSize: 'اختر الحجم',
      reviews: 'التقييمات',
      description: 'الوصف',
      benefits: 'الفوائد',
      share: 'مشاركة',
      category: 'الفئة',
      featured: 'مميز',
      new: 'جديد',
      sale: 'تخفيض',
    },
    header: {
      searchPlaceholder: 'ابحث عن المنتجات...',
      cart: 'السلة',
      account: 'الحساب',
      menu: 'القائمة',
      items: 'عناصر',
      item: 'عنصر',
      inCart: 'في سلة التسوق',
      emptyCart: 'سلة التسوق فارغة',
      viewCart: 'عرض السلة',
      checkout: 'الدفع',
      continueShopping: 'متابعة التسوق',
    },
    nav: {
      categories: {
        honey: 'العسل',
        oils: 'الزيوت',
      },
    },
    home: {
      hero: {
        title: 'كنوز نقية من بني ملال',
        subtitle: 'اكتشف العسل المغربي الأصيل والزيوت الجبلية، مستخرجة مباشرة من جبال الأطلس البكر.',
        cta: 'اختر طريقك',
        scrollDown: 'مرر لتكشف الحكايات الذهبية',
      },
      featured: {
        title: 'المنتجات المميزة',
        subtitle: 'اختيارات مميزة مختارة بعناية من مجموعتنا',
        viewAll: 'عرض جميع المنتجات',
      },
      categories: {
        title: 'مسارات الذوق',
        subtitle: 'دع همسات الأطلس تروي قصة كل موسم من منتجاتنا الذهبية',
        explore: 'غص في التشكيلة',
        honeyDesc: 'نقي وطبيعي من الجبال',
        oilsDesc: 'جودة تقليدية وأصيلة',
      },
      story: {
        badge: 'قصتنا',
        heading: 'من جبال بني ملال إلى مائدتك',
        p1: 'ولدت سيليا من احترام عميق للأرض وتقاليد بني ملال. على مدى أجيال، ننتج بعضًا من أجود أنواع العسل والزيوت في العالم، باستخدام طرق توارثوها عبر العصور.',
        p2: 'نحن المنتجون المباشرون. من أشجارنا وخلايانا إلى طاولتك، نتعامل مع كل خطوة بعناية، مما يضمن أن كل جرة عسل وكل زجاجة زيت تلبي أعلى معايير النقاء والأصالة.',
        p3: 'اسم "سيليا" يمثل النقاء في قلوبنا — وهذا تمامًا ما نقدمه. منتجات نقية، تقاليد نقية، كنوز نقية من الجبال.',
        cta: 'تعرف علينا أكثر',
        yearsOfTradition: 'سنوات من التقاليد',
      },
      testimonials: {
        label: 'الشهادات',
        title: 'رأي العملاء',
        description: 'انضموا إلى آلاف العملاء الراضين في جميع أنحاء العالم',
      },
      chooseSize: 'اختر الحجم',
      features: {
        title: 'لماذا تختار سيليا',
        subtitle: 'جودة أصيلة يمكنك الوثوق بها',
        natural: {
          title: '100% طبيعي',
          description: 'منتجات نقية بدون إضافات أو مواد حافظة',
        },
        traditional: {
          title: 'أفضل التقنيات',
          description: 'نستخدم أرقى التقنيات الحديثة دون اللجوء إلى الأساليب القديمة',
        },
        premium: {
          title: 'جودة ممتازة',
          description: 'اختيارات مدروسة لجودة أعلى',
        },
        coldPressed: {
          title: 'معصور على البارد',
          description: 'استخراج طازج يحافظ على العناصر الغذائية والنكهات',
        },
      },
      trust: {
        noPreservatives: 'بدون مواد حافظة',
        directSource: 'مصدر مباشر',
        fromBeniMellal: 'من بني ملال',
      },
    },
    cart: {
      title: 'سلة التسوق',
      subtitle: 'راجع عناصرك قبل الدفع',
      empty: {
        title: 'سلة التسوق فارغة',
        description: 'اكتشف منتجاتنا المغربية المميزة وأضفها إلى سلة التسوق.',
        startShopping: 'ابدأ التسوق',
      },
      orderSummary: 'ملخص الطلب',
      items: 'عناصر',
      item: 'عنصر',
      removeItem: 'إزالة العنصر',
      updateQuantity: 'تحديث الكمية',
      proceedToCheckout: 'المتابعة إلى الدفع',
      continueShopping: 'متابعة التسوق',
      freeShippingMessage: 'شحن مجاني للطلبات التي تزيد عن 200 درهم',
      addMoreForFreeShipping: 'أضف {amount} درهم أخرى للحصول على شحن مجاني!',
      steps: {
        cart: 'السلة',
        details: 'التفاصيل',
        payment: 'الدفع',
        done: 'تم',
      },
      shippingDetails: {
        title: 'تفاصيل الشحن',
        subtitle: 'أين يجب أن نوصّل طلبك؟',
        personalInfo: 'المعلومات الشخصية',
        fullName: 'الاسم الكامل',
        phoneNumber: 'رقم الهاتف',
        emailAddress: 'عنوان البريد الإلكتروني',
        emailHint: 'سنرسل تأكيد الطلب وتحديثات التتبع إلى هذا البريد الإلكتروني',
        shippingAddress: 'عنوان الشحن',
        streetAddress: 'العنوان',
        city: 'المدينة',
        cityTangier: 'طنجة',
        cityOther: 'مدينة أخرى',
        shippingDependsOnCity: '20 درهم في طنجة • 35 درهم مدن أخرى',
        additionalNotes: 'ملاحظات إضافية',
        optional: 'اختياري',
        notesPlaceholder: 'أي تعليمات خاصة للتوصيل؟ (مثل: رن الجرس، اترك عند الباب...)',
      },
      payment: {
        title: 'الدفع',
        subtitle: 'اختر طريقة الدفع المفضلة لديك',
        method: 'طريقة الدفع',
        cashOnDelivery: 'الدفع عند الاستلام',
        cashOnDeliveryDesc: 'ادفع عند استلام طلبك',
        recommended: 'موصى به',
        bankTransfer: 'تحويل بنكي',
        bankTransferDesc: 'الدفع عبر التحويل البنكي',
        comingSoon: 'قريباً',
        orderReview: 'مراجعة الطلب',
        deliveryDetails: 'تفاصيل التوصيل',
        estimatedDelivery: 'التوصيل المتوقع',
        days: '3-5 أيام عمل',
        placeOrder: 'تأكيد الطلب',
        processing: 'جاري المعالجة...',
        securityNote: 'معلوماتك آمنة ومشفرة',
      },
      success: {
        thankYou: 'شكراً لك!',
        orderPlaced: 'تم تقديم طلبك بنجاح',
        orderNumber: 'رقم الطلب',
        trackingCode: 'رمز التتبع',
        totalToPay: 'المبلغ المدفوع',
        estimatedDelivery: 'التوصيل المتوقع',
        saveTrackingCode: 'احفظ رمز التتبع الخاص بك:',
        trackingHint: 'يمكنك استخدامه في أي وقت لتتبع حالة طلبك',
        trackOrder: 'تتبع الطلب',
        continueShopping: 'متابعة التسوق',
        orderConfirmed: 'تم تأكيد الطلب!',
        order: 'الطلب',
        tracking: 'التتبع',
        emailConfirmation: 'سنرسل تفاصيل الطلب وتحديثات التتبع إلى بريدك الإلكتروني.',
        close: 'إغلاق',
      },
      labels: {
        required: '*',
      },
      placeholders: {
        fullName: 'أدخل اسمك الكامل',
        phoneNumber: '+212 6XX XXX XXX',
        emailAddress: 'بريدك@مثال.com',
        streetAddress: 'اسم الشارع، رقم المبنى، الشقة...',
        city: 'مثال: الدار البيضاء، الرباط، مراكش...',
        additionalNotes: 'أي تعليمات خاصة للتوصيل؟ (مثل: رن الجرس، اترك عند الباب...)',
      },
    },
    product: {
      addedToCart: 'تمت الإضافة إلى السلة',
      inCart: 'في السلة',
      addToWishlist: 'أضف إلى قائمة الرغبات',
      selectSize: 'اختر الحجم:',
      each: 'لكل',
      save: 'وفر',
      savePercent: 'وفر 15%',
      freeShipping: 'شحن مجاني',
      securePayment: 'دفع آمن',
      natural: '100% طبيعي',
      aboutProduct: 'حول هذا المنتج',
      healthBenefits: 'الفوائد الصحية',
      origin: 'اصلي',
      ingredients: 'المكونات',
      pureNoAdditives: '100% نقي، بدون إضافات',
      youMightAlsoLike: 'قد يعجبك أيضاً',
      hoverToZoom: 'مرر للتكبير',
      viewSizes: 'اطّلع على الأحجام والأسعار',
      startingFrom: 'ابتداءً من',
      unavailable: 'غير متوفر',
      unavailableStatus: 'غير متوفر',
      rating: '5.0 (24 تقييم)',
      reviewsCount: '(24)',
      productNotFound: 'المنتج غير موجود',
      productNotFoundDesc: 'المنتج الذي تبحث عنه غير موجود أو تم حذفه.',
      backToHome: 'العودة للرئيسية',
      quantity: 'الكمية',
      description: 'الوصف',
      benefits: 'الفوائد',
      reviews: 'التقييمات',
      categoryBreadcrumb: 'الرئيسية',
      relatedProducts: 'منتجات ذات صلة',
    },
    about: {
      hero: {
        title: 'قصتنا',
        subtitle: 'جلب الكنوز المغربية الأصيلة إلى مائدتك',
      },
      story: {
        title: 'من الجبال إلى منزلك',
        p1: 'وُلدت سيليا من حب عميق لكنوز بني ملال الطبيعية، وهي منطقة تقع في قلب جبال الأطلس المغربية. لقرون، نحصد أفضل العسل ونضغط أنقى الزيوت باستخدام طرق تقليدية تم تناقلها عبر الأجيال.',
        p2: 'نحن المنتجون. من أشجارنا وخلايانا، ندير كل خطوة من العملية لضمان أن كل منتج يحافظ على طابعه الأصيل وفوائده الطبيعية. التزامنا هو جلب منتجات ليست طبيعية فحسب، بل استثنائية حقاً.',
        p3: 'كل برطمان عسل وكل زجاجة زيت تحكي قصة من التقاليد والرعاية والبيئة الجبلية البكر حيث تم إنشاؤها.',
        tagline: 'اسم "سيليا" يمثل النقاء في قلوبنا – وهذا تماماً ما نقدمه: منتجات نقية، تقاليد نقية، كنوز نقية من الجبال.',
      },
      values: {
        title: 'قيمنا',
        purity: {
          title: 'النقاء',
          description: 'منتجات 100% طبيعية بدون إضافات أو مواد حافظة أو مكونات اصطناعية. فقط الطبيعة النقية.',
        },
        community: {
          title: 'المجتمع',
          description: 'نحن المنتجون المباشرون. من أشجارنا وخلايا النحل إلى طاولتك، نتعامل مع كل شيء بعناية وتقليد.',
        },
        heritage: {
          title: 'التراث',
          description: 'نكرم قروناً من المعرفة التقليدية التي تم تناقلها عبر أجيال من العائلات الجبلية.',
        },
      },
      features: {
        title: 'ما يميزنا',
        mountainSourced: {
          title: 'من الجبال',
          description: 'منتجاتنا تأتي من جبال الأطلس البكر في بني ملال، حيث تبقى الطبيعة سليمة.',
        },
        handcrafted: {
          title: 'مصنوع بحب',
          description: 'كل برطمان وكل زجاجة يتم إعدادهما بعناية باستخدام طرق تقليدية تحافظ على الصفات الطبيعية.',
        },
        premium: {
          title: 'جودة ممتازة',
          description: 'نتحقق من الجودة في كل مرحلة، من الحصاد إلى التعبئة، مما يضمن أفضل المنتجات.',
        },
        coldPressed: {
          title: 'معصور على البارد',
          description: 'زيوتنا معصورة على البارد باستخدام مطاحن حجرية تقليدية للحفاظ على العناصر الغذائية والنكهة.',
        },
      },
    },
    contact: {
      title: 'تواصل معنا',
      subtitle: 'لديك أسئلة؟ نحن هنا للمساعدة! تواصل معنا عبر البريد الإلكتروني أو واتساب.',
      whatsapp: 'تواصل معنا',
      faqTitle: 'الأسئلة الشائعة',
      faqSubtitle: 'إجابات سريعة للأسئلة الشائعة',
      faq: {
        shipping: {
          question: 'كم تكلفة الشحن؟',
          answer: 'الشحن مجاني تمامًا لجميع الطلبات في جميع أنحاء المغرب! نقوم بالتوصيل إلى بابك دون أي تكلفة إضافية.',
        },
        delivery: {
          question: 'كم يستغرق التوصيل؟',
          answer: 'نقوم بالتوصيل في غضون 48 ساعة أو أقل إلى معظم المدن في المغرب. التوصيل السريع متاح للطلبات العاجلة.',
        },
        payment: {
          question: 'ما هي طرق الدفع المقبولة؟',
          answer: 'نقبل الدفع عند التسليم لراحتك. ادفع عندما تستلم طلبك عند بابك.',
        },
        returns: {
          question: 'ما هي سياسة الإرجاع؟',
          answer: 'نقدم سياسة إرجاع لمدة 7 أيام. إذا لم تكن راضيًا عن طلبك، اتصل بنا في غضون 7 أيام للحصول على استرداد كامل أو استبدال.',
        },
        tracking: {
          question: 'كيف يمكنني تتبع طلبي؟',
          answer: 'بعد تقديم طلبك، ستتلقى رمز تتبع عبر واتساب. استخدمه في صفحة تتبع الطلب لرؤية التحديثات في الوقت الفعلي.',
        },
      },
      form: {
        name: 'الاسم الكامل',
        namePlaceholder: 'أدخل اسمك',
        email: 'عنوان البريد الإلكتروني',
        emailPlaceholder: 'بريدك@مثال.com',
        subject: 'الموضوع',
        subjectPlaceholder: 'بم يتعلق هذا؟',
        message: 'الرسالة',
        messagePlaceholder: 'أخبرنا كيف يمكننا المساعدة...',
        send: 'إرسال الرسالة',
        sending: 'جاري الإرسال...',
        success: 'تم إرسال الرسالة بنجاح!',
        successMessage: 'سنرد عليك خلال 24 ساعة.',
      },
      info: {
        title: 'معلومات الاتصال',
        email: 'البريد الإلكتروني',
        phone: 'الهاتف',
        location: 'الموقع',
        hours: 'ساعات العمل',
        weekdays: 'الاثنين - الجمعة: 9:00 صباحاً - 6:00 مساءً',
        weekend: 'السبت: 10:00 صباحاً - 4:00 مساءً',
      },
    },
    footer: {
      cta: {
        title: 'اكتشف كنوز المغرب النقية',
        description: 'اكتشف العسل والزيوت الأصيلة من جبال الأطلس في بني ملال',
        shopNow: 'تسوق الآن',
        learnMore: 'اعرف المزيد',
      },
      shop: 'المتجر',
      allProducts: 'جميع المنتجات',
      giftSets: 'مجموعات الهدايا',
      newArrivals: 'الوافدات الجديدة',
      support: 'الدعم',
      trackOrder: 'تتبع الطلب',
      shippingInfo: 'معلومات الشحن',
      returns: 'الإرجاع والاسترداد',
      faq: 'الأسئلة الشائعة',
      contact: 'اتصل بنا',
      location: 'الموقع',
      copyright: '© 2025 سيليا. جميع الحقوق محفوظة. كنوز نقية من جبال بني ملال.',
      brandDescription: 'كنوز نقية من جبال بني ملال. أصيلة، تقليدية، ومصممة بعناية لأجيال كاملة.',
      privacy: 'سياسة الخصوصية',
      terms: 'شروط الخدمة',
      cookies: 'سياسة ملفات تعريف الارتباط',
    },
    category: {
      filters: 'الفلاتر',
      sortBy: 'ترتيب حسب',
      price: 'السعر',
      availability: 'التوفر',
      inStock: 'متوفر',
      outOfStock: 'غير متوفر',
      all: 'الكل',
      lowToHigh: 'السعر: من الأقل إلى الأعلى',
      highToLow: 'السعر: من الأعلى إلى الأقل',
      nameAZ: 'الاسم: أ-ي',
      nameZA: 'الاسم: ي-أ',
      clearFilters: 'مسح الفلاتر',
      noProducts: 'لم يتم العثور على منتجات',
      showing: 'عرض',
      of: 'من',
      results: 'نتائج',
      filtersAndSort: 'مرشحات و ترتيب',
      sortPlaceholder: 'رتب حسب',
      refine: 'نقح بحثك',
      productsLabel: 'المنتجات',
      naturalLabel: 'طبيعي',
      ratingLabel: 'التقييم',
      hundredPercent: '100%',
      fiveStars: '5★',
    },
    trackOrder: {
      title: 'تتبع طلبك',
      subtitle: 'أدخل رقم الطلب أو رمز التتبع لرؤية تحديثات التوصيل',
      badge: 'تتبع الطلب',
      orderNumber: 'رقم الطلب',
      trackingCode: 'رمز التتبع',
      searchPlaceholder: 'مثال: CMD001',
      searchPlaceholderTracking: 'مثال: SL-251205-XXXX',
      trackButton: 'تتبع الطلب',
      searching: 'جاري البحث...',
      tryAgain: 'حاول مرة أخرى',
      orderNotFound: 'الطلب غير موجود',
      orderNotFoundMessage: 'يرجى التحقق من رقم الطلب أو رمز التتبع',
      cancelled: 'ملغى',
      cancelOrder: 'إلغاء',
      cancelConfirm: 'هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.',
      cancelReason: 'سبب الإلغاء (اختياري)',
      cancelPlaceholder: 'أخبرنا لماذا تقوم بإلغاء هذا الطلب...',
      keepOrder: 'الاحتفاظ بالطلب',
      cancelling: 'جاري الإلغاء...',
      status: {
        pending: 'قيد الانتظار',
        pendingDesc: 'تم استلام طلبك وهو في انتظار التأكيد',
        confirmed: 'تم التأكيد',
        confirmedDesc: 'تم تأكيد طلبك وهو قيد الإعداد',
        processing: 'قيد المعالجة',
        processingDesc: 'يتم تغليف طلبك بعناية',
        shipped: 'تم الشحن',
        shippedDesc: 'طلبك في طريقه إليك',
        outForDelivery: 'خارج للتوصيل',
        outForDeliveryDesc: 'طلبك خارج للتوصيل اليوم',
        delivered: 'تم التسليم',
        deliveredDesc: 'تم تسليم طلبك بنجاح',
        cancelled: 'ملغى',
        cancelledDesc: 'تم إلغاء هذا الطلب',
        refunded: 'مسترد',
        refundedDesc: 'تم استرداد هذا الطلب',
      },
      orderDate: 'تاريخ الطلب',
      estDelivery: 'التوصيل المتوقع',
      total: 'الإجمالي',
      shippingAddress: 'عنوان الشحن',
      orderItems: 'عناصر الطلب',
      each: 'لكل منتج',
      trackingHistory: 'سجل التتبع',
      noTracking: 'لا توجد تحديثات تتبع بعد',
      checkBack: 'تحقق مرة أخرى قريبًا للحصول على تحديثات التوصيل',
      needHelp: 'تحتاج مساعدة؟',
      needHelpDesc: 'فريق خدمة العملاء لدينا هنا لمساعدتك',
      contactUs: 'اتصل بنا',
      orderTip: 'رقم الطلب',
      orderTipDesc: 'ابحث عن رقم طلبك في البريد الإلكتروني للتأكيد الذي أرسلناه لك (مثال: CMD001)',
      trackingTip: 'رمز التتبع',
      trackingTipDesc: 'استخدم رمز التتبع الفريد الخاص بك للحصول على تحديثات التوصيل في الوقت الفعلي (مثال: SL-251205-XXXX)',
    },
  },
}

