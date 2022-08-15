import type { NextPage } from "next"
import { useCallback, useState } from "react"
import { BsFillFileCodeFill } from "react-icons/bs"
import { HiArrowRight} from "react-icons/hi"
import { TiHeartOutline } from "react-icons/ti"
import Header from "../../modules/Header"
import { useUser } from "../../provider/LiffProvider"
import genId from "../../components/utils/genId"
import { useRouter } from "next/router"
import { createBot, useBots } from "../../services/api_service"
import Link from "next/link"
import Head from "next/head"

export type FileComponentProps = {
  botId: string
  name: string
  creatorName: string
  creatorIconUrl: string
  good: number
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
            {/*<BsFillFileCodeFill size={64} />*/}
            <HiArrowRight size={64} />
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
      await createBot(botId, "新しいプログラム", user.id, "[]")

      router.push(`/bot/${botId}`)
    } catch {
      window.alert("エラーが発生しました")
    }
  }, [router, user])

  return (
    <>
      <Head>
        <title>LINE Bot Maker</title>
      </Head>
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
          <div className="flex flex-raw flex-wrap justify-evenly gap-4 w-full">
            {bots?.map((bot: any) => (
              <div className="flex flex-col w-1/3" key={bot.fields.bot_id}> {/*なぜ1/3？*/}
                <FileComponent
                  key={bot.fields.bot_id}
                  botId={bot.fields.bot_id}
                  name={bot.fields.name}
                  creatorName={user?.name ?? ""}
                  creatorIconUrl={user?.iconUrl ?? ""}
                  good={2}
                />
                <div>「天気は？」と聞くと、明日の天気を教えてくれます！</div>
                <div className="flex flex-raw items-center space-x-3">
                  <TiHeartOutline size={32} className="bg-gray-300 hover:bg-gray-200 rounded-full"/>
                  <button className="bg-gray-300 hover:bg-gray-200 text-black font-semibold rounded-full px-4 py-1">プログラムを見る</button>
                  <button 
                    className="bg-red-200 hover:bg-gray-200 text-black font-semibold rounded-full px-4 py-1"
                    onClick={handleCreate}>
                      使ってみる
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default Home
