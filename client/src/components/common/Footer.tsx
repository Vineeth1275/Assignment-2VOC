import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background: ${props => props.theme.colors.surface};
  border-top: 1px solid ${props => props.theme.colors.border};
  padding: ${props => props.theme.spacing.lg};
  text-align: center;
  color: ${props => props.theme.colors.textMuted};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <p>&copy; 2024 AnimeTracker. All rights reserved.</p>
    </FooterContainer>
  );
};

export default Footer;