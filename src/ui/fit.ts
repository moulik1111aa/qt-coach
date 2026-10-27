// Keep display maths inside the screen: a line wider than its box is scaled down to fit
// (to no less than 70%); anything still wider scrolls sideways inside its box.

export function fitMath(root: ParentNode): void {
  requestAnimationFrame(() => {
    for (const m of root.querySelectorAll<HTMLElement>('.mblock')) {
      m.style.zoom = '';
      const box = m.parentElement;
      if (!box) continue;
      const avail = box.clientWidth;
      const need = m.scrollWidth;
      if (need > avail && avail > 0) m.style.zoom = String(Math.max(0.7, (avail - 2) / need));
    }
  });
}
