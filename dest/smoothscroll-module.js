'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.smoothScrollTo = smoothScrollTo;
var now = function () {
  if (window.performance && window.performance.now) {
    return function () {
      return window.performance.now();
    };
  } else {
    return function () {
      return Date.now();
    };
  }
}();

function ease(k) {
  return 0.5 * (1 - Math.cos(Math.PI * k));
}

function animationFrame(ctx) {
  var $el = ctx.$el,
      method = ctx.method,
      startX = ctx.startX,
      startY = ctx.startY,
      x = ctx.x,
      y = ctx.y,
      startTime = ctx.startTime,
      delay = ctx.delay;

  var time = now();
  var elapsed = Math.min(1, (time - startTime) / delay);
  var progress = ease(elapsed);
  var currentX = startX + (x - startX) * progress;
  var currentY = startY + (y - startY) * progress;

  method.call($el, currentX, currentY);

  if (currentX !== x || currentY !== y) {
    window.requestAnimationFrame(function () {
      return animationFrame(ctx);
    });
  }
}

function scrollElement(x, y) {
  this.scrollLeft = x;
  this.scrollTop = y;
}

function smoothScroll($el, x, y, delay) {
  var ctx = { x: x, y: y, startTime: now(), delay: delay };

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

function scrollBy(_ref, delay) {
  var top = _ref.top,
      left = _ref.left;

  var x = Math.floor(left) + (window.scrollX || window.pageXOffset);
  var y = Math.floor(top) + (window.scrollY || window.pageYOffset);
  smoothScroll(document.body, x, y, delay);
};

function findScrollableParent($el) {
  while (true) {
    $el = $el.parentNode;
    if ($el === document.body) break;
    if ($el.clientHeight > $el.scrollHeight && $el.clientWidth > $el.scrollWidth) continue;
    if (window.getComputedStyle($el, null).overflow !== 'visible') break;
  }
  return $el;
};

function smoothScrollTo($el) {
  var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 468;

  if (typeof $el == 'string') {
    $el = document.querySelector($el);
  }

  var $scrollable = findScrollableParent($el);
  var parentRects = $scrollable.getBoundingClientRect();
  var clientRects = $el.getBoundingClientRect();

  if ($scrollable === document.body) {
    scrollBy(clientRects, delay);
  } else {
    var x = $scrollable.scrollLeft + clientRects.left - parentRects.left;
    var y = $scrollable.scrollTop + clientRects.top - parentRects.top;
    smoothScroll($scrollable, x, y, delay);
    scrollBy(parentRects, delay);
  }
};