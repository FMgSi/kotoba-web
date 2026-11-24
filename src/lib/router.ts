import { useEffect, useState } from 'react';
import type { NavTab } from '../types';

export interface AppRoute {
  tab: NavTab;
  itemId?: string;
  practiceAll?: boolean;
  lessonTag?: string;
}

const VALID_TABS: NavTab[] = [
  'dashboard',
  'study',
  'vocab',
  'listening',
  'reading',
  'writing',
  'settings',
];

export function buildHashUrl(route: AppRoute): string {
  if (route.tab === 'dashboard') return '#/';
  if (route.tab === 'vocab' && route.itemId) {
    const encoded = encodeURIComponent(route.itemId);
    const params = new URLSearchParams();
    if (route.practiceAll) params.set('all', '1');
    if (route.lessonTag) params.set('tag', route.lessonTag);
    const qs = params.toString();
    return `#/vocab/review/${encoded}${qs ? `?${qs}` : ''}`;
  }
  if ((route.tab === 'study' || route.tab === 'listening') && route.itemId) {
    return `#/${route.tab}/${encodeURIComponent(route.itemId)}`;
  }
  return `#/${route.tab}`;
}

export function parseHashRoute(rawHash: string): AppRoute {
  const cleaned = rawHash.replace(/^#\/?/, '').trim();
  if (!cleaned) return { tab: 'dashboard' };

  const [pathPart, queryPart] = cleaned.split('?');
  const segments = pathPart.split('/').filter(Boolean);
  const first = segments[0] as NavTab | undefined;

  if (!first || !VALID_TABS.includes(first)) {
    return { tab: 'dashboard' };
  }

  if (first === 'vocab' && segments[1] === 'review' && segments[2]) {
    const params = new URLSearchParams(queryPart || '');
    return {
      tab: 'vocab',
      itemId: decodeURIComponent(segments[2]),
      practiceAll: params.get('all') === '1',
      lessonTag: params.get('tag') || undefined,
    };
  }

  if ((first === 'study' || first === 'listening') && segments[1]) {
    return {
      tab: first,
      itemId: decodeURIComponent(segments[1]),
    };
  }

  return { tab: first };
}

// Track recent in-session hashes so in-app Back buttons use real history.back() when safe
const sessionStack: string[] = [];

function recordCurrentHash(hash: string) {
  const normalized = hash || '#/';
  if (sessionStack[sessionStack.length - 1] !== normalized) {
    sessionStack.push(normalized);
    if (sessionStack.length > 50) sessionStack.shift();
  }
}

export function pushRoute(route: AppRoute): void {
  const nextHash = buildHashUrl(route);
  const currentHash = window.location.hash || '#/';
  if (currentHash === nextHash) return;
  recordCurrentHash(currentHash);
  window.location.hash = nextHash;
  recordCurrentHash(nextHash);
}

export function replaceRoute(route: AppRoute): void {
  const nextHash = buildHashUrl(route);
  const url = `${window.location.pathname}${window.location.search}${nextHash}`;
  window.history.replaceState(null, '', url);
  if (sessionStack.length > 0) {
    sessionStack[sessionStack.length - 1] = nextHash;
  } else {
    sessionStack.push(nextHash);
  }
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}

export function goBackOrFallback(fallback: AppRoute): void {
  const targetHash = buildHashUrl(fallback);
  if (sessionStack.length >= 2 && sessionStack[sessionStack.length - 2] === targetHash) {
    sessionStack.pop();
    window.history.back();
    return;
  }
  pushRoute(fallback);
}

export function useHashRoute(): AppRoute {
  const [route, setRoute] = useState<AppRoute>(() => {
    const initial = window.location.hash || '#/';
    if (!window.location.hash) {
      const url = `${window.location.pathname}${window.location.search}#/`;
      window.history.replaceState(null, '', url);
    }
    recordCurrentHash(initial);
    return parseHashRoute(initial);
  });

  useEffect(() => {
    function syncFromHash() {
      const h = window.location.hash || '#/';
      // Keep session stack aligned if user pressed browser Back
      if (sessionStack.length >= 2 && sessionStack[sessionStack.length - 2] === h) {
        sessionStack.pop();
      } else {
        recordCurrentHash(h);
      }
      setRoute(parseHashRoute(h));
      window.scrollTo({ top: 0, behavior: 'auto' });
    }

    window.addEventListener('hashchange', syncFromHash);
    window.addEventListener('popstate', syncFromHash);
    return () => {
      window.removeEventListener('hashchange', syncFromHash);
      window.removeEventListener('popstate', syncFromHash);
    };
  }, []);

  return route;
}
