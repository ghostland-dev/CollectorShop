import { createTheme, alpha } from '@mui/material/styles';

// ── Dark TCG Premium Palette ────────────────────────────────────────────────
// Inspired by high-end Pokémon card aesthetics: dark navy + holographic gold
// slate-950: #020617  slate-900: #0f172a  slate-800: #1e293b  slate-700: #334155
// amber-400: #fbbf24  amber-500: #f59e0b  amber-600: #d97706
// violet-500: #8b5cf6  violet-400: #a78bfa
// ────────────────────────────────────────────────────────────────────────────

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#f59e0b',       // amber-500 (Pokémon gold)
      light: '#fbbf24',      // amber-400
      dark: '#d97706',       // amber-600
      contrastText: '#0f172a',
    },
    secondary: {
      main: '#8b5cf6',       // violet-500 (legendary/rare)
      light: '#a78bfa',      // violet-400
      dark: '#7c3aed',       // violet-600
      contrastText: '#ffffff',
    },
    background: {
      default: '#0f172a',    // slate-900
      paper: '#1e293b',      // slate-800
    },
    text: {
      primary: '#f8fafc',    // slate-50
      secondary: '#94a3b8',  // slate-400
    },
    divider: 'rgba(248, 250, 252, 0.08)',
    success: {
      main: '#10b981',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f59e0b',
      contrastText: '#0f172a',
    },
    error: {
      main: '#ef4444',
      contrastText: '#ffffff',
    },
    info: {
      main: '#38bdf8',
      contrastText: '#0f172a',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'sans-serif',
    ].join(','),
    h1: { fontFamily: 'Rajdhani, Inter, sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontFamily: 'Rajdhani, Inter, sans-serif', fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontFamily: 'Rajdhani, Inter, sans-serif', fontWeight: 600 },
    h4: { fontFamily: 'Rajdhani, Inter, sans-serif', fontWeight: 600 },
    h5: { fontFamily: 'Rajdhani, Inter, sans-serif', fontWeight: 600 },
    h6: { fontFamily: 'Rajdhani, Inter, sans-serif', fontWeight: 600 },
    button: { fontWeight: 600, letterSpacing: '0.03em' },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: '#0f172a',
          scrollbarWidth: 'thin',
          scrollbarColor: '#334155 #0f172a',
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-track': { background: '#0f172a' },
          '&::-webkit-scrollbar-thumb': { background: '#334155', borderRadius: 3 },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
          transition: 'all 0.2s ease',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: '#0f172a',
          boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
          '&:hover': {
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            boxShadow: '0 6px 20px rgba(245, 158, 11, 0.5)',
            transform: 'translateY(-1px)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)',
          '&:hover': {
            background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
            boxShadow: '0 6px 20px rgba(139, 92, 246, 0.5)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderColor: 'rgba(245, 158, 11, 0.4)',
          '&:hover': {
            borderColor: '#f59e0b',
            background: alpha('#f59e0b', 0.08),
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: '#1e293b',
          border: '1px solid rgba(248, 250, 252, 0.06)',
          borderRadius: 12,
          transition: 'all 0.25s ease',
          '&:hover': {
            border: '1px solid rgba(245, 158, 11, 0.4)',
            boxShadow: '0 8px 32px rgba(245, 158, 11, 0.15), 0 0 0 1px rgba(245, 158, 11, 0.1)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: '#1e293b',
          backgroundImage: 'none',
          border: '1px solid rgba(248, 250, 252, 0.06)',
        },
        elevation3: {
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(245, 158, 11, 0.15)',
          boxShadow: '0 1px 20px rgba(0,0,0,0.5)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
        colorPrimary: {
          background: alpha('#f59e0b', 0.15),
          color: '#f59e0b',
          border: '1px solid rgba(245, 158, 11, 0.3)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            background: 'rgba(15, 23, 42, 0.5)',
            '& fieldset': {
              borderColor: 'rgba(248, 250, 252, 0.12)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(245, 158, 11, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#f59e0b',
              boxShadow: '0 0 0 2px rgba(245, 158, 11, 0.15)',
            },
          },
          '& label.Mui-focused': {
            color: '#f59e0b',
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(248, 250, 252, 0.08)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
        standardInfo: {
          background: alpha('#38bdf8', 0.1),
          border: '1px solid rgba(56, 189, 248, 0.25)',
        },
        standardWarning: {
          background: alpha('#f59e0b', 0.1),
          border: '1px solid rgba(245, 158, 11, 0.25)',
        },
        standardError: {
          background: alpha('#ef4444', 0.1),
          border: '1px solid rgba(239, 68, 68, 0.25)',
        },
        standardSuccess: {
          background: alpha('#10b981', 0.1),
          border: '1px solid rgba(16, 185, 129, 0.25)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontFamily: 'Rajdhani, Inter, sans-serif',
          fontSize: '0.95rem',
        },
      },
    },
  },
});
