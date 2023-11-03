import type { 
  MouseEvent as ReactMouseEvent, 
  TouchEvent as ReactTouchEvent,
  PointerEvent as ReactPointerEvent,
} from "react";

export function isMouseEvent(event: MouseEvent | undefined): event is MouseEvent {
  return event !== undefined;
}

export function isTouchEvent(event: TouchEvent | undefined): event is TouchEvent {
  return event !== undefined;
}

export function isPointerEvent(event: PointerEvent | undefined): event is PointerEvent {
  return event !== undefined;
}

export function isReactMouseEvent(event: ReactMouseEvent | undefined): event is ReactMouseEvent {
  return event !== undefined;
}

export function isReactTouchEvent(event: ReactTouchEvent | undefined): event is ReactTouchEvent {
  return event !== undefined;
}

export function isReactPointerEvent(event: ReactPointerEvent | undefined): event is ReactPointerEvent {
  return event !== undefined;
}