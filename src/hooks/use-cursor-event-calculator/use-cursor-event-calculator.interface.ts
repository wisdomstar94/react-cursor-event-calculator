import type { 
  MouseEvent as ReactMouseEvent, 
  TouchEvent as ReactTouchEvent,
  PointerEvent as ReactPointerEvent,
} from "react";

export declare namespace IUseCursorEventCalculator {
  export type HorizontalDirection = 'left' | 'right' | '';
  export type VerticalDirection = 'top' | 'bottom' | '';

  export interface Event {
    mouseEvent?: MouseEvent;
    touchEvent?: TouchEvent;
    pointerEvent?: PointerEvent;
    reactMouseEvent?: ReactMouseEvent;
    reactTouchEvent?: ReactTouchEvent;
    reactPointerEvent?: ReactPointerEvent;
  }

  export interface PositionClient {
    top: number;
    left: number;
  }

  export interface PositionOffset {
    top: number;
    left: number;
    width: number;
    height: number;
  }

  export interface PositoinXY {
    x: number;
    y: number;
  }

  export interface PositionCoordinateSet {
    /** 요소의 상단 좌측 좌표 */
    pointTopLeft: PositoinXY;
    /** 요소의 상단 우측 좌표 */
    pointTopRight: PositoinXY;
    /** 요소의 하단 좌측 좌표 */
    pointBottomLeft: PositoinXY;
    /** 요소의 하단 우측 좌표 */
    pointBottomRight: PositoinXY;
  }

  export interface ElementPositionInfo {
    /** 부모 요소 기준 */
    client: PositionClient;
    /** 부모 요소 기준 */
    offset: PositionOffset;
    /** 창 테두리 기준 */
    rect: DOMRect;
    /** 창 테두리 기준 요소의 top-left, top-right, bottom-left, bottom-right 4개 좌표 정보 */
    rectCoordinateSet: PositionCoordinateSet;
    /** 창 테두리 기준 요소의 top-left, top-right, bottom-left, bottom-right 4개 좌표에 window(body) 스크롤 값을 더한, body 기준 절대 좌표 정보 */
    bodyAbsoluteRectCoordinateSet: PositionCoordinateSet;
  }

  export interface CursorPositionInfo {
    /** 창 테두리 기준으로 이벤트가 발생한 지점의 x, y 좌표 정보 */
    client: PositoinXY | undefined;
    /** body 기준으로 이벤트가 발생한 지점의 x, y 절대 좌표 정보, (예를 들어 화면상에 1px, 1px 사이즈로 렌더링된 요소를 클릭할 때 스크롤이 얼마나 되어 있던지 간에 항상 같은 좌표가 찍힌다.) */
    page: PositoinXY | undefined;
  }

  export type RequiredKeyValueItemCheckType = 'full-match' | 'include';

  export type RequiredKeyValueItemsCheckType = 'and' | 'or';

  export interface RequiredKeyValueItem {
    key: string;
    value: string;
    checkType: RequiredKeyValueItemCheckType;
    checkOnToParentDepthLimit?: number;
  }

  export interface ElementPositionInfoFromEventTargetOptions {
    requiredKeyValueItems: Array<RequiredKeyValueItem>;
    requiredKeyValueItemsCheckType: RequiredKeyValueItemsCheckType;
  }

  export interface CursorCalculateTargetInfo {
    element: HTMLElement;
    rect: DOMRect;
    cursorPositionInfo: CursorPositionInfo;
  }

  export interface DragAreaInfo {
    width: number;
    height: number;
    top?: number;
    left?: number;
    rectCoordinateSet?: PositionCoordinateSet;
    // positionCoordinateSet: IUseCursorEventCalculator.PositionCoordinateSet;
  }

  export interface DragEndEvent {
    endInfo: CursorCalculateTargetInfo;
  }

  export interface Props {
    squareMargin?: number;
  }
}