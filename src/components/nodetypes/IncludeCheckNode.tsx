import { useEffect, useState } from "react"
import { GraphNodeClass } from "../editor/node"

type Props = {
  node: GraphNodeClass
}

const IncludeCheckNode: React.FC<Props> = (props) => {
  const { node } = props
  const [inputedText, setInputedText] = useState(node.createrInputValue)
  useEffect(() => {
    node.createrInputValue = inputedText
  }, [inputedText, node])

  return (
    <div className="flex">
      <div className="text-black">
        <textarea
          value={inputedText}
          onChange={(e) => setInputedText(e.target.value)}
          cols={5}
          rows={1}
        />
      </div>
      <div>を含むか</div>
    </div>
  )
}

export default IncludeCheckNode
