import { useEffect, useState } from "react"
import { GraphNodeClass } from "../editor/node"

// type Props = {
//   node: GraphNodeClass
// }

const TextInputNode = () => {
  // const { node } = props
  // const [inputedText, setInputedText] = useState("")
  // useEffect(() => {
  //   const updateUserInputValue = () => {
  //     node.userInputValue = inputedText
  //   }
  //   updateUserInputValue();
  //   console.log(node.userInputValue);
  // }, [inputedText, node])

  return (
    <div className="flex">
      <div>ユーザの入力待ち</div>
      <div className="text-black">
        {/* <textarea
          value={inputedText}
          onChange={(e) => setInputedText(e.target.value)}
          cols={5}
          rows={1}
        /> */}
      </div>
    </div>
  )
}

export default TextInputNode
