import { PinataSDK } from "pinata";

export const pinata = new PinataSDK({
  pinataJwt: "",
  pinataGateway: "dweb.mypinata.cloud"
})

export async function uploadData(message: string, file?: File) {
  try {
    const keyReq = await fetch("https://api.thedappbook.com/keys", {
      method: "POST"
    })
    const keyRes = await keyReq.json()

    if (!keyReq.ok) {
      console.log("Problem fetching key")
    }

    let imageUrl: string = ""

    if (file) {
      const fileUpload = await pinata.upload.public
        .file(file)
        .key(keyRes.data as unknown as string)
      imageUrl = await pinata.gateways.public.convert(fileUpload.cid)
    }

    const { cid: uri } = await pinata.upload.public.json({
      message,
      imageUrl
    }).key(keyRes.data)

    return uri
  } catch (error) {
    console.log(error)
    return ''
  }
}
