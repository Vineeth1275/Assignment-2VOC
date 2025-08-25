import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: ${props => props.theme.spacing.xl} 0;
`;

const Reviews: React.FC = () => {
  return (
    <Container>
      <h1>Reviews</h1>
      <p>This page will show anime reviews and allow users to write their own reviews.</p>
    </Container>
  );
};

export default Reviews;