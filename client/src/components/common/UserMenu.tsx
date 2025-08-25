import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const MenuContainer = styled.div`
  position: relative;
`;

const MenuTrigger = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: transparent;
  color: ${props => props.theme.colors.text};
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.surfaceVariant};
  }
`;

const Avatar = styled.div<{ $src?: string }>`
  width: 32px;
  height: 32px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => props.$src ? `url(${props.$src})` : props.theme.colors.gradient};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const MenuDropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: ${props => props.theme.spacing.sm};
  min-width: 200px;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.lg};
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.$isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all ${props => props.theme.transitions.fast};
  z-index: ${props => props.theme.zIndex.dropdown};
`;

const MenuHeader = styled.div`
  padding: ${props => props.theme.spacing.md};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const UserName = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const UserEmail = styled.div`
  color: ${props => props.theme.colors.textMuted};
  font-size: ${props => props.theme.typography.fontSize.xs};
  margin-top: 2px;
`;

const MenuList = styled.div`
  padding: ${props => props.theme.spacing.sm};
`;

const MenuItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text};
  text-decoration: none;
  font-size: ${props => props.theme.typography.fontSize.sm};
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.surfaceVariant};
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const MenuButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  width: 100%;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  background: none;
  border: none;
  color: ${props => props.theme.colors.text};
  text-decoration: none;
  font-size: ${props => props.theme.typography.fontSize.sm};
  text-align: left;
  transition: all ${props => props.theme.transitions.fast};
  cursor: pointer;

  &:hover {
    background: ${props => props.theme.colors.surfaceVariant};
    color: ${props => props.theme.colors.error};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <MenuContainer ref={menuRef}>
      <MenuTrigger onClick={() => setIsOpen(!isOpen)}>
        <Avatar $src={user.avatar}>
          {!user.avatar && getInitials(user.username)}
        </Avatar>
        <ChevronDown size={16} />
      </MenuTrigger>

      <MenuDropdown $isOpen={isOpen}>
        <MenuHeader>
          <UserName>{user.username}</UserName>
          <UserEmail>{user.email}</UserEmail>
        </MenuHeader>

        <MenuList>
          <MenuItem to="/profile" onClick={() => setIsOpen(false)}>
            <User />
            Profile
          </MenuItem>
          
          <MenuItem to="/settings" onClick={() => setIsOpen(false)}>
            <Settings />
            Settings
          </MenuItem>
          
          {user.role === 'admin' && (
            <MenuItem to="/admin" onClick={() => setIsOpen(false)}>
              <Settings />
              Admin Panel
            </MenuItem>
          )}
          
          <MenuButton onClick={handleLogout}>
            <LogOut />
            Logout
          </MenuButton>
        </MenuList>
      </MenuDropdown>
    </MenuContainer>
  );
};

export default UserMenu;