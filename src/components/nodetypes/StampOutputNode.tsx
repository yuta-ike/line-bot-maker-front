import { useEffect, useState } from "react"
import { GraphNodeClass } from "../editor/node"

type Props = {
  node: GraphNodeClass
}

export const STAMP_OPTIONS = {
  ok: "OK!",
  yes: "Yes!",
  no: "No!",
  enjoy: "楽しい",
  stargazing: "放心",
  sad: "悲しい",
}

const StampOutputNode: React.FC<Props> = (props) => {
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
      <select
        className="w-full p-2 text-black rounded focus:outline-none"
        placeholder="スタンプコード"
        value={inputedText}
        onChange={(e) => setInputedText(e.target.value)}
        onClick={(e) => e.preventDefault()}
      >
        <option value="ok">{STAMP_OPTIONS["ok"]}</option>
        <option value="yes">{STAMP_OPTIONS["yes"]}</option>
        <option value="no">{STAMP_OPTIONS["no"]}</option>
        <option value="enjoy">{STAMP_OPTIONS["enjoy"]}</option>
        <option value="stargazing">{STAMP_OPTIONS["stargazing"]}</option>
        <option value="sad">{STAMP_OPTIONS["sad"]}</option>
      </select>
      <p className="block mt-2 shrink-0">のスタンプを送信</p>
    </div>
  )
}

export default StampOutputNode
