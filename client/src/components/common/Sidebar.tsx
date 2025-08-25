import React from 'react';
import styled from 'styled-components';

const SidebarContainer = styled.aside`
  width: 280px;
  position: fixed;
  left: 0;
  top: 70px;
  bottom: 0;
  background: ${props => props.theme.colors.surface};
  border-right: 1px solid ${props => props.theme.colors.border};
  padding: ${props => props.theme.spacing.lg};
  overflow-y: auto;
  
  @media (max-width: ${props => props.theme.breakpoints.desktop}) {
    display: none;
  }
`;

const Sidebar: React.FC = () => {
  return (
    <SidebarContainer>
      <p>Sidebar content will go here</p>
    </SidebarContainer>
  );
};

export default Sidebar;