import { body, param, query } from 'express-validator';
import { EventType, EventStatus, EventHostType } from '@prisma/client';

// ============================================================================
// EVENT VALIDATORS
// ============================================================================

export const createEventValidators = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),
  
  body('type')
    .notEmpty().withMessage('Event type is required')
    .isIn(Object.values(EventType)).withMessage('Invalid event type'),
  
  body('date')
    .notEmpty().withMessage('Event date is required')
    .isISO8601().withMessage('Invalid date format')
    .custom((value) => {
      const eventDate = new Date(value);
      if (eventDate < new Date()) {
        throw new Error('Event date must be in the future');
      }
      return true;
    }),
  
  body('location')
    .trim()
    .notEmpty().withMessage('Location is required')
    .isLength({ min: 3, max: 500 }).withMessage('Location must be between 3 and 500 characters'),
  
  body('mapLink')
    .optional()
    .trim()
    .isURL().withMessage('Invalid map link URL'),
  
  body('maxAttendees')
    .optional()
    .isInt({ min: 1, max: 100000 }).withMessage('Max attendees must be between 1 and 100,000'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Notes cannot exceed 2000 characters'),
  
  body('communityId')
    .optional()
    .trim()
    .isString().withMessage('Community ID must be a valid string'),
  
  body('images')
    .optional()
    .isArray().withMessage('Images must be an array')
    .custom((value) => {
      if (value && value.length > 10) {
        throw new Error('Maximum 10 images allowed');
      }
      return true;
    }),
  
  body('images.*')
    .optional()
    .isURL().withMessage('Each image must be a valid URL'),
  
  body('isFree')
    .notEmpty().withMessage('isFree is required')
    .isBoolean().withMessage('isFree must be a boolean'),
  
  body('price')
    .if(body('isFree').equals('false'))
    .notEmpty().withMessage('Price is required for paid events')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  
  body('currency')
    .optional()
    .isString()
    .isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code (e.g., MYR, USD)'),
  
  body('hostType')
    .optional()
    .isIn(Object.values(EventHostType)).withMessage('Invalid host type'),
  
  body('status')
    .optional()
    .isIn(Object.values(EventStatus)).withMessage('Invalid event status'),
];

export const updateEventValidators = [
  param('id')
    .notEmpty().withMessage('Event ID is required')
    .isString().withMessage('Event ID must be a valid string'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),
  
  body('type')
    .optional()
    .isIn(Object.values(EventType)).withMessage('Invalid event type'),
  
  body('date')
    .optional()
    .isISO8601().withMessage('Invalid date format'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ min: 3, max: 500 }).withMessage('Location must be between 3 and 500 characters'),
  
  body('mapLink')
    .optional()
    .trim()
    .isURL().withMessage('Invalid map link URL'),
  
  body('maxAttendees')
    .optional()
    .isInt({ min: 1, max: 100000 }).withMessage('Max attendees must be between 1 and 100,000'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Notes cannot exceed 2000 characters'),
  
  body('images')
    .optional()
    .isArray().withMessage('Images must be an array')
    .custom((value) => {
      if (value && value.length > 10) {
        throw new Error('Maximum 10 images allowed');
      }
      return true;
    }),
  
  body('isFree')
    .optional()
    .isBoolean().withMessage('isFree must be a boolean'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  
  body('status')
    .optional()
    .isIn(Object.values(EventStatus)).withMessage('Invalid event status'),
];

export const eventIdValidator = [
  param('id')
    .notEmpty().withMessage('Event ID is required')
    .isString().withMessage('Event ID must be a valid string'),
];

export const eventQueryValidators = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  query('sortBy')
    .optional()
    .isIn(['date', 'createdAt', 'price', 'title']).withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  
  query('type')
    .optional()
    .isIn(Object.values(EventType)).withMessage('Invalid event type'),
  
  query('status')
    .optional()
    .isIn(Object.values(EventStatus)).withMessage('Invalid event status'),
  
  query('isFree')
    .optional()
    .isBoolean().withMessage('isFree must be a boolean'),
  
  query('startDate')
    .optional()
    .isISO8601().withMessage('Invalid start date format'),
  
  query('endDate')
    .optional()
    .isISO8601().withMessage('Invalid end date format'),
  
  query('location')
    .optional()
    .trim()
    .isString().withMessage('Location must be a string'),
  
  query('search')
    .optional()
    .trim()
    .isString().withMessage('Search must be a string'),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Max price must be a positive number'),
];

// ============================================================================
// TICKET TIER VALIDATORS
// ============================================================================

export const createTicketTierValidators = [
  body('eventId')
    .notEmpty().withMessage('Event ID is required')
    .isString().withMessage('Event ID must be a valid string'),
  
  body('tierName')
    .trim()
    .notEmpty().withMessage('Tier name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Tier name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  
  body('currency')
    .optional()
    .isString()
    .isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code'),
  
  body('totalQuantity')
    .optional()
    .isInt({ min: 1 }).withMessage('Total quantity must be a positive integer'),
  
  body('minPurchase')
    .optional()
    .isInt({ min: 1 }).withMessage('Min purchase must be a positive integer'),
  
  body('maxPurchase')
    .optional()
    .isInt({ min: 1 }).withMessage('Max purchase must be a positive integer'),
  
  body('availableFrom')
    .optional()
    .isISO8601().withMessage('Invalid availableFrom date format'),
  
  body('availableUntil')
    .optional()
    .isISO8601().withMessage('Invalid availableUntil date format'),
  
  body('displayOrder')
    .optional()
    .isInt({ min: 0 }).withMessage('Display order must be a non-negative integer'),
];

export const updateTicketTierValidators = [
  param('id')
    .notEmpty().withMessage('Ticket tier ID is required')
    .isString().withMessage('Ticket tier ID must be a valid string'),
  
  body('tierName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Tier name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  
  body('totalQuantity')
    .optional()
    .isInt({ min: 1 }).withMessage('Total quantity must be a positive integer'),
  
  body('minPurchase')
    .optional()
    .isInt({ min: 1 }).withMessage('Min purchase must be a positive integer'),
  
  body('maxPurchase')
    .optional()
    .isInt({ min: 1 }).withMessage('Max purchase must be a positive integer'),
  
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
];

// ============================================================================
// TICKET PURCHASE VALIDATORS
// ============================================================================

export const purchaseTicketValidators = [
  body('eventId')
    .notEmpty().withMessage('Event ID is required')
    .isString().withMessage('Event ID must be a valid string'),
  
  body('ticketTierId')
    .optional()
    .isString().withMessage('Ticket tier ID must be a valid string'),
  
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('Quantity must be between 1 and 50'),
  
  body('attendeeName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 }).withMessage('Attendee name must be between 2 and 200 characters'),
  
  body('attendeeEmail')
    .optional()
    .trim()
    .isEmail().withMessage('Invalid attendee email'),
  
  body('attendeePhone')
    .optional()
    .trim()
    .isMobilePhone('any').withMessage('Invalid phone number'),
];

// ============================================================================
// RSVP VALIDATORS
// ============================================================================

export const createRsvpValidators = [
  param('id')
    .notEmpty().withMessage('Event ID is required')
    .isString().withMessage('Event ID must be a valid string'),
];

// ============================================================================
// ATTENDANCE VALIDATORS
// ============================================================================

export const checkInValidators = [
  param('id')
    .notEmpty().withMessage('Event ID is required')
    .isString().withMessage('Event ID must be a valid string'),
  
  body('userId')
    .optional()
    .isString().withMessage('User ID must be a valid string'),
  
  body('qrCode')
    .optional()
    .isString().withMessage('QR code must be a valid string'),
];

// ============================================================================
// DISCOVERY VALIDATORS
// ============================================================================

export const getTrendingEventsValidators = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

export const getNearbyEventsValidators = [
  query('latitude')
    .notEmpty().withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  
  query('longitude')
    .notEmpty().withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
  
  query('radius')
    .optional()
    .isFloat({ min: 1, max: 500 }).withMessage('Radius must be between 1 and 500 km'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

export const getRecommendedEventsValidators = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

export const getEventsByHostValidators = [
  param('hostId')
    .notEmpty().withMessage('Host ID is required')
    .isString().withMessage('Host ID must be a valid string'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

export const getCommunityEventsValidators = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

export const getUserAttendedEventsValidators = [
  param('userId')
    .notEmpty().withMessage('User ID is required')
    .isString().withMessage('User ID must be a valid string'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  query('startDate')
    .optional()
    .isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  
  query('endDate')
    .optional()
    .isISO8601().withMessage('End date must be a valid ISO 8601 date'),
];

// ============================================================================
// CALENDAR VALIDATORS
// ============================================================================

export const getDayEventsValidators = [
  query('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Date must be in ISO 8601 format (YYYY-MM-DD)'),
  
  query('type')
    .optional()
    .isIn(Object.values(EventType)).withMessage('Invalid event type'),
  
  query('sortBy')
    .optional()
    .isIn(['date', 'title', 'popularity']).withMessage('Sort by must be date, title, or popularity'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  
  query('timezone')
    .optional()
    .isString().withMessage('Timezone must be a string'),
];

export const getTodayEventsValidators = [
  query('type')
    .optional()
    .isIn(Object.values(EventType)).withMessage('Invalid event type'),
  
  query('sortBy')
    .optional()
    .isIn(['date', 'title', 'popularity']).withMessage('Sort by must be date, title, or popularity'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  
  query('timezone')
    .optional()
    .isString().withMessage('Timezone must be a string'),
];

export const getWeekScheduleValidators = [
  query('type')
    .optional()
    .isIn(Object.values(EventType)).withMessage('Invalid event type'),
  
  query('timezone')
    .optional()
    .isString().withMessage('Timezone must be a string'),
];

export const getMonthEventsValidators = [
  query('year')
    .notEmpty().withMessage('Year is required')
    .isInt({ min: 2000, max: 2100 }).withMessage('Year must be between 2000 and 2100'),
  
  query('month')
    .notEmpty().withMessage('Month is required')
    .isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  
  query('type')
    .optional()
    .isIn(Object.values(EventType)).withMessage('Invalid event type'),
  
  query('timezone')
    .optional()
    .isString().withMessage('Timezone must be a string'),
];

export const getCalendarCountsValidators = [
  query('startDate')
    .optional()
    .isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  
  query('endDate')
    .optional()
    .isISO8601().withMessage('End date must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (req.query.startDate && value) {
        const start = new Date(req.query.startDate as string);
        const end = new Date(value);
        if (end < start) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    }),
  
  query('type')
    .optional()
    .isIn(Object.values(EventType)).withMessage('Invalid event type'),
];
