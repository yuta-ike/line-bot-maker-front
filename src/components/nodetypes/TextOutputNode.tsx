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
    console.log(node.createrInputValue)
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
      <div>と出力</div>
    </div>
  )
}

export default TextOutputNode
