import useSWR from "swr"
import axios from "axios"

const url = process.env.NEXT_PUBLIC_API_BASE_URL as string

const fetcher = (url: string) => axios.get(url).then((res) => res.data)

export function useBots(developerId?: string) {
  const { data, error } = useSWR(
    developerId == null
      ? null
      : url + "/getIdToken/bot?developerId=" + developerId,
    fetcher,
  )

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  }
}

export async function getBot(id: string) {
  const res = await axios.get(url + `/getIdToken/bot/${id}`)
  return res.data
}

export async function getOthersBot(id: string) {
  const res = await axios.get(url + `/getIdToken/bot/others`, { params: { developerId: id } })
  return res.data
}

export async function createBot(
  bot_id: string,
  name: string,
  developerId: string,
  flowChart: string,
) {
  const res = await axios.post(url + "/getIdToken/bot", {
    bot_id: bot_id,
    name: name,
    developerId: developerId,
    flowChart: flowChart,
  })

  return res
}

export async function updateBot(
  bot_id: string,
  name: string,
  developerId: string,
  flowChart: string,
) {
  let data: { [key: string]: string }

  data = {}
  if (name) {
    data["name"] = name
  }

  if (developerId) {
    data["developerId"] = developerId
  }

  if (flowChart) {
    data["flowChart"] = flowChart
  }

  const res = await axios.put(url + `/getIdToken/bot/${bot_id}`, data)

  return res
}

export async function deleteBot(bot_id: string) {
  const res = await axios.delete(url + `/getIdToken/bot/${bot_id}`)
  return res
}

export async function activateBot(developerId: string, bot_id: string) {
  const res = await axios.post(url + `/getIdToken/activate`, {
    user_id: developerId,
    bot_id,
  })
  return res
}
