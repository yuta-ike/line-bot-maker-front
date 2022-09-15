import { useEffect, useState } from "react"
import { GraphNodeClass } from "../editor/node"

type Props = {
  node: GraphNodeClass
}

const CorrespondCheckNode: React.FC<Props> = (props) => {
  const { node } = props
  const [inputedText, setInputedText] = useState(node.createrInputValue)
  useEffect(() => {
    const updateUserInputValue = () => {
      node.createrInputValue = inputedText
    }
    updateUserInputValue()
  }, [inputedText, node])

  return (
    <div className="flex items-center w-full text-sm">
      <input
        className="p-2 text-black rounded w-max focus:outline-none"
        placeholder="テキスト"
        value={inputedText}
        onChange={(e) => setInputedText(e.target.value)}
        onClick={(e) => e.preventDefault()}
      />
      <p className="block ml-2 shrink-0">に</p>
    </div>
  )
}

export default CorrespondCheckNode
