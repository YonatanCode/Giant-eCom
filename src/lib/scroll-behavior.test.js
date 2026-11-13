import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getFiltersAreaWheelPlan,
  getHeaderVisibilityState,
  getProductsAreaWheelPlan,
  shouldHandleSplitWheel
} from './scroll-behavior-logic.js';

test('split wheel handling ignores horizontal and ctrl-modified gestures', () => {
  assert.equal(shouldHandleSplitWheel({
    isDesktopSplitScrollActive: true,
    ctrlKey: true,
    deltaX: 0,
    deltaY: 120
  }), false);

  assert.equal(shouldHandleSplitWheel({
    isDesktopSplitScrollActive: true,
    ctrlKey: false,
    deltaX: 120,
    deltaY: 120
  }), false);

  assert.equal(shouldHandleSplitWheel({
    isDesktopSplitScrollActive: true,
    ctrlKey: false,
    deltaX: 0,
    deltaY: 120
  }), true);
});

test('filters area scrolls page only before sticky mode starts', () => {
  assert.deepEqual(getFiltersAreaWheelPlan({
    isFiltersSticky: false,
    canScrollFilters: true,
    canScrollPage: true
  }), {
    handled: true,
    mode: 'page-only'
  });
});

test('filters area scrolls filters and page together once sticky mode is active', () => {
  assert.deepEqual(getFiltersAreaWheelPlan({
    isFiltersSticky: true,
    canScrollFilters: true,
    canScrollPage: true
  }), {
    handled: true,
    mode: 'filters-and-page'
  });
});

test('products area scrolls page first when scrolling down, then hands off to filters', () => {
  assert.deepEqual(getProductsAreaWheelPlan({
    deltaY: 120,
    canScrollFilters: true,
    canScrollPage: true
  }), {
    handled: true,
    primary: 'page',
    secondary: 'filters'
  });
});

test('products area scrolls filters first when scrolling back up', () => {
  assert.deepEqual(getProductsAreaWheelPlan({
    deltaY: -120,
    canScrollFilters: true,
    canScrollPage: true
  }), {
    handled: true,
    primary: 'filters',
    secondary: 'page'
  });
});

test('header stays visible for small downward scrolls near the top', () => {
  assert.deepEqual(getHeaderVisibilityState({
    currentY: 18,
    previousY: 10,
    lastDirection: 'down',
    directionStartY: 0,
    isHeaderVisible: true,
    threshold: 12,
    minScrollY: 24
  }), {
    lastDirection: 'down',
    directionStartY: 0,
    isHeaderVisible: true
  });
});

test('header hides after sustained downward scrolling beyond the hide threshold', () => {
  assert.deepEqual(getHeaderVisibilityState({
    currentY: 72,
    previousY: 60,
    lastDirection: 'down',
    directionStartY: 40,
    isHeaderVisible: true,
    threshold: 12,
    minScrollY: 24
  }), {
    lastDirection: 'down',
    directionStartY: 40,
    isHeaderVisible: false
  });
});

test('header reveals after the user scrolls back up enough', () => {
  assert.deepEqual(getHeaderVisibilityState({
    currentY: 132,
    previousY: 140,
    lastDirection: 'up',
    directionStartY: 148,
    isHeaderVisible: false,
    threshold: 12,
    minScrollY: 24
  }), {
    lastDirection: 'up',
    directionStartY: 148,
    isHeaderVisible: true
  });
});
