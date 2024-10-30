import { useImageList } from '@/context'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'

const ImageGallery = () => {
    const {
        imageUrlList: imageList,
        deleteUpload,
        getUploadedImage,
    } = useImageList()
    const [loaded, setIsLoaded] = useState(false)

    return imageList.length ? (
        <>
            <hr />
            <div className="flex flex-col gap-6 items-start">
                <div className="flex flex-col gap-1 items-start">
                    <h2 className="text-xl sm:text-2xl font-semibold">
                        List of uploads
                    </h2>
                    <p>Select an image by clicking on it</p>
                </div>

                <div className="flex gap-4 flex-wrap justify-center">
                    {imageList.map((imagePath) => (
                        <div key={imagePath} className="relative">
                            <img
                                src={`${import.meta.env.VITE_API_URL}${imagePath}`}
                                alt={`Uploaded image with path ${imagePath}`}
                                className="object-cover rounded-lg w-full h-auto sm:max-w-[200px] max-h-[200px] cursor-pointer transition-all hover:opacity-80"
                                loading="lazy"
                                onLoad={() => setIsLoaded(true)}
                                onClick={() => getUploadedImage(imagePath)}
                            />
                            {loaded ? (
                                <button
                                    title="Delete upload"
                                    onClick={() => deleteUpload(imagePath)}
                                    className="p-2 rounded-lg bg-red-500/50 text-white hover:bg-red-500 absolute top-2 right-2"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            ) : null}
                        </div>
                    ))}
                </div>
            </div>
        </>
    ) : null
}

export default ImageGallery
