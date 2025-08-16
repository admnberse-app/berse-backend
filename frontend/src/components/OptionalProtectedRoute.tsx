import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';

const LoginPromptContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const PromptCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const Icon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  color: #2fce98;
  margin-bottom: 10px;
`;

const Message = styled.p`
  color: #666;
  margin-bottom: 30px;
`;

const LoginButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const RegisterLink = styled.a`
  color: #667eea;
  text-decoration: none;
  margin-top: 15px;
  display: inline-block;
  font-size: 14px;
  
  &:hover {
    text-decoration: underline;
  }
`;

interface OptionalProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  featureName?: string;
}

export const OptionalProtectedRoute: React.FC<OptionalProtectedRouteProps> = ({ 
  children, 
  requireAuth = false,
  featureName = 'this feature'
}) => {
  const { user, isAuthenticated } = useAuth();

  // If authentication is required and user is not logged in
  if (requireAuth && !isAuthenticated) {
    return (
      <LoginPromptContainer>
        <PromptCard>
          <Icon>🔒</Icon>
          <Title>Login Required</Title>
          <Message>
            Please login to access {featureName}. 
            Join our community to unlock exclusive features!
          </Message>
          <LoginButton onClick={() => window.location.href = '/login'}>
            Login to Continue
          </LoginButton>
          <RegisterLink href="/register">
            Don't have an account? Register here
          </RegisterLink>
        </PromptCard>
      </LoginPromptContainer>
    );
  }

  // Otherwise, render the children
  return <>{children}</>;
};