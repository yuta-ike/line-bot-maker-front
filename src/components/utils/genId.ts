import { customAlphabet } from "nanoid"
const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 10)

const genId = () => nanoid()

export default genId
