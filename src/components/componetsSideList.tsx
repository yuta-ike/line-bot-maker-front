import classNames from "classnames"
import { useCallback, useState } from "react"
import Draggable from "react-draggable"
import { getPointPos, isSameEdge } from "./editor/helper"
import { Coordinate, Edge, GraphNodeClass } from "./editor/node"
import useCursorPos from "./utils/getCursorPos"
import Line from "./Line"
import LineUI from "./presentation/LineUI"

//nodeのサイズ
const NODE_WIDTH = 160
const NODE_HEIGHT = 80

//nodeの初期値を設定
//初期で4個のnodeを定義している
const INIT_NODES = [
  new GraphNodeClass(
    {
      label: "Node 01",
      color: "#fda4aeed",
      nodeType: "hoge"
    },
    {
      pos: {
        x: 50,
        y: 50,
      },
      inPoints: [
        { type: "number", label: "input", limit: null },
        { type: "number", label: "input", limit: null },
      ],
      outPoints: [
        { type: "number", label: "yes", limit: null },
        { type: "number", label: "no", limit: null },
      ],
    },
  ),
  new GraphNodeClass(
    {
      label: "Node 02",
      color: "#14b8a5ed",
      nodeType: "hoge"
    },
    {
      pos: {
        x: 50,
        y: 150,
      },
      inPoints: [{ type: "number", label: "input", limit: null }],
      outPoints: [
        { type: "number", label: "yes", limit: null },
        { type: "number", label: "no", limit: null },
      ],
    },
  ),
  new GraphNodeClass(
    {
      label: "Node 03",
      color: "#fb923ced",
      nodeType: "hoge"

    },
    {
      pos: {
        x: 50,
        y: 250,
      },
      inPoints: [
        { type: "number", label: "input", limit: null },
        { type: "number", label: "input", limit: null },
      ],
      outPoints: [{ type: "number", label: "no", limit: null }],
    },
  ),
  new GraphNodeClass(
    {
      label: "Node 04",
      color: "#fb923ced",
      nodeType: "hoge"

    },
    {
      pos: {
        x: 50,
        y: 350,
      },
      inPoints: [
        { type: "number", label: "input", limit: null },
        { type: "number", label: "input", limit: null },
      ],
      outPoints: [{ type: "number", label: "no", limit: null }],
    },
  ),
]

//初期位置のnodeの位置のリスト()
//ComponentsSideListの中でなく，ここで書いているのはnodesに新たなnodeが加わると，INIT_NODES自身も新たなnodeが加わった配列になるから（驚き）
const fixedInitNodePosList: Coordinate[] = INIT_NODES.map(
  (node: GraphNodeClass) => node.pos,
)

const ComponentsSideList = () => {
  //nodeとedgeの状態管理　えｄげは線
  const [nodes, setNodes] = useState<GraphNodeClass[]>(INIT_NODES)
  const [edges, setEdges] = useState<Edge[]>([])

  //初期のnodeがドラッグされると初期位置に新たなnodeを追加する
  //ドラッグされたnodeを受け取り，それが初期位置にあったnodeなら初期位置に同じnodeを追加
  const regenerateNode = (node: GraphNodeClass) => {
    if (fixedInitNodePosList.includes(node.pos)) {
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
          },
        ),
      )
    }
  }

  //一時的に触っているnode
  const [tmpEdgeStartNodeId, setTempEdgeStartNodeId] = useState<{
    nodeId: string
    pointId: number
    //|はnull許容用
  } | null>(null)

  //カーソルのpositionをチェック
  const cursorPos = useCursorPos(tmpEdgeStartNodeId != null)

  //getNodeに関数を代入しているだけ
  const getNode = useCallback(
    (nodeId: string) => {
      //idがnullのときだけ評価される
      return nodes.find(({ id }) => id === nodeId) ?? null
    },
    [nodes],
  )

  return (
    //枠線の指定
    <div
      className="draggable-parent static min-h-screen border border-blue-100"
      onClick={() => setTempEdgeStartNodeId(null)}
    >
      {/* // <div > */}
      {tmpEdgeStartNodeId != null &&
        (() => {
          const tmpStartNode = getNode(tmpEdgeStartNodeId.nodeId)
          if (tmpStartNode == null) {
            return null
          }
          //始点のデータを取得
          const startPointPos = getPointPos(
            "out",
            tmpStartNode,
            tmpEdgeStartNodeId.pointId,
          )
          return (
            <div className="absolute top-0 left-0 h-full w-full" key="temp">
              <LineUI
                startPos={startPointPos}
                //このデルタはなに？
                delta={{
                  x: cursorPos.x - 32 - startPointPos.x,
                  y: cursorPos.y - 32 - startPointPos.y,
                }}
              />
            </div>
          )
        })()}
      {edges.map((edge) => (
        <Line
          key={`${edge.start.nodeId}_${edge.start.pointId}_${edge.end.nodeId}_${edge.end.pointId}`}
          edge={edge}
          getNode={getNode}
          onDelete={() =>
            setEdges((edges) => edges.filter((e) => !isSameEdge(e, edge)))
          }
        />
      ))}

      {nodes.map((node) => (
        <Draggable
          key={node.id}
          position={node.pos}
          bounds=".draggable-parent"
          defaultClassName="!absolute top-0 left-0"
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
          onStart={() => regenerateNode(node)}
        >
          <div
            className="relative flex h-20 w-40 items-center justify-center rounded text-white shadow"
            style={{ background: node.node.color }}
          >
            {node.node.label}
            <div className="absolute inset-x-0 top-0 flex -translate-y-1/2 justify-evenly">
              {node.inPoints.map((point, i) => (
                <button
                  key={i}
                  className="relative"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (tmpEdgeStartNodeId == null) return
                    const tmpEdgeStartNode = getNode(tmpEdgeStartNodeId.nodeId)
                    if (tmpEdgeStartNode == null) return

                    if (
                      node.canConnect(
                        i,
                        tmpEdgeStartNode,
                        tmpEdgeStartNodeId.pointId,
                      )
                    ) {
                      setEdges((prev) => [
                        ...prev,
                        {
                          start: tmpEdgeStartNodeId,
                          end: {
                            nodeId: node.id,
                            pointId: i,
                          },
                        },
                      ])
                      setTempEdgeStartNodeId(null)
                    }
                  }}
                >
                  <div
                    className={classNames(
                      "h-5 w-5 rounded-full border-2 border-white transition",
                      tmpEdgeStartNodeId == null
                        ? "border-white bg-green-500 hover:scale-110"
                        : tmpEdgeStartNodeId != null &&
                          node.canConnect(
                            i,
                            // @ts-ignore
                            getNode(tmpEdgeStartNodeId.nodeId),
                            tmpEdgeStartNodeId.pointId,
                          )
                        ? "scale-100 border-white bg-green-500 hover:scale-110"
                        : "scale-50 cursor-not-allowed border-gray-100 bg-gray-300",
                    )}
                  />
                  <div className="absolute top-full left-1/2 -translate-x-1/2 text-sm leading-none text-white">
                    {point.label}
                  </div>
                </button>
              ))}
            </div>
            <div className="absolute inset-x-0 bottom-0 flex translate-y-1/2 justify-evenly">
              {node.outPoints.map((point, i) => (
                <button
                  key={i}
                  className="relative"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (tmpEdgeStartNodeId == null) {
                      setTempEdgeStartNodeId({ nodeId: node.id, pointId: i })
                    }
                  }}
                >
                  <div
                    className={classNames(
                      "h-5 w-5 rounded-full border-2 border-white transition",
                      tmpEdgeStartNodeId == null
                        ? "bg-yellow-500 hover:scale-110"
                        : "scale-50 cursor-not-allowed bg-gray-300",
                    )}
                  />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 text-sm leading-none text-white">
                    {point.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Draggable>
      ))}
    </div>
  )
}

export default ComponentsSideList
