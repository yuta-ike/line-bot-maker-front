import type { NextPage } from "next"
import Header from "../modules/Header"
import { useUser } from "../provider/LiffProvider"
import { useRouter } from "next/router"
import { activateBot, useAvailableBots } from "../services/api_service"
import Image from "next/image"
import { useAuthRoute } from "../utils/useRoute"

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
    <div className="flex-row pb-4 border-b border-gray-300 md:flex">
      <div className="basis-1/3" />
      <div className="basis-1/6">
        <div className="flex flex-col">
          <p className="w-auto text-lg truncate rounded-lg font-mplus">
            {name}
          </p>
          <div className="flex items-center text-sm truncate rounded-lg font-mplus">
            <div className="p-2 shrink-0">
              <Image
                width={24}
                height={24}
                alt=""
                src={creatorIconUrl}
                className="w-6 h-6 rounded-full"
              />
            </div>
            {creatorName}
          </div>
          <div className="text-xs rounded-sm font-mplus">{update}</div>
        </div>
      </div>

      <div className="w-[148px] shrink-0 basis-1/12">
        <button
          onClick={onClickUse}
          className="p-3 text-white bg-green-500 rounded hover:bg-green-600"
        >
          使ってみる
        </button>
      </div>
      <div className="basis-1/3" />
    </div>
  )
}

const BotSelect: NextPage = () => {
  useAuthRoute()

  const router = useRouter()
  const { user } = useUser()

  const { data: bots, isLoading } = useAvailableBots()

  const handleOnClick = async (botId: string) => {
    if (user != null) {
      await activateBot(user.id, botId)
      router.push(`https://line.me/R/ti/p/${LINE_BOT_BASIC_ID}`)
    }
  }

  return (
    <div className="p-4 mt-20 bg-fixed font-mplus">
      <Header />
      <div className="flex-col items-center text-2xl rounded-lg md:flex">
        現在利用できるBot
      </div>
      <div className="p-4 mt-4">
        {user == null ? (
          <div className="mx-auto text-lg text-center">ログイン中</div>
        ) : isLoading ? (
          <div className="mx-auto text-lg text-center">ロード中</div>
        ) : (
          <div>
            {bots?.map((bot: any) => (
              <FileComponent
                key={bot.bot_id}
                botId={bot.bot_id}
                name={bot.name}
                creatorName={user?.name ?? ""}
                creatorIconUrl={user?.iconUrl ?? ""}
                update={""}
                onClickUse={() => handleOnClick(bot.bot_id as string)}
              />
            ))}
            {bots != null && bots.length === 0 && (
              <div className="mx-auto text-lg text-center">
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
