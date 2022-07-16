import React from "react"
import { Edge, GraphNode } from "./editor/node"
import { getPointPos } from "./editor/helper"
import LineUI from "./presentation/LineUI"

export type LineProps = {
  edge: Edge
  getNode: (nodeId: string) => GraphNode | null
  onDelete: () => void
}

const Line: React.FC<LineProps> = ({ edge, getNode, onDelete }) => {
  const startNode = getNode(edge.start.nodeId)
  const endNode = getNode(edge.end.nodeId)
  if (startNode == null || endNode == null) {
    return null
  }
  const startPointPos = getPointPos("out", startNode, edge.start.pointId)
  const endPointPos = getPointPos("in", endNode, edge.end.pointId)
  const deltaX = endPointPos.x - startPointPos.x
  const deltaY = endPointPos.y - startPointPos.y
  return (
    <div className="absolute top-0 left-0">
      <LineUI
        startPos={startPointPos}
        delta={{ x: deltaX, y: deltaY }}
        onDelete={onDelete}
      />
    </div>
  )
}

export default Line
