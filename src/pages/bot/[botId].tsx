import { useCallback, useEffect, useState } from "react"

import { Edge, GraphNodeClass } from "../../components/editor/node"
import TopBar from "../../components/TopBar"
import BottomBar from "../../components/BottomBar"
import { useRouter } from "next/router"
import { useLiff, useUser } from "../../provider/LiffProvider"
import { FlowChart } from "../../interpreter/type"
import buildInviteMessage from "../../components/utils/flexMessage"
import { deleteBot, getBot, updateBot } from "../../services/api_service"
import Head from "next/head"
import Image from "next/image"
import FlowchartEditor from "../../components/editor/FlowchartEditor"
import { useAuthRoute } from "../../utils/useRoute"

const genInitNodes = () => {
  const getHeightGenerator = function* () {
    for (let i = 0; i < 100; i++) {
      yield 40 + 125 * i
    }
  }
  const getHeight = getHeightGenerator()

  return [
    new GraphNodeClass(
      {
        label: "テキスト入力",
        color: "#06c755",
        nodeType: "textInputNode",
      },
      {
        pos: {
          x: 50,
          y: getHeight.next().value as number,
        },
        inPoints: [],
        outPoints: [{ type: "number", label: "", limit: 1 }],
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
          y: getHeight.next().value as number,
        },
        size: {
          width: 225,
          height: 90,
        },
        inPoints: [{ type: "number", label: "", limit: null }],
        outPoints: [
          { type: "number", label: "含む", limit: 1 },
          { type: "number", label: "含まない", limit: 1 },
        ],
        isInitialNode: true,
        createrInputValue: "",
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
          y: getHeight.next().value as number,
        },
        size: {
          width: 225,
          height: 90,
        },
        inPoints: [{ type: "number", label: "", limit: null }],
        outPoints: [
          { type: "number", label: "一致する", limit: 1 },
          { type: "number", label: "一致しない", limit: 1 },
        ],
        isInitialNode: true,
        createrInputValue: "",
      },
    ),
    new GraphNodeClass(
      {
        label: "追加質問",
        color: "#dc6ae2",
        nodeType: "askAnswerNode",
      },
      {
        pos: {
          x: 50,
          y: getHeight.next().value as number,
        },
        size: {
          width: 254,
          height: 90,
        },
        inPoints: [{ type: "number", label: "", limit: null }],
        outPoints: [{ type: "number", label: "答え", limit: 1 }],
        isInitialNode: true,
        createrInputValue: "",
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
          y: getHeight.next().value as number,
        },
        size: {
          width: 203,
          height: 90,
        },
        inPoints: [{ type: "number", label: "", limit: null }],
        outPoints: [],
        isInitialNode: true,
      },
    ),
    new GraphNodeClass(
      {
        label: "スタンプを出力",
        color: "#06c755",
        nodeType: "stampOutputNode",
      },
      {
        pos: {
          x: 50,
          y: getHeight.next().value as number,
        },
        size: {
          width: 160,
          height: 90,
        },
        inPoints: [{ type: "number", label: "", limit: null }],
        outPoints: [],
        isInitialNode: true,
        createrInputValue: "ok",
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
          y: getHeight.next().value as number,
        },
        inPoints: [{ type: "number", label: "", limit: null }],
        outPoints: [
          { type: "number", label: "晴れ", limit: 1 },
          { type: "number", label: "曇り", limit: 1 },
          { type: "number", label: "雨", limit: 1 },
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
          y: getHeight.next().value as number,
        },
        inPoints: [{ type: "number", label: "", limit: null }],
        outPoints: [
          { type: "number", label: "A", limit: 1 },
          { type: "number", label: "B", limit: 1 },
        ],
        isInitialNode: true,
      },
    ),
  ]
}

// const SAMPLE_NODES = genInitNodes()

const unwrapId = (id: string): string => {
  if (id.startsWith("SAVED_")) {
    return unwrapId(id.slice("SAVED_".length))
  } else {
    return id
  }
}

const BotDetail: React.FC = () => {
  useAuthRoute()

  const router = useRouter()
  const liff = useLiff()
  const { user } = useUser()

  const [name, setName] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [nodes, setNodes] = useState<GraphNodeClass[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [testcase, setTestcase] = useState("Hello")
  const [mockValues, setMockValues] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)

  const [showTutorial, setShowTutorial] = useState(
    localStorage.getItem("BOT_EDITOR_OPERATION_TUTORIAL") == null,
  )

  useEffect(() => {
    if (!showTutorial) {
      localStorage.setItem("BOT_EDITOR_OPERATION_TUTORIAL", "true")
    }
  }, [showTutorial])

  const [tutorialStep, setTutorialStep] = useState(0)

  const botId = router.query.botId as string | undefined

  useEffect(() => {
    return () => GraphNodeClass.resetId()
  }, [])

  /**
   * データベースから初期位置となるフローチャートを取得
   */
  useEffect(() => {
    if (botId == null || user?.idToken == null) {
      return
    }
    ;(async () => {
      const res = await getBot(user.idToken, botId)
      const flowChart: FlowChart = JSON.parse(res.flowchart)
      const savedNodes = flowChart.map(
        ({ node }) =>
          new GraphNodeClass(node.node, {
            id: node.id,
            pos: node.pos,
            size: node.size,
            inPoints: node.inPoints,
            outPoints: node.outPoints,
            createrInputValue: node.createrInputValue,
            isInitialNode: false,
          }),
      )
      const maxId = savedNodes.reduce<number>(
        (acc, { id }) => (acc > parseInt(id, 10) ? acc : parseInt(id, 10)),
        -1,
      )
      GraphNodeClass.id = maxId + 1
      setNodes([...savedNodes, ...genInitNodes()])
      setEdges((prev) => [
        ...prev,
        ...flowChart
          .map(({ node, outputs }) =>
            outputs.map((outNodeId, i) => ({
              start: {
                nodeId: node.id,
                pointId: i,
              },
              end: {
                nodeId: outNodeId,
                pointId: 0,
              },
            })),
          )
          .flat(1),
      ])
      setName(res.name)
      setIsPublic(res.is_public)
      setIsLoading(false)
    })()
  }, [botId, user?.idToken])

  /**
   * フローチャートの保存処理
   */
  const handleSave = async (_isPublic?: boolean) => {
    if (user == null || botId == null) {
      window.alert("保存に失敗しました!!")
      return false
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
        _isPublic ?? isPublic,
      )
      return true
    } catch {
      showSnackBar("error", "エラーが発生しました")
      return false
    }
  }

  const onChangeIsPublic = async (value: boolean) => {
    if (user?.idToken == null || botId == null) {
      return
    }

    try {
      setIsPublic(value)
      await handleSave(value)
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
  }, [botId, liff, name])

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
  }, [botId, router, user?.idToken])

  /**
   * フローチャートのリセット処理
   */
  const handleReset = useCallback(() => {
    setNodes(genInitNodes())
    setEdges([])
  }, [])

  if (botId == null) {
    return null
  }

  return (
    <>
      <Head>
        <title>{`${name}｜ふろちゃでぼっと`}</title>
      </Head>
      <div className="flex flex-col min-h-screen">
        <main className="h-[200vh] w-[200vw] flex-grow">
          <TopBar
            name={name}
            onChangeName={setName}
            isPublic={isPublic}
            onChangeIsPublic={onChangeIsPublic}
          />
          <FlowchartEditor
            nodes={nodes}
            setNodes={setNodes}
            edges={edges}
            setEdges={setEdges}
            testcase={testcase}
            setTestcase={setTestcase}
            mockValues={mockValues}
            setMockValues={setMockValues}
          />
        </main>
        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center w-full h-full font-bold">
            ローディング中...
          </div>
        )}
      </div>
      <footer>
        <BottomBar
          botId={botId ?? ""}
          onSave={handleSave}
          onShare={handleShare}
          onDelete={handleDeleteBot}
          onReset={handleReset}
        />
      </footer>
      {showTutorial && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="flex w-[600px] max-w-full flex-col items-center rounded-md bg-white p-4">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              {tutorialStep === 0
                ? "ブロックを動かそう"
                : tutorialStep === 1
                ? "ブロック同士を繋げよう"
                : tutorialStep === 2
                ? "動作を確認しよう"
                : "ボットを使おう"}
            </h2>
            <p className="mb-4 text-gray-600">
              {tutorialStep === 0 ? (
                "ブロックは、ドラッグ&ドロップで動かすことができます"
              ) : tutorialStep === 1 ? (
                <>
                  丸をクリック → カーソルを移動 →
                  繋げたい丸の上でもう一度クリック
                  すると、線で繋ぐことができます
                  <br />
                  <span className="text-sm text-gray-400">
                    ※ ブロックの移動と操作方法が違うのでご注意ください
                  </span>
                </>
              ) : tutorialStep === 2 ? (
                "「実行フローをエディタに反映する」にチェックを入れると、実行フローがピンク色で表示されます"
              ) : (
                "完成したら、右下の「保存して公開」から、実際に使ってみよう。QRコードをスマホで読み取ることで、LINEで利用できるようになります"
              )}
            </p>
            <Image
              src={
                tutorialStep === 0
                  ? "/tutorial/tutorial_1.gif"
                  : tutorialStep === 1
                  ? "/tutorial/tutorial_2.gif"
                  : tutorialStep === 2
                  ? "/tutorial/tutorial_3.gif"
                  : "/tutorial/tutorial_4.png"
              }
              alt=""
              width={600}
              height={400}
            />
            <div className="flex justify-between w-full mt-4">
              <button
                className="rounded border border-gray-300 px-5 py-1.5 hover:bg-gray-100"
                onClick={() => setShowTutorial(false)}
              >
                スキップ
              </button>
              <button
                className="rounded bg-red-300 px-5 py-1.5 hover:shadow"
                onClick={() => {
                  setTutorialStep((prev) => prev + 1)
                  if (tutorialStep === 3) {
                    setShowTutorial(false)
                  }
                }}
              >
                {tutorialStep === 3 ? "完了" : "次へ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default BotDetail
function showSnackBar(arg0: string, arg1: string) {
  throw new Error("Function not implemented.")
}
