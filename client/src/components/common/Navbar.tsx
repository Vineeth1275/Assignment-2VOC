import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { Search, Bell, User, Settings, LogOut, Menu, X, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import SearchBar from './SearchBar';
import UserMenu from './UserMenu';

const NavContainer = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: ${props => props.theme.zIndex.navbar};
  background: ${props => props.theme.colors.surface}cc;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${props => props.theme.colors.border};
  transition: all ${props => props.theme.transitions.fast};
`;

const NavContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 ${props => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    padding: 0 ${props => props.theme.spacing.md};
  }
`;

const Logo = styled(Link)`
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  background: ${props => props.theme.colors.gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-decoration: none;

  &:hover {
    text-decoration: none;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    display: none;
  }
`;

const NavLink = styled(Link)<{ $isActive?: boolean }>`
  color: ${props => props.$isActive ? props.theme.colors.primary : props.theme.colors.textSecondary};
  font-weight: ${props => props.$isActive ? props.theme.typography.fontWeight.semibold : props.theme.typography.fontWeight.medium};
  text-decoration: none;
  transition: color ${props => props.theme.transitions.fast};

  &:hover {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
  }
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const IconButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: transparent;
  color: ${props => props.theme.colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background: ${props => props.theme.colors.surfaceVariant};
    color: ${props => props.theme.colors.primary};
  }
`;

const MobileMenuButton = styled(IconButton)`
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    display: none;
  }
`;

const MobileMenu = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  transform: translateY(${props => props.$isOpen ? '0' : '-100%'});
  opacity: ${props => props.$isOpen ? '1' : '0'};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: all ${props => props.theme.transitions.normal};
  z-index: ${props => props.theme.zIndex.dropdown};
  
  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    display: none;
  }
`;

const MobileMenuContent = styled.div`
  padding: ${props => props.theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const MobileNavLink = styled(Link)<{ $isActive?: boolean }>`
  color: ${props => props.$isActive ? props.theme.colors.primary : props.theme.colors.text};
  font-weight: ${props => props.$isActive ? props.theme.typography.fontWeight.semibold : props.theme.typography.fontWeight.medium};
  text-decoration: none;
  padding: ${props => props.theme.spacing.sm} 0;
  border-bottom: 1px solid ${props => props.theme.colors.borderLight};

  &:hover {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const SearchContainer = styled.div`
  flex: 1;
  max-width: 500px;
  margin: 0 ${props => props.theme.spacing.lg};

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    display: none;
  }
`;

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/watchlist', label: 'My List' },
    { path: '/clubs', label: 'Clubs' },
    { path: '/reviews', label: 'Reviews' },
  ];

  return (
    <>
      <NavContainer>
        <NavContent>
          <Logo to={user ? '/dashboard' : '/'}>
            AnimeTracker
          </Logo>

          {user && (
            <SearchContainer>
              <SearchBar />
            </SearchContainer>
          )}

          {user && (
            <NavLinks>
              {navItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  $isActive={isActiveRoute(item.path)}
                >
                  {item.label}
                </NavLink>
              ))}
            </NavLinks>
          )}

          <NavActions>
            <IconButton onClick={toggleTheme} title="Toggle theme">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </IconButton>

            {user ? (
              <>
                <IconButton title="Notifications">
                  <Bell size={20} />
                </IconButton>
                
                <UserMenu />
              </>
            ) : (
              <>
                <NavLink to="/login">Login</NavLink>
                <NavLink to="/register">Register</NavLink>
              </>
            )}

            {user && (
              <MobileMenuButton
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                title="Menu"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </MobileMenuButton>
            )}
          </NavActions>
        </NavContent>
      </NavContainer>

      {user && (
        <MobileMenu $isOpen={isMobileMenuOpen}>
          <MobileMenuContent>
            {navItems.map(item => (
              <MobileNavLink
                key={item.path}
                to={item.path}
                $isActive={isActiveRoute(item.path)}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </MobileNavLink>
            ))}
            
            <MobileNavLink to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
              Profile
            </MobileNavLink>
            
            <MobileNavLink to="/settings" onClick={() => setIsMobileMenuOpen(false)}>
              Settings
            </MobileNavLink>
            
            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                textAlign: 'left',
                padding: '8px 0',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </MobileMenuContent>
        </MobileMenu>
      )}
    </>
  );
};

export default Navbar;