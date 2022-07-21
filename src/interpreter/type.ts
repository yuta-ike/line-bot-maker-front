import { GraphNode } from "../components/editor/node"

export type FlowChartNode = {
  id: string
  node: GraphNode
  outputs: string[]
}

export type FlowChart = FlowChartNode[]

export type StackTrace = ({
  // 実行するNode ID
  nodeId: string | null
  // 入力値
  inMessage: string
  // 結果
  result: "success" | "failure"
} & (
  | {
      result: "success"
      // 出力値
      outMessage: string
      // プログラムが終了ノードに達したか
      done: boolean
    }
  | {
      result: "failure"
      // エラー
      error: Error | null
    }
))[]
