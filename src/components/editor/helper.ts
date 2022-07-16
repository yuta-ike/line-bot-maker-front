import { Edge, GraphNode } from "./node"

export const getPointPos = (
  inOrOut: "in" | "out",
  node: GraphNode,
  pointId: number,
) => ({
  x: node.pos.x + (160 / (node[`${inOrOut}Points`].length + 1)) * (pointId + 1),
  y: node.pos.y + (inOrOut === "in" ? 0 : 80),
})

export const isSameEdge = (e1: Edge, e2: Edge) => {
  return (
    e1.start.nodeId === e2.start.nodeId &&
    e1.start.pointId === e2.start.pointId &&
    e1.end.nodeId === e2.end.nodeId &&
    e1.end.pointId === e2.end.pointId
  )
}
