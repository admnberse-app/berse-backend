import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { CompactHeader } from '../components/CompactHeader';
import { MainNav } from '../components/MainNav';
import { ProfileSidebar } from '../components/ProfileSidebar';
import rewardsService from '../../../frontend-api/services/rewards.service';
import userService from '../../../frontend-api/services/user.service';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F9F3E3;
`;

const Content = styled.div`
  flex: 1;
  padding-bottom: 90px;
  overflow-y: auto;
  max-width: 393px;
  width: 100%;
  margin: 0 auto;
`;

// Brand/Deal Detail Page Styles
const DetailContainer = styled.div`
  background-color: #F9F3E3;
  min-height: 100vh;
`;

const DetailHeader = styled.div`
  padding: 16px;
  display: flex;
  align-items: center;
  background: #F9F3E3;
`;

const DetailBackButton = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const DetailContent = styled.div`
  padding: 0 16px;
`;

const BrandLogoContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 20px 0;
`;

const BrandLogoLarge = styled.div<{ bgColor?: string }>`
  width: 120px;
  height: 120px;
  border-radius: 24px;
  background: ${props => props.bgColor || 'white'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const BrandImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 16px;
  margin-bottom: 20px;
`;

const BrandTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  color: #333;
  margin: 20px 0 10px;
`;

const BrandTags = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 20px 0;
`;

const BrandTag = styled.span`
  background: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
  margin: 24px 0;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 16px;
  border-radius: 24px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #3d4c74;
  color: white;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(61, 76, 116, 0.3);
  }
`;

const RatingSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 16px 0;
  font-size: 16px;
  color: #333;
`;

const PromoSection = styled.div`
  margin: 24px 0;
`;

const PromoTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
`;

const PromoCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const PromoHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  cursor: pointer;
`;

const PromoLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PromoIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: #3d4c74;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
`;

const PromoInfo = styled.div`
  flex: 1;
`;

const PromoName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const PromoValidity = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 8px;
`;

const ValidityBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
`;

const GreenDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4CAF50;
`;

const ExpandIcon = styled.span`
  font-size: 20px;
  color: #999;
  transition: transform 0.2s;
  
  &.expanded {
    transform: rotate(180deg);
  }
`;

const PromoDetails = styled.div`
  padding-top: 16px;
  border-top: 1px solid #F0F0F0;
  color: #666;
  font-size: 14px;
  line-height: 1.6;
`;

const RedeemButton = styled.button`
  width: 100%;
  padding: 16px;
  background: #3d4c74;
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 16px;
  transition: all 0.2s;

  &:hover {
    background: #2d3c64;
    transform: translateY(-2px);
  }
`;

const AboutSection = styled.div`
  margin: 32px 0;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const AboutTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
`;

const AboutText = styled.p`
  font-size: 14px;
  color: #666;
  line-height: 1.6;
`;

// Points Balance Section
const PointsBalanceCard = styled.div`
  background: linear-gradient(135deg, #2fce98 0%, #3A7A68 100%);
  color: white;
  padding: 20px;
  margin: 16px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const PointsAmount = styled.div`
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
`;

const PointsLabel = styled.div`
  font-size: 14px;
  opacity: 0.9;
`;

const PointsActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const PointsActionButton = styled.button`
  flex: 1;
  padding: 10px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

// Category Detail Page Styles
const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: white;
  border-bottom: 1px solid #E5E5E5;
`;

const BackButton = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #F5F3EF;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  transition: all 0.2s;

  &:hover {
    background: #E8E8E8;
  }
`;

const CategoryTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #333;
  flex: 1;
  text-align: center;
`;

const FavoriteButton = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #F5F3EF;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
`;

const SearchBar = styled.div`
  margin: 16px;
  background: #F5F3EF;
  border-radius: 24px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: none;
  outline: none;
  font-size: 16px;
  color: #333;
  
  &::placeholder {
    color: #999;
  }
`;

const SubcategoriesScroll = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px;
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const SubcategoryCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
  cursor: pointer;
`;

const SubcategoryImage = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 12px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin-bottom: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const SubcategoryName = styled.div`
  font-size: 14px;
  color: #333;
  text-align: center;
  font-weight: 500;
`;

const DealsSection = styled.div`
  padding: 0 16px;
`;

const DealItemCard = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
`;

const DealImageContainer = styled.div`
  position: relative;
  height: 200px;
  background: #F5F3EF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
`;

const LocationBadge = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  background: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const DealFavoriteButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const BrandLogo = styled.div`
  position: absolute;
  bottom: -24px;
  right: 16px;
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const DealContent = styled.div`
  padding: 16px;
  padding-top: 36px;
`;

const DealTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const DealInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DealDiscount = styled.div`
  font-size: 16px;
  color: #3d4c74;
  font-weight: 600;
`;

const DealCategory = styled.div`
  font-size: 14px;
  color: #666;
`;

// Categories Section
const CategoriesSection = styled.div`
  padding: 0 16px;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
`;

const CategoryCard = styled.div<{ bgColor: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  background: ${props => props.bgColor};
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s;
  min-height: 80px;

  &:hover {
    transform: translateY(-2px);
  }
`;

const CategoryIcon = styled.div`
  font-size: 24px;
  margin-bottom: 4px;
`;

const CategoryName = styled.div`
  font-size: 11px;
  color: white;
  text-align: center;
  font-weight: 500;
`;

// Featured Deal Section
const FeaturedDealCard = styled.div`
  margin: 0 16px 24px;
  background: linear-gradient(135deg, #70AD47 0%, #5A9138 100%);
  border-radius: 16px;
  padding: 20px;
  color: white;
  position: relative;
  overflow: hidden;
`;

const FeaturedBadge = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
`;

const FeaturedTitle = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
`;

const FeaturedSubtitle = styled.p`
  font-size: 16px;
  opacity: 0.95;
  margin-bottom: 16px;
`;

const FeaturedButton = styled.button`
  background: white;
  color: #70AD47;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

// Other existing styles...
const TrendingSection = styled.div`
  padding: 0 16px;
  margin-bottom: 24px;
`;

const OfferCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
`;

const OfferImage = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 8px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-right: 16px;
`;

const OfferDetails = styled.div`
  flex: 1;
`;

const OfferTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const OfferDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
`;

const OfferPoints = styled.div`
  font-size: 14px;
  color: #2fce98;
  font-weight: 600;
`;

const NewBadge = styled.span`
  background: #FF6B35;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
  margin-left: 8px;
`;

const BrandsSection = styled.div`
  padding: 0 16px;
  margin-bottom: 24px;
`;

const BrandsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
`;

const BrandCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
`;

const BrandLogoSmall = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 8px;
`;

const BrandName = styled.div`
  font-size: 12px;
  color: #333;
  text-align: center;
  font-weight: 500;
`;

const BrandDeals = styled.div`
  font-size: 10px;
  color: #666;
  margin-top: 2px;
`;

const HorizontalScroll = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 0 16px;
  margin-bottom: 24px;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const DealCard = styled.div<{ bgColor?: string }>`
  min-width: 160px;
  background: ${props => props.bgColor || 'white'};
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const DealCardTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.color || '#333'};
  margin-bottom: 8px;
`;

const DealCardDiscount = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: ${props => props.color || '#333'};
  margin-bottom: 4px;
`;

const DealCardPoints = styled.div`
  font-size: 12px;
  color: ${props => props.color || '#666'};
`;

export const PointsDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userPoints, setUserPoints] = useState(450);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [selectedDeal, setSelectedDeal] = useState<any>(null);
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [expandedPromo, setExpandedPromo] = useState<string | null>(null);

  const categories = [
    { name: 'Food', icon: '🍽️', color: '#FF6B35' },
    { name: 'Transport', icon: '🚌', color: '#4A90E2' },
    { name: 'Education', icon: '📚', color: '#70AD47' },
    { name: 'Travel', icon: '✈️', color: '#9B59B6' },
    { name: 'Fashion', icon: '👗', color: '#FF7043' },
    { name: 'Grocery', icon: '🛒', color: '#FFC107' },
    { name: 'Health', icon: '💊', color: '#F44336' },
    { name: 'Services', icon: '🔧', color: '#3F51B5' },
  ];

  const brandsData: Record<string, any> = {
    'KFC': {
      name: 'KFC',
      icon: '🍗',
      bgColor: '#E4002B',
      tags: ['Fast Food', 'Chicken', 'American'],
      rating: 4.5,
      reviews: 234,
      image: null,
      promos: [
        { id: '1', discount: '20%', title: 'Student Discount', description: 'Get 20% off on all meals with valid student ID' },
        { id: '2', discount: 'B1G1', title: 'Buy 1 Get 1 Free', description: 'Buy any Zinger burger and get another one free' },
        { id: '3', discount: '30%', title: 'Family Meal Deal', description: 'Save 30% on family bucket meals' },
      ],
      about: 'KFC is a global chicken restaurant brand with a rich, decades-long history of success and innovation. It all started with one cook, Colonel Sanders, who created a finger lickin good recipe more than 75 years ago.'
    },
    'Krispy Kreme': {
      name: 'Krispy Kreme',
      icon: '🍩',
      bgColor: '#00A04A',
      tags: ['Doughnut', 'Dessert', 'Sweet'],
      rating: 5.0,
      reviews: 19,
      image: null,
      promos: [
        { id: '1', discount: '50%', title: 'Up to 50% Student Discount', description: 'Show your student ID and get up to 50% off on selected items' },
        { id: '2', discount: 'B1G1', title: 'Buy 1 Get 1 Student Offer', description: 'Buy any dozen and get 6 glazed donuts free' },
      ],
      about: 'Krispy Kreme is a legendary doughnut shop known for its light, melt-in-your-mouth Original Glazed doughnuts. Founded in 1937, we have been spreading joy through the simple pleasure of a delicious doughnut.'
    },
    'Alif Stores': {
      name: 'Alif Stores',
      icon: '📚',
      bgColor: '#00BCD4',
      tags: ['Books', 'Read', 'Electronics'],
      rating: 5.0,
      reviews: 3,
      image: null,
      promos: [
        { id: '1', discount: '15%', title: '15% Student Discount', description: 'Get a 15% Student Discount on the Entire Bill!\n\nApplicable to the following categories:\n- Stationery\n- Books\n- Lifestyle (Non-electronics)\n- Toys\n\nThe discount is available across all branches and is not valid on promotional products.' },
      ],
      about: 'Alif Stores is a haven for book lovers, offering a diverse and thoughtfully curated selection to suit every interest and passion. From gripping novels to insightful non-fiction, the collection spans a wide range of genres designed to inspire, educate, and entertain.'
    },
    'LE PETIT CAMION': {
      name: 'LE PETIT CAMION',
      icon: '☕',
      bgColor: '#FFC107',
      tags: ['Cafe', 'Coffee', 'French'],
      rating: 5.0,
      reviews: 2,
      image: null,
      promos: [
        { id: '1', discount: '10%', title: '10% Student Discount', description: 'Get 10% off on all beverages and pastries with student ID' },
      ],
      about: 'We take pride in serving specialty coffee and bringing high-end blends to the Qatari market. Our journey started with a simple idea: to create a mobile coffee experience that brings joy to every corner of the city.'
    },
    'Inflata City': {
      name: 'Inflata City',
      icon: '🎪',
      bgColor: '#4A90E2',
      tags: ['Themepark', 'Fun', 'Kids'],
      rating: 0,
      reviews: 0,
      image: null,
      promos: [
        { id: '1', discount: '6%', title: 'Inflatapass: 6% discount', description: 'Get 6% off on entry tickets' },
        { id: '2', discount: '15%', title: 'Super Pass: 15% discount', description: 'Save 15% on unlimited access passes' },
        { id: '3', discount: '15%', title: 'VIP Pass: 15% discount', description: 'Enjoy 15% off on VIP experiences' },
        { id: '4', discount: '3%', title: 'Family Pass: 3% discount', description: 'Get 3% off on family packages' },
      ],
      about: "World's Largest Indoor Inflatable Zone! Experience the ultimate adventure at Inflata City with massive slides, obstacle courses, and endless fun for all ages."
    }
  };

  const categoryDeals: Record<string, any> = {
    Food: {
      subcategories: [
        { name: 'Burger', icon: '🍔' },
        { name: 'Arabic', icon: '🥙' },
        { name: 'Chicken', icon: '🍗' },
        { name: 'Asian', icon: '🍜' },
        { name: 'Pizza', icon: '🍕' },
        { name: 'Dessert', icon: '🍰' },
      ],
      deals: [
        {
          id: 1,
          name: 'Krispy Kreme',
          discount: '50% Student Discount',
          category: 'Dessert',
          locations: '9+ Locations',
          icon: '🍩',
          brandIcon: '🍩',
        },
        {
          id: 2,
          name: "Nando's",
          discount: '15% Student Discount',
          category: 'Chicken',
          locations: '10+ Locations',
          icon: '🍗',
          brandIcon: '🔥',
        },
        {
          id: 3,
          name: 'KFC',
          discount: '20% Off Meals',
          category: 'Chicken',
          locations: '9+ Locations',
          icon: '🍗',
          brandIcon: '🍗',
        },
      ],
    },
    Transport: {
      subcategories: [
        { name: 'Ride', icon: '🚗' },
        { name: 'Bus', icon: '🚌' },
        { name: 'Metro', icon: '🚇' },
        { name: 'Taxi', icon: '🚕' },
      ],
      deals: [
        {
          id: 1,
          name: 'Grab',
          discount: '20% Off Rides',
          category: 'Ride Sharing',
          locations: 'Available Everywhere',
          icon: '🚗',
          brandIcon: '🚗',
        },
        {
          id: 2,
          name: 'RapidKL',
          discount: '30% Student Pass',
          category: 'Public Transport',
          locations: 'All Stations',
          icon: '🚇',
          brandIcon: '🚇',
        },
      ],
    },
    Education: {
      subcategories: [
        { name: 'Courses', icon: '📖' },
        { name: 'Books', icon: '📚' },
        { name: 'Tutoring', icon: '👨‍🏫' },
        { name: 'Online', icon: '💻' },
      ],
      deals: [
        {
          id: 1,
          name: 'BRIGHT English',
          discount: '20% Off Courses',
          category: 'Language',
          locations: '5+ Centers',
          icon: '🗣️',
          brandIcon: '📚',
        },
        {
          id: 2,
          name: 'MPH Bookstore',
          discount: '15% Student Discount',
          category: 'Books',
          locations: '12+ Locations',
          icon: '📚',
          brandIcon: '📖',
        },
      ],
    },
  };

  const trendingOffers = [
    {
      id: 1,
      title: 'Tim Hortons',
      description: 'Buy 1 Get 1 Free Coffee',
      points: 50,
      icon: '☕',
      isNew: false,
      disabled: true,
      comingSoon: true,
    },
    {
      id: 2,
      title: 'Meryal Waterpark',
      description: '50% Student Discount',
      points: 200,
      icon: '🏊',
      isNew: false,
      disabled: true,
      comingSoon: true,
    },
    {
      id: 3,
      title: 'Desert Falls',
      description: '70% off Water & Adventure',
      points: 150,
      icon: '🎢',
      isNew: false,
      disabled: true,
      comingSoon: true,
    },
  ];

  const topBrands = [
    { name: 'KFC', deals: '12 deals', icon: '🍗' },
    { name: "Papa John's", deals: '8 deals', icon: '🍕' },
    { name: 'Grab', deals: '15 deals', icon: '🚗' },
    { name: 'AirAsia', deals: '6 deals', icon: '✈️' },
    { name: 'Starbucks', deals: '10 deals', icon: '☕' },
    { name: 'Uniqlo', deals: '5 deals', icon: '👔' },
  ];

  const travelDeals = [
    { title: 'Bali Trip', discount: '20% OFF', points: 500, color: '#9B59B6' },
    { title: 'Dubai Hotel', discount: '30% OFF', points: 400, color: '#9B59B6' },
    { title: 'Flight to Tokyo', discount: '15% OFF', points: 800, color: '#9B59B6' },
  ];

  const educationDeals = [
    { title: 'BRIGHT English', discount: '20% OFF', points: 500, color: '#70AD47' },
    { title: 'University Fees', discount: '10% OFF', points: 500, color: '#70AD47' },
    { title: 'Book Store', discount: '15% OFF', points: 50, color: '#70AD47' },
  ];

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
  };

  const handleBackClick = () => {
    setSelectedCategory(null);
    setSelectedBrand(null);
    setSelectedDeal(null);
  };

  const handleBrandClick = (brandName: string) => {
    setSelectedBrand(brandsData[brandName] || brandsData['KFC']);
  };

  const handleDealClick = (deal: any) => {
    // Map deal to brand data
    const brandMap: Record<string, string> = {
      'Krispy Kreme': 'Krispy Kreme',
      'KFC': 'KFC',
      'Nando\'s': 'KFC', // Using KFC as fallback
      'Tim Hortons': 'LE PETIT CAMION', // Using as coffee shop example
    };
    
    const brandKey = brandMap[deal.name || deal.title] || 'KFC';
    setSelectedBrand(brandsData[brandKey]);
  };

  const togglePromo = (promoId: string) => {
    setExpandedPromo(expandedPromo === promoId ? null : promoId);
  };

  // Render Brand/Deal Detail Page
  if (selectedBrand) {
    return (
      <DetailContainer>
        <StatusBar />
        
        <DetailHeader>
          <DetailBackButton onClick={handleBackClick}>←</DetailBackButton>
        </DetailHeader>

        <DetailContent>
          {selectedBrand.image ? (
            <BrandImage src={selectedBrand.image} alt={selectedBrand.name} />
          ) : (
            <BrandLogoContainer>
              <BrandLogoLarge bgColor={selectedBrand.bgColor}>
                {selectedBrand.icon}
              </BrandLogoLarge>
            </BrandLogoContainer>
          )}

          <BrandTitle>{selectedBrand.name}</BrandTitle>

          <BrandTags>
            {selectedBrand.tags.map((tag: string, index: number) => (
              <BrandTag key={index}>{tag}</BrandTag>
            ))}
          </BrandTags>

          <ActionButtons>
            <ActionButton>
              📞 Call
            </ActionButton>
            <ActionButton>
              📍 Locate
            </ActionButton>
          </ActionButtons>

          <RatingSection>
            ⭐ {selectedBrand.rating.toFixed(2)} ({selectedBrand.reviews} ratings)
            <span style={{ marginLeft: '8px' }}>›</span>
          </RatingSection>

          <PromoSection>
            <PromoTitle>Available Promos</PromoTitle>
            
            {selectedBrand.promos.map((promo: any) => (
              <PromoCard key={promo.id}>
                <PromoHeader onClick={() => togglePromo(promo.id)}>
                  <PromoLeft>
                    <PromoIcon>{promo.discount}</PromoIcon>
                    <PromoInfo>
                      <PromoName>{promo.title}</PromoName>
                    </PromoInfo>
                  </PromoLeft>
                  <ExpandIcon className={expandedPromo === promo.id ? 'expanded' : ''}>
                    {expandedPromo === promo.id ? '∧' : '∨'}
                  </ExpandIcon>
                </PromoHeader>
                
                <PromoValidity>
                  <ValidityBadge>
                    <GreenDot />
                    In-store
                  </ValidityBadge>
                  <ValidityBadge>
                    <GreenDot />
                    All Branches
                  </ValidityBadge>
                </PromoValidity>

                {expandedPromo === promo.id && (
                  <PromoDetails>
                    {promo.description.split('\n').map((line: string, idx: number) => (
                      <div key={idx}>{line}</div>
                    ))}
                  </PromoDetails>
                )}

                <RedeemButton>Redeem Offer</RedeemButton>
              </PromoCard>
            ))}
          </PromoSection>

          <AboutSection>
            <AboutTitle>About {selectedBrand.name}</AboutTitle>
            <AboutText>{selectedBrand.about}</AboutText>
          </AboutSection>
        </DetailContent>

        <MainNav
          activeTab="rewards"
          onTabPress={(tab) => {
            if (tab === 'home') navigate('/dashboard');
            else if (tab === 'connect') navigate('/connect');
            else if (tab === 'match') navigate('/match');
            else if (tab === 'profile') navigate('/profile');
          }}
        />
      </DetailContainer>
    );
  }

  // Render Category Detail Page
  if (selectedCategory && categoryDeals[selectedCategory]) {
    const categoryData = categoryDeals[selectedCategory];
    const selectedCategoryInfo = categories.find(c => c.name === selectedCategory);

    return (
      <Container>
        <StatusBar />
        
        <CategoryHeader>
          <BackButton onClick={handleBackClick}>←</BackButton>
          <CategoryTitle>{selectedCategory}</CategoryTitle>
          <FavoriteButton>♡</FavoriteButton>
        </CategoryHeader>

        <Content>
          <SearchBar>
            <span>🔍</span>
            <SearchInput placeholder="Search things" />
          </SearchBar>

          <SubcategoriesScroll>
            {categoryData.subcategories.map((sub: any, index: number) => (
              <SubcategoryCard key={index}>
                <SubcategoryImage>{sub.icon}</SubcategoryImage>
                <SubcategoryName>{sub.name}</SubcategoryName>
              </SubcategoryCard>
            ))}
          </SubcategoriesScroll>

          <DealsSection>
            {categoryData.deals.map((deal: any) => (
              <DealItemCard key={deal.id} onClick={() => handleDealClick(deal)}>
                <DealImageContainer>
                  <LocationBadge>{deal.locations}</LocationBadge>
                  <DealFavoriteButton>♡</DealFavoriteButton>
                  {deal.icon}
                  <BrandLogo>{deal.brandIcon}</BrandLogo>
                </DealImageContainer>
                <DealContent>
                  <DealTitle>{deal.name}</DealTitle>
                  <DealInfo>
                    <DealDiscount>{deal.discount}</DealDiscount>
                    <DealCategory>{deal.category}</DealCategory>
                  </DealInfo>
                </DealContent>
              </DealItemCard>
            ))}
          </DealsSection>
        </Content>

        <MainNav
          activeTab="rewards"
          onTabPress={(tab) => {
            if (tab === 'home') navigate('/dashboard');
            else if (tab === 'connect') navigate('/connect');
            else if (tab === 'match') navigate('/match');
            else if (tab === 'profile') navigate('/profile');
          }}
        />
      </Container>
    );
  }

  // Render Main Rewards Page
  return (
    <Container>
      <StatusBar />
      <CompactHeader 
        onMenuClick={() => setShowProfileSidebar(true)}
      />

      <Content>
        {/* Categories */}
        <CategoriesSection>
          <SectionTitle>Categories</SectionTitle>
          <CategoriesGrid>
            {categories.map((category, index) => (
              <CategoryCard 
                key={index} 
                bgColor={category.color}
                onClick={() => handleCategoryClick(category.name)}
              >
                <CategoryIcon>{category.icon}</CategoryIcon>
                <CategoryName>{category.name}</CategoryName>
              </CategoryCard>
            ))}
          </CategoriesGrid>
        </CategoriesSection>

        {/* Featured Deal */}
        <FeaturedDealCard>
          <FeaturedBadge>FEATURED</FeaturedBadge>
          <FeaturedTitle>Mukha Cafe ☕</FeaturedTitle>
          <FeaturedSubtitle>Get 30% off on all beverages and pastries</FeaturedSubtitle>
          <FeaturedButton>Redeem for 30 pts</FeaturedButton>
        </FeaturedDealCard>

        {/* Trending Offers */}
        <TrendingSection>
          <SectionTitle>🔥 Trending Offers</SectionTitle>
          {trendingOffers.map((offer) => (
            <OfferCard 
              key={offer.id} 
              onClick={offer.disabled ? undefined : () => handleDealClick(offer)}
              style={{
                opacity: offer.disabled ? 0.6 : 1,
                cursor: offer.disabled ? 'not-allowed' : 'pointer'
              }}
            >
              <OfferImage>{offer.icon}</OfferImage>
              <OfferDetails>
                <OfferTitle>
                  {offer.title}
                  {offer.isNew && <NewBadge>NEW</NewBadge>}
                  {offer.comingSoon && <NewBadge style={{ background: '#999' }}>Soon</NewBadge>}
                </OfferTitle>
                <OfferDescription>
                  {offer.disabled ? 'Coming Soon' : offer.description}
                </OfferDescription>
                <OfferPoints>
                  {offer.disabled ? '-- points' : `${offer.points} points`}
                </OfferPoints>
              </OfferDetails>
            </OfferCard>
          ))}
        </TrendingSection>

        {/* Top Brands */}
        <BrandsSection>
          <SectionTitle>⚡ Top Brands</SectionTitle>
          <BrandsGrid>
            {topBrands.map((brand, index) => (
              <BrandCard key={index} onClick={() => handleBrandClick(brand.name)}>
                <BrandLogoSmall>{brand.icon}</BrandLogoSmall>
                <BrandName>{brand.name}</BrandName>
                <BrandDeals>{brand.deals}</BrandDeals>
              </BrandCard>
            ))}
          </BrandsGrid>
        </BrandsSection>

        {/* Travel Deals */}
        <div>
          <SectionTitle style={{ padding: '0 16px', marginBottom: '12px' }}>
            ✈️ Travel Deals
          </SectionTitle>
          <HorizontalScroll>
            {travelDeals.map((deal, index) => (
              <DealCard key={index} bgColor={deal.color}>
                <DealCardTitle color="white">{deal.title}</DealCardTitle>
                <DealCardDiscount color="white">{deal.discount}</DealCardDiscount>
                <DealCardPoints color="rgba(255,255,255,0.8)">
                  {deal.points} points
                </DealCardPoints>
              </DealCard>
            ))}
          </HorizontalScroll>
        </div>

        {/* Education Deals */}
        <div>
          <SectionTitle style={{ padding: '0 16px', marginBottom: '12px' }}>
            📚 Education Deals
          </SectionTitle>
          <HorizontalScroll>
            {educationDeals.map((deal, index) => (
              <DealCard key={index} bgColor={deal.color}>
                <DealCardTitle color="white">{deal.title}</DealCardTitle>
                <DealCardDiscount color="white">{deal.discount}</DealCardDiscount>
                <DealCardPoints color="rgba(255,255,255,0.8)">
                  {deal.points} points
                </DealCardPoints>
              </DealCard>
            ))}
          </HorizontalScroll>
        </div>
      </Content>

      <ProfileSidebar 
        isOpen={showProfileSidebar}
        onClose={() => setShowProfileSidebar(false)}
      />

      <MainNav
        activeTab="rewards"
        onTabPress={(tab) => {
          if (tab === 'home') navigate('/dashboard');
          else if (tab === 'connect') navigate('/connect');
          else if (tab === 'match') navigate('/match');
          else if (tab === 'profile') navigate('/profile');
        }}
      />
    </Container>
  );
};