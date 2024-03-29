import classNames from "classnames"
import React, { Dispatch, SetStateAction, useMemo } from "react"
import { FiAlertCircle } from "react-icons/fi"
import { OutputValue } from "../../interpreter"
import { InterpreterError } from "../../interpreter/error"
import { StackTrace } from "../../interpreter/type"
import { STAMP_OPTIONS } from "../nodetypes/StampOutputNode"
import { GraphNodeClass } from "./node"

export type SidebarProps = {
  result:
    | {
        type: "success"
        error: null
        value: string
        output: OutputValue
        stackTrace: StackTrace
      }
    | {
        type: "failure"
        value: null
        stackTrace: StackTrace | null
        error: InterpreterError
      }
  nodes: GraphNodeClass[]
  testcase: string
  setTestcase: Dispatch<SetStateAction<string>>
  mockValues: Record<string, string>
  setMockValues: Dispatch<SetStateAction<Record<string, string>>>
  showFlowDebug: boolean
  onChangeShowFlowDebug: (value: boolean) => void
  className?: string
}

const Sidebar: React.FC<SidebarProps> = ({
  result,
  nodes,
  testcase,
  setTestcase,
  mockValues,
  setMockValues,
  showFlowDebug,
  onChangeShowFlowDebug,
  className,
}) => {
  const effectInputs = useMemo(
    () =>
      nodes
        .filter(({ isInitialNode }) => !isInitialNode)
        .map((node) => {
          if (node.node.nodeType === "weatherCheckNode") {
            return { nodeType: "weatherCheckNode", node }
          } else if (node.node.nodeType === "randomNode") {
            return { nodeType: "randomNode", node }
          } else if (node.node.nodeType === "askAnswerNode") {
            return { nodeType: "askAnswerNode", node }
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

  return (
    <div
      className={classNames(
        "flex w-max max-w-[30%] flex-col space-y-2 overflow-y-scroll break-all rounded border-2 border-[#efefef] bg-white/50 p-4 backdrop-blur",
        className,
      )}
    >
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
            {nodeType === "weatherCheckNode"
              ? "天気"
              : nodeType === "randomNode"
              ? "ランダム"
              : "質問"}
            (#
            {node.id})
            {nodeType === "askAnswerNode" && (
              <span className="mt-1 block">Q.{node.createrInputValue}</span>
            )}
          </div>
          {nodeType === "askAnswerNode" ? (
            <input
              type="text"
              className="w-full max-w-[203px] rounded border border-[#efefef] px-3 py-2 focus:outline-none"
              placeholder="答え"
              value={mockValues[node.id]}
              onChange={(e) =>
                setMockValues((prev) => ({
                  ...prev,
                  [node.id]: e.target.value,
                }))
              }
            />
          ) : (
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
          )}
        </div>
      ))}
      <div className="!mt-6">
        <div className="text-sm text-gray-500">出力</div>
        <div className="flex w-full max-w-[203px] items-center">
          {result.type === "success" && result.output.type === "stamp" && (
            <div className="shrink-0 text-sm">スタンプ： </div>
          )}
          <input
            className={classNames(
              "w-full rounded border border-[#efefef] bg-gray-100 px-3 py-2 focus:outline-none",
              (result == null || result?.value === "") && "text-gray-300",
            )}
            value={
              result.type === "success"
                ? result.output.type === "stamp"
                  ? // @ts-ignore
                    STAMP_OPTIONS[result.output.value]
                  : result.output.value
                : "値なし"
            }
            disabled
            placeholder="出力"
          />
        </div>
      </div>
      {result.error?.message != null && (
        <div className="flex items-center space-x-1 text-sm text-red-500">
          <FiAlertCircle className="shrink-0" />
          <span>{result.error.message}</span>
        </div>
      )}
      <label className="!mt-6 flex cursor-pointer space-x-2 text-gray-500">
        <input
          type="checkbox"
          className="shrink-0"
          checked={showFlowDebug}
          onChange={(e) => onChangeShowFlowDebug(e.target.checked)}
        />
        <div>実行フローをエディタに反映する</div>
      </label>
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
                  <code className="bg-blue-100">{trace.inMessage}</code>
                  <br />
                  {trace.error}
                </>
              )}
            </div>
          ))}
        </div>
      </details>
    </div>
  )
}

export default Sidebar
