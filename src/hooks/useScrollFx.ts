import { useEffect, useRef, type DependencyList } from 'react';

/** Adds `.in-view` to `.reveal` descendants as they enter the viewport. */
export function useReveal<T extends HTMLElement>(deps: DependencyList = []) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = root.querySelectorAll('.reveal:not(.in-view)');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in-view');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    // fallback: guarantee visibility even if IO misses
    const timer = window.setTimeout(() => {
      els.forEach((el) => el.classList.add('in-view'));
    }, 800);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

/** Tracks scroll direction: returns true when the header should hide. */
export function useHideOnScroll() {
  const lastY = useRef(0);
  const hidden = useRef(false);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const goingDown = y > lastY.current && y > 64;
      if (goingDown !== hidden.current) {
        hidden.current = goingDown;
        ref.current?.classList.toggle('header-hidden', goingDown);
      }
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return ref;
}
