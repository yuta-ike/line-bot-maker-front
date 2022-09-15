import Fuse from "fuse.js"

export const searchText = <Item extends Record<string, unknown>>(
  list: Item[],
  keys: (keyof Item)[],
  keyword: string,
) => {
  const fuse = new Fuse(list, { keys: keys as string[] })
  const result = fuse.search(keyword) //検索クエリ
  console.log(result)
  return result.map((res) => res.item)
}
