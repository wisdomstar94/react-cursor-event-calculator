"use client"

import { useAddEventListener } from '@wisdomstar94/react-add-event-listener';
import { useCursorEventCalculator } from "@/hooks/use-cursor-event-calculator/use-cursor-event-calculator.hook";
import { useRef } from "react";

export default function Page() {
  const divRef = useRef<HTMLDivElement>(null);
  const cursorEventCalculator = useCursorEventCalculator({
    dragAreaMargin: 0,
  });

  useAddEventListener({
    windowEventRequiredInfo: {
      eventName: 'mousedown',
      eventListener(event) {
        cursorEventCalculator.setPress(document.body, { mouseEvent: event });
      },
    },
  });

  useAddEventListener({
    windowEventRequiredInfo: {
      eventName: 'mousemove',
      eventListener(event) {
        cursorEventCalculator.setMoving({ mouseEvent: event });
      },
    },
  });

  useAddEventListener({
    windowEventRequiredInfo: {
      eventName: 'mouseup',
      eventListener(event) {
        cursorEventCalculator.setEnd({ mouseEvent: event });
      },
    },
  });

  return (
    <>
      <div 
        ref={divRef}
        className="w-[600px] h-[600px] bg-amber-300"
        // onMouseDown={(event) => {
        //   cursorEventCalculator.setPress(divRef.current, { reactMouseEvent: event });
        // }}
        // onMouseMove={(event) => {
        //   cursorEventCalculator.setMoving({ reactMouseEvent: event });
        // }}
        // onMouseUp={(event) => {
        //   cursorEventCalculator.setEnd({ reactMouseEvent: event });
        // }}
        >

      </div>

      <div className="w-[500px] h-[500px] bg-slate-300">

      </div>

      <div
        style={{
          position: 'fixed',
          top: cursorEventCalculator.dragAreaInfo?.top,
          left: cursorEventCalculator.dragAreaInfo?.left,
          width: cursorEventCalculator.dragAreaInfo?.width,
          height: cursorEventCalculator.dragAreaInfo?.height,
          zIndex: 2,
        }}
        className="border border-dashed border-slate-400 bg-black/30 box-border">

      </div>

    </>
  );
}