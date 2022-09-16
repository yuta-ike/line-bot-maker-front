import { FlowchartSyntaxError, InternalError, InterpreterError } from "./error"
import { FlowChart, StackTrace } from "./type"

type FlowInputParam = {
  message: string
}

export type OutputValue = {
  type: "text" | "stamp"
  value: string
}

export type FlowChartSnapshot = {
  resumeNodeId: string
  stackTrace: StackTrace
}

export type ExecFlowChartResult =
  | {
      finish: true
      value: string
      output: OutputValue
      stackTrace: StackTrace
      snapshot?: undefined
    }
  | {
      finish: false
      value?: undefined
      output: OutputValue
      stackTrace?: undefined
      snapshot: FlowChartSnapshot
    }

/**
 * フローチャートを実行する
 * @param flowChart 実行するフローチャート
 * @param param1 実行に必要な値
 * @param mockValues モック用の値
 * @returns 実行結果
 */
const execFlowChart = (
  flowChart: FlowChart,
  { message }: FlowInputParam,
  mockValues?: Record<string, string>,
  handoverSnapshot?: FlowChartSnapshot,
): ExecFlowChartResult => {
  const inputNode = (() => {
    if (handoverSnapshot != null) {
      const initialNode = flowChart.find(
        ({ id }) => id === handoverSnapshot.resumeNodeId,
      )
      if (initialNode == null) {
        // TODO: 実行中にプログラムが更新された場合
        throw new Error("Unexpected Error")
      }
      return initialNode
    }

    // validation: input node
    const inputNodes = flowChart.filter(
      (chart) => chart.node.node.nodeType === "textInputNode",
    )
    if (inputNodes.length == 0) {
      throw new FlowchartSyntaxError("NO_INPUT_NODE", "入力ノードがありません")
    } else if (2 <= inputNodes.length) {
      throw new FlowchartSyntaxError(
        "MULTIPLE_INPUT_NODE",
        "入力ノードが複数あります",
      )
    }
    return inputNodes[0]
  })()

  // validation: id duplication
  const ids = flowChart.map(({ id }) => id)
  if (new Set(ids).size !== ids.length) {
    console.log(ids)
    throw new InternalError("ID_DUPLICATION", "IDに重複があります")
  }

  // validation: output node
  // const outputNodeIds = Array.from(
  //   new Set(flowChart.map(({ outputs }) => outputs).flat(1)),
  // )
  // outputNodeIds.forEach((nodeId) => {
  //   const node = flowChart.find(({ id }) => id === nodeId)
  //   if (node == null) {
  //     throw new InternalError(
  //       "NODE_NOT_FOUND",
  //       `繋がっていないノードがあります`,
  //     )
  //   }
  // })

  const stackTrace: StackTrace = handoverSnapshot?.stackTrace ?? []

  let nextNodeId: string | null = inputNode.id
  let value = message
  let done: boolean = false
  let stepCount = 0
  let output: OutputValue | null = null

  while (nextNodeId != null) {
    const result = stepFlowChartProxy(
      stackTrace,
      flowChart,
      nextNodeId,
      value,
      mockValues,
    )
    if (result.status === "suspense") {
      return {
        finish: false,
        output: result.output,
        snapshot: {
          resumeNodeId: result.nextNodeId,
          stackTrace,
        },
      }
    } else if (result.status === "failure") {
      result.error.stackTrace = stackTrace
      throw result.error
    }
    nextNodeId = result.nextNodeId
    value = result.value
    done = result.done
    if (result.done) {
      output = result.output
    }
    stepCount += 1
    if (stepCount > 500) {
      throw new FlowchartSyntaxError(
        "STACK_OVER_FLOW",
        "無限ループになっている可能性があります",
      )
    }
  }

  if (!done) {
    const error = new FlowchartSyntaxError(
      "NO_OUTPUT_NODE",
      "出力ノードに達していません",
    )
    error.stackTrace = stackTrace
    throw error
  }

  return {
    finish: true,
    value,
    output: output as OutputValue,
    stackTrace,
  }
}

type FlowChartStepResult =
  | ({
      // 成功 or エラーが発生した
      status: "success"
      // 次に遷移するノード
      nextNodeId: string | null
      // メモリに保存する値
      value: string
      // プログラムが終了ノードに達したか
      done: boolean
    } & (
      | {
          done: false
          output?: undefined
        }
      | {
          done: true
          output: OutputValue
        }
    ))
  | {
      status: "failure"
      value: string | null
      error: InterpreterError
    }
  | {
      status: "suspense"
      value: null
      nextNodeId: string
      output: OutputValue
      done: false
    }

/**
 * フローチャートを1ステップ実行し、StackTraceを更新する
 * @param stackTrace スタックトレースを溜める配列
 * @param flowChart 実行するフローチャート
 * @param nextNodeId 今から実行するNodeId
 * @param mockValues モック用の値
 * @param value 次のノードに渡す値
 * @returns 実行結果
 */
const stepFlowChartProxy = (
  stackTrace: StackTrace,
  flowChart: FlowChart,
  nextNodeId: string | null,
  value: string,
  mockValues?: Record<string, string>,
): FlowChartStepResult => {
  const result = stepFlowChart(flowChart, nextNodeId, value, mockValues)
  if (result.status === "success") {
    stackTrace.push({
      result: "success",
      nodeId: nextNodeId,
      inMessage: value,
      outMessage: result.value,
      done: result.done,
    })
  } else if (result.status === "failure") {
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
 * @param mockValues モック用の値
 * @returns 実行結果
 */
const stepFlowChart = (
  flowChart: FlowChart,
  nextNodeId: string | null,
  value: string,
  mockValues?: Record<string, string>,
): FlowChartStepResult => {
  if (nextNodeId == null) {
    return {
      status: "failure",
      value,
      error: new FlowchartSyntaxError(
        "NODE_NOT_CONNECTED",
        "ノードが繋がっていません",
      ),
    }
  }

  const nextNode = flowChart.find(({ id }) => id === nextNodeId) ?? null
  if (nextNode == null) {
    return {
      status: "failure",
      value,
      error: new InternalError(
        "NODE_NOT_FOUND",
        `node id (${nextNodeId}) が見つかりません`,
      ),
    }
  }

  if (nextNode.node.node.nodeType === "textInputNode") {
    return {
      status: "success",
      nextNodeId: nextNode.outputs[0],
      value,
      done: false,
    }
  }

  if (nextNode.node.node.nodeType === "correspondCheckNode") {
    if (value === nextNode.node.createrInputValue) {
      return {
        status: "success",
        nextNodeId: nextNode.outputs[0],
        value,
        done: false,
      }
    } else {
      return {
        status: "success",
        nextNodeId: nextNode.outputs[1],
        value,
        done: false,
      }
    }
  }

  if (nextNode.node.node.nodeType === "includeCheckNode") {
    if (value.includes(nextNode.node.createrInputValue)) {
      return {
        status: "success",
        nextNodeId: nextNode.outputs[0],
        value,
        done: false,
      }
    } else {
      return {
        status: "success",
        nextNodeId: nextNode.outputs[1],
        value,
        done: false,
      }
    }
  }

  if (nextNode.node.node.nodeType === "askAnswerNode") {
    if (mockValues != null) {
      const mockValue = mockValues[nextNodeId] ?? ""
      return {
        status: "success",
        nextNodeId: nextNode.outputs[0],
        value: mockValue,
        done: false,
      }
    } else {
      return {
        status: "suspense",
        nextNodeId: nextNode.outputs[0],
        value: null,
        done: false,
        output: {
          type: "text",
          value: nextNode.node.createrInputValue,
        },
      }
      // TODO: ココ!!!!!!!!!!!
    }
  }

  if (nextNode.node.node.nodeType === "nop") {
    return {
      status: "success",
      nextNodeId: nextNode.outputs[0],
      value,
      done: false,
    }
  }

  if (nextNode.node.node.nodeType === "weatherCheckNode") {
    let outputNodeId: number
    if (mockValues != null) {
      if (mockValues[nextNodeId]) {
        const mockValue = mockValues[nextNodeId]
        outputNodeId =
          mockValue === "sunny" ? 0 : mockValue === "cloudy" ? 1 : 2
      } else {
        outputNodeId = 0
      }
    } else {
      const rand = Math.random()
      const weather = rand < 0.33 ? 0 : rand < 0.66 ? 1 : 2
      outputNodeId = weather
    }

    return {
      status: "success",
      nextNodeId: nextNode.outputs[outputNodeId],
      value,
      done: false,
    }
  }

  if (nextNode.node.node.nodeType === "randomNode") {
    let outputNodeId: number
    if (mockValues != null) {
      if (mockValues[nextNodeId]) {
        const mockValue = mockValues[nextNodeId]
        outputNodeId = mockValue === "A" ? 0 : 1
      } else {
        outputNodeId = 0
      }
    } else {
      const rand = Math.random()
      const weather = rand < 0.5 ? 0 : 1
      outputNodeId = weather
    }

    return {
      status: "success",
      nextNodeId: nextNode.outputs[outputNodeId],
      value,
      done: false,
    }
  }

  if (nextNode.node.node.nodeType === "textOutputNode") {
    return {
      status: "success",
      value: nextNode.node.createrInputValue,
      nextNodeId: null,
      done: true,
      output: {
        type: "text",
        value: nextNode.node.createrInputValue,
      },
    }
  }

  if (nextNode.node.node.nodeType === "stampOutputNode") {
    return {
      status: "success",
      value: nextNode.node.createrInputValue,
      nextNodeId: null,
      done: true,
      output: {
        type: "stamp",
        value: nextNode.node.createrInputValue,
      },
    }
  }

  throw new Error("unreachable")
}

export default execFlowChart
