// Pure scroll-handoff rules for the desktop split-scroll layout.
// Kept as its own dependency-free module so the regression tests in
// scroll-behavior.test.js can cover the contract documented in README.md.
export function shouldHandleSplitWheel({ isDesktopSplitScrollActive, ctrlKey, deltaX, deltaY }) {
  if (!isDesktopSplitScrollActive || ctrlKey) {
    return false;
  }

  if (Math.abs(deltaY) <= Math.abs(deltaX) || deltaY === 0) {
    return false;
  }

  return true;
}

export function getFiltersAreaWheelPlan({ isFiltersSticky, canScrollFilters, canScrollPage }) {
  if (!canScrollFilters && !canScrollPage) {
    return { handled: false, mode: 'none' };
  }

  if (!isFiltersSticky) {
    return canScrollPage
      ? { handled: true, mode: 'page-only' }
      : { handled: true, mode: 'filters-only' };
  }

  if (canScrollFilters && canScrollPage) {
    return { handled: true, mode: 'filters-and-page' };
  }

  if (canScrollFilters) {
    return { handled: true, mode: 'filters-only' };
  }

  return { handled: true, mode: 'page-only' };
}

export function getProductsAreaWheelPlan({ deltaY, canScrollFilters, canScrollPage }) {
  const primary = deltaY > 0 ? 'page' : 'filters';
  const secondary = deltaY > 0 ? 'filters' : 'page';
  const canScrollPrimary = primary === 'page' ? canScrollPage : canScrollFilters;
  const canScrollSecondary = secondary === 'page' ? canScrollPage : canScrollFilters;

  if (!canScrollPrimary && !canScrollSecondary) {
    return { handled: false, primary: null, secondary: null };
  }

  return {
    handled: true,
    primary,
    secondary
  };
}

export function getHeaderVisibilityState({
  currentY,
  previousY,
  lastDirection,
  directionStartY,
  isHeaderVisible,
  threshold,
  minScrollY
}) {
  const nextY = Math.max(0, currentY);
  const prevY = Math.max(0, previousY);
  const deltaY = nextY - prevY;

  if (nextY <= 0) {
    return {
      lastDirection: null,
      directionStartY: 0,
      isHeaderVisible: true
    };
  }

  if (Math.abs(deltaY) < 1) {
    return {
      lastDirection,
      directionStartY,
      isHeaderVisible
    };
  }

  const nextDirection = deltaY > 0 ? 'down' : 'up';
  const nextDirectionStartY = nextDirection === lastDirection ? directionStartY : prevY;
  const travelledDistance = Math.abs(nextY - nextDirectionStartY);
  let nextVisibility = isHeaderVisible;

  if (nextDirection === 'down' && nextY > minScrollY && travelledDistance >= threshold) {
    nextVisibility = false;
  } else if (nextDirection === 'up' && travelledDistance >= threshold) {
    nextVisibility = true;
  }

  return {
    lastDirection: nextDirection,
    directionStartY: nextDirectionStartY,
    isHeaderVisible: nextVisibility
  };
}
