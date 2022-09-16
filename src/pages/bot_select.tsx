import type { NextPage } from "next"
import Header from "../modules/Header"
import { useUser } from "../provider/LiffProvider"
import { useRouter } from "next/router"
import { activateBot, useAvailableBots } from "../services/api_service"

const LINE_BOT_BASIC_ID = process.env.NEXT_PUBLIC_LINE_BOT_BASIC_ID as string

export type FileComponentProps = {
  botId: string
  name: string
  creatorName: string
  creatorIconUrl: string
  update: string
  onClickUse: () => void
}

const FileComponent: React.FC<FileComponentProps> = ({
  botId,
  name,
  creatorName,
  creatorIconUrl,
  update,
  onClickUse,
}) => {
  return (
    <div className="flex-row border-b border-gray-300 pb-4 md:flex">
      <div className="basis-1/3" />
      <div className="basis-1/6">
        <div className="flex flex-col">
          <p className="w-auto truncate rounded-lg font-mplus text-lg">
            {name}
          </p>
          <div className="flex items-center truncate rounded-lg font-mplus text-sm">
            <div className="shrink-0 p-2">
              <img src={creatorIconUrl} className="h-6 w-6 rounded-full" />
            </div>
            {creatorName}
          </div>
          <div className="rounded-sm font-mplus text-xs">{update}</div>
        </div>
      </div>

      <div className="w-[148px] shrink-0 basis-1/12">
        <button
          onClick={onClickUse}
          className="rounded bg-green-500 p-3 text-white hover:bg-green-600"
        >
          使ってみる
        </button>
      </div>
      <div className="basis-1/3" />
    </div>
  )
}

const BotSelect: NextPage = () => {
  const router = useRouter()
  const user = useUser()

  const { data: bots, isLoading } = useAvailableBots()

  const handleOnClick = async (botId: string) => {
    if (user != null) {
      await activateBot(user.id, botId)
      router.push(`https://line.me/R/ti/p/${LINE_BOT_BASIC_ID}`)
    }
  }

  return (
    <div className="mt-20 bg-fixed p-4 font-mplus">
      <Header />
      <div className="flex-col items-center rounded-lg text-2xl md:flex">
        現在利用できるBot
      </div>
      <div className="mt-4 p-4">
        {user == null ? (
          <div className="mx-auto text-center text-lg">ログイン中</div>
        ) : isLoading ? (
          <div className="mx-auto text-center text-lg">ロード中</div>
        ) : (
          <div>
            {bots?.map((bot: any) => (
              <FileComponent
                key={bot.botId}
                botId={bot.bot_id}
                name={bot.name}
                creatorName={user?.name ?? ""}
                creatorIconUrl={user?.iconUrl ?? ""}
                update={""}
                onClickUse={() => handleOnClick(bot.id as string)}
              />
            ))}
            {bots != null && bots.length === 0 && (
              <div className="mx-auto text-center text-lg">
                利用できるBotはありません
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default BotSelect
