const APP_URL = process.env.NEXT_PUBLIC_APP_URL

export type BuildInviteMessageParams = {
  name: string
  createdAt: string
  botId: string
}

const buildInviteMessage = ({
  name,
  createdAt,
  botId,
}: BuildInviteMessageParams) =>
  ({
    type: "flex",
    altText: "",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "Botへの招待が届いています",
            weight: "bold",
            size: "lg",
          },
          {
            type: "box",
            layout: "vertical",
            margin: "lg",
            spacing: "sm",
            contents: [
              {
                type: "box",
                layout: "baseline",
                spacing: "sm",
                contents: [
                  {
                    type: "text",
                    text: "Bot名",
                    color: "#aaaaaa",
                    size: "sm",
                    flex: 1,
                  },
                  {
                    type: "text",
                    text: name,
                    wrap: true,
                    color: "#666666",
                    size: "sm",
                    flex: 5,
                  },
                ],
              },
              {
                type: "box",
                layout: "baseline",
                spacing: "sm",
                contents: [
                  {
                    type: "text",
                    text: "作成日",
                    color: "#aaaaaa",
                    size: "sm",
                    flex: 1,
                    wrap: false,
                  },
                  {
                    type: "text",
                    text: createdAt,
                    wrap: true,
                    color: "#666666",
                    size: "sm",
                    flex: 5,
                  },
                ],
              },
            ],
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "button",
            style: "link",
            height: "sm",
            action: {
              type: "uri",
              label: "利用する",
              uri: `${APP_URL}/activate?botId=${botId}`,
            },
          },
          {
            type: "box",
            layout: "vertical",
            contents: [],
            margin: "sm",
          },
        ],
        flex: 0,
      },
    },
  } as const)

export default buildInviteMessage
