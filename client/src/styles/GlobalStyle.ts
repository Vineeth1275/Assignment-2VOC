import { createGlobalStyle } from 'styled-components';
import { Theme } from './theme';

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
    font-size: 16px;
  }

  body {
    font-family: ${props => props.theme.typography.fontFamily};
    font-size: ${props => props.theme.typography.fontSize.base};
    line-height: ${props => props.theme.typography.lineHeight.normal};
    color: ${props => props.theme.colors.text};
    background-color: ${props => props.theme.colors.background};
    transition: background-color ${props => props.theme.transitions.normal}, 
                color ${props => props.theme.transitions.normal};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    line-height: ${props => props.theme.typography.lineHeight.tight};
    margin-bottom: ${props => props.theme.spacing.md};
    color: ${props => props.theme.colors.text};
  }

  h1 {
    font-size: ${props => props.theme.typography.fontSize['3xl']};
    font-weight: ${props => props.theme.typography.fontWeight.bold};
  }

  h2 {
    font-size: ${props => props.theme.typography.fontSize['2xl']};
  }

  h3 {
    font-size: ${props => props.theme.typography.fontSize.xl};
  }

  h4 {
    font-size: ${props => props.theme.typography.fontSize.lg};
  }

  h5 {
    font-size: ${props => props.theme.typography.fontSize.base};
  }

  h6 {
    font-size: ${props => props.theme.typography.fontSize.sm};
  }

  p {
    margin-bottom: ${props => props.theme.spacing.md};
    color: ${props => props.theme.colors.textSecondary};
    line-height: ${props => props.theme.typography.lineHeight.relaxed};
  }

  a {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
    transition: color ${props => props.theme.transitions.fast};

    &:hover {
      color: ${props => props.theme.colors.primaryDark};
      text-decoration: underline;
    }
  }

  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    background: none;
    transition: all ${props => props.theme.transitions.fast};

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
    border: 1px solid ${props => props.theme.colors.border};
    border-radius: ${props => props.theme.borderRadius.md};
    padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
    background-color: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
    transition: border-color ${props => props.theme.transitions.fast},
                box-shadow ${props => props.theme.transitions.fast};

    &:focus {
      outline: none;
      border-color: ${props => props.theme.colors.primary};
      box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
    }

    &::placeholder {
      color: ${props => props.theme.colors.textMuted};
    }
  }

  textarea {
    resize: vertical;
    min-height: 100px;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  ul, ol {
    padding-left: ${props => props.theme.spacing.lg};
    margin-bottom: ${props => props.theme.spacing.md};
  }

  li {
    margin-bottom: ${props => props.theme.spacing.xs};
  }

  blockquote {
    border-left: 4px solid ${props => props.theme.colors.primary};
    padding-left: ${props => props.theme.spacing.md};
    margin: ${props => props.theme.spacing.lg} 0;
    font-style: italic;
    color: ${props => props.theme.colors.textSecondary};
  }

  code {
    background-color: ${props => props.theme.colors.surfaceVariant};
    color: ${props => props.theme.colors.primary};
    padding: 2px 6px;
    border-radius: ${props => props.theme.borderRadius.sm};
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.875em;
  }

  pre {
    background-color: ${props => props.theme.colors.surfaceVariant};
    color: ${props => props.theme.colors.text};
    padding: ${props => props.theme.spacing.md};
    border-radius: ${props => props.theme.borderRadius.md};
    overflow-x: auto;
    margin-bottom: ${props => props.theme.spacing.md};

    code {
      background: none;
      padding: 0;
    }
  }

  hr {
    border: none;
    border-top: 1px solid ${props => props.theme.colors.border};
    margin: ${props => props.theme.spacing.xl} 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: ${props => props.theme.spacing.md};
  }

  th, td {
    padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
    text-align: left;
    border-bottom: 1px solid ${props => props.theme.colors.border};
  }

  th {
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
    background-color: ${props => props.theme.colors.surface};
  }

  /* Scrollbar styles */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.surface};
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border};
    border-radius: ${props => props.theme.borderRadius.full};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.colors.textMuted};
  }

  /* Selection styles */
  ::selection {
    background-color: ${props => props.theme.colors.primary}30;
    color: ${props => props.theme.colors.text};
  }

  /* Focus styles for accessibility */
  *:focus-visible {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }

  /* Animation classes */
  .fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }

  .slide-up {
    animation: slideUp 0.3s ease-out;
  }

  .scale-in {
    animation: scaleIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes scaleIn {
    from {
      transform: scale(0.9);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  /* Utility classes */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .text-truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .text-center {
    text-align: center;
  }

  .text-right {
    text-align: right;
  }

  .text-left {
    text-align: left;
  }

  .flex {
    display: flex;
  }

  .flex-col {
    flex-direction: column;
  }

  .items-center {
    align-items: center;
  }

  .justify-center {
    justify-content: center;
  }

  .justify-between {
    justify-content: space-between;
  }

  .gap-2 {
    gap: ${props => props.theme.spacing.sm};
  }

  .gap-4 {
    gap: ${props => props.theme.spacing.md};
  }

  .gap-6 {
    gap: ${props => props.theme.spacing.lg};
  }

  .mb-2 {
    margin-bottom: ${props => props.theme.spacing.sm};
  }

  .mb-4 {
    margin-bottom: ${props => props.theme.spacing.md};
  }

  .mb-6 {
    margin-bottom: ${props => props.theme.spacing.lg};
  }

  .mt-2 {
    margin-top: ${props => props.theme.spacing.sm};
  }

  .mt-4 {
    margin-top: ${props => props.theme.spacing.md};
  }

  .mt-6 {
    margin-top: ${props => props.theme.spacing.lg};
  }

  .p-2 {
    padding: ${props => props.theme.spacing.sm};
  }

  .p-4 {
    padding: ${props => props.theme.spacing.md};
  }

  .p-6 {
    padding: ${props => props.theme.spacing.lg};
  }

  .rounded {
    border-radius: ${props => props.theme.borderRadius.md};
  }

  .rounded-lg {
    border-radius: ${props => props.theme.borderRadius.lg};
  }

  .shadow {
    box-shadow: ${props => props.theme.shadows.md};
  }

  .shadow-lg {
    box-shadow: ${props => props.theme.shadows.lg};
  }

  /* Responsive utilities */
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    .hidden-mobile {
      display: none;
    }
  }

  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    .hidden-desktop {
      display: none;
    }
  }
`;