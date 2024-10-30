export interface ActiveImagePayload {
    url: string
    file: File | null
}

export interface ImageListContext {
    imageUrlList: string[]
    fetchImageList: () => void
    deleteUpload: (imageUrl: string) => void
    getUploadedImage: (imageUrl: string) => void
    activeImage: ActiveImagePayload
    setActiveImage: (payload: ActiveImagePayload) => void
}
