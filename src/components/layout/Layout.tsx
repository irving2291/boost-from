import React, { useState, useEffect } from 'react';
import { List } from '@phosphor-icons/react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Button } from '../ui';
import { cn } from '../../utils';

interface LayoutProps {
  children: React.ReactNode;
  currentPath?: string;
  onNavigate?: (path: string) => void;
  onSearch?: (query: string) => void;
  searchValue?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  currentPath = '/dashboard',
  onNavigate,
  onSearch,
  searchValue = '',
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false); // Close mobile sidebar on desktop
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    }
    // Close sidebar on mobile after navigation
    if (isMobile) {
      closeSidebar();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header with Menu Button */}
      <div className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center justify-between h-14 px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="p-2"
          >
            <List size={20} />
          </Button>
          <h1 className="text-lg font-semibold text-slate-900">CRM System</h1>
          <div className="w-8"></div> {/* Spacer for centering */}
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <Sidebar
            currentPath={currentPath}
            onNavigate={handleNavigation}
            className="fixed left-0 top-0 h-full z-30"
          />
        </div>

        {/* Mobile Sidebar */}
        <div className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
          <Sidebar
            currentPath={currentPath}
            onNavigate={handleNavigation}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Desktop Header */}
          <div className="hidden lg:block">
            <Header
              onSearch={onSearch}
              searchValue={searchValue}
              className="sticky top-0 z-20"
            />
          </div>

          {/* Mobile Search Header */}
          <div className="lg:hidden bg-white border-b border-slate-200 p-4">
            <Header
              onSearch={onSearch}
              searchValue={searchValue}
              className="mobile-header"
              isMobile={true}
            />
          </div>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export { Layout };