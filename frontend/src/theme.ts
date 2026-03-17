import { createTheme } from '@mui/material/styles';

// Emerald palette
// emerald-500: #10b981, emerald-600: #059669, emerald-700: #047857
// emerald-400: #34d399, emerald-800: #065f46

export const theme = createTheme({
  palette: {
    primary: {
      main: '#059669',    // emerald-600
      light: '#34d399',   // emerald-400
      dark: '#047857',    // emerald-700
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#065f46',    // emerald-800
      light: '#10b981',   // emerald-500
      dark: '#064e3b',    // emerald-900
      contrastText: '#ffffff',
    },
    background: {
      default: '#f0fdf4',   // emerald-50
      paper: '#ffffff',
    },
    success: {
      main: '#10b981',
    },
    info: {
      main: '#0d9488',      // teal-600 (complementary)
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(5, 150, 105, 0.08)',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(5, 150, 105, 0.18)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%)',
          boxShadow: '0 2px 12px rgba(5, 150, 105, 0.3)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: '#059669',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#059669',
            },
          },
          '& label.Mui-focused': {
            color: '#059669',
          },
        },
      },
    },
  },
});
