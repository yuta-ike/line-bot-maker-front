export const getLiffLocalStorageKeys = (prefix: string) => {
  const keys = []
  for (var i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key != null && key.indexOf(prefix) === 0) {
      keys.push(key)
    }
  }
  return keys
}

export const clearExpiredIdToken = (liffId: string) => {
  const keyPrefix = `LIFF_STORE:${liffId}:`
  const key = keyPrefix + "decodedIDToken"
  console.log(key)
  const decodedIDTokenString = localStorage.getItem(key)
  if (!decodedIDTokenString) {
    return
  }
  const decodedIDToken = JSON.parse(decodedIDTokenString)
  console.log(new Date().getTime() > decodedIDToken.exp * 1000)
  // 有効期限をチェック
  if (new Date().getTime() > decodedIDToken.exp * 1000) {
    const keys = getLiffLocalStorageKeys(keyPrefix)
    keys.forEach(function (key) {
      localStorage.removeItem(key)
    })
  }
}
