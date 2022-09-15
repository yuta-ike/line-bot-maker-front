export type GraphNode = {
  id: string
  node: EditorNode
  pos: Coordinate
  size: Size
  inPoints: {
    type: string
    label: string
    limit: number | null
  }[]
  outPoints: {
    type: string
    label: string
    limit: number | null
  }[]
  createrInputValue: string
}

export type EditorNode = {
  label: string
  color: string
  nodeType: string
}

export type Edge = {
  start: {
    nodeId: string
    pointId: number
  }
  end: {
    nodeId: string
    pointId: number
  }
}

export type UnfixedEdge = {
  start: string
  end: Coordinate
}

export type Point = {
  type: string
  label: string
  limit: number | null
}

export type Coordinate = {
  x: number
  y: number
}

export type Size = {
  width: number
  height: number
}

export class GraphNodeClass {
  static id = 0

  public static resetId() {
    GraphNodeClass.id = 0
  }

  public id: string
  public node: EditorNode
  public pos: {
    //座標
    x: number
    y: number
  }
  public size: {
    width: number
    height: number
  }
  public inPoints: {
    type: string
    label: string //これがノード内に表示される
    limit: number | null //union型で複数の型を許容
  }[]
  public outPoints: {
    type: string
    label: string //これがノード内に表示される
    limit: number | null
  }[]
  //これはユーザがノードに記入する値（例えば，TextInputNodeであるならば，質問文）
  public createrInputValue = ""

  public isInitialNode: boolean

  constructor(
    node: EditorNode,
    {
      pos,
      size,
      inPoints,
      outPoints,
      createrInputValue,
      isInitialNode = false,
      id,
    }: {
      pos?: Coordinate //44l、三項演算子、値が入っていないとFalse判定で宣言
      size?: Size
      inPoints?: Point[] //38l
      outPoints?: Point[]
      createrInputValue?: string
      isInitialNode?: boolean
      id?: string
    } = {},
  ) {
    this.id = id ?? `${GraphNodeClass.id++}`
    this.node = node
    this.pos = pos ?? { x: 0, y: 0 }
    this.size = size ?? { width: 160, height: 90 }
    this.inPoints = inPoints ?? []
    this.outPoints = outPoints ?? []
    this.createrInputValue = createrInputValue ?? ""
    this.isInitialNode = isInitialNode
  }

  setPos(coordinate: Coordinate) {
    this.pos = coordinate
    return this
  }

  duplicate(pos: Coordinate = { ...this.pos }) {
    return new GraphNodeClass(structuredClone(this.node), {
      pos,
      size: { ...this.size },
      inPoints: structuredClone(this.inPoints),
      outPoints: structuredClone(this.outPoints),
      createrInputValue: this.createrInputValue,
    })
  }

  canConnect(
    pointId: number,
    counterNode: GraphNodeClass,
    counterPointId: number,
  ) {
    return !(this.id === counterNode.id)
  }
}
