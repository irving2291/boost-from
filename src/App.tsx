import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DashboardPage, RequestsPage, AnalyticsPage, SettingsPage } from './pages';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Layout
          currentPath={location.pathname}
          onNavigate={handleNavigation}
          onSearch={handleSearch}
          searchValue={searchQuery}
        >
          <ErrorBoundary>
            <Routes>
              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Main routes */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route
                path="/requests"
                element={<RequestsPage searchQuery={searchQuery} />}
              />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              
              {/* 404 fallback */}
              <Route
                path="*"
                element={
                  <div className="text-center py-12">
                    <h1 className="text-2xl font-bold text-slate-900">Página no encontrada</h1>
                    <p className="text-slate-600 mt-2">La página que buscas no existe.</p>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Ir al Dashboard
                    </button>
                  </div>
                }
              />
            </Routes>
          </ErrorBoundary>
        </Layout>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
