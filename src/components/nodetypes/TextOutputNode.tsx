import { useEffect, useState } from "react"
import { GraphNodeClass } from "../editor/node"

type Props = {
  node: GraphNodeClass
}

const TextOutputNode: React.FC<Props> = (props) => {
  const { node } = props
  const [inputedText, setInputedText] = useState(node.createrInputValue)
  useEffect(() => {
    const updateUserInputValue = () => {
      node.createrInputValue = inputedText
    }
    updateUserInputValue()
  }, [inputedText, node])

  return (
    <div className="flex flex-col items-start w-full text-sm">
      <input
        className="p-2 text-black rounded w-max focus:outline-none"
        placeholder="テキスト"
        value={inputedText}
        onChange={(e) => setInputedText(e.target.value)}
        onClick={(e) => e.preventDefault()}
      />
      <p className="block mt-2 shrink-0">と出力</p>
    </div>
  )
}

export default TextOutputNode
