import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react"
import { Edge, GraphNode, GraphNodeClass } from "./node"
import execFlowChart from "../../interpreter"
import useCursorPos from "../utils/getCursorPos"
import { InterpreterError } from "../../interpreter/error"
import classNames from "classnames"
import { FiCopy, FiTrash2 } from "react-icons/fi"
import LineUI from "../presentation/LineUI"
import { calcEdgeId, getPointPos, isSameEdge } from "./helper"
import Line from "../Line"
import Draggable from "react-draggable"
import NodeCard from "../NodeCard"
import Sidebar from "./Sidebar"

export type FlowchartEditorProps = {
  nodes: GraphNodeClass[]
  setNodes: Dispatch<SetStateAction<GraphNodeClass[]>>
  edges: Edge[]
  setEdges: Dispatch<SetStateAction<Edge[]>>
  testcase: string
  setTestcase: Dispatch<SetStateAction<string>>
  mockValues: Record<string, string>
  setMockValues: Dispatch<SetStateAction<Record<string, string>>>
}

const FlowchartEditor: React.FC<FlowchartEditorProps> = ({
  nodes,
  edges,
  setEdges,
  setNodes,
  testcase,
  setTestcase,
  mockValues,
  setMockValues,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [showFlowDebug, setShowFlowDebug] = useState(false)
  const [focusItemId, setFocusItemId] = useState<
    | { type: "node"; nodeId: string }
    | {
        type: "edge"
        start: {
          nodeId: string
          pointId: number
        }
        end: {
          nodeId: string
          pointId: number
        }
      }
    | null
  >(null)

  const getNode = useCallback(
    (nodeId: string) => nodes.find(({ id }) => id === nodeId) ?? null,
    [nodes],
  )

  const regenerateSampleNode = (node: GraphNodeClass) => {
    if (node.isInitialNode) {
      const newSampleNode = node.duplicate()
      newSampleNode.isInitialNode = true
      setNodes((prev) => [newSampleNode, ...prev])
      setNodes((prev) =>
        prev.map((n) => {
          if (node.id === n.id) {
            n.isInitialNode = false
          }
          return n
        }),
      )
    }
  }

  const [tmpEdgeStartNodeId, setTempEdgeStartNodeId] = useState<{
    nodeId: string
    pointId: number
  } | null>(null)

  const tmpEdgeStartNode = useMemo(() => {
    if (tmpEdgeStartNodeId == null) {
      return null
    }
    const tmpNode = getNode(tmpEdgeStartNodeId.nodeId)
    if (tmpNode == null) {
      return null
    }
    return {
      node: tmpNode,
      pointId: tmpEdgeStartNodeId.pointId,
    }
  }, [getNode, tmpEdgeStartNodeId])

  const cursorPos = useCursorPos(tmpEdgeStartNodeId != null)

  // NOTE: ノードが削除された場合に、関連するエッジも削除する
  useEffect(() => {
    const nodeIds = nodes.map(({ id }) => id)
    setEdges((edges) =>
      edges.filter((edge) => nodeIds.includes(edge.start.nodeId)),
    )
  }, [nodes, setEdges])

  // NOTE: ノードの削除
  const handleDelete = useCallback(
    (node: GraphNode) => {
      setNodes((nodes) => nodes.filter(({ id }) => id !== node.id))
      setEdges((edges) =>
        edges.filter(
          ({ start, end }) =>
            start.nodeId !== node.id && end.nodeId !== node.id,
        ),
      )
    },
    [setEdges, setNodes],
  )

  // NOTE: ノードの複製
  const handleDuplicate = useCallback(
    (node: GraphNodeClass) => {
      const duplicatedNodePos = {
        x: node.pos.x + 250,
        y: node.pos.y,
      }
      setNodes((nodes) => [...nodes, node.duplicate(duplicatedNodePos)])
    },
    [setNodes],
  )

  useEffect(() => {
    if (!isDragging) {
      setNodes((nodes) =>
        nodes.filter((node) => 360 <= node.pos.x || node.isInitialNode),
      )
    }
  }, [isDragging, setNodes])

  /**
   * フローチャートのリアルタイム実行
   */
  const result = useMemo(() => {
    try {
      const result = execFlowChart(
        nodes
          .filter(({ isInitialNode }) => !isInitialNode)
          .map((node) => {
            const relatedEdges = edges.filter(
              ({ start }) => start.nodeId === node.id,
            )
            const relatedEdgeMap = Object.fromEntries(
              relatedEdges.map(({ start, end }) => [start.pointId, end.nodeId]),
            )
            return {
              id: node.id,
              node: {
                ...node,
                type: node.node.nodeType as
                  | "textInputNode"
                  | "correspondCheckNode"
                  | "textOutputNode"
                  | "nop",
                userInputValue: node.createrInputValue,
              },
              // outputs: relatedEdges.map(({ end }) => end.nodeId),
              outputs: node.outPoints.map((_, i) => relatedEdgeMap[i]),
            }
          }),
        {
          message: testcase,
        },
        mockValues,
      )
      return {
        type: "success" as const,
        ...result,
        error: null,
      }
    } catch (e: unknown) {
      if (e instanceof InterpreterError) {
        return {
          type: "failure" as const,
          value: null,
          stackTrace: e.stackTrace,
          error: e,
        }
      } else {
        throw e
      }
    }
  }, [edges, mockValues, nodes, testcase])

  const rootId = useId()

  return (
    <div className="flex">
      <div id="concept" className="flex-grow">
        {/* 枠線の指定 */}
        <div className="relative flex">
          <Sidebar
            className="fixed inset-y-[60px] right-0 m-4"
            nodes={nodes}
            result={result}
            testcase={testcase}
            setTestcase={setTestcase}
            mockValues={mockValues}
            setMockValues={setMockValues}
            showFlowDebug={showFlowDebug}
            onChangeShowFlowDebug={(v) => setShowFlowDebug(v)}
          />
          <div className="absolute inset-y-0 left-0 w-[360px] bg-gray-100" />
          <div
            id={rootId}
            className="draggable-parent static min-h-screen flex-grow border border-blue-100"
            onClick={(e) => {
              // @ts-ignore
              if (e.target.id === rootId) {
                setFocusItemId(null)
              }
              setTempEdgeStartNodeId(null)
            }}
          >
            {tmpEdgeStartNode != null &&
              (() => {
                const tmpStartNode = getNode(tmpEdgeStartNode.node.id)
                if (tmpStartNode == null) {
                  return null
                }
                //始点のデータを取得
                const startPointPos = getPointPos(
                  "out",
                  tmpStartNode,
                  tmpEdgeStartNode.pointId,
                )
                return (
                  <div
                    className="absolute top-0 left-0 h-full w-full"
                    key="temp"
                  >
                    <LineUI
                      startPos={startPointPos}
                      delta={{
                        x: cursorPos.x - startPointPos.x,
                        y: cursorPos.y - startPointPos.y - 45,
                      }}
                    />
                  </div>
                )
              })()}
            {edges.map((edge) => {
              const startNode = getNode(edge.start.nodeId)
              const endNode = getNode(edge.end.nodeId)
              if (startNode == null || endNode == null) {
                return
              }
              const isHighlighted =
                showFlowDebug &&
                result.stackTrace?.some(
                  (item, i) =>
                    item.nodeId === startNode.id &&
                    result.stackTrace?.[i + 1]?.nodeId === endNode.id,
                )

              return (
                <Line
                  key={calcEdgeId(edge)}
                  start={{
                    node: startNode,
                    pointId: edge.start.pointId,
                  }}
                  end={{
                    node: endNode,
                    pointId: edge.end.pointId,
                  }}
                  isFocused={
                    focusItemId?.type === "edge" &&
                    focusItemId.start.nodeId === edge.start.nodeId &&
                    focusItemId.start.pointId === edge.start.pointId &&
                    focusItemId.end.nodeId === edge.end.nodeId &&
                    focusItemId.end.pointId === edge.end.pointId
                  }
                  isHighlighted={isHighlighted}
                  onFocus={() =>
                    setFocusItemId({
                      type: "edge",
                      start: {
                        nodeId: edge.start.nodeId,
                        pointId: edge.start.pointId,
                      },
                      end: {
                        nodeId: edge.end.nodeId,
                        pointId: edge.end.pointId,
                      },
                    })
                  }
                  onDelete={() =>
                    setEdges((edges) =>
                      edges.filter((e) => !isSameEdge(e, edge)),
                    )
                  }
                />
              )
            })}

            {nodes.map((node) => {
              const isFocused =
                focusItemId?.type === "node" && focusItemId.nodeId === node.id
              return (
                <Draggable
                  key={node.id}
                  position={node.pos}
                  bounds=".draggable-parent"
                  defaultClassName={classNames(
                    "!absolute top-0 left-0",
                    node.isInitialNode ? "z-0" : "z-10",
                  )}
                  defaultClassNameDragging="group"
                  onDrag={(_, data) => {
                    setFocusItemId({
                      type: "node",
                      nodeId: node.id,
                    })
                    setNodes((nodes) =>
                      nodes.map((n) =>
                        n.id !== node.id
                          ? n
                          : n.setPos({
                              x: Math.round(data.x),
                              y: Math.round(data.y),
                            }),
                      ),
                    )
                  }}
                  onStart={() => {
                    regenerateSampleNode(node)
                    setIsDragging(true)
                  }}
                  onStop={() => setIsDragging(false)}
                >
                  <div>
                    <NodeCard
                      className={classNames(
                        !node.isInitialNode && node.pos.x < 360 && "opacity-80",
                        showFlowDebug &&
                          result.stackTrace
                            ?.map(({ nodeId }) => nodeId)
                            .includes(node.id) &&
                          "rounded-xl ring-4 ring-pink-500 ring-offset-2",
                      )}
                      node={node}
                      actionButtons={
                        node.isInitialNode
                          ? []
                          : [
                              {
                                label: "コピー",
                                icon: FiCopy,
                                onClick: () => handleDuplicate(node),
                              },
                              {
                                label: "ゴミ箱",
                                icon: FiTrash2,
                                onClick: () => handleDelete(node),
                                color: "danger",
                              },
                            ]
                      }
                      onClick={() =>
                        setFocusItemId({
                          type: "node",
                          nodeId: node.id,
                        })
                      }
                      isFocused={isFocused}
                      connectableInPoint={(i: number) =>
                        !node.isInitialNode &&
                        tmpEdgeStartNode != null &&
                        node.canConnect(
                          i,
                          tmpEdgeStartNode.node,
                          tmpEdgeStartNode.pointId,
                        )
                      }
                      isConnecting={tmpEdgeStartNode != null}
                      onClickInPoint={
                        node.isInitialNode
                          ? undefined
                          : (i) => {
                              if (tmpEdgeStartNode == null) {
                                return
                              }
                              setEdges((prev) => [
                                ...prev,
                                {
                                  start: {
                                    nodeId: tmpEdgeStartNode.node.id,
                                    pointId: tmpEdgeStartNode.pointId,
                                  },
                                  end: {
                                    nodeId: node.id,
                                    pointId: i,
                                  },
                                },
                              ])
                              setTempEdgeStartNodeId(null)
                            }
                      }
                      onClickOutPoint={
                        node.isInitialNode
                          ? undefined
                          : (i) => {
                              const outEdgeCount = edges.filter(
                                (edge) =>
                                  edge.start.nodeId === node.id &&
                                  edge.start.pointId === i,
                              ).length
                              const limit = node.outPoints[i].limit
                              if (limit == null || outEdgeCount < limit) {
                                setFocusItemId(null)
                                setTempEdgeStartNodeId({
                                  nodeId: node.id,
                                  pointId: i,
                                })
                              }
                            }
                      }
                      emphasisOutPoint={tmpEdgeStartNodeId == null}
                    />
                  </div>
                </Draggable>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FlowchartEditor
