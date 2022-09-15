import React from "react"
import { GraphNode } from "./editor/node"
import { getPointPos } from "./editor/helper"
import LineUI from "./presentation/LineUI"

export type LineProps = {
  start: {
    node: GraphNode
    pointId: number
  }
  end: {
    node: GraphNode
    pointId: number
  }
  isFocused: boolean
  onFocus: () => void
  onDelete: () => void
  isHighlighted?: boolean
}

const Line: React.FC<LineProps> = ({
  start,
  end,
  isFocused,
  onFocus,
  onDelete,
  isHighlighted = false,
}) => {
  const startPointPos = getPointPos("out", start.node, start.pointId)
  const endPointPos = getPointPos("in", end.node, end.pointId)
  const deltaX = endPointPos.x - startPointPos.x
  const deltaY = endPointPos.y - startPointPos.y
  return (
    <div className="pointer-events-none absolute top-0 left-0">
      <LineUI
        startPos={{ x: startPointPos.x, y: startPointPos.y }}
        delta={{ x: deltaX, y: deltaY }}
        isFocused={isFocused}
        isHighlighted={isHighlighted}
        onFocus={onFocus}
        onDelete={onDelete}
      />
    </div>
  )
}

export default Line
