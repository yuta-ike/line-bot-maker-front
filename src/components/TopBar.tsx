import Link from "next/link"
import { MdHome } from "react-icons/md"

export type TopBarProps = {
  name: string
  onChangeName: (name: string) => void
  isPublic: boolean
  onChangeIsPublic: (isPublic: boolean) => void
}

const TopBar: React.FC<TopBarProps> = ({
  name,
  onChangeName,
  isPublic,
  onChangeIsPublic,
}) => {
  return (
    <>
      <div className="z-30 flex items-center p-2 pl-4 bg-red-300">
        <Link href="/">
          <a className="text-gray-800 transition rounded-full hover:text-gray-800/50">
            <MdHome size="24px" />
          </a>
        </Link>
        <div className="ml-4">PJ名：</div>
        <input
          className="px-2 py-1 rounded"
          placeholder="プロジェクト名"
          value={name}
          onChange={(e) => {
            onChangeName(e.target.value)
          }}
        />
        <div className="ml-auto">
          <button onClick={() => onChangeIsPublic(!isPublic)}>
            {isPublic ? "公開中" : "非公開"}
          </button>
        </div>
      </div>
    </>
  )
}
export default TopBar
