import { type ReactElement, useMemo, useState } from "react";

export type ListProps = {
  itemHeight: number;
  items: string[];
  wrapperHeight: number;
};

export default function VirtualizedList({
  itemHeight,
  items,
  wrapperHeight,
}: ListProps): ReactElement {
  const [scrollTop, setScrollTop] = useState(0);

  const renderedItemCount = useMemo(
    () => Math.ceil(wrapperHeight / itemHeight),
    [itemHeight, wrapperHeight],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: I have a different opinion?
  const visibleItems = useMemo<ReactElement[]>(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(startIndex + renderedItemCount + 1, items.length);
    const sliced: ReactElement[] = [];
    for (let i = startIndex; i < endIndex; i += 1) {
      const word = items[i];
      sliced.push(
        <li
          key={`${word}-${i}`}
          className="absolute text-2xl"
          style={{ height: `${itemHeight}px`, top: `${i * itemHeight}px` }}
        >
          {word}
        </li>
      );
    }
    return sliced;
  }, [itemHeight, items, renderedItemCount, scrollTop]);

  const listStyle = useMemo(
    () => ({ height: `${itemHeight * items.length}px` }),
    [itemHeight, items.length],
  );

  return (
    <div
      onScroll={(ev) => setScrollTop(ev.currentTarget.scrollTop)}
      className="overflow-scroll"
      style={{ height: `${wrapperHeight}px` }}
    >
      <ul
        className="bg-blue-400 relative"
        style={listStyle}
      >
        {visibleItems}
      </ul>
    </div>
  );
}
