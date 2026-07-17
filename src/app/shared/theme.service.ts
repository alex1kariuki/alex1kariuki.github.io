import { Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeId = 'intergalactic' | 'worldcup' | 'winter';
export type TimeOfDay = 'dawn' | 'day' | 'sunset' | 'night';
export type Weather = 'clear' | 'clouds' | 'rain' | 'snow' | 'thunder';
export type Orbiter = 'rocket' | 'ball' | 'snowflake';

export interface ThemeState {
  id: ThemeId;
  label: string;
  sky: [string, string, string];
  nebula: [string, string, string, string];
  orbiter: Orbiter;
  favicon: string;
  timeOfDay: TimeOfDay;
  weather: Weather | null;
  city: string | null;
}

type Palette = Partial<Record<TimeOfDay, string[]>> & { all?: string[] };

const SKY: Record<ThemeId, Palette> = {
  intergalactic: {
    night: ['#080418', '#0d0726', '#04121f'],
    dawn: ['#0b0724', '#241338', '#3a1d3f'],
    day: ['#0b1030', '#191a4a', '#0c2740'],
    sunset: ['#160a2a', '#48203f', '#5c3114'],
  },
  worldcup: { all: ['#04160e', '#082a1a', '#04182a'] },
  winter: { all: ['#050d1e', '#0b1a34', '#0c2740'] },
};

const NEBULA: Record<ThemeId, Palette> = {
  intergalactic: {
    night: ['rgba(124,58,237,0.42)', 'rgba(219,39,119,0.30)', 'rgba(79,70,229,0.36)', 'rgba(20,184,166,0.24)'],
    dawn: ['rgba(244,114,182,0.32)', 'rgba(129,140,248,0.30)', 'rgba(168,85,247,0.28)', 'rgba(251,191,36,0.20)'],
    day: ['rgba(99,102,241,0.32)', 'rgba(56,189,248,0.28)', 'rgba(139,92,246,0.28)', 'rgba(45,212,191,0.20)'],
    sunset: ['rgba(251,146,60,0.40)', 'rgba(236,72,153,0.30)', 'rgba(168,85,247,0.30)', 'rgba(45,212,191,0.16)'],
  },
  worldcup: { all: ['rgba(16,185,129,0.40)', 'rgba(250,204,21,0.28)', 'rgba(5,150,105,0.34)', 'rgba(59,130,246,0.20)'] },
  winter: { all: ['rgba(56,189,248,0.34)', 'rgba(224,242,254,0.22)', 'rgba(99,102,241,0.30)', 'rgba(45,212,191,0.20)'] },
};

/**
 * Resolves the site's living theme from the calendar (event/seasonal windows),
 * the visitor's local clock (time of day), and — best-effort — the current
 * weather at their approximate location. Everything degrades gracefully:
 * without JS or network the CSS-variable fallbacks render the default
 * intergalactic night theme. Preview any state with ?theme=, ?time=, ?weather=.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly isBrowser: boolean;

  readonly state = signal<ThemeState>(this.compose('intergalactic', 'night', null, null));

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  init(): void {
    if (!this.isBrowser) return;

    const o = this.readOverrides();
    const now = new Date();
    const baseId = o.theme ?? this.resolveBaseTheme(now);
    const timeOfDay = o.time ?? this.resolveTimeOfDay(now);

    this.apply(this.compose(baseId, timeOfDay, o.weather ?? null, null));

    // Only fetch live weather when it hasn't been forced via the URL.
    if (!o.weather) {
      void this.loadWeather(baseId, timeOfDay);
    }
  }

  // ---- Resolution ---------------------------------------------------------

  private resolveBaseTheme(_d: Date): ThemeId {
    // Auto theme-switching is disabled — the site always uses the default
    // intergalactic theme. Time-of-day tint and live weather still apply, and
    // the other themes stay previewable via ?theme=worldcup / ?theme=winter.
    //
    // To bring scheduled themes back, restore these checks:
    //   if (_d >= new Date(2026, 5, 11) && _d < new Date(2026, 6, 21)) return 'worldcup';
    //   const m = _d.getMonth(), day = _d.getDate();
    //   if (m === 11 || (m === 0 && day <= 6)) return 'winter'; // Dec 1 – Jan 6
    return 'intergalactic';
  }

  private resolveTimeOfDay(d: Date): TimeOfDay {
    const h = d.getHours();
    if (h >= 5 && h < 8) return 'dawn';
    if (h >= 8 && h < 17) return 'day';
    if (h >= 17 && h < 20) return 'sunset';
    return 'night';
  }

  private compose(id: ThemeId, timeOfDay: TimeOfDay, weather: Weather | null, city: string | null): ThemeState {
    const skyPal = SKY[id];
    const nebPal = NEBULA[id];
    const sky = (skyPal.all ?? skyPal[timeOfDay]!) as [string, string, string];
    const nebula = (nebPal.all ?? nebPal[timeOfDay]!) as [string, string, string, string];
    const orbiter: Orbiter = id === 'worldcup' ? 'ball' : id === 'winter' ? 'snowflake' : 'rocket';
    const label = id === 'worldcup' ? 'World Cup 2026' : id === 'winter' ? 'Winter' : 'Intergalactic';
    return {
      id,
      label,
      sky,
      nebula,
      orbiter,
      favicon: this.pickFavicon(id, timeOfDay, weather),
      timeOfDay,
      weather,
      city,
    };
  }

  private pickFavicon(id: ThemeId, timeOfDay: TimeOfDay, weather: Weather | null): string {
    if (id === 'worldcup') return '⚽';
    if (id === 'winter') return weather === 'rain' ? '🌧️' : '❄️';
    if (weather === 'rain') return '🌧️';
    if (weather === 'snow') return '❄️';
    if (weather === 'thunder') return '⛈️';
    if (weather === 'clouds') return '☁️';
    if (timeOfDay === 'sunset') return '🌅';
    if (timeOfDay === 'dawn') return '🌄';
    if (timeOfDay === 'night') return '🌌';
    return '🚀';
  }

  // ---- Apply --------------------------------------------------------------

  private apply(state: ThemeState): void {
    this.state.set(state);
    if (!this.isBrowser) return;

    const root = document.documentElement.style;
    root.setProperty('--sky-1', state.sky[0]);
    root.setProperty('--sky-2', state.sky[1]);
    root.setProperty('--sky-3', state.sky[2]);
    state.nebula.forEach((c, i) => root.setProperty(`--nebula-${i + 1}`, c));

    this.setFavicon(state.favicon);
  }

  private setFavicon(emoji: string): void {
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
      `<text x="32" y="50" font-size="52" text-anchor="middle">${emoji}</text></svg>`;
    const href = 'data:image/svg+xml,' + encodeURIComponent(svg);
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.type = 'image/svg+xml';
    link.href = href;
  }

  // ---- Weather (best-effort, non-blocking) --------------------------------

  private async loadWeather(baseId: ThemeId, timeOfDay: TimeOfDay): Promise<void> {
    try {
      const loc = await this.getLocation();
      if (!loc) return;
      const weather = await this.getWeather(loc.lat, loc.lon);
      if (!weather) return;
      this.apply(this.compose(baseId, timeOfDay, weather, loc.city));
    } catch {
      /* stay on the base theme */
    }
  }

  private async getLocation(): Promise<{ lat: number; lon: number; city: string | null } | null> {
    const r = await this.fetchJson('https://ipwho.is/');
    if (r && r.success !== false && typeof r.latitude === 'number') {
      return { lat: r.latitude, lon: r.longitude, city: r.city ?? null };
    }
    return null;
  }

  private async getWeather(lat: number, lon: number): Promise<Weather | null> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code`;
    const r = await this.fetchJson(url);
    const code = r?.current?.weather_code;
    return typeof code === 'number' ? this.mapWeatherCode(code) : null;
  }

  private mapWeatherCode(code: number): Weather {
    if (code === 0) return 'clear';
    if (code <= 3) return 'clouds';
    if (code === 45 || code === 48) return 'clouds';
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
    if (code >= 95) return 'thunder';
    return 'clear';
  }

  private async fetchJson(url: string): Promise<any | null> {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4500);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      return res.ok ? await res.json() : null;
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  // ---- URL preview overrides ---------------------------------------------

  private readOverrides(): { theme?: ThemeId; time?: TimeOfDay; weather?: Weather } {
    const out: { theme?: ThemeId; time?: TimeOfDay; weather?: Weather } = {};
    if (!this.isBrowser) return out;
    const p = new URLSearchParams(location.search);
    const themes: ThemeId[] = ['intergalactic', 'worldcup', 'winter'];
    const times: TimeOfDay[] = ['dawn', 'day', 'sunset', 'night'];
    const weathers: Weather[] = ['clear', 'clouds', 'rain', 'snow', 'thunder'];
    const t = p.get('theme') as ThemeId | null;
    const ti = p.get('time') as TimeOfDay | null;
    const w = p.get('weather') as Weather | null;
    if (t && themes.includes(t)) out.theme = t;
    if (ti && times.includes(ti)) out.time = ti;
    if (w && weathers.includes(w)) out.weather = w;
    return out;
  }
}
