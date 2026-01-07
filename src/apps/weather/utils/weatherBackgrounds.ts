import type { WeatherCondition } from '../types/weather'

export interface WeatherBackground {
  gradient: string
  className: string
  particles?: 'rain' | 'snow'
}

export const weatherBackgrounds: Record<WeatherCondition, WeatherBackground> = {
  clear: {
    gradient: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
    className: 'bg-clear'
  },
  'partly-cloudy': {
    gradient: 'linear-gradient(180deg, #60A5FA 0%, #DBEAFE 100%)',
    className: 'bg-partly-cloudy'
  },
  cloudy: {
    gradient: 'linear-gradient(180deg, #9CA3AF 0%, #E5E7EB 100%)',
    className: 'bg-cloudy'
  },
  overcast: {
    gradient: 'linear-gradient(180deg, #6B7280 0%, #D1D5DB 100%)',
    className: 'bg-overcast'
  },
  'light-rain': {
    gradient: 'linear-gradient(180deg, #3B82F6 0%, #60A5FA 100%)',
    className: 'bg-light-rain',
    particles: 'rain'
  },
  rain: {
    gradient: 'linear-gradient(180deg, #1E3A8A 0%, #475569 100%)',
    className: 'bg-rain',
    particles: 'rain'
  },
  'heavy-rain': {
    gradient: 'linear-gradient(180deg, #1E293B 0%, #334155 100%)',
    className: 'bg-heavy-rain',
    particles: 'rain'
  },
  snow: {
    gradient: 'linear-gradient(180deg, #E0F2FE 0%, #F0F9FF 100%)',
    className: 'bg-snow',
    particles: 'snow'
  },
  fog: {
    gradient: 'linear-gradient(180deg, #6B7280 0%, #F3F4F6 100%)',
    className: 'bg-fog'
  },
  windy: {
    gradient: 'linear-gradient(135deg, #06B6D4 0%, #0EA5E9 100%)',
    className: 'bg-windy'
  }
}

export function getWeatherBackground(condition: WeatherCondition): WeatherBackground {
  return weatherBackgrounds[condition] || weatherBackgrounds.clear
}
