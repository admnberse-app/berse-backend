import { Response } from 'express';
import matchingService from '../services/matching.service';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../types';
import { MatchType, MatchStatus } from '@prisma/client';

export const findMatches = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { type, preferences } = req.body;

    if (!type || !Object.values(MatchType).includes(type)) {
      sendError(res, 'Invalid match type', 400);
    }

    const matches = await matchingService.findMatches({
      userId,
      type,
      preferences,
    });

    sendSuccess(res, matches, 'Matches found successfully');
  } catch (error) {
    console.error('Find matches error:', error);
    sendError(res, 'Failed to find matches');
  }
};

export const createMatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const senderId = req.user!.id;
    const { receiverId, type, message } = req.body;

    if (!receiverId || !type) {
      sendError(res, 'Receiver ID and type are required', 400);
    }

    if (!Object.values(MatchType).includes(type)) {
      sendError(res, 'Invalid match type', 400);
    }

    const match = await matchingService.createMatch(
      senderId,
      receiverId,
      type,
      message
    );

    sendSuccess(res, match, 'Match created successfully', 201);
  } catch (error: any) {
    console.error('Create match error:', error);
    if (error.message === 'Match already exists') {
      sendError(res, error.message, 409);
    }
    sendError(res, 'Failed to create match');
  }
};

export const respondToMatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { matchId } = req.params;
    const { accept } = req.body;

    if (typeof accept !== 'boolean') {
      sendError(res, 'Accept parameter must be a boolean', 400);
    }

    const updatedMatch = await matchingService.respondToMatch(
      matchId,
      userId,
      accept
    );

    sendSuccess(
      res,
      updatedMatch,
      `Match ${accept ? 'accepted' : 'rejected'} successfully`
    );
  } catch (error: any) {
    console.error('Respond to match error:', error);
    if (error.message === 'Match not found or already responded') {
      sendError(res, error.message, 404);
    }
    sendError(res, 'Failed to respond to match');
  }
};

export const getUserMatches = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { status } = req.query;

    let matchStatus: MatchStatus | undefined;
    if (status && Object.values(MatchStatus).includes(status as MatchStatus)) {
      matchStatus = status as MatchStatus;
    }

    const matches = await matchingService.getUserMatches(userId, matchStatus);

    sendSuccess(res, matches, 'Matches retrieved successfully');
  } catch (error) {
    console.error('Get user matches error:', error);
    sendError(res, 'Failed to retrieve matches');
  }
};

export const getMatchRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { type } = req.query;

    if (!type || !Object.values(MatchType).includes(type as MatchType)) {
      sendError(res, 'Valid match type is required', 400);
    }

    const recommendations = await matchingService.getMatchRecommendations(
      userId,
      type as MatchType
    );

    sendSuccess(
      res,
      recommendations,
      'Match recommendations retrieved successfully'
    );
  } catch (error) {
    console.error('Get match recommendations error:', error);
    sendError(res, 'Failed to get match recommendations');
  }
};

export const getMatchDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { matchId } = req.params;

    const matches = await matchingService.getUserMatches(userId);
    const match = matches.find(m => m.id === matchId);

    if (!match) {
      sendError(res, 'Match not found', 404);
    }

    sendSuccess(res, match, 'Match details retrieved successfully');
  } catch (error) {
    console.error('Get match details error:', error);
    sendError(res, 'Failed to retrieve match details');
  }
};