/**
 * Event Participants Export Service
 */

import { prisma } from '../../config/database';
import { BaseExportService } from './base-export.service';
import { ExportColumn } from './export.types';
import { AppError } from '../../middleware/error';

interface EventParticipantExportData {
  id: string;
  eventId: string;
  userId: string;
  status: string;
  qrCode: string;
  registeredAt: Date;
  checkedInAt: Date | null;
  canceledAt: Date | null;
  hasTicket: boolean;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  tickets: Array<{
    ticketNumber: string;
    ticketType: string;
    price: number;
    currency: string;
    status: string;
    paymentStatus: string;
  }>;
}

export class EventParticipantsExportService extends BaseExportService<EventParticipantExportData> {
  protected entityName = 'Event Participants';
  protected defaultFileName = 'event_participants';

  private eventId: string;

  constructor(eventId: string) {
    super();
    this.eventId = eventId;
  }

  protected getColumns(): ExportColumn[] {
    return [
      { header: 'Participant ID', key: 'participantId', width: 25 },
      { header: 'Full Name', key: 'fullName', width: 30 },
      { header: 'Email', key: 'email', width: 35 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Registered At', key: 'registeredAt', width: 20 },
      { header: 'Checked In', key: 'isCheckedIn', width: 15 },
      { header: 'Check-in Time', key: 'checkedInAt', width: 20 },
      { header: 'Canceled', key: 'isCanceled', width: 15 },
      { header: 'Has Ticket', key: 'hasTicket', width: 15 },
      { header: 'Ticket Number', key: 'ticketNumber', width: 20 },
      { header: 'Ticket Type', key: 'ticketType', width: 20 },
      { header: 'Ticket Price', key: 'ticketPrice', width: 15 },
      { header: 'Payment Status', key: 'paymentStatus', width: 15 },
      { header: 'QR Code', key: 'qrCode', width: 30 },
    ];
  }

  protected async fetchBatch(
    skip: number,
    take: number,
    filters?: Record<string, any>
  ): Promise<EventParticipantExportData[]> {
    const whereClause: any = { eventId: this.eventId };

    // Apply filters if provided
    if (filters?.status) {
      whereClause.status = filters.status;
    }
    if (filters?.hasCheckedIn !== undefined) {
      whereClause.checkedInAt = filters.hasCheckedIn ? { not: null } : null;
    }
    if (filters?.hasCanceled !== undefined) {
      whereClause.canceledAt = filters.hasCanceled ? { not: null } : null;
    }

    const participants = await prisma.eventParticipant.findMany({
      where: whereClause,
      skip,
      take,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        eventTickets: {
          select: {
            ticketNumber: true,
            ticketType: true,
            price: true,
            currency: true,
            status: true,
            paymentStatus: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return participants.map(p => ({
      id: p.id,
      eventId: p.eventId,
      userId: p.userId,
      status: p.status,
      qrCode: p.qrCode,
      registeredAt: p.createdAt,
      checkedInAt: p.checkedInAt,
      canceledAt: p.canceledAt,
      hasTicket: p.eventTickets.length > 0,
      user: p.user,
      tickets: p.eventTickets,
    }));
  }

  protected transformRecord(record: EventParticipantExportData): Record<string, any> {
    const ticket = record.tickets[0]; // Get first ticket if exists

    return {
      participantId: record.id,
      fullName: record.user.fullName,
      email: record.user.email,
      phoneNumber: '',
      status: record.status,
      registeredAt: this.formatDate(record.registeredAt, 'datetime'),
      isCheckedIn: this.formatBoolean(!!record.checkedInAt),
      checkedInAt: this.formatDate(record.checkedInAt, 'datetime'),
      isCanceled: this.formatBoolean(!!record.canceledAt),
      hasTicket: this.formatBoolean(record.hasTicket),
      ticketNumber: ticket?.ticketNumber || '',
      ticketType: ticket?.ticketType || '',
      ticketPrice: ticket ? this.formatCurrency(ticket.price, ticket.currency) : '',
      paymentStatus: ticket?.paymentStatus || '',
      qrCode: record.qrCode,
    };
  }

  protected async getTotalCount(filters?: Record<string, any>): Promise<number> {
    const whereClause: any = { eventId: this.eventId };

    if (filters?.status) {
      whereClause.status = filters.status;
    }
    if (filters?.hasCheckedIn !== undefined) {
      whereClause.checkedInAt = filters.hasCheckedIn ? { not: null } : null;
    }
    if (filters?.hasCanceled !== undefined) {
      whereClause.canceledAt = filters.hasCanceled ? { not: null } : null;
    }

    return await prisma.eventParticipant.count({ where: whereClause });
  }

  protected async validateExportPermission(userId: string, filters?: Record<string, any>): Promise<boolean> {
    // Check if user is the event host or has admin rights
    const event = await prisma.event.findUnique({
      where: { id: this.eventId },
      select: { hostId: true },
    });

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    // Allow if user is the host
    if (event.hostId === userId) {
      return true;
    }

    // TODO: Add admin check if needed
    // const user = await prisma.user.findUnique({ where: { id: userId } });
    // if (user?.role === 'ADMIN') return true;

    return false;
  }

  protected async getMetadata(filters?: Record<string, any>): Promise<Partial<any>> {
    const event = await prisma.event.findUnique({
      where: { id: this.eventId },
      select: {
        title: true,
        date: true,
        location: true,
      },
    });

    return {
      eventId: this.eventId,
      eventTitle: event?.title,
      eventDate: event?.date,
      eventLocation: event?.location,
    };
  }
}
