import useSWR from "swr"
import axios from "axios"
import { useUser } from "../provider/LiffProvider"
import { clearExpiredIdToken } from "../components/utils/liffHelper"

const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID!

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("ERROR")
    if (error.response.status === 403) {
      clearExpiredIdToken(LIFF_ID)
    }
  },
)

const url = process.env.NEXT_PUBLIC_API_BASE_URL as string

export async function postLogin(idToken: string) {
  const res = await axios.post(
    url + `/getIdToken/login`,
    {},
    {
      headers: {
        Authorization: idToken,
      },
    },
  )
  return res.data
}

export function useBots({ me }: { me?: boolean } = {}) {
  const user = useUser()
  console.log(url + (me ? "/getIdToken/bot" : "/getIdToken/bot/others"))
  const { data, error } = useSWR(
    url + (me ? "/getIdToken/bot" : "/getIdToken/bot/others"),
    async (url: string) => {
      if (user?.idToken == null) {
        throw new Error()
      }
      const res = await axios.get(url, {
        headers: {
          Authorization: user.idToken,
        },
      })
      return res.data
    },
  )

  return {
    data,
    isLoading: !error && !data,
    isError: error,
  }
}

export async function getBot(idToken: string | null, id: string) {
  if (idToken == null) {
    throw new Error()
  }
  const res = await axios.get(url + `/getIdToken/bot/${id}`, {
    headers: {
      Authorization: idToken,
    },
  })
  return res.data
}

export async function getOthersBot(id: string) {
  const res = await axios.get(url + `/getIdToken/bot/others`, {
    params: { developerId: id },
  })
  return res.data
}

export async function createBot(
  idToken: string | null,
  bot_id: string,
  name: string,
  flowchart: string,
) {
  if (idToken == null) {
    throw new Error()
  }
  const res = await axios.post(
    url + "/getIdToken/bot",
    {
      bot_id: bot_id,
      name: name,
      flowchart: flowchart,
    },
    {
      headers: {
        Authorization: idToken ?? "",
      },
    },
  )

  return res
}

export async function updateBot(
  idToken: string | null,
  bot_id: string,
  name: string,
  developerId: string,
  flowchart: string,
  isPublic: boolean,
) {
  if (idToken == null) {
    throw new Error()
  }
  const res = await axios.put(
    url + `/getIdToken/bot/${bot_id}`,
    {
      name,
      created_by: developerId,
      flowchart,
      is_public: isPublic,
    },
    {
      headers: {
        Authorization: idToken,
      },
    },
  )

  return res
}

export async function deleteBot(idToken: string | null, bot_id: string) {
  if (idToken == null) {
    throw new Error()
  }
  const res = await axios.delete(url + `/getIdToken/bot/${bot_id}`, {
    headers: {
      Authorization: idToken,
    },
  })
  return res
}

export async function activateBot(developerId: string, bot_id: string) {
  const res = await axios.post(url + `/getIdToken/activate`, {
    user_id: developerId,
    bot_id,
  })
  return res
}
