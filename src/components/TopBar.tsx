import { BsPencilSquare } from "react-icons/bs"

export type TopBarProps = {
  name: string
  onChangeName: (name: string) => void
}

const TopBar: React.FC<TopBarProps> = ({ name, onChangeName }) => {
  return (
    <>
      <div className="flex items-center bg-red-300 p-2 pl-4">
        <div>PJ名：</div>
        <input
          className="rounded px-2 py-1"
          placeholder="プロジェクト名"
          value={name}
          onChange={(e) => {
            onChangeName(e.target.value)
          }}
        />
        <div className="bg-w p-2">
          <BsPencilSquare />
        </div>
      </div>
    </>
  )
}
export default TopBar
