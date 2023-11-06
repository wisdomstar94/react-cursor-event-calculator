import { useMemo, useRef, useState } from "react";
import { IUseCursorEventCalculator } from "./use-cursor-event-calculator.interface";
import { isMouseEvent, isPointerEvent, isReactMouseEvent, isReactPointerEvent, isReactTouchEvent, isTouchEvent } from "@/utils/type-checker.util";

export function useCursorEventCalculator(props?: IUseCursorEventCalculator.Props) {
  const squareMargin = useMemo(() => props?.squareMargin ?? 4, [props?.squareMargin]);
  const pressInfo = useRef<IUseCursorEventCalculator.CursorCalculateTargetInfo>();
  const movingInfo = useRef<IUseCursorEventCalculator.CursorCalculateTargetInfo>();
  const endInfo = useRef<IUseCursorEventCalculator.CursorCalculateTargetInfo>();
  const [isPressing, setIsPressing] = useState<boolean>(false);
  const isPressingSync = useRef<boolean>(isPressing);

  const [scrollX, setScrollX] = useState<number>(0);
  const [scrollY, setScrollY] = useState<number>(0);
  const [pressMovingSquareInfo, setPressMovingSquareInfo] = useState<IUseCursorEventCalculator.PressMovingSquareInfo>();
  const [dragHorizontalDirection, setDragHorizontalDirection] = useState<IUseCursorEventCalculator.HorizontalDirection>('');
  const [dragVerticalDirection, setDragVerticalDirection] = useState<IUseCursorEventCalculator.VerticalDirection>('');
  const [dragEndEvent, setDragEndEvent] = useState<IUseCursorEventCalculator.DragEndEvent>();

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

  function getElementFromEvent(event: IUseCursorEventCalculator.Event, options?: IUseCursorEventCalculator.ElementPositionInfoFromEventTargetOptions) {
    const {
      mouseEvent,
      touchEvent,
      pointerEvent,
      reactMouseEvent,
      reactTouchEvent,
      reactPointerEvent,
    } = event;

    const {
      requiredKeyValueItems,
      requiredKeyValueItemsCheckType,
    } = options ?? {};

    let target: HTMLElement | null | undefined;
    if (isMouseEvent(mouseEvent)) {
      target = mouseEvent.target as HTMLElement;
    } else if (isTouchEvent(touchEvent)) {
      target = touchEvent.target as HTMLElement;
    } else if (isPointerEvent(pointerEvent)) {
      target = pointerEvent.target as HTMLElement;
    } else if (isReactMouseEvent(reactMouseEvent)) {
      target = reactMouseEvent.target as HTMLElement;
    } else if (isReactTouchEvent(reactTouchEvent)) {
      target = reactTouchEvent.target as HTMLElement;
    } else if (isReactPointerEvent(reactPointerEvent)) {
      target = reactPointerEvent.target as HTMLElement;
    }

    if (target === null) return undefined;
    if (target === undefined) return undefined;

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

  function getCursorElements(event: IUseCursorEventCalculator.Event) {
    const positionInfo = getCursorEventPositionInfo(event);
    if (positionInfo.client === undefined) {
      throw new Error(`positionInfo.client 정보가 없습니다.`);
    }
    return document.elementsFromPoint(positionInfo.client.x, positionInfo.client.y) as HTMLElement[];
  }

  function getCursorElement(event: IUseCursorEventCalculator.Event, options?: IUseCursorEventCalculator.ElementPositionInfoFromEventTargetOptions) {
    const elements = getCursorElements(event);
    if (elements.length === 0) return undefined;

    const {
      requiredKeyValueItems,
      requiredKeyValueItemsCheckType,
    } = options ?? {};

    let targetElement: HTMLElement | null = elements[0];
    if (requiredKeyValueItems !== undefined && requiredKeyValueItems.length > 0) {
      // const maximumCheckOnToParentDepthLimit: number = Math.max(...requiredKeyValueItems.map(x => x.checkOnToParentDepthLimit ?? defaultValues.checkOnToParentDepthLimit));
      const maximumCheckOnToParentDepthLimit: number = elements.length;
      let currentElement: HTMLElement | null | undefined = targetElement;
      for (let i = 1; i < maximumCheckOnToParentDepthLimit; i++) {
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

        currentElement = elements[i];
      }
    }

    if (targetElement === null || targetElement === undefined) {
      return undefined;
    }

    return targetElement;
  }

  function setPress(element: HTMLElement | null, event: IUseCursorEventCalculator.Event) {
    if (element === null) {
      throw new Error(`element 가 null 입니다.`);
    }

    pressInfo.current = {
      element,
      rect: element.getBoundingClientRect(),
      cursorPositionInfo: getCursorEventPositionInfo(event),
    };
    movingInfo.current = undefined;
    endInfo.current = undefined;
    setScrollX(0);
    setScrollY(0);
    setIsPressing(true);
    isPressingSync.current = true;
    setMoving(event);
  }

  function setMoving(event: IUseCursorEventCalculator.Event) {
    if (!isPressingSync.current) {
      return;
    }

    if (pressInfo.current === undefined) {
      // throw new Error(`setMoving() 함수가 호출되기 전에 먼저 setPress() 함수가 호출되어야 합니다.`);
      return;
    }

    movingInfo.current = {
      element: pressInfo.current.element,
      rect: pressInfo.current.element.getBoundingClientRect(),
      cursorPositionInfo: getCursorEventPositionInfo(event),
    };

    const press = pressInfo.current;
    const moving = movingInfo.current;

    const _scrollX = (press.rect.x - moving.rect.x);
    const _scrollY = (press.rect.y - moving.rect.y);
    setScrollY(_scrollY);
    setScrollX(_scrollX);

    let top: number | undefined;
    let left: number | undefined;
    let width: number = 0;
    let height: number = 0;

    if (moving.cursorPositionInfo.client !== undefined && press.cursorPositionInfo.client !== undefined) {
      if (moving.cursorPositionInfo.client.x < press.cursorPositionInfo.client.x - _scrollX) {
        left = press.cursorPositionInfo.client.x - (press.cursorPositionInfo.client.x - moving.cursorPositionInfo.client.x) + squareMargin;
        width = press.cursorPositionInfo.client.x - moving.cursorPositionInfo.client.x - scrollX - (squareMargin * 2);
        setDragHorizontalDirection('left');
      } else {
        left = press.cursorPositionInfo.client.x - (_scrollX) + squareMargin;
        width = moving.cursorPositionInfo.client.x - press.cursorPositionInfo.client.x + _scrollX - (squareMargin * 2);
        setDragHorizontalDirection('right');
      }

      if (moving.cursorPositionInfo.client.y < press.cursorPositionInfo.client.y - _scrollY) {
        top = press.cursorPositionInfo.client.y - (press.cursorPositionInfo.client.y - moving.cursorPositionInfo.client.y) + squareMargin;
        height = press.cursorPositionInfo.client.y - moving.cursorPositionInfo.client.y - _scrollY - (squareMargin * 2);
        setDragVerticalDirection('top');
      } else {
        top = press.cursorPositionInfo.client.y - (_scrollY) + squareMargin;
        height = moving.cursorPositionInfo.client.y - press.cursorPositionInfo.client.y + _scrollY - (squareMargin * 2);
        setDragVerticalDirection('bottom');
      }
    }

    let rectCoordinateSet: IUseCursorEventCalculator.PositionCoordinateSet | undefined;

    if (top !== undefined && left !== undefined) {
      rectCoordinateSet = {
        pointTopLeft: { x: left, y: top },
        pointTopRight: { x: left + width, y: top },
        pointBottomLeft: { x: left, y: top + height },
        pointBottomRight: { x: left + width, y: top + height },
      };
    }

    const info: IUseCursorEventCalculator.PressMovingSquareInfo = {
      top,
      left,
      width,
      height, 
      rectCoordinateSet: rectCoordinateSet,
    };
    setPressMovingSquareInfo(info);
  }

  function setEnd(event: IUseCursorEventCalculator.Event) {
    if (movingInfo.current === undefined) {
      // throw new Error(`setEnd() 함수가 호출되기 전에 먼저 setMoving() 함수가 호출되어야 합니다.`);
      return;
    }

    endInfo.current = {
      element: movingInfo.current.element,
      rect: movingInfo.current.element.getBoundingClientRect(),
      cursorPositionInfo: getCursorEventPositionInfo(event),
    };

    setIsPressing(false);
    isPressingSync.current = false;
    setPressMovingSquareInfo(undefined);
    setDragHorizontalDirection('');
    setDragVerticalDirection('');
    setDragEndEvent({ endInfo: endInfo.current });
  }

  function isIncludeElementTargetSquare(element: HTMLElement | null) {
    if (element === null) return false;

    const elementPositionInfo = getElementPositionInfo(element);
    if (elementPositionInfo === undefined) return false;

    // isIncludeCase1 check
    const isIncludeXY = (x: number, y: number, targetRectCoordinateSet: IUseCursorEventCalculator.PositionCoordinateSet) => {
      let matchedCount: number = 0;
      if (targetRectCoordinateSet.pointTopLeft.x <= x && targetRectCoordinateSet.pointTopLeft.y <= y) {
        matchedCount++;
      }
      if (targetRectCoordinateSet.pointTopRight.x >= x && targetRectCoordinateSet.pointTopLeft.y <= y) {
        matchedCount++;
      }
      if (targetRectCoordinateSet.pointBottomLeft.x <= x && targetRectCoordinateSet.pointBottomLeft.y >= y) {
        matchedCount++;
      }
      if (targetRectCoordinateSet.pointBottomRight.x >= x && targetRectCoordinateSet.pointBottomLeft.y >= y) {
        matchedCount++;
      }
      return matchedCount === 4;
    };

    let isIncludeCase1: boolean = false;
    let targetPoint: IUseCursorEventCalculator.PositoinXY | undefined;
    if (pressMovingSquareInfo?.rectCoordinateSet !== undefined) {
      let matchedCount: number = 0;
      // 1) element 의 pointTopLeft 이 include 되었는지 확인하기
      targetPoint = elementPositionInfo.rectCoordinateSet.pointTopLeft;
      if (isIncludeXY(targetPoint.x, targetPoint.y, pressMovingSquareInfo.rectCoordinateSet)) {
        matchedCount++;
      }
      // 2) element 의 pointTopRight 이 include 되었는지 확인하기
      targetPoint = elementPositionInfo.rectCoordinateSet.pointTopRight;
      if (isIncludeXY(targetPoint.x, targetPoint.y, pressMovingSquareInfo.rectCoordinateSet)) {
        matchedCount++;
      }
      // 3) element 의 pointBottomLeft 이 include 되었는지 확인하기
      targetPoint = elementPositionInfo.rectCoordinateSet.pointBottomLeft;
      if (isIncludeXY(targetPoint.x, targetPoint.y, pressMovingSquareInfo.rectCoordinateSet)) {
        matchedCount++;
      }
      // 4) element 의 pointBottomRight 이 include 되었는지 확인하기
      targetPoint = elementPositionInfo.rectCoordinateSet.pointBottomRight;
      if (isIncludeXY(targetPoint.x, targetPoint.y, pressMovingSquareInfo.rectCoordinateSet)) {
        matchedCount++;
      }
      if (matchedCount > 0) {
        isIncludeCase1 = true;
      }
    }

    const topStrokeY = elementPositionInfo.rectCoordinateSet.pointTopLeft.y;
    const bottomStrokeY = elementPositionInfo.rectCoordinateSet.pointBottomLeft.y;
    const leftStrokeX = elementPositionInfo.rectCoordinateSet.pointTopLeft.x;
    const rightStrokeX = elementPositionInfo.rectCoordinateSet.pointTopRight.x;

    // isIncludeCase2 check
    let isIncludeCase2: boolean = false;
    if (pressMovingSquareInfo?.rectCoordinateSet !== undefined) {
      const squareTopStrokeY = pressMovingSquareInfo.rectCoordinateSet.pointTopLeft.y;
      const squareBottomStrokeY = pressMovingSquareInfo.rectCoordinateSet.pointBottomLeft.y;
      const squareLeftStrokeX = pressMovingSquareInfo.rectCoordinateSet.pointTopLeft.x;
      const squareRightStrokeX = pressMovingSquareInfo.rectCoordinateSet.pointTopRight.x;

      let matchedXCount: number = 0;
      let matchedYCount: number = 0;
      // x check
      if (leftStrokeX >= squareLeftStrokeX && leftStrokeX <= squareRightStrokeX) {
        matchedXCount++;
      }
      if (rightStrokeX >= squareLeftStrokeX && rightStrokeX <= squareRightStrokeX) {
        matchedXCount++;
      }
      // y check
      if (squareTopStrokeY >= topStrokeY && squareTopStrokeY <= bottomStrokeY) {
        matchedYCount++;
      }
      if (squareBottomStrokeY >= topStrokeY && squareBottomStrokeY <= bottomStrokeY) {
        matchedYCount++;
      }
      if (matchedXCount > 0 && matchedYCount > 0) {
        isIncludeCase2 = true;
      }
    }

    // isIncludeCase3 check
    let isIncludeCase3: boolean = false;
    if (pressMovingSquareInfo?.rectCoordinateSet !== undefined) {
      const squareTopStrokeY = pressMovingSquareInfo.rectCoordinateSet.pointTopLeft.y;
      const squareBottomStrokeY = pressMovingSquareInfo.rectCoordinateSet.pointBottomLeft.y;
      const squareLeftStrokeX = pressMovingSquareInfo.rectCoordinateSet.pointTopLeft.x;
      const squareRightStrokeX = pressMovingSquareInfo.rectCoordinateSet.pointTopRight.x;

      let matchedXCount: number = 0;
      let matchedYCount: number = 0;
      // y check
      if (topStrokeY >= squareTopStrokeY && topStrokeY <= squareBottomStrokeY) {
        matchedYCount++;
      }
      if (bottomStrokeY >= squareTopStrokeY && bottomStrokeY <= squareBottomStrokeY) {
        matchedYCount++;
      }
      // x check
      if (squareLeftStrokeX >= leftStrokeX && squareLeftStrokeX <= rightStrokeX) {
        matchedXCount++;
      }
      if (squareRightStrokeX >= leftStrokeX && squareRightStrokeX <= rightStrokeX) {
        matchedXCount++;
      }
      if (matchedXCount > 0 && matchedYCount > 0) {
        isIncludeCase3 = true;
      }
    }

    // isIncludeCase4 check
    let isIncludeCase4: boolean = false;
    if (pressMovingSquareInfo?.rectCoordinateSet !== undefined) {
      let matchedCount: number = 0;
      // 1) 
      targetPoint = pressMovingSquareInfo.rectCoordinateSet.pointTopLeft;
      if (isIncludeXY(targetPoint.x, targetPoint.y, elementPositionInfo.rectCoordinateSet)) {
        matchedCount++;
      }
      // 2) 
      targetPoint = pressMovingSquareInfo.rectCoordinateSet.pointTopRight;
      if (isIncludeXY(targetPoint.x, targetPoint.y, elementPositionInfo.rectCoordinateSet)) {
        matchedCount++;
      }
      // 3) 
      targetPoint = pressMovingSquareInfo.rectCoordinateSet.pointBottomLeft;
      if (isIncludeXY(targetPoint.x, targetPoint.y, elementPositionInfo.rectCoordinateSet)) {
        matchedCount++;
      }
      // 4) 
      targetPoint = pressMovingSquareInfo.rectCoordinateSet.pointBottomRight;
      if (isIncludeXY(targetPoint.x, targetPoint.y, elementPositionInfo.rectCoordinateSet)) {
        matchedCount++;
      }
      isIncludeCase4 = matchedCount === 4;
    }

    return isIncludeCase1 || isIncludeCase2 || isIncludeCase3 || isIncludeCase4;
  }

  return {
    getElementPositionInfo,
    getElementFromEvent,

    getCursorEventPositionInfo,
    getCursorElements,
    getCursorElement,

    isPressing,

    setPress,
    setMoving,
    setEnd,
    scrollX,
    scrollY,
    pressMovingSquareInfo,
    isIncludeElementTargetSquare,

    dragHorizontalDirection,
    dragVerticalDirection,
    dragEndEvent,
  };
}