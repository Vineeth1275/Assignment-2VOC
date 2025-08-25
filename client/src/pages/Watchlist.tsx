import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: ${props => props.theme.spacing.xl} 0;
`;

const Watchlist: React.FC = () => {
  return (
    <Container>
      <h1>My Watchlist</h1>
      <p>This page will show the user's anime watchlist with filtering and sorting options.</p>
    </Container>
  );
};

export default Watchlist;