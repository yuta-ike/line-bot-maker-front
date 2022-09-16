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
      <div className="z-30 flex items-center p-2 pl-4 bg-red-300">
        <Link href="/">
          <a className="text-gray-800 transition rounded-full hover:text-gray-800/50">
            <MdChevronLeft size="36px" />
          </a>
        </Link>
        <div className="ml-4">Botの名前：</div>
        <input
          className="px-2 py-1 rounded focus:outline-none"
          placeholder="プロジェクト名"
          value={name}
          onChange={(e) => {
            onChangeName(e.target.value)
          }}
        />
        <button
          onClick={() => onChangeIsPublic(!isPublic)}
          className="flex items-center ml-8 space-x-2 leading-none"
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
