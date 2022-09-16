import classNames from "classnames"
import Link from "next/link"
import { MdChevronLeft, MdHome } from "react-icons/md"

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
      <div className="z-30 flex items-center bg-red-300 p-2 pl-4">
        <Link href="/">
          <a className="rounded-full text-gray-800 transition hover:text-gray-800/50">
            <MdChevronLeft size="36px" />
          </a>
        </Link>
        <div className="ml-4">Botの名前：</div>
        <input
          className="rounded px-2 py-1 focus:outline-none"
          placeholder="プロジェクト名"
          value={name}
          onChange={(e) => {
            onChangeName(e.target.value)
          }}
        />
        <button
          onClick={() => onChangeIsPublic(!isPublic)}
          className="ml-8 flex items-center space-x-2 leading-none"
        >
          <span className="text-sm">
            {isPublic ? "プログラムを公開する　" : "プログラムを公開しない"}
          </span>
          <div
            className={classNames(
              "relative h-[24px] w-[40px] rounded-full",
              isPublic ? "bg-green-500" : "bg-gray-300",
            )}
          >
            <div
              className={classNames(
                "absolute top-[2px] h-[20px] w-[20px] rounded-full bg-white shadow",
                isPublic ? "right-[2px]" : "left-[2px]",
              )}
            />
          </div>
        </button>
      </div>
    </>
  )
}
export default TopBar
