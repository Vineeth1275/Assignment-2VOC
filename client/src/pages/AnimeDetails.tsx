import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  padding: ${props => props.theme.spacing.xl} 0;
`;

const AnimeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <Container>
      <h1>Anime Details</h1>
      <p>Anime ID: {id}</p>
      <p>This page will show detailed anime information, reviews, and watchlist actions.</p>
    </Container>
  );
};

export default AnimeDetails;