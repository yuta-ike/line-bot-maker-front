import { useState } from "react"
import { BsPencilSquare } from "react-icons/bs"

const TopBar = () => {
  const [pjName, setPJName] = useState("")

  return (
    <>
      <div className="flex items-center bg-red-300 p-2 pl-4">
        <div>PJ名：</div>
        <textarea
          className="rounded"
          rows={1}
          value={pjName}
          onChange={(e) => {
            setPJName(e.target.value)
          }}
        ></textarea>
        <div className="bg-w p-2">
          <BsPencilSquare />
        </div>
      </div>
    </>
  )
}
export default TopBar
