import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { berseVerticalLogo } from '../assets/images';

const Container = styled.div<{ $fadeOut?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #2D5F4F 0%, #4A8B7C 100%);
  color: ${({ theme }) => theme.colors.common.white};
  transition: opacity 0.3s ease-out;
  opacity: 1;
  
  ${({ $fadeOut }) => $fadeOut && css`
    opacity: 0;
  `}
`;

const Logo = styled.img`
  width: 380px;
  height: auto;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
`;

const LoadingText = styled.p`
  font-size: 14px;
  font-weight: 400;
  font-style: italic;
  letter-spacing: 0.5px;
  color: #023854;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

export const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      // Show splash for 1.5 seconds
      const fadeTimer = setTimeout(() => {
        setFadeOut(true);
      }, 1300);
      
      // Navigate after fade completes
      const navTimer = setTimeout(() => {
        if (isAuthenticated) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      }, 1600); // Navigate 300ms after fade starts

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(navTimer);
      };
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <Container $fadeOut={fadeOut}>
      <Logo src={berseVerticalLogo} alt="Berse App" />
      <LoadingText>Find Friends Everywhere</LoadingText>
    </Container>
  );
};