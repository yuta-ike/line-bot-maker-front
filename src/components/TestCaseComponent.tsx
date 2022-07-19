import classNames from "classnames"
import { useCallback, useEffect, useId, useMemo, useState } from "react"
import { Coordinate, Edge, GraphNode, GraphNodeClass } from "./editor/node"
import Line from "./Line"
import LineUI from "./presentation/LineUI"
import TextInputNode from "./nodetypes/TextInputNode"
import TextOutputNode from "./nodetypes/TextOutputNode"
import CorrespondCheckNode from "./nodetypes/CorrespondCheckNode"
import IncludeCheckNode from "./nodetypes/IncludeCheckNode"
import WeatherCheckNode from "./nodetypes/WeatherCheckNode"

const TestCaseComponent = (props: any) => {
  const nodes: GraphNodeClass[] = props.nodes
  nodes.map((node) => {
    return node.node.nodeType === "WeatherCheckNode"
  })

  console.log(nodes.length)
  return <>hogehoge</>
}

export default TestCaseComponent
