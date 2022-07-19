import { useEffect, useState } from "react"
import { GraphNodeClass } from "../editor/node"

type Props = {
  node: GraphNodeClass
}

const CorrespondCheckNode: React.FC<Props> = (props) => {
  const { node } = props
  const [inputedText, setInputedText] = useState("")
  useEffect(() => {
    const updateUserInputValue = () => {
      node.createrInputValue = inputedText
    }
    updateUserInputValue()
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
      <div>に一致するか</div>
    </div>
  )
}

export default CorrespondCheckNode
