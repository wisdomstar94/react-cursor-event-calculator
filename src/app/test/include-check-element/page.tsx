"use client"

import { useAddEventListener } from '@wisdomstar94/react-add-event-listener';
import { useCursorEventCalculator } from "@/hooks/use-cursor-event-calculator/use-cursor-event-calculator.hook";
import { useEffect, useRef, useState } from "react";

export default function Page() {
  const tableRef = useRef<HTMLTableElement>(null);
  const cursorEventCalculator = useCursorEventCalculator({
    squareMargin: 0,
  });
  const [data, setData] = useState<Array<Array<number>>>([
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
  ]);

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

  useEffect(() => {
    if (cursorEventCalculator.isPressing !== true) return;
    if (cursorEventCalculator.pressMovingSquareInfo === undefined) return;

    const table = tableRef.current;
    if (table === null) return;

    table.querySelectorAll<HTMLElement>('tbody td').forEach((element) => {
      if (cursorEventCalculator.isIncludeElementTargetSquare(element)) {
        element.classList.add('bg-amber-400');
      } else {
        element.classList.remove('bg-amber-400');
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursorEventCalculator.isPressing, cursorEventCalculator.pressMovingSquareInfo]);

  return (
    <>
      <div 
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

      <div className="w-[500px] h-[500px] bg-slate-300 relative">
        <table ref={tableRef} className='w-full h-full border border-t-slate-400 border-l-slate-400'>
          <thead>

          </thead>
          <tbody>
            {
              data.map((row, rowIndex) => {
                return (
                  <tr key={`row_${rowIndex}`}>
                    {
                      row.map((item, itemIndex) => {
                        return (
                          <td key={`row_${rowIndex}_td_${itemIndex}`} className='border border-r-slate-400 border-b-slate-400' data-row-index={rowIndex} data-td-index={itemIndex}>

                          </td>
                        );
                      })
                    }
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>

      <div
        style={{
          position: 'fixed',
          top: cursorEventCalculator.pressMovingSquareInfo?.top,
          left: cursorEventCalculator.pressMovingSquareInfo?.left,
          width: cursorEventCalculator.pressMovingSquareInfo?.width,
          height: cursorEventCalculator.pressMovingSquareInfo?.height,
          zIndex: 2,
        }}
        className="border border-dashed border-slate-400 bg-black/30 box-border">

      </div>

    </>
  );
}