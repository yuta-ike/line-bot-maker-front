import useSWR from 'swr'
import axios from "axios"

const fetcher = (url:string) => axios.get(url).then(res => res.data)

export function GetBots () {
    const { data, error } = useSWR('http://localhost:8000/getIdToken/bot', fetcher)

    return {
        user: data,
        isLoading: !error && !data,
        isError: error
    }
}

export function GetBot (id: string) {
    const { data, error } = useSWR(`http://localhost:8000/getIdToken/bot/${id}`, fetcher)

    return {
        user: data,
        isLoading: !error && !data,
        isError: error
    }
}

export function CreateBot (bot_id: string, name: string, developerId: string, flowChart: string) {
    const res = axios.post('http://localhost:8000/getIdToken/bot', {
        bot_id: bot_id,
        name: name,
        developerId: developerId,
        flowChart: flowChart
      })

    return(res)


export function UpdateBot (bot_id: string, name: string, developerId: string, flowChart: string) {
    let data: {[key: string]: string};

    data = {}
    if (name){
        data['name'] = name
    }

    if (developerId){
        data['developerId'] = developerId
    }

    if (flowChart){
        data['flowChart'] = flowChart
    }

    const res = axios.post(`http://localhost:8000/getIdToken/bot/${bot_id}`, data)

    return(res)
}

export function DeleteBot (bot_id: string) {
    const res = axios.delete(`http://localhost:8000/getIdToken/bot/${bot_id}`)

    return res
}
