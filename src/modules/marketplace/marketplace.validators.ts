import { body, param, query, ValidationChain } from 'express-validator';
import { ListingStatus, OrderStatus, DisputeStatus } from '@prisma/client';
import { MARKETPLACE_CONSTANTS } from './marketplace.types';

// ============= LISTING VALIDATORS =============

export const createListingValidator: ValidationChain[] = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must not exceed 5000 characters'),
  
  body('category')
    .optional()
    .trim()
    .isIn(MARKETPLACE_CONSTANTS.LISTING_CATEGORIES)
    .withMessage(`Category must be one of: ${MARKETPLACE_CONSTANTS.LISTING_CATEGORIES.join(', ')}`),
  
  body('price')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),
  
  body('currency')
    .optional()
    .isString()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-letter code'),
  
  body('quantity')
    .optional()
    .isInt({ min: 1, max: MARKETPLACE_CONSTANTS.MAX_QUANTITY_PER_ITEM })
    .withMessage(`Quantity must be between 1 and ${MARKETPLACE_CONSTANTS.MAX_QUANTITY_PER_ITEM}`),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location must not exceed 200 characters'),
  
  body('images')
    .optional()
    .isArray({ max: MARKETPLACE_CONSTANTS.MAX_IMAGES_PER_LISTING })
    .withMessage(`You can upload up to ${MARKETPLACE_CONSTANTS.MAX_IMAGES_PER_LISTING} images`),
  
  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL'),
  
  body('status')
    .optional()
    .isIn(Object.values(ListingStatus))
    .withMessage('Invalid listing status')
];

export const updateListingValidator: ValidationChain[] = [
  param('id')
    .isString()
    .notEmpty()
    .withMessage('Listing ID is required'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must not exceed 5000 characters'),
  
  body('category')
    .optional()
    .trim()
    .isIn(MARKETPLACE_CONSTANTS.LISTING_CATEGORIES)
    .withMessage(`Category must be one of: ${MARKETPLACE_CONSTANTS.LISTING_CATEGORIES.join(', ')}`),
  
  body('price')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Price must be a positive number'),
  
  body('currency')
    .optional()
    .isString()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-letter code'),
  
  body('quantity')
    .optional()
    .isInt({ min: 1, max: MARKETPLACE_CONSTANTS.MAX_QUANTITY_PER_ITEM })
    .withMessage(`Quantity must be between 1 and ${MARKETPLACE_CONSTANTS.MAX_QUANTITY_PER_ITEM}`),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location must not exceed 200 characters'),
  
  body('images')
    .optional()
    .isArray({ max: MARKETPLACE_CONSTANTS.MAX_IMAGES_PER_LISTING })
    .withMessage(`You can upload up to ${MARKETPLACE_CONSTANTS.MAX_IMAGES_PER_LISTING} images`),
  
  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL'),
  
  body('status')
    .optional()
    .isIn(Object.values(ListingStatus))
    .withMessage('Invalid listing status')
];

export const listingIdValidator: ValidationChain[] = [
  param('id')
    .isString()
    .notEmpty()
    .withMessage('Listing ID is required')
];

export const searchListingsValidator: ValidationChain[] = [
  query('query')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Search query must be between 1 and 200 characters'),
  
  query('category')
    .optional()
    .isIn(MARKETPLACE_CONSTANTS.LISTING_CATEGORIES)
    .withMessage('Invalid category'),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  
  query('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location must not exceed 200 characters'),
  
  query('status')
    .optional()
    .isIn(Object.values(ListingStatus))
    .withMessage('Invalid listing status'),
  
  query('sellerId')
    .optional()
    .isString()
    .withMessage('Seller ID must be a string'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'price', 'title', 'updatedAt'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

// ============= CART VALIDATORS =============

export const addToCartValidator: ValidationChain[] = [
  body('listingId')
    .isString()
    .notEmpty()
    .withMessage('Listing ID is required'),
  
  body('quantity')
    .isInt({ min: 1, max: MARKETPLACE_CONSTANTS.MAX_QUANTITY_PER_ITEM })
    .withMessage(`Quantity must be between 1 and ${MARKETPLACE_CONSTANTS.MAX_QUANTITY_PER_ITEM}`)
];

export const updateCartItemValidator: ValidationChain[] = [
  param('itemId')
    .isString()
    .notEmpty()
    .withMessage('Cart item ID is required'),
  
  body('quantity')
    .isInt({ min: 1, max: MARKETPLACE_CONSTANTS.MAX_QUANTITY_PER_ITEM })
    .withMessage(`Quantity must be between 1 and ${MARKETPLACE_CONSTANTS.MAX_QUANTITY_PER_ITEM}`)
];

export const cartItemIdValidator: ValidationChain[] = [
  param('itemId')
    .isString()
    .notEmpty()
    .withMessage('Cart item ID is required')
];

// ============= ORDER VALIDATORS =============

export const createOrderValidator: ValidationChain[] = [
  body('listingId')
    .isString()
    .notEmpty()
    .withMessage('Listing ID is required'),
  
  body('quantity')
    .isInt({ min: 1, max: MARKETPLACE_CONSTANTS.MAX_QUANTITY_PER_ITEM })
    .withMessage(`Quantity must be between 1 and ${MARKETPLACE_CONSTANTS.MAX_QUANTITY_PER_ITEM}`),
  
  body('shippingAddress')
    .isObject()
    .withMessage('Shipping address is required'),
  
  body('shippingAddress.fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  
  body('shippingAddress.addressLine1')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Address line 1 must be between 5 and 200 characters'),
  
  body('shippingAddress.addressLine2')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address line 2 must not exceed 200 characters'),
  
  body('shippingAddress.city')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  
  body('shippingAddress.state')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters'),
  
  body('shippingAddress.postalCode')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Postal code must be between 3 and 20 characters'),
  
  body('shippingAddress.country')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters'),
  
  body('shippingAddress.phone')
    .trim()
    .isMobilePhone('any')
    .withMessage('Phone must be a valid phone number'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters')
];

export const updateOrderValidator: ValidationChain[] = [
  param('id')
    .isString()
    .notEmpty()
    .withMessage('Order ID is required'),
  
  body('status')
    .optional()
    .isIn(Object.values(OrderStatus))
    .withMessage('Invalid order status'),
  
  body('trackingNumber')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Tracking number must not exceed 100 characters'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters')
];

export const orderIdValidator: ValidationChain[] = [
  param('id')
    .isString()
    .notEmpty()
    .withMessage('Order ID is required')
];

export const searchOrdersValidator: ValidationChain[] = [
  query('status')
    .optional()
    .isIn(Object.values(OrderStatus))
    .withMessage('Invalid order status'),
  
  query('paymentStatus')
    .optional()
    .isIn(['PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELED', 'REFUNDED', 'PARTIALLY_REFUNDED'])
    .withMessage('Invalid payment status'),
  
  query('listingId')
    .optional()
    .isString()
    .withMessage('Listing ID must be a string'),
  
  query('fromDate')
    .optional()
    .isISO8601()
    .withMessage('From date must be a valid ISO 8601 date'),
  
  query('toDate')
    .optional()
    .isISO8601()
    .withMessage('To date must be a valid ISO 8601 date'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// ============= REVIEW VALIDATORS =============

export const createReviewValidator: ValidationChain[] = [
  body('orderId')
    .isString()
    .notEmpty()
    .withMessage('Order ID is required'),
  
  body('revieweeId')
    .isString()
    .notEmpty()
    .withMessage('Reviewee ID is required'),
  
  body('rating')
    .isInt({ min: MARKETPLACE_CONSTANTS.MIN_RATING, max: MARKETPLACE_CONSTANTS.MAX_RATING })
    .withMessage(`Rating must be between ${MARKETPLACE_CONSTANTS.MIN_RATING} and ${MARKETPLACE_CONSTANTS.MAX_RATING}`),
  
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment must not exceed 1000 characters')
];

export const reviewIdValidator: ValidationChain[] = [
  param('id')
    .isString()
    .notEmpty()
    .withMessage('Review ID is required')
];

// ============= DISPUTE VALIDATORS =============

export const createDisputeValidator: ValidationChain[] = [
  body('orderId')
    .isString()
    .notEmpty()
    .withMessage('Order ID is required'),
  
  body('reason')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Reason must be between 10 and 1000 characters')
];

export const updateDisputeValidator: ValidationChain[] = [
  param('id')
    .isString()
    .notEmpty()
    .withMessage('Dispute ID is required'),
  
  body('status')
    .optional()
    .isIn(Object.values(DisputeStatus))
    .withMessage('Invalid dispute status'),
  
  body('resolution')
    .optional()
    .isObject()
    .withMessage('Resolution must be an object')
];

export const disputeIdValidator: ValidationChain[] = [
  param('id')
    .isString()
    .notEmpty()
    .withMessage('Dispute ID is required')
];
