import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button.tsx'
import { Input } from '@/components/ui/input.tsx'
import {
    FlipHorizontal2,
    FlipVertical2,
    Redo2,
    RefreshCw,
    Undo2,
    Upload,
} from 'lucide-react'
import type { AxiosResponse } from 'axios'
import useManipulations from '@/hooks/useManipulations.ts'
import DragAndDrop from '@/components/DragAndDrop.tsx'
import api from '@/lib/axios.ts'
import DrawingCanvas from '@/components/DrawingCanvas.tsx'
import { useImageList, useToast } from '@/context'

// -180 is the same as 180 and 180 is flipping it vertical, so I don't include them here
const rotationOptions = [-135, -90, -45, 0, 45, 90, 135]
const zoomOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3]

const ImageViewer = () => {
    const { setToastMessage } = useToast()
    const { fetchImageList, activeImage, setActiveImage } = useImageList()
    const {
        manipulations,
        reDoArray,
        addRotation,
        addZoom,
        flipHorizontal,
        flipVertical,
        resetManipulations,
        undoLastAction,
        redoLastAction,
        lastRotation,
        lastZoom,
        lastHorizontalFlip,
        lastVerticalFlip,
    } = useManipulations()

    const typeFileInputAttachRef = useRef<HTMLInputElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const drawingCanvasRef = useRef<{
        getCanvas: () => HTMLCanvasElement | null
        clearCanvas: () => void
    }>(null)

    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [inputResetKey, setInputResetKey] = useState(0)
    const [loading, setLoading] = useState(false)
    const disabled = loading || !imageUrl

    const parseFile = (file: File) => {
        if (!file) return setToastMessage('File type unsupported')

        // Extra check for image type. (We're still triple checking on the backend endpoint)
        if (!['image/jpg', 'image/jpeg', 'image/png'].includes(file.type)) {
            setInputResetKey(inputResetKey + 1)
            setToastMessage('File type not allowed')
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

    // State to sync canvas dimensions
    const [canvasDrawn, setCanvasDrawn] = useState(0)
    const drawImageOnCanvas = useCallback(
        (imageSrc: string = imageUrl ?? '') => {
            const imagePath = imageSrc
            const rotationAngle = lastRotation()
            const zoomFactor = lastZoom()
            const flipHorizontal = lastHorizontalFlip()
            const flipVertical = lastVerticalFlip()

            if (imagePath && canvasRef.current) {
                const canvas = canvasRef.current
                const ctx = canvas.getContext('2d')

                if (!ctx) {
                    console.error('Unable to get the canvas context')
                    return
                }

                const image = new Image()

                // this is to avoid tainting the canvas and not being able to upload the image
                if (imagePath.includes('localhost')) {
                    image.crossOrigin = 'anonymous'
                }

                image.src = imagePath

                image.onload = () => {
                    ctx.save()

                    // Calculate the diagonal length to determine the canvas size;
                    // we're going to need it later to show the full image if it's rotated
                    const diagonal = Math.sqrt(
                        image.width ** 2 + image.height ** 2
                    )

                    // Check to see if we use the diagonal for dimensions or the image dimensions
                    const useImageDimensions = [
                        0,
                        -180,
                        180,
                        ...(image.height === image.width
                            ? [-270, -90, 90, 270]
                            : []),
                    ].includes(rotationAngle)
                    const isRotated90Degrees = [-90, 90].includes(rotationAngle)

                    // Flips
                    ctx.scale(flipHorizontal, 1) // horizontally
                    ctx.scale(1, flipVertical) // vertically

                    // Rotation
                    canvas.width = useImageDimensions
                        ? isRotated90Degrees
                            ? image.height
                            : image.width
                        : diagonal
                    canvas.height = useImageDimensions
                        ? isRotated90Degrees
                            ? image.width
                            : image.height
                        : diagonal
                    ctx.clearRect(0, 0, canvas.width, canvas.height)
                    ctx.translate(canvas.width / 2, canvas.height / 2)
                    const angleInRadians = (rotationAngle * Math.PI) / 180
                    ctx.rotate(angleInRadians)

                    // Zoom
                    ctx.scale(
                        flipHorizontal * zoomFactor,
                        flipVertical * zoomFactor
                    )
                    ctx.clearRect(
                        canvas.width,
                        canvas.height,
                        useImageDimensions ? image.width : diagonal,
                        useImageDimensions ? image.height : diagonal
                    )
                    ctx.drawImage(image, -image.width / 2, -image.height / 2)
                    setCanvasDrawn(canvasDrawn + 1)

                    ctx.restore()
                }
            }
        },
        [
            canvasDrawn,
            imageUrl,
            lastHorizontalFlip,
            lastRotation,
            lastVerticalFlip,
            lastZoom,
        ]
    )

    // Re-draw canvas each time the imageUrl state changes
    useEffect(() => {
        if (activeImage.url && activeImage.file) {
            setImageUrl(activeImage.url)
            setImageFile(activeImage.file)
            drawImageOnCanvas(activeImage.url)
        } else {
            drawImageOnCanvas()
        }
    }, [imageUrl, activeImage.file, activeImage.url])

    // Reset the "activeImageUrl" variable when a new image is being dropped or attached
    useEffect(() => {
        setActiveImage({ url: '', file: null })
    }, [imageUrl, setActiveImage])

    // Upload the image to the server
    const handleImageUpload = async () => {
        setLoading(true)
        const baseCanvas = canvasRef.current
        const drawingCanvas = drawingCanvasRef.current?.getCanvas()
        if (!baseCanvas) return

        // Create a temporary canvas to merge both layers
        const mergedCanvas = document.createElement('canvas')
        mergedCanvas.width = baseCanvas.width
        mergedCanvas.height = baseCanvas.height
        const ctx = mergedCanvas.getContext('2d')

        if (!ctx) return

        // Draw the base image canvas
        ctx.drawImage(baseCanvas, 0, 0)

        // Draw the drawing canvas on top if it exists
        if (drawingCanvas) {
            // Scale the drawing canvas to match the base canvas dimensions
            const scaledWidth = baseCanvas.width
            const scaledHeight = baseCanvas.height
            ctx.drawImage(drawingCanvas, 0, 0, scaledWidth, scaledHeight)
        }

        // Use the merged canvas for the blob
        mergedCanvas.toBlob(async (blob) => {
            if (!blob) {
                return setToastMessage(
                    'Unable to build blob from current canvas',
                    'error'
                )
            }

            const file = new File([blob], imageFile?.name ?? '', {
                type: imageFile?.type ?? 'image/jpeg',
            })

            const formData = new FormData()
            formData.append('image', file)

            try {
                await api
                    .post('/upload', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    })
                    .then(
                        (
                            response: AxiosResponse<{
                                filePath: string
                                message: string
                            }>
                        ) => {
                            setToastMessage(response.data.message, 'success')
                        }
                    )
            } catch (error) {
                console.error(`Failed to upload image: ${error}`)
                setToastMessage(`Failed to upload image: ${error}`)
            } finally {
                fetchImageList()
                setLoading(false)
            }
        })
    }

    // Drawing canvas related methods
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
    const updateDimensions = () => {
        if (canvasRef.current) {
            const { width, height } = canvasRef.current.getBoundingClientRect()
            setDimensions({ width, height })
        }
    }

    // Listener for keeping up the same dimensions for both canvas (base and drawing)
    useEffect(() => {
        updateDimensions()
        window.addEventListener('resize', updateDimensions)
        return () => window.removeEventListener('resize', updateDimensions) // clean up
    }, [])

    // run update dimensions every time the canvas is set with a new image
    useEffect(() => {
        const baseCanvas = canvasRef.current
        const drawingCanvas = drawingCanvasRef.current?.getCanvas()

        if (
            baseCanvas &&
            drawingCanvas &&
            (baseCanvas.getBoundingClientRect().height !==
                drawingCanvas.getBoundingClientRect().height ||
                baseCanvas.getBoundingClientRect().width !==
                    drawingCanvas.getBoundingClientRect().width)
        ) {
            // Run updateDimensions to match sizes between both canvas every time the canvas is drawn
            updateDimensions()
        }
    }, [canvasDrawn])

    // Force re-draws after manipulations
    useEffect(() => {
        drawImageOnCanvas()
    }, [manipulations])

    return (
        <div className="flex flex-col items-center gap-4">
            <DragAndDrop
                onFileDropped={parseFile}
                onContainerClick={() => typeFileInputAttachRef.current?.click()}
            />
            <Input
                key={inputResetKey}
                ref={typeFileInputAttachRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleImageAttached}
                onChangeCapture={handleImageAttached} // When using the drag and drop mixed with the click to attach functionality "onChange" acts weird sometimes. Using onChangeCapture fixes it
                className="hidden"
            />
            <div id="manipulations" className="flex flex-wrap gap-4 w-full">
                <div className="w-full sm:w-[calc(50%-0.5rem)] flex flex-col gap-2 items-start">
                    <label className="text-xs font-semibold">
                        Rotation: {lastRotation()}°
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {rotationOptions.map((value) => (
                            <label
                                key={value}
                                className="flex items-center space-x-2 cursor-pointer"
                            >
                                <input
                                    type="radio"
                                    name="rotation"
                                    disabled={disabled}
                                    value={value}
                                    checked={lastRotation() === value}
                                    onChange={() => addRotation(value)}
                                    className="accent-green-500"
                                />
                                <span className="text-sm">{value}°</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="w-full sm:w-[calc(50%-0.5rem)] flex flex-col gap-2 items-start">
                    <label className="text-xs font-semibold">
                        Zoom: {Math.round(lastZoom() * 100)}%
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {zoomOptions.map((value) => (
                            <label
                                key={value}
                                className="flex items-center space-x-2 cursor-pointer"
                            >
                                <input
                                    type="radio"
                                    name="zoom"
                                    disabled={disabled}
                                    value={value}
                                    checked={lastZoom() === value}
                                    onChange={() => addZoom(value)}
                                    className="accent-green-500"
                                />
                                <span className="text-sm">
                                    {Math.round(value * 100)}%
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap justify-around gap-4 w-full">
                <Button
                    onClick={undoLastAction}
                    disabled={disabled || manipulations.length === 0}
                    variant="secondary"
                    className="w-full sm:max-w-[calc(25%-1rem)]"
                >
                    <Undo2 className="w-4 h-4" />
                    Undo
                </Button>
                <Button
                    onClick={redoLastAction}
                    disabled={
                        disabled || manipulations.length === reDoArray.length
                    }
                    variant="secondary"
                    className="w-full sm:max-w-[calc(25%-1rem)]"
                >
                    <Redo2 className="w-4 h-4" />
                    Re-do
                </Button>
                <Button
                    onClick={flipHorizontal}
                    disabled={disabled}
                    variant="secondary"
                    className="w-full sm:max-w-[calc(25%-1rem)]"
                >
                    <FlipHorizontal2 className="w-4 h-4" />
                    Flip horizontal
                </Button>
                <Button
                    onClick={flipVertical}
                    disabled={disabled}
                    variant="secondary"
                    className="w-full sm:max-w-[calc(25%-1rem)]"
                >
                    <FlipVertical2 className="w-4 h-4" />
                    Flip vertical
                </Button>
            </div>
            <div className="flex flex-wrap justify-around gap-4 w-full">
                <Button
                    onClick={() => {
                        resetManipulations()
                        drawingCanvasRef.current?.clearCanvas()
                    }}
                    disabled={disabled}
                    variant="secondary"
                    className="w-full sm:max-w-[calc(50%-0.5rem)]"
                >
                    <RefreshCw className="w-4 h-4" />
                    Reset
                </Button>
                <Button
                    onClick={handleImageUpload}
                    disabled={disabled}
                    className="w-full sm:max-w-[calc(50%-0.5rem)]"
                >
                    <Upload className="w-4 h-4" />
                    Upload
                </Button>
            </div>
            {(imageUrl || activeImage.url) && (
                <div className="relative mt-4">
                    <canvas
                        id="baseCanvas"
                        ref={canvasRef}
                        className={`bg-white w-auto h-full max-h-[480px] max-w-full md:max-w-2xl fit-cover rounded-lg scroll-pt-8`}
                    />
                    <div className="absolute top-0 left-0">
                        <DrawingCanvas
                            ref={drawingCanvasRef}
                            width={dimensions.width}
                            height={dimensions.height}
                            className="w-full h-full"
                        />
                    </div>
                    <span className="self-end text-xs text-muted-foreground px-2 break-all">
                        {imageFile?.name}
                    </span>
                </div>
            )}
        </div>
    )
}

export default ImageViewer
