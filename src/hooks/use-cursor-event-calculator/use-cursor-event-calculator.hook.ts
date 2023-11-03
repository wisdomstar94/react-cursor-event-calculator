import { useMemo } from "react";
import { 
  MouseEvent as ReactMouseEvent, 
  TouchEvent as ReactTouchEvent, 
  PointerEvent as ReactPointerEvent, 
} from "react";
import { IUseCursorEventCalculator } from "./use-cursor-event-calculator.interface";
import { isMouseEvent, isPointerEvent, isReactMouseEvent, isReactPointerEvent, isReactTouchEvent, isTouchEvent } from "@/utils/type-checker.util";

export function useCursorEventCalculator(props?: IUseCursorEventCalculator.Props) {
  const defaultValues = useMemo(() => {
    return {
      checkOnToParentDepthLimit: 30,
    };
  }, []);

  function getElementPositionInfo(element: HTMLElement | undefined | null) {
    if (element === undefined || element === null) {
      return undefined;
    }

    const rect = element.getBoundingClientRect();

    const rectCoordinateSet: IUseCursorEventCalculator.PositionCoordinateSet = {
      pointTopLeft: {
        x: rect.x,
        y: rect.y,
      },
      pointTopRight: {
        x: rect.x + rect.width,
        y: rect.y,
      },
      pointBottomLeft: {
        x: rect.x,
        y: rect.y + rect.height,
      },
      pointBottomRight: {
        x: rect.x + rect.width,
        y: rect.y + rect.height,
      },
    };

    const bodyAbsoluteRectCoordinateSet: IUseCursorEventCalculator.PositionCoordinateSet = {
      pointTopLeft: {
        x: rectCoordinateSet.pointTopLeft.x + window.scrollX,
        y: rectCoordinateSet.pointTopLeft.y + window.scrollY,
      },
      pointTopRight: {
        x: rectCoordinateSet.pointTopRight.x + window.scrollX,
        y: rectCoordinateSet.pointTopRight.y + window.scrollY,
      },
      pointBottomLeft: {
        x: rectCoordinateSet.pointBottomLeft.x + window.scrollX,
        y: rectCoordinateSet.pointBottomLeft.y + window.scrollY,
      },
      pointBottomRight: {
        x: rectCoordinateSet.pointBottomRight.x + window.scrollX,
        y: rectCoordinateSet.pointBottomRight.y + window.scrollY,
      },
    };

    const positionInfo: IUseCursorEventCalculator.ElementPositionInfo = {
      client: {
        top: element.clientTop,
        left: element.clientLeft,
      },
      offset: {
        top: element.offsetTop,
        left: element.offsetLeft,
        width: element.offsetWidth,
        height: element.offsetHeight,
      },
      rect,
      rectCoordinateSet,
      bodyAbsoluteRectCoordinateSet,
    };
    return positionInfo;
  }

  function getElementFromEvent(event: MouseEvent | TouchEvent | PointerEvent | ReactMouseEvent | ReactTouchEvent | ReactPointerEvent, options?: IUseCursorEventCalculator.ElementPositionInfoFromEventTargetOptions) {
    const {
      requiredKeyValueItems,
      requiredKeyValueItemsCheckType,
    } = options ?? {};

    const target: HTMLElement | null | undefined = event.target as HTMLElement;

    if (target === null) return undefined;

    let targetElement: HTMLElement | null = target;
    if (requiredKeyValueItems !== undefined && requiredKeyValueItems.length > 0) {
      const maximumCheckOnToParentDepthLimit: number = Math.max(...requiredKeyValueItems.map(x => x.checkOnToParentDepthLimit ?? defaultValues.checkOnToParentDepthLimit));
      let currentElement: HTMLElement | null | undefined = targetElement;
      for (let i = 0; i < maximumCheckOnToParentDepthLimit; i++) {
        if (currentElement === null || currentElement === undefined) {
          targetElement = null;
          break;
        }

        let matchedCount = 0;
        for (const item of requiredKeyValueItems) {
          const checkOnToParentDepthLimit = item.checkOnToParentDepthLimit ?? defaultValues.checkOnToParentDepthLimit;
          if (i >= checkOnToParentDepthLimit) {
            continue;
          }

          const value = currentElement?.getAttribute(item.key);
          let isMatched: boolean = false;
          if (typeof value !== 'string') {
            isMatched = false;
          } else if (item.checkType === 'full-match') {
            isMatched = value === item.value;
          } else if (item.checkType === 'include') {
            isMatched = value.includes(item.value);
          }

          if (isMatched) {
            matchedCount++;
          }
        }

        if (requiredKeyValueItemsCheckType === 'and') {
          if (matchedCount === requiredKeyValueItems.length) {
            targetElement = currentElement;
            break;
          }
        } else if (requiredKeyValueItemsCheckType === 'or') {
          if (matchedCount > 0) {
            targetElement = currentElement;
            break;
          }
        }

        currentElement = currentElement?.parentElement;
      }
    }

    if (targetElement === null || targetElement === undefined) {
      return undefined;
    }

    return targetElement;
  }

  function getCursorEventPositionInfo(event: IUseCursorEventCalculator.Event) {
    const {
      mouseEvent,
      touchEvent,
      pointerEvent,
      reactMouseEvent,
      reactTouchEvent,
      reactPointerEvent,
    } = event;

    let client: IUseCursorEventCalculator.PositoinXY | undefined = undefined;
    let page: IUseCursorEventCalculator.PositoinXY | undefined = undefined;

    if (isMouseEvent(mouseEvent)) {
      client = {
        x: mouseEvent.clientX,
        y: mouseEvent.clientY,
      };
      page = {
        x: mouseEvent.pageX,
        y: mouseEvent.pageY,
      };
    } else if (isTouchEvent(touchEvent)) {
      client = {
        x: touchEvent.touches[0].clientX,
        y: touchEvent.touches[0].clientY,
      };
      page = {
        x: touchEvent.touches[0].pageX,
        y: touchEvent.touches[0].pageY,
      };
    } else if (isPointerEvent(pointerEvent)) {
      client = {
        x: pointerEvent.clientX,
        y: pointerEvent.clientY,
      };
      page = {
        x: pointerEvent.pageX,
        y: pointerEvent.pageY,
      };
    } else if (isReactMouseEvent(reactMouseEvent)) {
      client = {
        x: reactMouseEvent.clientX,
        y: reactMouseEvent.clientY,
      };
      page = {
        x: reactMouseEvent.pageX,
        y: reactMouseEvent.pageY,
      };
    } else if (isReactTouchEvent(reactTouchEvent)) {
      client = {
        x: reactTouchEvent.touches[0].clientX,
        y: reactTouchEvent.touches[0].clientY,
      };
      page = {
        x: reactTouchEvent.touches[0].pageX,
        y: reactTouchEvent.touches[0].pageY,
      };
    } else if (isReactPointerEvent(reactPointerEvent)) {
      client = {
        x: reactPointerEvent.clientX,
        y: reactPointerEvent.clientY,
      };
      page = {
        x: reactPointerEvent.pageX,
        y: reactPointerEvent.pageY,
      };
    }

    const cursorPositionInfo: IUseCursorEventCalculator.CursorPositionInfo = {
      client,
      page,
    };

    return cursorPositionInfo;
  }

  return {
    getElementPositionInfo,
    getElementFromEvent,

    getCursorEventPositionInfo,
  };
}