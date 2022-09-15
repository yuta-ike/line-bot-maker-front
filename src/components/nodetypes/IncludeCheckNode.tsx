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
    <div className="flex w-full items-center text-sm">
      <input
        className="w-max rounded p-2 text-black focus:outline-none"
        placeholder="テキスト"
        value={inputedText}
        onChange={(e) => setInputedText(e.target.value)}
        onClick={(e) => e.preventDefault()}
      />
      <p className="ml-2 block shrink-0">を</p>
    </div>
  )
}

export default IncludeCheckNode
