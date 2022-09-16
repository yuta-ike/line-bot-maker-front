import { NextApiRequest, NextApiResponse } from "next"
import execFlowChart, {
  FlowChartSnapshot,
  OutputValue,
} from "../../../interpreter"
import { FlowchartSyntaxError } from "../../../interpreter/error"
import { FlowChart } from "../../../interpreter/type"

type Content =
  | {
      finish: true
      reply: OutputValue
    }
  | {
      finish: false
      reply: OutputValue
      snapshot: FlowChartSnapshot
    }

const route = async (req: NextApiRequest, res: NextApiResponse<Content>) => {
  if (req.method === "POST") {
    const flowchart: FlowChart = JSON.parse(req.body.flowchart)
    const message: string = req.body.message
    const handoverSnapshot =
      req.body.snapshot == null || req.body.snapshot === ""
        ? undefined
        : JSON.parse(req.body.snapshot)

    try {
      console.log(handoverSnapshot)
      const { finish, output, snapshot } = execFlowChart(
        flowchart,
        { message },
        undefined,
        handoverSnapshot,
      )

      if (snapshot == null) {
        console.log({ finish, reply: output })
        return res.status(200).json({ finish, reply: output })
      } else {
        console.log({ finish, reply: output, snapshot })
        return res.status(200).json({ finish, reply: output, snapshot })
      }
    } catch (e) {
      if (e instanceof FlowchartSyntaxError) {
        res.status(400).end()
      } else {
        throw e
      }
    }
  } else {
    res.status(405).end()
  }
}

export default route

export const config = {
  api: {
    bodyParser: true,
  },
}
