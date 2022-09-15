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
import { FlowChart, StackTrace } from "../../interpreter/type"
import buildInviteMessage from "../../components/utils/flexMessage"
import { useSnackBar } from "../../components/NotificationSnackBar"
import { deleteBot, getBot, updateBot } from "../../services/api_service"
import RandomNode from "../../components/nodetypes/RandomNode"
import Head from "next/head"

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
  new GraphNodeClass(
    {
      label: "ランダム選択",
      color: "#4169e1",
      nodeType: "randomNode",
    },
    {
      pos: {
        x: 50,
        y: 725,
      },
      inPoints: [{ type: "number", label: "", limit: null }],
      outPoints: [
        { type: "number", label: "A", limit: null },
        { type: "number", label: "B", limit: null },
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
  } else if (node.node.nodeType == "randomNode") {
    return <RandomNode />
  } else {
    return node.node.label
  }
}

const unwrapId = (id: string): string => {
  if (id.startsWith("SAVED_")) {
    return unwrapId(id.slice("SAVED_".length))
  } else {
    return id
  }
}

const ComponentsSideList: React.FC = () => {
  const router = useRouter()
  const botId = router.query.botId as string | undefined
  const user = useUser()
  const liff = useLiff()
  const showSnackBar = useSnackBar()

  const [name, setName] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  //nodeとedgeの状態管理
  const [nodes, setNodes] = useState<GraphNodeClass[]>(() => genInitNodes())
  const [edges, setEdges] = useState<Edge[]>([])
  const [testcase, setTestcase] = useState("Hello")
  const [mockValues, setMockValues] = useState<Record<string, string>>({})

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
    if (botId == null || user?.idToken == null || botId == null) {
      return
    }
    ;(async () => {
      const res = await getBot(user.idToken, botId)
      const flowChart: FlowChart = JSON.parse(res.flowchart)
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
      setName(res.name)
      setIsPublic(res.is_public)
    })()
  }, [botId, user?.idToken])

  const onChangeIsPublic = async (value: boolean) => {
    if (user?.idToken == null || botId == null) {
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

    try {
      await updateBot(
        user.idToken,
        botId,
        name,
        user.id,
        JSON.stringify(flowchart),
        value,
      )
      setIsPublic(value)
    } catch {
      showSnackBar("error", "エラーが発生しました")
    }
  }

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
  }, [edges, mockValues, nodes, testcase])

  /**
   * フローチャートの保存処理
   */
  const handleSave = async () => {
    if (user == null || botId == null) {
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

    try {
      await updateBot(
        user.idToken,
        botId,
        name,
        user.id,
        JSON.stringify(flowchart),
        isPublic,
      )
    } catch {
      showSnackBar("error", "エラーが発生しました")
    }
  }

  /**
   * フローチャートのLINE共有処理
   */
  const handleShare = useCallback(async () => {
    if (botId == null) {
      return
    }
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
    if (botId == null) {
      return
    }
    try {
      const res = window.confirm("本当に削除しますか？")
      if (res) {
        await deleteBot(user?.idToken ?? null, botId)
        router.push("/")
      }
    } catch {
      showSnackBar("error", "削除に失敗しました")
    }
  }, [botId, router, showSnackBar, user?.idToken])

  const effectInputs = useMemo(
    () =>
      nodes
        .filter(({ isInitialNode }) => !isInitialNode)
        .map((node) => {
          if (node.node.nodeType === "weatherCheckNode") {
            return { nodeType: "weatherCheckNode", node }
          } else if (node.node.nodeType === "randomNode") {
            return { nodeType: "randomNode", node }
          } else {
            return null
          }
        })
        .filter(
          (
            nodeType,
          ): nodeType is {
            nodeType: string
            node: GraphNodeClass
          } => nodeType != null,
        ),
    [nodes],
  )

  const rootId = useId()

  return (
    <>
      <Head>
        <title>{`${name}｜LINE Bot Maker`}</title>
      </Head>
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
          <TopBar
            name={name}
            onChangeName={setName}
            isPublic={isPublic}
            onChangeIsPublic={onChangeIsPublic}
          />
          <div id="concept">
            {/* 枠線の指定 */}
            <div className="flex">
              <div className="fixed inset-y-[60px] right-0 m-4 flex w-max max-w-[30%] flex-col space-y-2 overflow-y-scroll break-all rounded border-2 border-[#efefef] bg-white/50 p-4 backdrop-blur">
                <div>
                  <div className="text-sm text-gray-500">入力</div>
                  <input
                    type="text"
                    className="max-w-[203px] rounded border border-[#efefef] px-3 py-2 focus:outline-none"
                    placeholder="入力値"
                    value={testcase}
                    onChange={(e) => setTestcase(e.target.value)}
                  />
                </div>
                {effectInputs?.map(({ nodeType, node }, i) => (
                  <div key={node.id} className={classNames(i === 0 && "!mt-6")}>
                    <div className="text-sm text-gray-500">
                      ダミー値:{" "}
                      {nodeType === "weatherCheckNode" ? "天気" : "ランダム"}(#
                      {unwrapId(node.id)})
                    </div>
                    <select
                      className="w-full max-w-[203px] rounded border border-[#efefef] px-3 py-2 focus:outline-none"
                      placeholder="入力値"
                      value={mockValues[node.id]}
                      onChange={(e) =>
                        setMockValues((prev) => ({
                          ...prev,
                          [node.id]: e.target.value,
                        }))
                      }
                    >
                      {nodeType === "weatherCheckNode" ? (
                        <>
                          <option value="sunny">晴れ</option>
                          <option value="cloudy">曇り</option>
                          <option value="rainy">雨</option>
                        </>
                      ) : (
                        <>
                          <option value="A">A</option>
                          <option value="B">B</option>
                        </>
                      )}
                    </select>
                  </div>
                ))}
                <div className="!mt-6">
                  <div className="text-sm text-gray-500">出力</div>
                  <input
                    className={classNames(
                      "max-w-[203px] rounded border border-[#efefef] bg-gray-100 bg-white px-3 py-2 focus:outline-none",
                      (result == null || result?.value === "") &&
                        "text-gray-300",
                    )}
                    value={result?.value || "<値なし>"}
                    disabled
                    placeholder="出力"
                  />
                </div>
                {result.error?.message != null && (
                  <div className="flex items-center space-x-1 text-sm text-red-500">
                    <FiAlertCircle className="shrink-0" />
                    <span>{result.error.message}</span>
                  </div>
                )}
                <details className="!mt-auto">
                  <summary>デバッグログ</summary>
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
                            <code className="bg-blue-100">
                              {trace.inMessage}
                            </code>
                            <br />
                            {trace.error}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              </div>
              <div
                id={rootId}
                className="static flex-grow min-h-screen border border-blue-100 draggable-parent"
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
                        className="absolute top-0 left-0 w-full h-full"
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
                    focusItemId?.type === "node" &&
                    focusItemId.nodeId === node.id
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
                            className="flex items-center px-2 py-1 space-x-1 text-sm text-white bg-blue-400 rounded w-max"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDuplicate(node)
                            }}
                          >
                            <FiCopy size="16px" />
                            <span>コピー</span>
                          </button>
                          <button
                            className="flex items-center px-2 py-1 space-x-1 text-sm text-white bg-red-400 rounded w-max"
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
                                  <div className="absolute text-sm leading-none text-white -translate-x-1/2 top-full left-1/2">
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
                        {/* ID表示 */}
                        {(node.node.nodeType === "weatherCheckNode" ||
                          node.node.nodeType === "randomNode") &&
                          !node.isInitialNode && (
                            <div className="absolute text-xs font-bold text-white top-2 left-2 tabular-nums">
                              #{unwrapId(node.id)}
                            </div>
                          )}
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
            botId={botId ?? ""}
            onSave={handleSave}
            onShare={handleShare}
            onDelete={handleDeleteBot}
            onReset={handleReset}
          />
        </footer>
      </div>
    </>
  )
}

export default ComponentsSideList
