import { GraphNode } from "../components/editor/node"

type FlowChartNode = {
  id: string
  node: GraphNode
  outputs: string[]
}

type FlowChart = FlowChartNode[]

class FlowchartSyntaxError extends Error {
  constructor(message?: string) {
    super(message)
  }
}

type FlowInputParam = {
  message: string
}

/**
 * フローチャートを実行する
 * @param flowChart 実行するフローチャート
 * @param param1 実行に必要な値
 * @returns 実行結果
 */
const execFlowChart = (flowChart: FlowChart, { message }: FlowInputParam) => {
  // validation: input node
  const inputNodes = flowChart.filter(
    (chart) => chart.node.node.nodeType === "textInputNode",
  )
  if (inputNodes.length == 0) {
    throw new FlowchartSyntaxError("入力ノードがありません")
  } else if (2 <= inputNodes.length) {
    throw new FlowchartSyntaxError("入力ノードが複数あります")
  }

  // validation: id duplication
  const ids = flowChart.map(({ id }) => id)
  if (new Set(ids).size !== ids.length) {
    console.log(ids)
    throw new Error("IDに重複があります")
  }

  // validation: output node
  const outputNodeIds = Array.from(
    new Set(flowChart.map(({ outputs }) => outputs).flat(1)),
  )
  outputNodeIds.forEach((nodeId) => {
    const node = flowChart.find(({ id }) => id === nodeId)
    if (node == null) {
      throw new Error("Unknown node id")
    }
  })

  const stackTrace: StackTrace = []

  const inputNode = inputNodes[0]

  let nextNodeId: string | null = inputNode.id
  let value = message

  while (nextNodeId != null) {
    const result = stepFlowChartProxy(
      stackTrace,
      flowChart,
      nextNodeId,
      message,
    )
    if (result.status === "failure") {
      throw result.error
    }
    nextNodeId = result.nextNodeId
    value = result.value
  }

  return {
    value,
    stackTrace,
  }
}

type FlowChartStepResult =
  | {
      // 成功 or エラーが発生した
      status: "success"
      // 次に遷移するノード
      nextNodeId: string | null
      // メモリに保存する値
      value: string
    }
  | {
      // 成功 or エラーが発生した
      status: "failure"
      // 保持する値
      value: string | null
      // エラー
      error: Error | null
    }

type StackTrace = ({
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
    }
  | {
      result: "failure"
      // エラー
      error: Error | null
    }
))[]

/**
 * フローチャートを1ステップ実行し、StackTraceを更新する
 * @param stackTrace スタックトレースを溜める配列
 * @param flowChart 実行するフローチャート
 * @param nextNodeId 今から実行するNodeId
 * @param value 次のノードに渡す値
 * @returns 実行結果
 */
const stepFlowChartProxy = (
  stackTrace: StackTrace,
  flowChart: FlowChart,
  nextNodeId: string | null,
  value: string,
): FlowChartStepResult => {
  const result = stepFlowChart(flowChart, nextNodeId, value)
  if (result.status === "success") {
    stackTrace.push({
      result: "success",
      nodeId: nextNodeId,
      inMessage: value,
      outMessage: result.value,
    })
  } else {
    stackTrace.push({
      result: "failure",
      nodeId: nextNodeId,
      inMessage: value,
      error: result.error,
    })
  }
  return result
}

/**
 * フローチャートを1ステップ実行する
 * @param flowChart 実行するフローチャート
 * @param nextNodeId 今から実行するNodeId
 * @param value 次のノードに渡す値
 * @returns 実行結果
 */
const stepFlowChart = (
  flowChart: FlowChart,
  nextNodeId: string | null,
  value: string,
): FlowChartStepResult => {
  if (nextNodeId == null) {
    return {
      status: "failure",
      value,
      error: new SyntaxError("ノードが繋がっていません"),
    }
  }

  const nextNode = flowChart.find(({ id }) => id === nextNodeId) ?? null
  if (nextNode == null) {
    console.log(flowChart.map(({ node }) => node.id))
    return {
      status: "failure",
      value,
      error: new Error("予期せぬエラーが発生しました"),
    }
  }

  if (nextNode.node.node.nodeType === "textInputNode") {
    return {
      status: "success",
      nextNodeId: nextNode.outputs[0],
      value,
    }
  }

  if (nextNode.node.node.nodeType === "correspondCheckNode") {
    if (value === nextNode.node.createrInputValue) {
      return {
        status: "success",
        nextNodeId: nextNode.outputs[0],
        value,
      }
    } else {
      return {
        status: "success",
        nextNodeId: nextNode.outputs[1],
        value,
      }
    }
  }

  if (nextNode.node.node.nodeType === "includeCheckNode") {
    if (value.includes(nextNode.node.createrInputValue)) {
      return {
        status: "success",
        nextNodeId: nextNode.outputs[0],
        value,
      }
    } else {
      return {
        status: "success",
        nextNodeId: nextNode.outputs[1],
        value,
      }
    }
  }

  if (nextNode.node.node.nodeType === "nop") {
    return {
      status: "success",
      nextNodeId: nextNode.outputs[0],
      value,
    }
  }

  if (nextNode.node.node.nodeType === "textOutputNode") {
    // return [null, nextNode.node.userInputValue]
    return {
      status: "success",
      value: nextNode.node.createrInputValue,
      nextNodeId: null,
    }
  }

  if (nextNode.node.node.nodeType === "weatherCheckNode") {
    // TODO: 天気のーど
  }

  throw new Error("unreachable")
}

// const output = execFlowChart(flowChart, {message: "京都"})
// console.log("OUTPUT: " + output.value)
// console.log(output.stackTrace)

export default execFlowChart
