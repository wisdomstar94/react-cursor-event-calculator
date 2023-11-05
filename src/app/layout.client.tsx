"use client"
import Link from "next/link";
import { ReactNode, useState } from "react";

interface Menu {
  name: string;
  href: string;
}

export function LayoutClient(props: { children?: ReactNode }) {
  const [menuList, setMenuList] = useState<Menu[]>([
    { name: '/test/basic', href: '/test/basic' },
    { name: '/test/cursor-scroll', href: '/test/cursor-scroll' },
    { name: '/test/include-check-element', href: '/test/include-check-element' },
  ]);

  return (
    <>
      <div className="w-full relative flex flex-wrap gap-2">
        {
          menuList.map(item => {
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className="inline-flex px-4 py-1 border border-slate-400 text-sm cursor-pointer hover:bg-slate-100"
                >
                { item.name }
              </Link>
            );
          })
        }
      </div>
      { props.children }
    </>
  );
}