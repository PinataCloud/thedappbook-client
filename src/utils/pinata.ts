import { PinataSDK } from "pinata";

export const pinata = new PinataSDK({
  pinataJwt: "",
  pinataGateway: "dweb.mypinata.cloud"
})

async function getUploadUrl() {
  try {
    const signedUrlReq = await fetch("https://api.thedappbook.com/signedUpload", {
      method: "POST"
    })
    const url = await signedUrlReq.json()
    return url.data
  } catch (error) {
    console.log(error)
    return error
  }
}

export async function uploadData(message: string, file?: File) {
  try {

    const url = await getUploadUrl()

    if (!url) {
      console.log("Problem fetching presigned upload url")
    }

    let imageUrl: string = ""

    if (file) {
      const fileUpload = await pinata.upload.public
        .file(file)
        .url(url)
      imageUrl = await pinata.gateways.public.convert(fileUpload.cid)
    }

    const urlJson = await getUploadUrl()

    if (!urlJson.ok) {
      console.log("Problem fetching presigned upload url")
    }

    const { cid: uri } = await pinata.upload.public.json({
      message,
      imageUrl
    }).url(urlJson)

    return uri
  } catch (error) {
    console.log(error)
    return ''
  }
}
