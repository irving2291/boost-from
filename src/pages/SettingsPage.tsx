import React, { useState } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Database,
  CheckCircle 
} from '@phosphor-icons/react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '../components/ui';

const SettingsPage: React.FC = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
  });

  const [profile, setProfile] = useState({
    name: 'Usuario Demo',
    email: 'usuario@ejemplo.com',
    company: 'Mi Empresa',
    timezone: 'America/Guayaquil',
  });

  const handleNotificationChange = (type: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleProfileChange = (field: keyof typeof profile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
        <p className="text-slate-600 mt-1">
          Ajusta las preferencias del sistema y tu perfil.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User size={20} className="mr-2" />
                Perfil de Usuario
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre completo
                  </label>
                  <Input
                    value={profile.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    placeholder="Tu nombre completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    placeholder="tu@email.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Empresa
                  </label>
                  <Input
                    value={profile.company}
                    onChange={(e) => handleProfileChange('company', e.target.value)}
                    placeholder="Nombre de tu empresa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Zona horaria
                  </label>
                  <select 
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={profile.timezone}
                    onChange={(e) => handleProfileChange('timezone', e.target.value)}
                  >
                    <option value="America/Guayaquil">Ecuador (GMT-5)</option>
                    <option value="America/Lima">Perú (GMT-5)</option>
                    <option value="America/Bogota">Colombia (GMT-5)</option>
                    <option value="America/Mexico_City">México (GMT-6)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <Button variant="primary">
                  Guardar cambios
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell size={20} className="mr-2" />
                Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Notificaciones por email</p>
                  <p className="text-sm text-slate-600">Recibe actualizaciones por correo electrónico</p>
                </div>
                <button
                  onClick={() => handleNotificationChange('email')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.email ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.email ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Notificaciones push</p>
                  <p className="text-sm text-slate-600">Recibe notificaciones en el navegador</p>
                </div>
                <button
                  onClick={() => handleNotificationChange('push')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.push ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.push ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">SMS</p>
                  <p className="text-sm text-slate-600">Recibe alertas importantes por SMS</p>
                </div>
                <button
                  onClick={() => handleNotificationChange('sms')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.sms ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.sms ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Settings */}
        <div className="space-y-6">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield size={20} className="mr-2" />
                Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Cambiar contraseña
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Autenticación 2FA
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Sesiones activas
              </Button>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette size={20} className="mr-2" />
                Apariencia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Tema</p>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Claro</option>
                  <option>Oscuro</option>
                  <option>Automático</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database size={20} className="mr-2" />
                Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm">
                <CheckCircle size={16} className="text-green-500 mr-2" />
                <span>Sistema actualizado</span>
              </div>
              <div className="text-xs text-slate-500">
                Versión 1.0.0
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Verificar actualizaciones
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export { SettingsPage };