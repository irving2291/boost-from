import React from 'react';
import { WifiHigh, WifiSlash, ArrowsClockwise } from '@phosphor-icons/react';
import { Badge } from '../ui';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { cn } from '../../utils';

const NetworkIndicator: React.FC = () => {
  const { isOnline, isReconnecting } = useNetworkStatus();

  if (isOnline && !isReconnecting) {
    return (
      <Badge
        variant="success"
        size="sm"
        className="flex items-center space-x-1"
      >
        <WifiHigh size={12} />
        <span>Conectado</span>
      </Badge>
    );
  }

  if (isReconnecting) {
    return (
      <Badge
        variant="warning"
        size="sm"
        className="flex items-center space-x-1"
      >
        <ArrowsClockwise size={12} className="animate-spin" />
        <span>Reconectando...</span>
      </Badge>
    );
  }

  return (
    <Badge
      variant="danger"
      size="sm"
      className="flex items-center space-x-1"
    >
      <WifiSlash size={12} />
      <span>Sin conexión</span>
    </Badge>
  );
};

export { NetworkIndicator };