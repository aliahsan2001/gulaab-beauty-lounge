/* 404: a drawn rose, half open. */

import { mountSvgRose } from '../core/svgrose.js';

export async function mount(root) {
  const rose = mountSvgRose(root.querySelector('[data-lost-rose]'), { bloom: 0 });
  const t = setTimeout(() => rose.setBloom(0.7), 300);
  return () => { clearTimeout(t); rose.dispose(); };
}
