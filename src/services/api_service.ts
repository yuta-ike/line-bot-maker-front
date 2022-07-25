import useSWR from "swr"
import axios from "axios"

const url = process.env.NEXT_PUBLIC_API_BASE_URL as string

const fetcher = (url: string) => axios.get(url).then((res) => res.data)

export function useBots() {
  const { data, error } = useSWR(url + "/getIdToken/bot", fetcher)

  return {
    user: data,
    isLoading: !error && !data,
    isError: error,
  }
}

export function useBot(id: string) {
  const { data, error } = useSWR(url + `/getIdToken/bot/${id}`, fetcher)

  return {
    user: data,
    isLoading: !error && !data,
    isError: error,
  }
}

export function createBot(
  bot_id: string,
  name: string,
  developerId: string,
  flowChart: string,
) {
  const res = axios.post(url + "/getIdToken/bot", {
    bot_id: bot_id,
    name: name,
    developerId: developerId,
    flowChart: flowChart,
  })

  return res
}

export function updateBot(
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

  const res = axios.put(url + `/getIdToken/bot/${bot_id}`, data)

  return res
}

export function deleteBot(bot_id: string) {
  const res = axios.delete(url + `/getIdToken/bot/${bot_id}`)

  return res
}
