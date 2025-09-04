# AI Provider Components

Этот модуль содержит компоненты для управления AI-провайдерами в приложении GoAI Timeline.

## Компоненты

### AiProviderDropdown

Основной компонент для выбора AI-провайдера с выпадающим списком.

**Props:**
- `selectedProvider: AIProvider` - текущий выбранный провайдер
- `onProviderChange: (provider: AIProvider) => void` - функция для изменения провайдера
- `className?: string` - дополнительные CSS классы
- `showStatus?: boolean` - показывать ли статус провайдера (Free/Premium)
- `compact?: boolean` - компактный режим без заголовка

**Пример использования:**
```tsx
import { AiProviderDropdown } from '@/components/chat/ai-provider-dropdown';

<AiProviderDropdown
  selectedProvider={selectedProvider}
  onProviderChange={setSelectedProvider}
  showStatus={true}
  compact={false}
/>
```

### AiProviderInfo

Компонент для отображения информации о текущем AI-провайдере в компактном виде.

**Props:**
- `provider: AIProvider` - провайдер для отображения
- `showDescription?: boolean` - показывать ли описание провайдера
- `className?: string` - дополнительные CSS классы

**Пример использования:**
```tsx
import { AiProviderInfo } from '@/components/chat/ai-provider-info';

<AiProviderInfo
  provider={selectedProvider}
  showDescription={true}
/>
```

## Хуки

### useAiProvider

Хук для управления состоянием AI-провайдеров.

**Параметры:**
- `initialProvider?: AIProvider` - начальный провайдер (по умолчанию: 'google-gemma')

**Возвращает:**
- `selectedProvider: AIProvider` - текущий выбранный провайдер
- `changeProvider: (provider: AIProvider) => void` - функция для изменения провайдера
- `getCurrentProvider: () => ProviderConfig | undefined` - получить конфигурацию текущего провайдера
- `isProviderAvailable: (provider: AIProvider) => boolean` - проверить доступность провайдера
- `getProviderStatus: (provider: AIProvider) => ProviderStatus` - получить статус провайдера
- `isLoading: boolean` - состояние загрузки при переключении
- `availableProviders: ProviderConfig[]` - список доступных провайдеров

**Пример использования:**
```tsx
import { useAiProvider } from '@/hooks/use-ai-provider';

const {
  selectedProvider,
  changeProvider,
  getCurrentProvider,
  isLoading
} = useAiProvider('google-gemma');
```

## Доступные провайдеры

### Google Gemma 3b
- **ID**: `google-gemma`
- **Статус**: Free
- **Описание**: Fast and efficient model for general conversation
- **Иконка**: Sparkles

### Mistral Medium
- **ID**: `mistral-medium`
- **Статус**: Premium
- **Описание**: Advanced model with enhanced reasoning capabilities
- **Иконка**: Zap

## Интеграция с существующим кодом

### Обновление useChat

Хук `useChat` был обновлен для использования `useAiProvider`:

```tsx
// Старый способ
const [selectedProvider, setSelectedProvider] = useState<AIProvider>('google-gemma');

// Новый способ
const {
  selectedProvider,
  changeProvider,
  getCurrentProvider,
  isLoading: isProviderLoading
} = useAiProvider('google-gemma');
```

### Обновление Sidebar

Компонент `Sidebar` теперь использует `AiProviderDropdown`:

```tsx
// Старый способ
<Select value={selectedProvider} onValueChange={onProviderChange}>
  {/* ... */}
</Select>

// Новый способ
<AiProviderDropdown
  selectedProvider={selectedProvider}
  onProviderChange={onProviderChange}
/>
```

## Стилизация

Компоненты используют Tailwind CSS и shadcn/ui компоненты:

- **Select**: для выпадающего списка
- **Badge**: для отображения статуса провайдеров
- **Icons**: Lucide React иконки для провайдеров

## Расширение функциональности

### Добавление нового провайдера

1. Добавить новый провайдер в `lib/types.ts`:
```tsx
export type AIProvider = 'google-gemma' | 'mistral-medium' | 'new-provider';
```

2. Добавить конфигурацию в `AI_PROVIDERS`:
```tsx
export const AI_PROVIDERS: ProviderConfig[] = [
  // ... существующие провайдеры
  {
    id: 'new-provider',
    name: 'New Provider',
    description: 'Description of new provider'
  }
];
```

3. Обновить функции в компонентах:
```tsx
const getProviderIcon = (providerId: AIProvider) => {
  switch (providerId) {
    // ... существующие случаи
    case 'new-provider':
      return <NewIcon className="w-4 h-4" />;
    default:
      return <Bot className="w-4 h-4" />;
  }
};
```

### Кастомизация стилей

Компоненты поддерживают кастомизацию через CSS классы:

```tsx
<AiProviderDropdown
  className="custom-dropdown"
  showStatus={false}
  compact={true}
/>
```

## Производительность

- Компоненты используют `useCallback` для оптимизации ре-рендеров
- Состояние провайдеров централизовано в хуке `useAiProvider`
- Загрузка при переключении провайдеров симулируется для лучшего UX 