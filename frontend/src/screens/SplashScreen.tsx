import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { logoWithBg } from '../assets/images';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.primary.main};
  color: ${({ theme }) => theme.colors.common.white};
`;

const Logo = styled.img`
  height: 120px;
  width: auto;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  filter: brightness(0) invert(1); // Make it white on dark background
`;

const LoadingText = styled.p`
  font-size: ${({ theme }) => theme.typography.body.large.fontSize};
  opacity: 0.8;
`;

export const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      // If auth is already loaded, navigate immediately
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      }, 1500); // Show splash for 1.5 seconds

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <Container>
      <Logo src={logoWithBg} alt="BerseMuka" />
      <LoadingText>Connecting people, enriching lives...</LoadingText>
    </Container>
  );
};