import { NextApiRequest, NextApiResponse } from "next"
import execFlowChart, { OutputValue } from "../../../interpreter"
import { FlowchartSyntaxError } from "../../../interpreter/error"
import { FlowChart } from "../../../interpreter/type"

type Content = {
  reply: OutputValue
}

const route = async (req: NextApiRequest, res: NextApiResponse<Content>) => {
  if (req.method === "POST") {
    const flowchart: FlowChart = JSON.parse(req.body.flowchart)
    const message: string = req.body.message

    try {
      const { output } = execFlowChart(flowchart, { message })

      res.status(200).json({ reply: output })
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
