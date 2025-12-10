import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../theme';
import { HomePage } from '../pages/HomePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          {component}
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('HomePage', () => {
  it('affiche le titre principal', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText('Bienvenue sur Collector.shop')).toBeInTheDocument();
  });

  it('affiche le lien vers le catalogue', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText('Découvrir le catalogue')).toBeInTheDocument();
  });
});
