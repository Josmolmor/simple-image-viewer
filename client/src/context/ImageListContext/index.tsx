import {
    createContext,
    useState,
    ReactNode,
    FC,
    useContext,
    useEffect,
} from 'react'
import api from '@/lib/axios.ts'
import { useToast } from '@/context'
import { AxiosResponse, isAxiosError } from 'axios'
import { convertImageUrlToFile } from '@/utils'
import type { ImageListContext, ActiveImagePayload } from './types.ts'

const ImageListContext = createContext<ImageListContext | undefined>({
    imageUrlList: [],
    fetchImageList: () => {},
    deleteUpload: () => {},
    getUploadedImage: () => {},
    activeImage: {
        url: '',
        file: null,
    },
    setActiveImage: () => {},
})

export const ImageListProvider: FC<{ children: ReactNode }> = ({
    children,
}) => {
    const { setToastMessage } = useToast()

    const [imageList, setImageList] = useState<string[]>([])
    const [activeImage, setActiveImage] = useState<ActiveImagePayload>({
        url: '',
        file: null,
    })

    const fetchImageList = async () => {
        try {
            const response: AxiosResponse<{
                message: string
                fileUrls: string[]
            }> = await api.get('/list-uploads')
            const list = response.data.fileUrls ?? []
            const reversedList = list.reverse()
            setImageList(reversedList)
        } catch (error) {
            if (isAxiosError(error)) {
                console.error(error.response)
                setToastMessage(error.message)
            } else {
                console.error(error)
                setToastMessage(error as string)
            }
        }
    }

    useEffect(() => {
        fetchImageList()
    }, [])

    const deleteUpload = async (imageUrl: string) => {
        try {
            const response = await api.delete(`${imageUrl}`) // "imageUrl" has a format like "/uploads/randomId"
            setToastMessage(response.data.message, 'success')
            await fetchImageList()
        } catch (error) {
            if (isAxiosError(error)) {
                console.error(error.response)
                setToastMessage(error.message)
            } else {
                console.error(error)
                setToastMessage(error as string)
            }
        }
    }

    const getUploadedImage = async (imageUrl: string) => {
        const fileUrl = `${import.meta.env.VITE_API_URL}${imageUrl}`
        const file = await convertImageUrlToFile(
            fileUrl,
            imageUrl.replace('/', '').replace('/', '-')
        )
        setActiveImage({
            url: fileUrl,
            file: file,
        })
    }

    return (
        <ImageListContext.Provider
            value={{
                imageUrlList: imageList,
                fetchImageList,
                deleteUpload,
                getUploadedImage,
                activeImage,
                setActiveImage,
            }}
        >
            {children}
        </ImageListContext.Provider>
    )
}

export const useImageList = (): ImageListContext => {
    const context = useContext(ImageListContext)
    if (context === undefined) {
        throw new Error(
            'useImageListContext must be used within a ImageListProvider'
        )
    }
    return context
}
