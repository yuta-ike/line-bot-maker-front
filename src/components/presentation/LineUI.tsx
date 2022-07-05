import classNames from "classnames";
import React, { useEffect, useState } from "react";

export type LineUIProps = {
  startPos: { x: number; y: number };
  delta: { x: number; y: number };
  onDelete?: () => void;
};

const LineUI: React.FC<LineUIProps> = ({ startPos, delta, onDelete }) => {
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const listener = () => setIsFocused(false);
    window.addEventListener("click", listener);
    return () => window.removeEventListener("click", listener);
  }, []); //初回のみ実行

  useEffect(() => {
    window.addEventListener("keydown", (e) => {
      if (e.key === "Backspace") {
        onDelete?.();
      }
    });
  }, []); //初回のみ実行

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="overflow-visible pointer-events-none"
    >
      <path
        d={`M ${startPos.x},${startPos.y} Q ${startPos.x} ${
          startPos.y + delta.y / 4
        } ${startPos.x + delta.x / 2},${startPos.y + delta.y / 2} T ${
          startPos.x + delta.x
        } ${startPos.y + delta.y}`}
        fill="none"
        stroke="black"
        className={classNames(
          "cursor-pointer pointer-events-auto transition",
          isFocused
            ? "stroke-red-600 stroke-[6px]"
            : "stroke-gray-500 stroke-[4px]"
        )}
        onClick={(e) => {
          e.stopPropagation();
          setIsFocused(true);
        }}
      />
    </svg>
  );
};

export default LineUI;
