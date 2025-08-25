import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: ${props => props.theme.spacing.xl} 0;
`;

const AdminPanel: React.FC = () => {
  return (
    <Container>
      <h1>Admin Panel</h1>
      <p>This page will provide admin controls for managing users, content, and system settings.</p>
    </Container>
  );
};

export default AdminPanel;