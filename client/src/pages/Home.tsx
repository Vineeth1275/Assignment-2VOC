import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HomeContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.xl};
  color: white;
  text-align: center;
`;

const Content = styled.div`
  max-width: 600px;
`;

const Title = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['5xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin-bottom: ${props => props.theme.spacing.lg};
  color: white;
`;

const Subtitle = styled.p`
  font-size: ${props => props.theme.typography.fontSize.xl};
  margin-bottom: ${props => props.theme.spacing['2xl']};
  opacity: 0.9;
  color: white;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.lg};
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled(Link)`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing['2xl']};
  border-radius: ${props => props.theme.borderRadius.full};
  text-decoration: none;
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  transition: all ${props => props.theme.transitions.fast};
  display: inline-block;

  &.primary {
    background: white;
    color: #667eea;

    &:hover {
      background: #f8f9fa;
      transform: translateY(-2px);
      box-shadow: ${props => props.theme.shadows.lg};
    }
  }

  &.secondary {
    background: transparent;
    color: white;
    border: 2px solid white;

    &:hover {
      background: white;
      color: #667eea;
      transform: translateY(-2px);
    }
  }
`;

const Home: React.FC = () => {
  return (
    <HomeContainer>
      <Content>
        <Title>Track Your Anime Journey</Title>
        <Subtitle>
          Organize your watchlist, discover new series, join communities, and never miss an episode again.
        </Subtitle>
        <ButtonGroup>
          <Button to="/register" className="primary">
            Get Started
          </Button>
          <Button to="/login" className="secondary">
            Sign In
          </Button>
        </ButtonGroup>
      </Content>
    </HomeContainer>
  );
};

export default Home;