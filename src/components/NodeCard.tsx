// import React from "react"
import classNames from "classnames"
import { FiCopy, FiTrash2 } from "react-icons/fi"
import { IconType } from "react-icons"
import { GraphNode, GraphNodeClass, Point } from "./editor/node"
import TextInputNode from "./nodetypes/TextInputNode"
import IncludeCheckNode from "./nodetypes/IncludeCheckNode"
import CorrespondCheckNode from "./nodetypes/CorrespondCheckNode"
import RandomNode from "./nodetypes/RandomNode"
import WeatherCheckNode from "./nodetypes/WeatherCheckNode"
import TextOutputNode from "./nodetypes/TextOutputNode"
import StampOutputNode from "./nodetypes/StampOutputNode"
import AskAnswerNode from "./nodetypes/AskAnswerNode"

const unwrapId = (id: string): string => {
  if (id.startsWith("SAVED_")) {
    return unwrapId(id.slice("SAVED_".length))
  } else {
    return id
  }
}

const renderNodeContent = (node: GraphNodeClass) => {
  if (node.node.nodeType == "textInputNode") {
    return <TextInputNode />
  } else if (node.node.nodeType == "includeCheckNode") {
    return <IncludeCheckNode node={node} />
  } else if (node.node.nodeType == "correspondCheckNode") {
    return <CorrespondCheckNode node={node} />
  } else if (node.node.nodeType == "textOutputNode") {
    return <TextOutputNode node={node} />
  } else if (node.node.nodeType == "stampOutputNode") {
    return <StampOutputNode node={node} />
  } else if (node.node.nodeType == "askAnswerNode") {
    return <AskAnswerNode node={node} />
  } else if (node.node.nodeType == "weatherCheckNode") {
    return <WeatherCheckNode />
  } else if (node.node.nodeType == "randomNode") {
    return <RandomNode />
  } else {
    return node.node.label
  }
}

export type NodeCardProps = {
  node: GraphNodeClass
  onClick?: () => void
  isFocused: boolean
  isConnecting: boolean
  connectableInPoint: (id: number) => boolean
  onClickInPoint?: (pointId: number) => void
  onClickOutPoint?: (pointId: number) => void
  emphasisOutPoint: boolean
  actionButtons?: {
    onClick: () => void
    label: string
    icon: IconType
    color?: "default" | "danger"
  }[]
  className?: string
  error?: {
    code: "NO_OUTPUT_NODE"
    pointId: number
  } | null
}

const NodeCard: React.FC<NodeCardProps> = ({
  node,
  // onDuplicate,
  // onDelete,
  onClick,
  isFocused,
  isConnecting,
  connectableInPoint,
  onClickInPoint,
  onClickOutPoint,
  emphasisOutPoint,
  actionButtons,
  className,
  error,
}) => {
  return (
    <div className={className}>
      {/* コピーと削除のボタン */}
      {/* TODO: 現在はフォーカスされている時に表示されるが、うざいので改善したい */}
      {actionButtons != null && 0 < actionButtons.length && (
        <div
          className={classNames(
            "absolute top-0 ml-2 flex flex-col space-y-1 transition-[left]",
            isFocused ? "left-full" : "left-0",
          )}
        >
          {actionButtons.map(({ label, ...actionButton }, i) => (
            <ActionButton key={i} {...actionButton}>
              {label}
            </ActionButton>
          ))}
        </div>
      )}

      {/* nodeの大枠を決める */}
      <div
        className={classNames(
          "relative flex items-center justify-center rounded-xl p-4 pt-6 text-white shadow transition",
          "h-max min-h-[90px] w-max min-w-[160px]",
          0 < node.outPoints.filter(({ label }) => label.length > 0).length &&
            "pb-8",
          isFocused &&
            "ring-4 ring-blue-400 group-hover:shadow-2xl group-hover:ring-0",
        )}
        style={{ background: node.node.color }}
        onClick={onClick}
      >
        {!node.isInitialNode && (
          <div className="absolute text-xs font-bold text-white top-1 left-1 tabular-nums">
            #{node.id}
          </div>
        )}
        {renderNodeContent(node)}
        {/* inPointsの描画 */}
        <div className="absolute inset-x-0 top-0 flex -translate-y-1/2 justify-evenly">
          {node.inPoints.map((point, i) => {
            const isConnectable = connectableInPoint(i)
            return (
              <InPointButton
                key={i}
                onClick={() => {
                  if (!isConnectable) {
                    return
                  }
                  onClickInPoint?.(i)
                }}
                label={point.label}
                disabled={!(isConnectable || !isConnecting)}
                disableInteraction={onClickInPoint == null}
              />
            )
          })}
        </div>
        {/* outPointsの描画 */}
        <div className="absolute inset-x-0 bottom-0 flex mt-2 translate-y-1/2 justify-evenly">
          {node.outPoints.map((point, i) => (
            <OutPointButton
              key={i}
              onClick={() => onClickOutPoint?.(i)}
              disabled={!emphasisOutPoint}
              label={point.label}
              disableInteraction={onClickOutPoint == null}
              showNoConnectError={error?.code === "NO_OUTPUT_NODE"}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default NodeCard

type ActionButtonProps = {
  onClick: () => void
  children: string
  icon: IconType
  color?: "default" | "danger"
}

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  children,
  icon: Icon,
  color = "default",
}) => {
  return (
    <button
      className={classNames(
        "flex w-max items-center space-x-1 rounded px-2 py-1 text-sm text-white",
        color === "danger" ? "bg-red-400" : "bg-blue-400",
      )}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      <Icon size="16px" />
      <span>{children}</span>
    </button>
  )
}

type InPointButtonProps = {
  onClick: () => void
  disabled: boolean
  label?: string
  disableInteraction?: boolean
}

const InPointButton: React.FC<InPointButtonProps> = ({
  onClick,
  disabled,
  label,
  disableInteraction = false,
}) => {
  return (
    <button
      className="relative"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      disabled={disabled || disableInteraction}
    >
      <div
        className={classNames(
          "h-5 w-5 rounded-full border-2 border-white transition",
          disableInteraction
            ? "border-white bg-green-500"
            : !disabled
            ? "border-white bg-green-500 hover:scale-110"
            : "scale-50 cursor-not-allowed border-gray-100 bg-gray-300",
        )}
      />
      <div className="absolute text-sm leading-none text-white -translate-x-1/2 top-full left-1/2">
        {label}
      </div>
    </button>
  )
}

type OutPointButtonProps = {
  onClick: () => void
  disabled: boolean
  label?: string
  disableInteraction?: boolean
  showNoConnectError?: boolean
}

const OutPointButton: React.FC<OutPointButtonProps> = ({
  onClick,
  disabled,
  label,
  disableInteraction = false,
  showNoConnectError = false,
}) => {
  return (
    <button
      className="relative"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      disabled={disabled || disableInteraction}
    >
      <div
        className={classNames(
          "h-5 w-5 rounded-full border-2 border-white transition",
          disableInteraction
            ? "bg-yellow-500"
            : !disabled
            ? "bg-yellow-500 hover:scale-110"
            : "scale-50 cursor-not-allowed bg-gray-300",
        )}
      />
      <div className="absolute bottom-full left-1/2 w-max -translate-x-1/2 rounded-sm px-1 py-0.5 text-sm leading-none text-white">
        {label}
      </div>
      {showNoConnectError && (
        <div className="absolute p-2 mt-1 text-sm text-black -translate-x-1/2 bg-white border-4 border-pink-500 left-1/2 top-full w-max rounded-xl">
          ノードが繋がっていません
        </div>
      )}
    </button>
  )
}
