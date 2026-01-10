import { CONSTANTS } from "@/constants";

export const NUM_EPOCH = 10;

export const storeBlob = async (blobData: Uint8Array) => {
    const url = `${CONSTANTS.WALRUS.PUBLISHER_URL}/v1/blobs?epochs=${NUM_EPOCH}`;
    console.log(`storeBlob url: ${url}`);
    return fetch(url, {
        method: "PUT",
        body: blobData,
    }).then(async (response) => {
        if (response.status === 200) {
            const blobInfo = await response.json();

            let blobId = "";
            if (blobInfo.alreadyCertified) {
                blobId = blobInfo.alreadyCertified.blobId;
            } else if (blobInfo.newlyCreated) {
                blobId = blobInfo.newlyCreated.blobObject.blobId;
            } else {
                throw new Error("Response does not contain expected bolbId");
            }

            return blobId;
        }

        throw new Error(
            `Something went wrong when storing the blob!, ${JSON.stringify(
                response,
                null,
                2
            )}`
        );
    });
};
