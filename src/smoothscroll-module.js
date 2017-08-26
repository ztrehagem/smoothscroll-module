const now = (() => {
  if (window.performance && window.performance.now) {
    return () => window.performance.now();
  } else {
    return () => Date.now();
  }
})();

function ease(k) {
  return 0.5 * (1 - Math.cos(Math.PI * k));
}

function animationFrame(ctx) {
  const { $el, method, startX, startY, x, y, startTime, delay } = ctx;
  const time = now();
  const elapsed = Math.min(1, (time - startTime) / delay);
  const progress = ease(elapsed);
  const currentX = startX + (x - startX) * progress;
  const currentY = startY + (y - startY) * progress;

  method.call($el, currentX, currentY);

  if (currentX !== x || currentY !== y) {
    window.requestAnimationFrame(() => animationFrame(ctx));
  }
}

function scrollElement(x, y) {
  this.scrollLeft = x;
  this.scrollTop = y;
}

function smoothScroll($el, x, y, delay) {
  const ctx = { x, y, startTime: now(), delay };

  if ($el === document.body) {
    ctx.$el = window;
    ctx.method = window.scroll || window.scrollTo;
    ctx.startX = window.scrollX || window.pageXOffset;
    ctx.startY = window.scrollY || window.pageYOffset;
  } else {
    ctx.$el = $el;
    ctx.method = scrollElement;
    ctx.startX = $el.scrollLeft;
    ctx.startY = $el.scrollTop;
  }

  animationFrame(ctx);
};

function scrollBy({ top, left }, delay) {
  const x = Math.floor(left) + (window.scrollX || window.pageXOffset);
  const y = Math.floor(top) + (window.scrollY || window.pageYOffset);
  smoothScroll(document.body, x, y, delay);
};

function findScrollableParent($el) {
  while (true) {
    $el = $el.parentNode;
    if ($el === document.body)
      break;
    if ($el.clientHeight > $el.scrollHeight && $el.clientWidth > $el.scrollWidth)
      continue;
    if (window.getComputedStyle($el, null).overflow !== 'visible')
      break;
  }
  return $el;
};

export function smoothScrollTo($el, delay = 468) {
  if (typeof $el == 'string') {
    $el = document.querySelector($el);
  }

  const $scrollable = findScrollableParent($el);
  const parentRects = $scrollable.getBoundingClientRect();
  const clientRects = $el.getBoundingClientRect();

  if ($scrollable === document.body) {
    scrollBy(clientRects, delay);
  } else {
    const x = $scrollable.scrollLeft + clientRects.left - parentRects.left;
    const y = $scrollable.scrollTop + clientRects.top - parentRects.top;
    smoothScroll($scrollable, x, y, delay);
    scrollBy(parentRects, delay);
  }
};
