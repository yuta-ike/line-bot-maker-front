import { useEffect, useState } from "react"
import { GraphNodeClass } from "../editor/node"

// type Props = {
//   node: GraphNodeClass
// }

const WeatherCheckNode = () => {
  return (
    <div className="flex">
      <div>天気予報</div>
      <div className="text-black"></div>
    </div>
  )
}

export default WeatherCheckNode
