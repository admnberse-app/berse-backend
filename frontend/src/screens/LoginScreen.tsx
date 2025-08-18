import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { StatusBar } from '../components/StatusBar/StatusBar';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F9F3E3;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background-color: #F9F3E3;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Content = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.xl};
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 393px;
  width: 100%;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.heading.h1.fontSize};
  font-weight: ${({ theme }) => theme.typography.heading.h1.fontWeight};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.body.large.fontSize};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.status.error};
  font-size: ${({ theme }) => theme.typography.body.small.fontSize};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const ForgotPasswordLink = styled.div`
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.body.small.fontSize};
  
  a {
    color: ${({ theme }) => theme.colors.primary.main};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const RegisterLink = styled.div`
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.typography.body.medium.fontSize};
  color: ${({ theme }) => theme.colors.text.secondary};

  a {
    color: ${({ theme }) => theme.colors.primary.main};
    text-decoration: none;
    font-weight: ${({ theme }) => theme.typography.body.medium.fontWeight};

    &:hover {
      text-decoration: underline;
    }
  }
`;

const EyeIcon = styled.div`
  cursor: pointer;
  font-size: 20px;
  user-select: none;
  
  &:hover {
    opacity: 0.7;
  }
`;

const RememberMeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: ${({ theme }) => theme.colors.primary.main};
`;

const CheckboxLabel = styled.label`
  font-size: ${({ theme }) => theme.typography.body.medium.fontSize};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  user-select: none;
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Logo = styled.img`
  width: auto;
  height: 120px;
  object-fit: contain;
`;

export const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      // Save rememberMe preference
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }
      // Navigation should happen immediately after successful login
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <StatusBar />
      <Header>
        <BackButton onClick={() => navigate('/')}>
          ← Back
        </BackButton>
      </Header>
      <Content>
        <LogoContainer>
          <Logo src="/berse-horizontal-logo.png" alt="Berse App" />
        </LogoContainer>
        <Title>Log-in Now</Title>
        <Subtitle>to use Berse App!</Subtitle>
        
        <Form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
          
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            endIcon={
              <EyeIcon onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </EyeIcon>
            }
          />
          
          <RememberMeContainer>
            <Checkbox
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <CheckboxLabel htmlFor="rememberMe">
              Keep me signed in
            </CheckboxLabel>
          </RememberMeContainer>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <Button
            variant="primary"
            size="large"
            type="submit"
            disabled={isLoading}
            fullWidth
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </Form>
        
        <ForgotPasswordLink>
          <a href="#" onClick={(e) => {
            e.preventDefault();
            alert('Password reset feature coming soon!\nPlease contact support at support@berseapp.com');
          }}>
            Forgot password?
          </a>
        </ForgotPasswordLink>
        
        <RegisterLink>
          Don't have an account? <Link to="/register">Register here</Link>
        </RegisterLink>
      </Content>
    </Container>
  );
};