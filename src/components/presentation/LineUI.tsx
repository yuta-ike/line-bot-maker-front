import classNames from "classnames"
import React, { useCallback, useEffect } from "react"
import { FiTrash2 } from "react-icons/fi"

export type LineUIProps = {
  startPos: { x: number; y: number }
  delta: { x: number; y: number }
  isFocused?: boolean
  onFocus?: () => void
  onDelete?: () => void
}

const LineUI: React.FC<LineUIProps> = ({
  startPos,
  delta,
  isFocused = false,
  onFocus,
  onDelete,
}) => {
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Backspace" && e.ctrlKey === true && isFocused) {
        console.log("onDelete@LineUI")
        onDelete?.()
      }
    }
    window.addEventListener("keydown", listener)
    return () => window.removeEventListener("keydown", listener)
  }, [isFocused, onDelete]) //初回のみ実行

  const path = `M ${startPos.x},${startPos.y} Q ${startPos.x} ${
    startPos.y + delta.y / 4
  } ${startPos.x + delta.x / 2},${startPos.y + delta.y / 2} T ${
    startPos.x + delta.x
  } ${startPos.y + delta.y}`

  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none overflow-visible"
      >
        {/* NOTE: クリック領域を拡大するために、透明な太い線を設定 */}
        <path
          d={path}
          fill="none"
          stroke="transparent"
          strokeWidth={20}
          className="pointer-events-auto cursor-pointer"
          onClick={onFocus}
        />
        <path
          d={path}
          fill="none"
          stroke="black"
          className={classNames(
            "pointer-events-none transition-[stroke,stroke-width]",
            isFocused
              ? "stroke-red-400 stroke-[6px] drop-shadow-2xl"
              : "stroke-gray-500 stroke-[4px]",
          )}
        />
      </svg>
      <div
        className={classNames(
          "absolute -translate-x-1/2 -translate-y-1/2",
          !isFocused && "invisible",
        )}
        style={{
          top: startPos.y + delta.y / 2,
          left: startPos.x + delta.x / 2,
        }}
      >
        <button
          className="group group flex items-center justify-center rounded-full border-[3px] border-red-400 bg-red-400 p-1.5 text-white transition-[background-color,border-color] hover:bg-white hover:text-red-400"
          onClick={onDelete}
        >
          <FiTrash2
            size="18px"
            className="transition group-hover:scale-110 group-hover:stroke-[2px]"
          />
        </button>
      </div>
    </>
  )
}

export default LineUI
