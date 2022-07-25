import type { NextPage } from "next"
import { useCallback, useState } from "react"
import { BsFillFileCodeFill } from "react-icons/bs"
import Header from "../modules/Header"
import { useUser } from "../provider/LiffProvider"
import genId from "../components/utils/genId"
import { useRouter } from "next/router"
import { createBot, useBots } from "../services/api_service"
import Link from "next/link"

export type FileComponentProps = {
  botId: string
  name: string
  creatorName: string
  creatorIconUrl: string
}

const FileComponent: React.FC<FileComponentProps> = ({
  botId,
  name,
  creatorName,
  creatorIconUrl,
}) => {
  return (
    <Link href={`/bot/${botId}`}>
      <a>
        <div className="flex max-w-[240px] flex-col items-center">
          <div className="flex w-full items-center justify-center rounded-lg bg-gray-300 py-10">
            <BsFillFileCodeFill size={64} />
          </div>
          <div className="pb-1" />
          <div className="flex w-full text-start text-lg">{name}</div>

          <div className="pb-2" />
        </div>
      </a>
    </Link>
  )
}

const Home: NextPage = () => {
  const router = useRouter()
  const user = useUser()

  const [searchInput, setSearchInput] = useState("")

  const { data: bots } = useBots(user?.id)

  /**
   * 新しいBotの作成
   */
  const handleCreate = useCallback(async () => {
    if (user == null) {
      return
    }
    try {
      const botId = genId()
      await createBot(botId, "新しいプログラム", "[]", user.id)

      router.push(`/bot/${botId}`)
    } catch {
      window.alert("エラーが発生しました")
    }
  }, [router, user])

  return (
    <div className="mt-20 bg-fixed p-4 font-mplus">
      <Header />
      <div className="flex w-full justify-end">
        <button
          onClick={handleCreate}
          className="rounded bg-green-500 p-4 text-white hover:bg-green-600"
        >
          新しいBotを作る
        </button>
      </div>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col items-center">
          <div className="flex flex-row">
            <input
              className="container h-8 w-64 border border-gray-300 bg-gray-100 font-mplus"
              type="text"
              name="search"
              placeholder="キーワードを入力"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <div className="w-4" />
            <button
              className="container w-12 border border-black"
              onClick={() => window.alert("すみません、未実装です🚧")}
            >
              検索
            </button>
          </div>
        </div>
      </form>
      <div className="mt-4 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-5">
          {bots?.map((bot: any) => (
            <FileComponent
              key={bot.fields.bot_id}
              botId={bot.fields.bot_id}
              name={bot.fields.name}
              creatorName={user?.name ?? ""}
              creatorIconUrl={user?.iconUrl ?? ""}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home
