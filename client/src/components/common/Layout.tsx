import React, { ReactNode } from 'react';
import styled from 'styled-components';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.div<{ $showSidebar: boolean }>`
  flex: 1;
  display: flex;
  padding-top: 70px; /* Account for fixed navbar */
  
  ${props => props.$showSidebar && `
    @media (min-width: ${props.theme.breakpoints.desktop}) {
      margin-left: 280px;
    }
  `}
`;

const Content = styled.main`
  flex: 1;
  padding: ${props => props.theme.spacing.xl};
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    padding: ${props => props.theme.spacing.lg};
  }

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: ${props => props.theme.spacing.md};
  }
`;

const Layout: React.FC<LayoutProps> = ({ children, showSidebar = true }) => {
  return (
    <LayoutContainer>
      <Navbar />
      
      <MainContent $showSidebar={showSidebar}>
        {showSidebar && <Sidebar />}
        
        <Content>
          {children}
        </Content>
      </MainContent>
      
      <Footer />
    </LayoutContainer>
  );
};

export default Layout;