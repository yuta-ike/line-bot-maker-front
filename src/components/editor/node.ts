export type GraphNode = {
  id: string
  node: EditorNode
  pos: Coordinate
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

export class GraphNodeClass {
  static id = 0

  public id: string
  public node: EditorNode
  public pos: {
    //座標
    x: number
    y: number
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

  constructor(
    node: EditorNode,
    {
      pos,
      inPoints,
      outPoints,
    }: {
      pos?: Coordinate //44l、三項演算子、値が入っていないとFalse判定で宣言
      inPoints?: Point[] //38l
      outPoints?: Point[]
    } = {},
  ) {
    this.id = `${GraphNodeClass.id++}` //idはGlaphNodeClassが呼び出される度に自動でインクリメント
    this.node = node
    this.pos = pos ?? { x: 0, y: 0 } //null合体代入、posがnullなら初期座標として(0,0)を代入
    this.inPoints = inPoints ?? []
    this.outPoints = outPoints ?? []
  }

  setPos(coordinate: Coordinate) {
    this.pos = coordinate
    return this
  }

  canConnect(
    pointId: number,
    counterNode: GraphNodeClass,
    counterPointId: number,
  ) {
    return !(this.id === counterNode.id)
  }
}
