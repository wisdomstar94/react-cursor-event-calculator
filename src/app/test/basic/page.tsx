"use client"

import { useCursorEventCalculator } from "@/hooks/use-cursor-event-calculator/use-cursor-event-calculator.hook";


export default function Page() {
  const cursorEventCalculator = useCursorEventCalculator();
  
  return (
    <>
      <div className='w-[600px] h-[500px] mt-[100px] ml-[200px] bg-red-300 relative'>
        <div
          className='w-[100px] h-[100px] bg-amber-300 cursor-pointer hover:bg-amber-500 mt-[20px] ml-[40px]'
          data-value={'me'}
          onClick={(event) => {
            console.log('@event', event);

            const element = cursorEventCalculator.getElementFromEvent({ reactMouseEvent: event }, {
              requiredKeyValueItems: [
                { key: 'data-value', value: 'm3', checkType: 'include' },
                { key: 'data-value2', value: 'm2', checkType: 'include' },
              ],
              requiredKeyValueItemsCheckType: 'or',
            });
            console.log('@element', element);

            const info = cursorEventCalculator.getElementPositionInfo(element);
            console.log('@info', info);

            const cursorEventInfo = cursorEventCalculator.getCursorEventPositionInfo({ reactMouseEvent: event });
            console.log('@cursorEventInfo', cursorEventInfo);
          }}
          >
          <div className='w-[50px] h-[50px] mt-[20px] ml-[20px] relative bg-purple-400' data-value={'m3'}>

          </div>
        </div>
      </div>
      <div className='w-[600px] h-[500px] mt-[100px] ml-[700px] bg-blue-300 relative'>

      </div>
    </>
  );
}