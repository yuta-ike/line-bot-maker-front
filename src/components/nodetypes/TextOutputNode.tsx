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
    <div className="flex w-full flex-col items-start text-sm">
      <input
        className="w-max rounded p-2 text-black focus:outline-none"
        placeholder="テキスト"
        value={inputedText}
        onChange={(e) => setInputedText(e.target.value)}
        onClick={(e) => e.preventDefault()}
      />
      <p className="mt-2 block shrink-0">と出力</p>
    </div>
  )
}

export default TextOutputNode
