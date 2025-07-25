import React, { useState } from 'react';
import { User, Gear, SignOut, CaretDown } from '@phosphor-icons/react';
import { SearchInput, Button } from '../ui';
import { NetworkIndicator } from './NetworkIndicator';
import { cn, getInitials } from '../../utils';
import { debounce } from '../../utils';

interface HeaderProps {
  onSearch?: (query: string) => void;
  searchValue?: string;
  className?: string;
  isMobile?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onSearch,
  searchValue = '',
  className,
  isMobile = false
}) => {
  const [searchQuery, setSearchQuery] = useState(searchValue);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Debounced search function
  const debouncedSearch = React.useMemo(
    () => debounce((query: string) => {
      if (onSearch) {
        onSearch(query);
      }
    }, 300),
    [onSearch]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const handleSearchClear = () => {
    setSearchQuery('');
    if (onSearch) {
      onSearch('');
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  // Mock user data - replace with actual user context
  const user = {
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@empresa.com',
    avatar: null, // URL to avatar image
  };

  // Mobile layout - just search
  if (isMobile) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <SearchInput
            placeholder="Buscar..."
            value={searchQuery}
            onChange={handleSearchChange}
            onClear={handleSearchClear}
            className="w-full"
          />
        </div>
        <NetworkIndicator />
      </div>
    );
  }

  // Desktop layout
  return (
    <header className={cn(
      'bg-white border-b border-slate-200 shadow-sm',
      'sticky top-0 z-40',
      className
    )}>
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left side - Search */}
        <div className="flex-1 max-w-md">
          <SearchInput
            placeholder="Buscar requests, clientes..."
            value={searchQuery}
            onChange={handleSearchChange}
            onClear={handleSearchClear}
            className="w-full"
          />
        </div>

        {/* Right side - Network indicator and User menu */}
        <div className="flex items-center space-x-4">
          {/* Network Status Indicator */}
          <NetworkIndicator />

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDropdown}
              className="flex items-center space-x-2 px-3 py-2"
            >
              {/* User Avatar */}
              <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(user.firstName, user.lastName)
                )}
              </div>
              
              {/* User Name */}
              <span className="text-sm font-medium text-slate-700 hidden sm:block">
                {user.firstName} {user.lastName}
              </span>
              
              {/* Dropdown Arrow */}
              <CaretDown 
                size={16} 
                className={cn(
                  'text-slate-500 transition-transform duration-200',
                  isDropdownOpen && 'rotate-180'
                )}
              />
            </Button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={closeDropdown}
                />
                
                {/* Menu */}
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-elegant-lg border border-slate-200 z-20 animate-fade-in">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {user.email}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      onClick={() => {
                        closeDropdown();
                        // Handle profile action
                        console.log('Profile clicked');
                      }}
                    >
                      <User size={16} className="mr-3 text-slate-500" />
                      Perfil
                    </button>
                    
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      onClick={() => {
                        closeDropdown();
                        // Handle settings action
                        console.log('Settings clicked');
                      }}
                    >
                      <Gear size={16} className="mr-3 text-slate-500" />
                      Configuración
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-slate-100 py-1">
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      onClick={() => {
                        closeDropdown();
                        // Handle logout action
                        console.log('Logout clicked');
                      }}
                    >
                      <SignOut size={16} className="mr-3" />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export { Header };