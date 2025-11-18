import prisma from '../../config/database';
import { Prisma } from '@prisma/client';

interface PaymentFilters {
  search?: string;
  transactionType?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
}

interface PaymentListParams {
  page: number;
  limit: number;
  filters: PaymentFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class AdminPaymentsService {
  /**
   * Get payment statistics for dashboard cards
   */
  async getPaymentStatistics(startDate?: Date, endDate?: Date) {
    const dateFilter: Prisma.PaymentTransactionWhereInput = {};
    
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = startDate;
      if (endDate) dateFilter.createdAt.lte = endDate;
    }

    // Current period stats
    const [currentStats, pendingCount, failedCount] = await Promise.all([
      prisma.paymentTransaction.aggregate({
        where: {
          ...dateFilter,
          status: { in: ['SUCCEEDED'] },
        },
        _sum: {
          amount: true,
          totalFees: true,
          netAmount: true,
        },
        _count: true,
      }),
      prisma.paymentTransaction.count({
        where: {
          ...dateFilter,
          status: { in: ['PENDING', 'PROCESSING'] },
        },
      }),
      prisma.paymentTransaction.count({
        where: {
          ...dateFilter,
          status: { in: ['FAILED', 'CANCELED'] },
        },
      }),
    ]);

    // Previous period stats for comparison (same duration before start date)
    let percentageChanges = {
      revenue: 0,
      fees: 0,
      netAmount: 0,
    };

    if (startDate && endDate) {
      const duration = endDate.getTime() - startDate.getTime();
      const prevStartDate = new Date(startDate.getTime() - duration);
      const prevEndDate = new Date(startDate);

      const prevStats = await prisma.paymentTransaction.aggregate({
        where: {
          createdAt: { gte: prevStartDate, lte: prevEndDate },
          status: { in: ['SUCCEEDED'] },
        },
        _sum: {
          amount: true,
          totalFees: true,
          netAmount: true,
        },
      });

      if (prevStats._sum.amount) {
        percentageChanges.revenue =
          ((currentStats._sum.amount || 0) - prevStats._sum.amount) / prevStats._sum.amount * 100;
      }
      if (prevStats._sum.totalFees) {
        percentageChanges.fees =
          ((currentStats._sum.totalFees || 0) - prevStats._sum.totalFees) / prevStats._sum.totalFees * 100;
      }
      if (prevStats._sum.netAmount) {
        percentageChanges.netAmount =
          ((currentStats._sum.netAmount || 0) - prevStats._sum.netAmount) / prevStats._sum.netAmount * 100;
      }
    }

    return {
      totalRevenue: currentStats._sum.amount || 0,
      totalFees: currentStats._sum.totalFees || 0,
      netAmount: currentStats._sum.netAmount || 0,
      totalTransactions: currentStats._count,
      pending: {
        count: pendingCount,
        status: 'Awaiting processing',
      },
      failed: {
        count: failedCount,
        status: 'Needs attention',
      },
      percentageChanges,
    };
  }

  /**
   * Get paginated list of all payment transactions with filters
   */
  async getPaymentTransactions(params: PaymentListParams) {
    const { page, limit, filters, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.PaymentTransactionWhereInput = {};

    // Search filter (transaction ID, user name/email, reference)
    if (filters.search) {
      where.OR = [
        { id: { contains: filters.search, mode: 'insensitive' } },
        { gatewayTransactionId: { contains: filters.search, mode: 'insensitive' } },
        { transactionId: { contains: filters.search, mode: 'insensitive' } },
        { user: { 
          OR: [
            { fullName: { contains: filters.search, mode: 'insensitive' } },
            { email: { contains: filters.search, mode: 'insensitive' } },
          ]
        }},
      ];
    }

    // Transaction type filter
    if (filters.transactionType) {
      where.transactionType = filters.transactionType as any;
    }

    // Status filter
    if (filters.status) {
      where.status = filters.status as any;
    }

    // Date range filter
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    // Payment method filter
    if (filters.paymentMethod) {
      where.paymentMethod = filters.paymentMethod;
    }

    // Fetch transactions with relations
    const [total, transactions] = await Promise.all([
      prisma.paymentTransaction.count({ where }),
      prisma.paymentTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              username: true,
            },
          },
          provider: {
            select: {
              id: true,
              providerName: true,
              providerType: true,
            },
          },
          eventTickets: {
            select: {
              id: true,
              events: {
                select: {
                  id: true,
                  title: true,
                  date: true,
                },
              },
            },
          },
          subscriptionPayments: {
            select: {
              id: true,
              subscriptions: {
                select: {
                  id: true,
                  tiers: {
                    select: {
                      tierName: true,
                    },
                  },
                },
              },
            },
          },
          marketplace_orders: {
            select: {
              id: true,
              marketplaceListings: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      }),
    ]);

    // Transform transactions to include related entity info
    const formattedTransactions = transactions.map((txn) => {
      let relatedTo: any = null;
      let recipient: any = null;

      // Determine related entity based on transaction type
      if (txn.transactionType === 'EVENT_TICKET' && txn.eventTickets.length > 0) {
        const ticket = txn.eventTickets[0];
        relatedTo = {
          type: 'Event',
          id: ticket.events.id,
          title: ticket.events.title,
          date: ticket.events.date,
        };
        recipient = {
          name: txn.user.fullName,
          type: 'host',
        };
      } else if (txn.transactionType === 'SUBSCRIPTION' && txn.subscriptionPayments.length > 0) {
        const subPayment = txn.subscriptionPayments[0];
        relatedTo = {
          type: 'Subscription',
          id: subPayment.subscriptions.id,
          title: subPayment.subscriptions.tiers.tierName,
        };
        recipient = {
          name: 'Berse Platform',
          type: 'host',
        };
      } else if (txn.transactionType === 'MARKETPLACE_ORDER' && txn.marketplace_orders.length > 0) {
        const order = txn.marketplace_orders[0];
        relatedTo = {
          type: 'Marketplace Order',
          id: order.marketplaceListings.id,
          title: order.marketplaceListings.title,
        };
      }

      return {
        id: txn.id,
        transactionId: txn.gatewayTransactionId || txn.transactionId || txn.id,
        type: txn.transactionType,
        status: txn.status,
        payer: {
          id: txn.user.id,
          name: txn.user.fullName,
          email: txn.user.email,
        },
        recipient,
        relatedTo,
        amount: txn.amount,
        currency: txn.currency,
        fees: txn.totalFees,
        net: txn.netAmount,
        paymentMethod: txn.paymentMethod,
        provider: txn.provider.providerName,
        date: txn.createdAt,
        paidAt: txn.paidAt,
        processedAt: txn.processedAt,
        failureReason: txn.failureReason,
        metadata: txn.metadata,
      };
    });

    return {
      transactions: formattedTransactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single transaction details
   */
  async getTransactionDetails(transactionId: string) {
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            username: true,
            profile: {
              select: {
                profilePicture: true,
              },
            },
          },
        },
        provider: true,
        eventTickets: {
          include: {
            events: {
              select: {
                id: true,
                title: true,
                date: true,
                location: true,
                user: {
                  select: {
                    fullName: true,
                    email: true,
                  },
                },
              },
            },
            tier: true,
          },
        },
        subscriptionPayments: {
          include: {
            subscriptions: {
              include: {
                tiers: true,
              },
            },
          },
        },
        marketplace_orders: {
          include: {
            marketplaceListings: {
              include: {
                user: {
                  select: {
                    fullName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        fees: true,
        payoutDistributions: true,
      },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    return transaction;
  }

  /**
   * Get payment method usage statistics
   */
  async getPaymentMethodStats(startDate?: Date, endDate?: Date) {
    const dateFilter: Prisma.PaymentTransactionWhereInput = {
      status: { in: ['SUCCEEDED'] },
    };
    
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = startDate;
      if (endDate) dateFilter.createdAt.lte = endDate;
    }

    const methodStats = await prisma.paymentTransaction.groupBy({
      by: ['paymentMethod'],
      where: dateFilter,
      _count: true,
      _sum: {
        amount: true,
        totalFees: true,
      },
    });

    return methodStats.map((stat) => ({
      method: stat.paymentMethod || 'Unknown',
      count: stat._count,
      totalAmount: stat._sum.amount || 0,
      totalFees: stat._sum.totalFees || 0,
    }));
  }
}

export default new AdminPaymentsService();
