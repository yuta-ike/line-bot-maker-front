import { useEffect, useState } from "react"
import { throttle } from "throttle-debounce"

//keepUpdateは動いているかどうか
const useCursorPos = (keepUpdate: boolean) => {
  const [pos, setPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const listener = throttle(10, (e: MouseEvent) => {
      setPos({
        x: e.pageX,
        y: e.pageY,
      })
    })

    window.addEventListener("pointermove", listener)
    return () => window.removeEventListener("pointermove", listener)
  }, [keepUpdate])

  return pos
}

export default useCursorPos
