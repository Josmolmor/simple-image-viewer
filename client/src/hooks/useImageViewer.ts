import { Dimensions, DrawingCanvasRef } from '@/components/ImageViewer/types'
import { useToast } from '@/context'
import { ToastVariant } from '@/context/ToastContext/types'
import { ChangeEvent, useEffect, useRef, useState } from 'react'

type UseImageViewerReturn = {
    canvasRef: React.RefObject<HTMLCanvasElement>
    typeFileInputAttachRef: React.RefObject<HTMLInputElement>
    drawingCanvasRef: React.RefObject<DrawingCanvasRef>
    dimensions: Dimensions
    updateDimensions: () => void
    imageUrl: string | null
    setImageUrl: (url: string | null) => void
    imageFile: File | null
    setImageFile: (file: File | null) => void
    inputResetKey: number
    setLoading: (loading: boolean) => void
    disabled: boolean
    parseFile: (file: File) => void
    handleImageAttached: (event: ChangeEvent<HTMLInputElement>) => void
    setToastMessage: (message: string, variant?: ToastVariant) => void
}

export const useImageViewer = (): UseImageViewerReturn => {
    const { setToastMessage } = useToast()

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const typeFileInputAttachRef = useRef<HTMLInputElement>(null)
    const drawingCanvasRef = useRef<DrawingCanvasRef>(null)
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [inputResetKey, setInputResetKey] = useState(0)
    const [loading, setLoading] = useState(false)

    // Drawing canvas related methods
    const [dimensions, setDimensions] = useState<Dimensions>({
        width: 0,
        height: 0,
    })
    const updateDimensions = () => {
        if (canvasRef.current) {
            const { width, height } = canvasRef.current.getBoundingClientRect()
            setDimensions({ width, height })
        }
    }

    const parseFile = (file: File) => {
        if (!file) return setToastMessage('No file found')

        // Extra check for image type. (We're still triple checking on the backend endpoint)
        if (!['image/jpg', 'image/jpeg', 'image/png'].includes(file.type)) {
            setInputResetKey(inputResetKey + 1)
            setToastMessage(
                'File type not allowed. Please upload a valid image file. (JPG/PNG)'
            )
            return
        }

        const reader = new FileReader()
        reader.onload = () => setImageUrl(`${reader.result}`)
        reader.readAsDataURL(file)
        setImageFile(file)
    }

    const handleImageAttached = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return
        parseFile(file)
    }

    // Listener for keeping up the same dimensions for both canvas (base and drawing)
    useEffect(() => {
        updateDimensions()
        window.addEventListener('resize', updateDimensions)
        return () => window.removeEventListener('resize', updateDimensions) // clean up
    }, [])

    // Handle edge cases where the image is changed and the dimensions need to be updated
    useEffect(() => {
        updateDimensions()
    }, [imageUrl, imageFile])

    return {
        canvasRef,
        typeFileInputAttachRef,
        drawingCanvasRef,
        dimensions,
        updateDimensions,
        imageUrl,
        setImageUrl,
        imageFile,
        setImageFile,
        inputResetKey,
        setLoading,
        disabled: loading || !imageUrl,
        parseFile,
        handleImageAttached,
        setToastMessage,
    }
}
