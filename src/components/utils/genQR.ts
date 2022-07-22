import QRCode from "qrcode"

const generateQR = async (text: string) => {
  return await QRCode.toDataURL(text, { errorCorrectionLevel: "L" })
}

export default generateQR
