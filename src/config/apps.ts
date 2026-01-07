import type { AppConfig } from '@/types/app'

export const appRegistry: AppConfig[] = [
  {
    id: 'recipe',
    name: 'Recipe Finder',
    icon: '/icons/recipe.svg',
    description: 'Find recipes and ingredients',
    route: '/recipe',
    component: () => import('@/apps/recipe/RecipeApp.vue'),
    color: '#10b981',
    enabled: true,
    order: 1
  },
  {
    id: 'system-monitor',
    name: 'System Monitor',
    icon: '/icons/monitor.svg',
    description: 'Monitor system metrics and performance',
    route: '/system-monitor',
    component: () => import('@/apps/system-monitor/SystemMonitorApp.vue'),
    color: '#3b82f6',
    enabled: true,
    order: 2
  },
  {
    id: 'plant-monitor',
    name: 'Plant Monitor',
    icon: '/icons/plant.svg',
    description: 'Monitor your smart plant sensors',
    route: '/plant-monitor',
    component: () => import('@/apps/plant-monitor/PlantMonitorApp.vue'),
    color: '#22C55E',
    enabled: true,
    order: 3
  },
  {
    id: 'calendar',
    name: 'Calendar',
    icon: '/icons/calendar.svg',
    description: 'Manage your events and schedule',
    route: '/calendar',
    component: () => import('@/apps/calendar/CalendarApp.vue'),
    color: '#6366F1',
    enabled: true,
    order: 4
  },
  {
    id: 'timer',
    name: 'Timer',
    icon: '/icons/timer.svg',
    description: 'Countdown, stopwatch, and pomodoro timers',
    route: '/timer',
    component: () => import('@/apps/timer/TimerApp.vue'),
    color: '#F59E0B',
    enabled: true,
    order: 5
  },
  {
    id: 'weather',
    name: 'Weather',
    icon: '/icons/weather.svg',
    description: '7-day forecast and weather alerts',
    route: '/weather',
    component: () => import('@/apps/weather/WeatherApp.vue'),
    color: '#3B82F6',
    enabled: true,
    order: 6
  }
]
