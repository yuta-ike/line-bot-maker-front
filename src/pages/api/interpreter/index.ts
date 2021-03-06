import { NextApiRequest, NextApiResponse } from "next"
import execFlowChart from "../../../interpreter"
import { FlowchartSyntaxError } from "../../../interpreter/error"
import { FlowChart } from "../../../interpreter/type"

type Content = {
  reply: string
}

const route = async (req: NextApiRequest, res: NextApiResponse<Content>) => {
  if (req.method === "POST") {
    const flowchart: FlowChart = JSON.parse(req.body.flowchart)
    const message: string = req.body.message

    try {
      const { value } = execFlowChart(flowchart, { message })

      res.status(200).json({ reply: value })
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
