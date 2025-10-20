/**
 * Subscription Module OpenAPI/Swagger Documentation
 * Complete API specification for subscription endpoints
 */

export const subscriptionSwaggerDocs = {
  // ===== COMPONENTS =====
  components: {
    schemas: {
      // Enums
      SubscriptionTier: {
        type: 'string',
        enum: ['FREE', 'BASIC', 'PREMIUM'],
        description: 'Subscription tier levels',
      },
      BillingCycle: {
        type: 'string',
        enum: ['MONTHLY', 'YEARLY'],
        description: 'Billing cycle frequency',
      },
      SubscriptionStatus: {
        type: 'string',
        enum: ['ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED', 'EXPIRED', 'PAUSED', 'INCOMPLETE'],
        description: 'Current status of subscription',
      },
      FeatureCode: {
        type: 'string',
        enum: [
          // Core Events
          'BROWSE_EVENTS', 'JOIN_EVENTS', 'CREATE_EVENTS', 'EDIT_OWN_EVENTS', 'DELETE_OWN_EVENTS',
          // Event Management
          'EVENT_PHOTO_UPLOAD', 'EVENT_PHOTO_UPLOAD_MULTIPLE', 'EVENT_QR_CHECKIN', 'EVENT_ANALYTICS',
          // Calendar
          'HOSTING_CALENDAR', 'CALENDAR_EXPORT',
          // Community Features
          'CREATE_COMMUNITIES', 'JOIN_COMMUNITIES', 'COMMUNITY_MANAGEMENT', 'COMMUNITY_ANALYTICS',
          // Card Game
          'CARDGAME_VIEW', 'CARDGAME_UNLOCK_OWN', 'CARDGAME_UNLOCK_MULTIPLE', 'CARDGAME_CUSTOMIZE',
          // Social Features
          'GIVE_VOUCH', 'VOUCH_MULTIPLE', 'VIEW_PROFILES', 'ADVANCED_SEARCH', 'SAVED_SEARCHES',
          // Messaging
          'DIRECT_MESSAGING', 'GROUP_MESSAGING', 'PRIORITY_MESSAGING',
          // Discovery
          'CITY_SEARCH', 'ADVANCED_FILTERS', 'RECOMMENDATIONS',
          // Analytics
          'BASIC_ANALYTICS', 'ADVANCED_ANALYTICS', 'EXPORT_DATA',
          // Admin
          'VERIFY_USERS', 'MODERATE_CONTENT',
        ],
        description: 'Feature access codes',
      },
      TrustLevel: {
        type: 'string',
        enum: ['starter', 'trusted', 'scout', 'leader'],
        description: 'User trust level tier',
      },
      PaymentGateway: {
        type: 'string',
        enum: ['XENDIT', 'STRIPE'],
        description: 'Payment provider',
      },

      // Core Objects
      TierFeatures: {
        type: 'object',
        properties: {
          maxEventsPerMonth: { type: 'number', example: 3 },
          maxEventPhotos: { type: 'number', example: 1 },
          maxCommunitiesOwned: { type: 'number', example: 0 },
          maxCommunitiesJoined: { type: 'number', example: 5 },
          maxVouchesPerMonth: { type: 'number', example: 2 },
          maxDirectMessages: { type: 'number', example: 10 },
          maxGroupChats: { type: 'number', example: 2 },
          maxSavedSearches: { type: 'number', example: 3 },
          cardGameUnlocksPerMonth: { type: 'number', example: 1 },
          prioritySupport: { type: 'boolean', example: false },
          customBranding: { type: 'boolean', example: false },
          advancedAnalytics: { type: 'boolean', example: false },
          dataExport: { type: 'boolean', example: false },
        },
      },

      SubscriptionTierModel: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          tierCode: { $ref: '#/components/schemas/SubscriptionTier' },
          name: { type: 'string', example: 'Basic Plan' },
          description: { type: 'string', example: 'Perfect for casual users' },
          price: { type: 'number', example: 30 },
          currency: { type: 'string', example: 'MYR' },
          billingCycle: { $ref: '#/components/schemas/BillingCycle' },
          features: { $ref: '#/components/schemas/TierFeatures' },
          enabledFeatures: {
            type: 'array',
            items: { $ref: '#/components/schemas/FeatureCode' },
          },
          isActive: { type: 'boolean', example: true },
          displayOrder: { type: 'number', example: 2 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },

      UserSubscription: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          tierCode: { $ref: '#/components/schemas/SubscriptionTier' },
          status: { $ref: '#/components/schemas/SubscriptionStatus' },
          billingCycle: { $ref: '#/components/schemas/BillingCycle' },
          currentPeriodStart: { type: 'string', format: 'date-time' },
          currentPeriodEnd: { type: 'string', format: 'date-time' },
          canceledAt: { type: 'string', format: 'date-time', nullable: true },
          tier: { $ref: '#/components/schemas/SubscriptionTierModel' },
        },
      },

      FeatureAccess: {
        type: 'object',
        properties: {
          feature: { $ref: '#/components/schemas/FeatureCode' },
          hasAccess: { type: 'boolean' },
          reason: { type: 'string', example: 'Subscription tier grants access' },
          subscriptionRequired: { $ref: '#/components/schemas/SubscriptionTier' },
          trustRequired: { $ref: '#/components/schemas/TrustLevel' },
          trustScore: { type: 'number', example: 35 },
        },
      },

      AccessSummary: {
        type: 'object',
        properties: {
          subscription: { $ref: '#/components/schemas/UserSubscription' },
          trustLevel: { $ref: '#/components/schemas/TrustLevel' },
          trustScore: { type: 'number', example: 35 },
          accessibleFeatures: {
            type: 'array',
            items: { $ref: '#/components/schemas/FeatureCode' },
          },
          featureDetails: {
            type: 'array',
            items: { $ref: '#/components/schemas/FeatureAccess' },
          },
        },
      },

      PaymentIntent: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          amount: { type: 'number', example: 30 },
          currency: { type: 'string', example: 'MYR' },
          status: { type: 'string', enum: ['pending', 'succeeded', 'failed', 'canceled'] },
          gatewayId: { type: 'string' },
          gateway: { $ref: '#/components/schemas/PaymentGateway' },
          metadata: {
            type: 'object',
            properties: {
              checkoutUrl: { type: 'string', format: 'uri' },
            },
          },
        },
      },
    },
  },

  // ===== PATHS =====
  paths: {
    '/api/subscriptions/tiers': {
      get: {
        tags: ['Subscriptions'],
        summary: 'Get all subscription tiers',
        description: 'Retrieve all available subscription tier options with pricing and features',
        responses: {
          200: {
            description: 'Subscription tiers retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/SubscriptionTierModel' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/api/subscriptions/tiers/{tierCode}': {
      get: {
        tags: ['Subscriptions'],
        summary: 'Get specific tier details',
        description: 'Retrieve detailed information about a specific subscription tier',
        parameters: [
          {
            name: 'tierCode',
            in: 'path',
            required: true,
            schema: { $ref: '#/components/schemas/SubscriptionTier' },
          },
        ],
        responses: {
          200: {
            description: 'Tier details retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/SubscriptionTierModel' },
                  },
                },
              },
            },
          },
          404: {
            description: 'Tier not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    error: { type: 'string', example: 'Tier not found' },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/api/subscriptions/my': {
      get: {
        tags: ['Subscriptions'],
        summary: 'Get my subscription',
        description: 'Get current user\'s active subscription details',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Subscription retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/UserSubscription' },
                  },
                },
              },
            },
          },
          401: {
            description: 'Authentication required',
          },
        },
      },
    },

    '/api/subscriptions/subscribe': {
      post: {
        tags: ['Subscriptions'],
        summary: 'Subscribe to a tier',
        description: 'Create new subscription (FREE tier is instant, paid tiers return payment intent)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['tierCode'],
                properties: {
                  tierCode: { $ref: '#/components/schemas/SubscriptionTier' },
                  billingCycle: { $ref: '#/components/schemas/BillingCycle' },
                  paymentGateway: { $ref: '#/components/schemas/PaymentGateway', description: 'Required for paid tiers' },
                },
                example: {
                  tierCode: 'BASIC',
                  billingCycle: 'MONTHLY',
                  paymentGateway: 'XENDIT',
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Subscription created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        subscription: { $ref: '#/components/schemas/UserSubscription' },
                        payment: { $ref: '#/components/schemas/PaymentIntent' },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid request',
          },
          401: {
            description: 'Authentication required',
          },
        },
      },
    },

    '/api/subscriptions/upgrade': {
      put: {
        tags: ['Subscriptions'],
        summary: 'Upgrade subscription',
        description: 'Upgrade to a higher tier with prorated billing',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['newTierCode'],
                properties: {
                  newTierCode: { $ref: '#/components/schemas/SubscriptionTier' },
                  paymentGateway: { $ref: '#/components/schemas/PaymentGateway' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Subscription upgraded successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        subscription: { $ref: '#/components/schemas/UserSubscription' },
                        payment: { $ref: '#/components/schemas/PaymentIntent' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/api/subscriptions/cancel': {
      post: {
        tags: ['Subscriptions'],
        summary: 'Cancel subscription',
        description: 'Cancel active subscription (access remains until end of billing period)',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Subscription canceled successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/UserSubscription' },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/api/subscriptions/access/check': {
      post: {
        tags: ['Subscriptions - Access Control'],
        summary: 'Check feature access',
        description: 'Check if user has access to specific feature (dual-gating: subscription + trust)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['feature'],
                properties: {
                  feature: { $ref: '#/components/schemas/FeatureCode' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Feature access checked',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/FeatureAccess' },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/api/subscriptions/access/summary': {
      get: {
        tags: ['Subscriptions - Access Control'],
        summary: 'Get access summary',
        description: 'Get complete overview of user\'s subscription, trust level, and accessible features',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Access summary retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/AccessSummary' },
                  },
                },
              },
            },
          },
        },
      },
    },

    '/api/subscriptions/usage/{feature}': {
      get: {
        tags: ['Subscriptions - Access Control'],
        summary: 'Get feature usage stats',
        description: 'Check current usage against feature limits (e.g., events created this month)',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'feature',
            in: 'path',
            required: true,
            schema: { $ref: '#/components/schemas/FeatureCode' },
          },
        ],
        responses: {
          200: {
            description: 'Usage stats retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        feature: { $ref: '#/components/schemas/FeatureCode' },
                        currentUsage: { type: 'number', example: 2 },
                        limit: { type: 'number', example: 3 },
                        remaining: { type: 'number', example: 1 },
                        resetDate: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ===== ADMIN ENDPOINTS =====
    '/api/admin/subscriptions/tiers': {
      get: {
        tags: ['Admin - Subscriptions'],
        summary: '[ADMIN] Get all tiers',
        description: 'Get all subscription tiers including inactive ones',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Tiers retrieved',
          },
        },
      },
      post: {
        tags: ['Admin - Subscriptions'],
        summary: '[ADMIN] Create tier',
        description: 'Create new subscription tier',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['tierCode', 'name', 'price'],
                properties: {
                  tierCode: { $ref: '#/components/schemas/SubscriptionTier' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  price: { type: 'number' },
                  currency: { type: 'string', default: 'MYR' },
                  billingCycle: { $ref: '#/components/schemas/BillingCycle' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Tier created',
          },
        },
      },
    },

    '/api/admin/subscriptions/tiers/{tierCode}': {
      put: {
        tags: ['Admin - Subscriptions'],
        summary: '[ADMIN] Update tier',
        description: 'Update tier name, description, visibility',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'tierCode',
            in: 'path',
            required: true,
            schema: { $ref: '#/components/schemas/SubscriptionTier' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  isActive: { type: 'boolean' },
                  displayOrder: { type: 'number' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Tier updated',
          },
        },
      },
    },

    '/api/admin/subscriptions/tiers/{tierCode}/pricing': {
      put: {
        tags: ['Admin - Subscriptions'],
        summary: '[ADMIN] Update tier pricing',
        description: 'Change tier price (affects new subscriptions only)',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'tierCode',
            in: 'path',
            required: true,
            schema: { $ref: '#/components/schemas/SubscriptionTier' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['price'],
                properties: {
                  price: { type: 'number' },
                  currency: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Pricing updated',
          },
        },
      },
    },

    '/api/admin/subscriptions/tiers/{tierCode}/features': {
      put: {
        tags: ['Admin - Subscriptions'],
        summary: '[ADMIN] Update tier features',
        description: 'Modify feature limits and capabilities for a tier',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'tierCode',
            in: 'path',
            required: true,
            schema: { $ref: '#/components/schemas/SubscriptionTier' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  features: { $ref: '#/components/schemas/TierFeatures' },
                  enabledFeatures: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/FeatureCode' },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Features updated',
          },
        },
      },
    },

    // ===== WEBHOOK ENDPOINTS =====
    '/api/webhooks/payment/xendit': {
      post: {
        tags: ['Webhooks'],
        summary: 'Xendit payment webhook',
        description: 'Receives payment notifications from Xendit',
        parameters: [
          {
            name: 'x-callback-token',
            in: 'header',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                description: 'Xendit webhook payload',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Webhook processed',
          },
          401: {
            description: 'Invalid webhook signature',
          },
        },
      },
    },

    '/api/webhooks/payment/stripe': {
      post: {
        tags: ['Webhooks'],
        summary: 'Stripe payment webhook',
        description: 'Receives payment notifications from Stripe',
        parameters: [
          {
            name: 'stripe-signature',
            in: 'header',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                description: 'Stripe webhook event',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Webhook processed',
          },
          400: {
            description: 'Invalid webhook signature',
          },
        },
      },
    },
  },
};
