import classNames from "classnames"
import { useCallback, useEffect, useId, useMemo, useState } from "react"
import Draggable from "react-draggable"
import {
  calcEdgeId,
  getPointPos,
  isSameEdge,
} from "../../components/editor/helper"
import {
  Coordinate,
  Edge,
  GraphNode,
  GraphNodeClass,
} from "../../components/editor/node"
import useCursorPos from "../../components/utils/getCursorPos"
import Line from "../../components/Line"
import LineUI from "../../components/presentation/LineUI"
import TextInputNode from "../../components/nodetypes/TextInputNode"
import TextOutputNode from "../../components/nodetypes/TextOutputNode"
import CorrespondCheckNode from "../../components/nodetypes/CorrespondCheckNode"
import IncludeCheckNode from "../../components/nodetypes/IncludeCheckNode"
import WeatherCheckNode from "../../components/nodetypes/WeatherCheckNode"
import { FiCopy, FiTrash2 } from "react-icons/fi"
import execFlowChart from "../../interpreter"
import { FiAlertCircle } from "react-icons/fi"
import { InterpreterError } from "../../interpreter/error"
import TopBar from "../../components/TopBar"
import BottomBar from "../../components/BottomBar"
import { useRouter } from "next/router"
import { useLiff, useUser } from "../../provider/LiffProvider"
import { FlowChart } from "../../interpreter/type"
import buildInviteMessage from "../../components/utils/flexMessage"
import { useSnackBar } from "../../components/NotificationSnackBar"
import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string

//nodeの初期値を設定
//初期で4個のnodeを定義している
const genInitNodes = () => [
  new GraphNodeClass(
    {
      label: "テキスト入力",
      color: "#06c755",
      nodeType: "textInputNode",
    },
    {
      pos: {
        x: 50,
        y: 100,
      },
      inPoints: [],
      outPoints: [{ type: "number", label: "confirmed", limit: null }],
      isInitialNode: true,
    },
  ),
  new GraphNodeClass(
    {
      label: "テキスト含有",
      color: "#a9a9a9",
      nodeType: "includeCheckNode",
    },
    {
      pos: {
        x: 50,
        y: 225,
      },
      inPoints: [{ type: "number", label: "", limit: null }],
      outPoints: [
        { type: "number", label: "yes", limit: null },
        { type: "number", label: "no", limit: null },
      ],
      isInitialNode: true,
    },
  ),
  new GraphNodeClass(
    {
      label: "テキスト一致",
      color: "#a9a9a9",
      nodeType: "correspondCheckNode",
    },
    {
      pos: {
        x: 50,
        y: 350,
      },
      inPoints: [{ type: "number", label: "", limit: null }],
      outPoints: [
        { type: "number", label: "yes", limit: null },
        { type: "number", label: "no", limit: null },
      ],
      isInitialNode: true,
    },
  ),
  new GraphNodeClass(
    {
      label: "テキスト出力",
      color: "#06c755",
      nodeType: "textOutputNode",
    },
    {
      pos: {
        x: 50,
        y: 475,
      },
      inPoints: [{ type: "number", label: "", limit: null }],
      outPoints: [],
      isInitialNode: true,
    },
  ),
  new GraphNodeClass(
    {
      label: "天気予報",
      color: "#4169e1",
      nodeType: "weatherCheckNode",
    },
    {
      pos: {
        x: 50,
        y: 600,
      },
      inPoints: [{ type: "number", label: "", limit: null }],
      outPoints: [
        { type: "number", label: "晴れ", limit: null },
        { type: "number", label: "曇り", limit: null },
        { type: "number", label: "雨", limit: null },
      ],
      isInitialNode: true,
    },
  ),
]

const checkNodeType = (node: GraphNodeClass) => {
  if (node.node.nodeType == "textInputNode") {
    return <TextInputNode />
  } else if (node.node.nodeType == "includeCheckNode") {
    return <IncludeCheckNode node={node} />
  } else if (node.node.nodeType == "correspondCheckNode") {
    return <CorrespondCheckNode node={node} />
  } else if (node.node.nodeType == "textOutputNode") {
    return <TextOutputNode node={node} />
  } else if (node.node.nodeType == "weatherCheckNode") {
    return <WeatherCheckNode />
  } else {
    return node.node.label
  }
}

const ComponentsSideList: React.FC = () => {
  const router = useRouter()
  const botId = router.query.botId as string
  const user = useUser()
  const liff = useLiff()
  const showSnackBar = useSnackBar()

  const [name, setName] = useState("")
  //nodeとedgeの状態管理
  const [nodes, setNodes] = useState<GraphNodeClass[]>(() => genInitNodes())
  const [edges, setEdges] = useState<Edge[]>([])
  const [testcase, setTestcase] = useState("Hello")

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

  /**
   * データベースから初期位置となるフローチャートを取得
   */
  useEffect(() => {
    if (botId == null) {
      return
    }
    ;(async () => {
      // NOTE: API呼び出しがまだ未実装なためreturn
      return

      const res = null as any // NOTE: API呼び出し: GET /bot/:botid
      const flowChart: FlowChart = JSON.parse(res.data.flowChart)
      setNodes((prev) => [
        ...prev,
        ...flowChart.map(
          ({ node }) =>
            new GraphNodeClass(node.node, {
              id: `SAVED_${node.id}`,
              pos: node.pos,
              inPoints: node.inPoints,
              outPoints: node.outPoints,
              createrInputValue: node.createrInputValue,
              isInitialNode: false,
            }),
        ),
      ])
      setEdges((prev) => [
        ...prev,
        ...flowChart
          .map(({ node, outputs }) =>
            outputs.map((outNodeId, i) => ({
              start: {
                nodeId: `SAVED_${node.id}`,
                pointId: i,
              },
              end: {
                nodeId: `SAVED_${outNodeId}`,
                pointId: 0,
              },
            })),
          )
          .flat(1),
      ])
      setName(res.data.name)
    })()
  }, [botId])

  //初期のnodeがドラッグされると初期位置に新たなnodeを追加する
  //ドラッグされたnodeを受け取り，それが初期位置にあったnodeなら初期位置に同じnodeを追加
  const regenerateNode = (node: GraphNodeClass) => {
    if (node.isInitialNode) {
      nodes.push(
        //ここでダイレクトにnodeを追加すると同じnodeオブジェクトをnodeをnodesに追加することになるので，もとのnodeと同じ情報をもつnodeを新たに生成する（idは異なる）
        new GraphNodeClass(
          {
            label: node.node.label,
            color: node.node.color,
            nodeType: node.node.nodeType,
          },
          {
            pos: node.pos,
            inPoints: node.inPoints,
            outPoints: node.outPoints,
            isInitialNode: true,
          },
        ),
      )
    }
  }

  //getNodeに関数を代入しているだけ
  const getNode = useCallback(
    (nodeId: string) => {
      //idがnullのときだけ評価される
      return nodes.find(({ id }) => id === nodeId) ?? null
    },
    [nodes],
  )

  //一時的に触っているnodeのidとpointのid
  const [tmpEdgeStartNodeId, setTempEdgeStartNodeId] = useState<{
    nodeId: string
    pointId: number
    //|はnull許容用
  } | null>(null)

  // 一時的に触っているnodeとpoint id
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

  // NOTE: ノードが削除された場合に、関連するエッジも削除する
  useEffect(() => {
    const nodeIds = nodes.map(({ id }) => id)
    setEdges((edges) =>
      edges.filter((edge) => nodeIds.includes(edge.start.nodeId)),
    )
  }, [nodes])

  // NOTE: ノードの削除
  const handleDelete = useCallback((node: GraphNode) => {
    setNodes((nodes) => nodes.filter(({ id }) => id !== node.id))
    setEdges((edges) =>
      edges.filter(
        ({ start, end }) => start.nodeId !== node.id && end.nodeId !== node.id,
      ),
    )
  }, [])

  // NOTE: ノードの複製
  const handleDuplicate = useCallback((node: GraphNodeClass) => {
    const duplicatedNodePos = {
      x: node.pos.x + 250,
      y: node.pos.y,
    }
    setNodes((nodes) => [...nodes, node.duplicate(duplicatedNodePos)])
  }, [])

  const handleReset = useCallback(() => {
    setNodes(genInitNodes())
    setEdges([])
  }, [])

  //カーソルのpositionをチェック
  const cursorPos = useCursorPos(tmpEdgeStartNodeId != null)

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
              outputs: relatedEdges.map(({ end }) => end.nodeId),
            }
          }),
        {
          message: testcase,
        },
      )
      return {
        ...result,
        error: null,
      }
    } catch (e: unknown) {
      if (e instanceof InterpreterError) {
        return {
          value: null,
          stackTrace: e.stackTrace,
          error: e,
        }
      } else {
        throw e
      }
    }
  }, [edges, nodes, testcase])

  /**
   * フローチャートの保存処理
   */
  const handleSave = async () => {
    if (user == null) {
      window.alert("保存に失敗しました")
      return
    }
    const flowchart = nodes
      .filter(({ isInitialNode }) => !isInitialNode)
      .map((node) => {
        const relatedEdges = edges.filter(
          ({ start }) => start.nodeId === node.id,
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
            createrInputValue: node.createrInputValue,
          },
          outputs: relatedEdges.map(({ end }) => end.nodeId),
        }
      })

    const payload = {
      name,
      flowChart: JSON.stringify(flowchart),
      developperId: user.id,
    }

    // NOTE: API呼び出し: PUT /bot/:botid
  }

  /**
   * フローチャートのLINE共有処理
   */
  const handleShare = useCallback(async () => {
    try {
      await liff!.shareTargetPicker([
        buildInviteMessage({
          name,
          botId,
          createdAt: new Date().toISOString().slice(0, 10),
        }),
      ])
    } catch {
      showSnackBar("error", "共有に失敗しました")
    }
  }, [botId, liff, name, showSnackBar])

  /**
   * フローチャートの削除処理
   */
  const handleDeleteBot = useCallback(async () => {
    try {
      const res = window.confirm("本当に削除しますか？")
      if (res) {
        // NOTE: API呼び出し: DELETE /bot/:botid
        router.push("/")
      }
    } catch {
      showSnackBar("error", "削除に失敗しました")
    }
  }, [router, showSnackBar])

  const rootId = useId()

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-grow">
        <TopBar name={name} onChangeName={setName} />
        <div id="concept">
          {/* 枠線の指定 */}
          <div className="flex">
            <div className="fixed inset-y-[60px] right-0 m-4 flex w-max max-w-[30%] flex-col space-y-2 overflow-y-scroll break-all rounded border-2 border-[#efefef] bg-white/50 p-4 backdrop-blur">
              <div>
                <div className="text-sm text-gray-500">入力</div>
                <input
                  type="text"
                  className="rounded border border-[#efefef] px-3 py-2 focus:outline-none"
                  placeholder="入力値"
                  value={testcase}
                  onChange={(e) => setTestcase(e.target.value)}
                />
              </div>
              <div>
                <div className="text-sm text-gray-500">出力</div>
                <input
                  className={classNames(
                    "rounded border border-[#efefef] bg-white px-3 py-2 focus:outline-none",
                    (result == null || result?.value === "") && "text-gray-300",
                  )}
                  value={result?.value || "<値なし>"}
                  disabled
                  placeholder="出力"
                />
              </div>

              <div>
                {result?.stackTrace?.map((trace, i) => (
                  <div key={i}>
                    {trace.result === "success" ? (
                      <>
                        <span className="text-sm">#{trace.nodeId}</span>
                        <br />
                        <code className="bg-blue-100">
                          {trace.inMessage || "<入力なし>"}
                        </code>{" "}
                        to{" "}
                        <code className="bg-blue-100">
                          {trace.outMessage || "<入力なし>"}
                        </code>
                      </>
                    ) : (
                      <>
                        {trace.nodeId}
                        <br />
                        <code className="bg-blue-100">{trace.inMessage}</code>
                        <br />
                        {trace.error}
                      </>
                    )}
                  </div>
                ))}
              </div>

              {result.error?.message != null && (
                <div className="flex items-center space-x-1 text-sm text-red-500">
                  <FiAlertCircle className="shrink-0" />
                  <span>{result.error.message}</span>
                </div>
              )}
            </div>
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
              {/* 線? */}
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
                        //このデルタはなに？
                        delta={{
                          //-32を消した
                          x: cursorPos.x - startPointPos.x,
                          y: cursorPos.y - startPointPos.y,
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
                    defaultClassName="!absolute top-0 left-0"
                    defaultClassNameDragging="group"
                    //dataはカーソルの位置が入る？
                    onDrag={(_, data) =>
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
                    }
                    onStart={() => {
                      regenerateNode(node)
                      // NOTE: 本当は良くない
                      node.isInitialNode = false
                    }}
                  >
                    <div>
                      {/* コピーと削除のボタン */}
                      {/* TODO: 現在はフォーカスされている時に表示されるが、うざいので改善したい */}
                      <div
                        className={classNames(
                          "absolute top-0 ml-2 flex flex-col space-y-1 transition-[left]",
                          isFocused ? "left-full" : "left-0",
                        )}
                      >
                        <button
                          className="flex w-max items-center space-x-1 rounded bg-blue-400 px-2 py-1 text-sm text-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDuplicate(node)
                          }}
                        >
                          <FiCopy size="16px" />
                          <span>コピー</span>
                        </button>
                        <button
                          className="flex w-max items-center space-x-1 rounded bg-red-400 px-2 py-1 text-sm text-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(node)
                          }}
                        >
                          <FiTrash2 size="16px" />
                          <span>ゴミ箱</span>
                        </button>
                      </div>

                      {/* <> */}
                      {/* nodeの大枠を決める */}
                      <div
                        className={classNames(
                          "relative flex h-[90px] w-40 items-center justify-center rounded text-white shadow transition",
                          isFocused &&
                            "ring-4 ring-blue-400 group-hover:shadow-2xl group-hover:ring-0",
                        )}
                        style={{ background: node.node.color }}
                        onClick={() =>
                          setFocusItemId({
                            type: "node",
                            nodeId: node.id,
                          })
                        }
                      >
                        {checkNodeType(node)}
                        {/* 位置 */}
                        <div className="absolute inset-x-0 top-0 flex -translate-y-1/2 justify-evenly">
                          {/* 機能 */}
                          {node.inPoints.map((point, i) => {
                            const isConnectableWithTempNode =
                              tmpEdgeStartNode != null &&
                              node.canConnect(
                                i,
                                tmpEdgeStartNode.node,
                                tmpEdgeStartNode.pointId,
                              )

                            return (
                              <button
                                key={i}
                                className="relative"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (!isConnectableWithTempNode) {
                                    return
                                  }
                                  const edge = {
                                    start: {
                                      nodeId: tmpEdgeStartNode.node.id,
                                      pointId: tmpEdgeStartNode.pointId,
                                    },
                                    end: {
                                      nodeId: node.id,
                                      pointId: i,
                                    },
                                  }
                                  setEdges((prev) => [...prev, edge])
                                  setTempEdgeStartNodeId(null)
                                }}
                              >
                                {/* inputを選択しているときに，つなげられる可能性のある点の色分け */}
                                <div
                                  className={classNames(
                                    "h-5 w-5 rounded-full border-2 border-white transition",
                                    tmpEdgeStartNodeId == null
                                      ? "border-white bg-green-500 hover:scale-110"
                                      : isConnectableWithTempNode
                                      ? "scale-100 border-white bg-green-500 hover:scale-110"
                                      : "scale-50 cursor-not-allowed border-gray-100 bg-gray-300",
                                  )}
                                />
                                {/* inputの文字 */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 text-sm leading-none text-white">
                                  {point.label}
                                </div>
                              </button>
                            )
                          })}
                        </div>
                        {/* outPointsの描画 */}
                        <div className="absolute inset-x-0 bottom-0 flex translate-y-1/2 justify-evenly">
                          {node.outPoints.map((point, i) => (
                            <button
                              key={i}
                              className="relative"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (tmpEdgeStartNode != null) {
                                  return
                                }
                                setFocusItemId(null)
                                setTempEdgeStartNodeId({
                                  nodeId: node.id,
                                  pointId: i,
                                })
                              }}
                            >
                              {/* inPointsを選択中に，outPointsの色を変更する */}
                              <div
                                className={classNames(
                                  "h-5 w-5 rounded-full border-2 border-white transition",
                                  tmpEdgeStartNodeId == null
                                    ? "bg-yellow-500 hover:scale-110"
                                    : "scale-50 cursor-not-allowed bg-gray-300",
                                )}
                              />
                              {/* outputの文字 */}
                              <div className="absolute bottom-full left-1/2 w-max -translate-x-1/2 rounded-sm px-1 py-0.5 text-sm leading-none text-white">
                                {point.label}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Draggable>
                )
              })}
            </div>
          </div>
        </div>
      </main>
      <footer>
        <BottomBar
          botId={botId}
          onSave={handleSave}
          onShare={handleShare}
          onDelete={handleDeleteBot}
          onReset={handleReset}
        />
      </footer>
    </div>
  )
}

export default ComponentsSideList
