'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { AiProviderDropdown } from './chat/ai-provider-dropdown';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Modal from '@/components/ui/modal';
import { 
  Settings, 
  Bot, 
  Palette, 
  Globe, 
  Shield, 
  Zap, 
  Moon, 
  Sun, 
  Volume2, 
  Bell,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Save,
  X,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { DescriptionList, DescriptionTerm, DescriptionDetails } from '@/components/catalyst-ui-kit/description-list';
import { AIProvider, AI_PROVIDERS } from '@/lib/types';
import { useSettings } from '@/lib/settings-context';

interface LocalSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SettingsState {
  selectedProvider: AIProvider;
  temperature: number;
  maxTokens: number;
  theme: 'light' | 'dark' | 'auto';
  language: 'ru' | 'en';
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
  soundEnabled: boolean;
  desktopNotifications: boolean;
  emailNotifications: boolean;
  saveHistory: boolean;
  encryptData: boolean;
  autoLogout: number;
  streamingEnabled: boolean;
  cacheEnabled: boolean;
  preloadModels: boolean;
}

export function LocalSettings({ isOpen, onClose }: LocalSettingsProps) {
  const { systemPrompt, setSystemPrompt } = useSettings();
  const [dbSettings, setDbSettings] = useState({
    storageDbHost: '',
    storageDbPort: '',
  });

  useEffect(() => {
    const fetchDbSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setDbSettings(data);
        } else {
          console.error('Failed to fetch db settings');
        }
      } catch (error) {
        console.error('Error fetching db settings:', error);
      }
    };

    if (isOpen) {
      fetchDbSettings();
    }
  }, [isOpen]);
  const [settings, setSettings] = useState<SettingsState>({
    selectedProvider: 'google-gemma',
    temperature: 0.7,
    maxTokens: 2048,
    theme: 'auto',
    language: 'ru',
    fontSize: 'medium',
    compactMode: false,
    soundEnabled: true,
    desktopNotifications: true,
    emailNotifications: false,
    saveHistory: true,
    encryptData: true,
    autoLogout: 30,
    streamingEnabled: true,
    cacheEnabled: true,
    preloadModels: false
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('ai');
  const [testStatus, setTestStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [testUrl, setTestUrl] = useState('');

  const [aiTestStatus, setAiTestStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [aiTestMessage, setAiTestMessage] = useState('');
  const [sentPrompt, setSentPrompt] = useState('');
  const [sentModel, setSentModel] = useState('');

  const updateSetting = useCallback(<K extends keyof SettingsState>(
    key: K, 
    value: SettingsState[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }, []);

  const handleSystemPromptChange = (value: string) => {
    setSystemPrompt(value);
    setHasChanges(true);
  }

  const handleTestConnection = async () => {
    setTestStatus('pending');
    setTestMessage('');
    setTestUrl('');
    try {
      const response = await fetch('/api/db-test', { method: 'POST' });
      const data = await response.json();
      if (data.url) {
        setTestUrl(data.url);
      }
      if (response.ok && data.success) {
        setTestStatus('success');
        setTestMessage(data.message);
      } else {
        setTestStatus('error');
        setTestMessage(data.message || 'Connection failed.');
      }
    } catch (error) {
      setTestStatus('error');
      setTestMessage('An unexpected error occurred.');
    }
  };

  const handleTestAIConnection = async () => {
    setAiTestStatus('pending');
    setAiTestMessage('');
    setSentPrompt('');
    setSentModel('');
    try {
      const response = await fetch('/api/ai-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: settings.selectedProvider,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
          // Add any other relevant AI settings here
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setAiTestStatus('success');
        setAiTestMessage(data.message);
        setSentPrompt(data.testPrompt || '');
        setSentModel(data.modelUsed || '');
      } else {
        setAiTestStatus('error');
        setAiTestMessage(data.message || 'AI test failed.');
        setSentPrompt(data.testPrompt || '');
        setSentModel(data.modelUsed || '');
      }
    } catch (error) {
      setAiTestStatus('error');
      setAiTestMessage('An unexpected error occurred during AI test.');
    }
  };

  const handleProviderChange = useCallback((provider: AIProvider) => {
    updateSetting('selectedProvider', provider);
  }, [updateSetting]);

  const handleSave = useCallback(async () => {
    try {
      console.log('Saving settings:', { ...settings, systemPrompt });
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }, [settings, systemPrompt]);

  const handleReset = useCallback(() => {
    setSettings({
      selectedProvider: 'google-gemma',
      temperature: 0.7,
      maxTokens: 2048,
      theme: 'auto',
      language: 'ru',
      fontSize: 'medium',
      compactMode: false,
      soundEnabled: true,
      desktopNotifications: true,
      emailNotifications: false,
      saveHistory: true,
      encryptData: true,
      autoLogout: 30,
      streamingEnabled: true,
      cacheEnabled: true,
      preloadModels: false
    });
    setSystemPrompt('You AI assistant.');
    setHasChanges(true);
  }, [setSystemPrompt]);

  const handleClose = useCallback(() => {
    if (hasChanges) {
      const confirmClose = window.confirm('У вас есть несохранённые изменения. Закрыть без сохранения?');
      if (!confirmClose) return;
    }
    onClose();
  }, [hasChanges, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <Modal.Header>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg">
            <Settings className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <Modal.Title>
              <span className="text-xl font-semibold text-foreground">
                Настройки приложения
              </span>
            </Modal.Title>
            <p className="text-sm text-muted-foreground mt-1">Настройки могут сохраняться в браузере</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="secondary" className="animate-pulse">
              Есть изменения
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={handleClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Modal.Header>
      
      <Modal.Body>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6 bg-muted text-muted-foreground">
            <TabsTrigger value="ai" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground">
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline">AI</span>
            </TabsTrigger>
            
            <TabsTrigger value="interface" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Интерфейс</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Уведомления</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Безопасность</span>
            </TabsTrigger>
            <TabsTrigger value="storage" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Данные</span>
            </TabsTrigger>
          </TabsList>

          {/* AI Settings Tab */}
          <TabsContent value="ai" className="space-y-6 animate-in fade-in-0 duration-300">
            <Card className="bg-card text-card-foreground border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Bot className="w-5 h-5" />
                  Модель
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Настройте поведение и параметры искусственного интеллекта
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">AI Провайдер</Label>
                  <AiProviderDropdown
                    selectedProvider={settings.selectedProvider}
                    onProviderChange={handleProviderChange}
                    availableProviders={AI_PROVIDERS}
                    showStatus={true}
                    compact={false}
                  />
                </div>
                
                <Separator className="bg-border" />
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center justify-between text-foreground">
                      Температура генерации
                      <span className="text-xs text-muted-foreground">{settings.temperature}</span>
                    </Label>
                    <Slider
                      value={[settings.temperature]}
                      onValueChange={([value]) => updateSetting('temperature', value)}
                      max={2}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Контролирует креативность ответов. Низкие значения - более точные ответы, высокие - более креативные.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Максимальное количество токенов</Label>
                    <Input
                      type="number"
                      value={settings.maxTokens}
                      onChange={(e) => updateSetting('maxTokens', parseInt(e.target.value) || 2048)}
                      min={100}
                      max={8192}
                      className="bg-input text-foreground border-border focus:ring-ring focus:border-primary"
                    />
                    <p className="text-xs text-muted-foreground">
                      Максимальная длина ответа ИИ. Больше токенов = более длинные ответы.
                    </p>
                  </div>
                </div>
                <Separator className="bg-border" />

                <div className="mt-4 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      onClick={handleTestAIConnection}
                      disabled={aiTestStatus === 'pending'}
                    >
                      {aiTestStatus === 'pending' ? 'Тестирование AI...' : 'Тест AI'}
                    </Button>
                    {aiTestStatus !== 'idle' && aiTestStatus !== 'pending' && (
                      <div className="flex items-center gap-2">
                        {aiTestStatus === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                        {aiTestStatus === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
                        <span className={`text-sm ${aiTestStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                          {aiTestMessage}
                        </span>
                      </div>
                    )}
                  </div>
                  {(aiTestStatus !== 'idle' && aiTestStatus !== 'pending') && (
                    <div className="space-y-2 text-sm bg-muted p-3 rounded-md">
                      {sentPrompt && (
                        <div>
                          <span className="font-medium">Отправленный промпт:</span>
                          <p className="text-muted-foreground break-words">{sentPrompt}</p>
                        </div>
                      )}
                      {sentModel && (
                        <div>
                          <span className="font-medium">Использованная модель:</span>
                          <p className="text-muted-foreground">{sentModel}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card text-card-foreground border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Bot className="w-5 h-5" />
                      Системный промпт
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Базовые инструкции, которые определяют контекст AI.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Textarea
                        value={systemPrompt}
                        onChange={(e) => handleSystemPromptChange(e.target.value)}
                        rows={15}
                        placeholder="Введите инструкции для ИИ..."
                        className="bg-input text-foreground border-border focus:ring-ring focus:border-primary"
                      />
                    </div>
                  </CardContent>
                </Card>
          </TabsContent>

          {/* Interface Settings Tab */}
          <TabsContent value="interface" className="space-y-6 animate-in fade-in-0 duration-300">
            <Card className="bg-card text-card-foreground border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Palette className="w-5 h-5" />
                  Настройки интерфейса
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Настройте внешний вид и поведение интерфейса
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Тема оформления</Label>
                    <select 
                      value={settings.theme} 
                      onChange={(e) => updateSetting('theme', e.target.value as 'light' | 'dark' | 'auto')}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-input px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground"
                    >
                      <option value="light">☀️ Светлая</option>
                      <option value="dark">🌙 Тёмная</option>
                      <option value="auto">🌍 Автоматически</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Язык интерфейса</Label>
                    <select 
                      value={settings.language} 
                      onChange={(e) => updateSetting('language', e.target.value as 'ru' | 'en')}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-input px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground"
                    >
                      <option value="ru">🇷🇺 Русский</option>
                      <option value="en">🇺🇸 Английский</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Размер шрифта</Label>
                    <select 
                      value={settings.fontSize} 
                      onChange={(e) => updateSetting('fontSize', e.target.value as 'small' | 'medium' | 'large')}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-input px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground"
                    >
                      <option value="small">Маленький</option>
                      <option value="medium">Средний</option>
                      <option value="large">Большой</option>
                    </select>
                  </div>
                </div>
                
                <Separator className="bg-border" />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-foreground">Компактный режим</Label>
                    <p className="text-xs text-muted-foreground">Уменьшает отступы и размеры элементов</p>
                  </div>
                  <Switch
                    checked={settings.compactMode}
                    onCheckedChange={(checked) => updateSetting('compactMode', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6 animate-in fade-in-0 duration-300">
            <Card className="bg-card text-card-foreground border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Bell className="w-5 h-5" />
                  Уведомления
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Настройте способы получения уведомлений
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium flex items-center gap-2 text-foreground">
                        <Volume2 className="w-4 h-4" />
                        Звуковые уведомления
                      </Label>
                      <p className="text-xs text-muted-foreground">Воспроизводить звук при получении ответа</p>
                    </div>
                    <Switch
                      checked={settings.soundEnabled}
                      onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-foreground">Уведомления на рабочем столе</Label>
                      <p className="text-xs text-muted-foreground">Показывать всплывающие уведомления</p>
                    </div>
                    <Switch
                      checked={settings.desktopNotifications}
                      onCheckedChange={(checked) => updateSetting('desktopNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-foreground">Email уведомления</Label>
                      <p className="text-xs text-muted-foreground">Отправлять важные уведомления на email</p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy & Security Tab */}
          <TabsContent value="privacy" className="space-y-6 animate-in fade-in-0 duration-300">
            <Card className="bg-card text-card-foreground border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Shield className="w-5 h-5" />
                  Приватность и безопасность
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Управляйте конфиденциальностью ваших данных
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-foreground">Сохранять историю чатов</Label>
                      <p className="text-xs text-muted-foreground">Локальное сохранение переписки</p>
                    </div>
                    <Switch
                      checked={settings.saveHistory}
                      onCheckedChange={(checked) => updateSetting('saveHistory', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-foreground">Шифрование данных</Label>
                      <p className="text-xs text-muted-foreground">Шифровать сохранённые данные</p>
                    </div>
                    <Switch
                      checked={settings.encryptData}
                      onCheckedChange={(checked) => updateSetting('encryptData', checked)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Автоматический выход (минуты)</Label>
                    <Input
                      type="number"
                      value={settings.autoLogout}
                      onChange={(e) => updateSetting('autoLogout', parseInt(e.target.value) || 30)}
                      min={5}
                      max={1440}
                      className="bg-input text-foreground border-border focus:ring-ring focus:border-primary"
                    />
                    <p className="text-xs text-muted-foreground">
                      Автоматически завершать сессию после периода неактивности
                    </p>
                  </div>
                </div>
                
                <Separator className="bg-border" />
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center gap-2 text-foreground">
                    <Zap className="w-4 h-4" />
                    Производительность
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-foreground">Потоковая передача</Label>
                      <p className="text-xs text-muted-foreground">Получать ответы по мере генерации</p>
                    </div>
                    <Switch
                      checked={settings.streamingEnabled}
                      onCheckedChange={(checked) => updateSetting('streamingEnabled', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-foreground">Кэширование</Label>
                      <p className="text-xs text-muted-foreground">Сохранять часто используемые данные</p>
                    </div>
                    <Switch
                      checked={settings.cacheEnabled}
                      onCheckedChange={(checked) => updateSetting('cacheEnabled', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-foreground">Предзагрузка моделей</Label>
                      <p className="text-xs text-muted-foreground">Загружать модели заранее для быстрого ответа</p>
                    </div>
                    <Switch
                      checked={settings.preloadModels}
                      onCheckedChange={(checked) => updateSetting('preloadModels', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Storage Tab */}
          <TabsContent value="storage" className="space-y-6 animate-in fade-in-0 duration-300">
            <Card className="bg-card text-card-foreground border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Download className="w-5 h-5" />
                  База данных
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Настройки подключения
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <DescriptionList>
                  <DescriptionTerm>STORAGE_DB_HOST</DescriptionTerm>
                  <DescriptionDetails>
                    {dbSettings.storageDbHost || 'не задано'}
                  </DescriptionDetails>
                  <DescriptionTerm>STORAGE_DB_PORT</DescriptionTerm>
                  <DescriptionDetails>
                    {dbSettings.storageDbPort || 'не задано'}
                  </DescriptionDetails>
                </DescriptionList>
                <div className="mt-4 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      onClick={handleTestConnection}
                      disabled={testStatus === 'pending'}
                    >
                      {testStatus === 'pending' ? 'Тестирование...' : 'Тест подключения'}
                    </Button>
                    {testStatus !== 'idle' && testStatus !== 'pending' && (
                      <div className="flex items-center gap-2">
                        {testStatus === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                        {testStatus === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
                        <span className={`text-sm ${testStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                          {testMessage}
                        </span>
                      </div>
                    )}
                  </div>
                  {(testStatus === 'pending' || testUrl) && (
                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                      {testStatus === 'pending' && !testUrl && <div>Тестирование...</div>}
                      {testUrl && <div className="break-all">URL: {testUrl}</div>}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Modal.Body>
      
      <Modal.Footer className="bg-card border-t border-border">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset} className="text-muted-foreground hover:text-foreground border-border hover:bg-accent">
              <RefreshCw className="w-4 h-4 mr-2" />
              Сбросить
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleClose} className="text-muted-foreground hover:text-foreground border-border hover:bg-accent">
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Save className="w-4 h-4 mr-2" />
              Сохранить
            </Button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
