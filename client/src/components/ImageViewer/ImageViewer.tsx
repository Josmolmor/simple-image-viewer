import { useCallback, useEffect, useState } from 'react'
import { Input } from '@/components/ui/input.tsx'
import type { AxiosResponse } from 'axios'
import useManipulations from '@/hooks/useManipulations.ts'
import DragAndDrop from '@/components/DragAndDrop.tsx'
import api from '@/lib/axios.ts'
import { useImageList } from '@/context'
import { RotationControl } from './RotationControl/RotationControl'
import { ZoomControl } from './ZoomControl/ZoomControl'
import ActionButtons from './ActionButtons/ActionButtons'
import { useImageViewer } from '@/hooks/useImageViewer'
import DrawingCanvas from './DrawingCanvas'

const ImageViewer = () => {
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

    const {
        canvasRef,
        typeFileInputAttachRef,
        drawingCanvasRef,
        imageUrl,
        imageFile,
        inputResetKey,
        setLoading,
        setImageUrl,
        setImageFile,
        disabled,
        dimensions,
        updateDimensions,
        parseFile,
        handleImageAttached,
        setToastMessage,
    } = useImageViewer()

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
    }, [imageUrl, activeImage.file, activeImage.url, drawImageOnCanvas])

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
    }, [drawImageOnCanvas, manipulations])

    return (
        <div className="flex flex-col items-center gap-6">
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
            <div id="manipulations" className="flex flex-wrap gap-4 w-full px-2">
                <RotationControl
                    addRotation={addRotation}
                    lastRotation={lastRotation}
                    disabled={disabled}
                />
                <ZoomControl
                    addZoom={addZoom}
                    lastZoom={lastZoom}
                    disabled={disabled}
                />
            </div>
            <ActionButtons
                disabled={disabled}
                manipulations={manipulations}
                reDoArray={reDoArray}
                onUndoLastAction={undoLastAction}
                onRedoLastAction={redoLastAction}
                onFlipHorizontal={flipHorizontal}
                onFlipVertical={flipVertical}
                onReset={() => {
                    resetManipulations()
                    drawingCanvasRef.current?.clearCanvas()
                }}
                onUpload={handleImageUpload}
            />
            {(imageUrl || activeImage.url) && (
                <>
                    <div className="grid place-content-center mt-4">
                        <canvas
                            id="baseCanvas"
                            ref={canvasRef}
                            className={`row-start-1 row-end-1 col-start-1 col-end-1 bg-white w-auto h-auto max-h-[480px] max-w-full md:max-w-2xl fit-cover rounded-lg scroll-pt-8`}
                        />
                        <DrawingCanvas
                            ref={drawingCanvasRef}
                            width={dimensions.width}
                            height={dimensions.height}
                            className="h-full w-full"
                        />
                    </div>
                    <span className="self-end text-xs text-muted-foreground px-2 break-all">
                        {imageFile?.name}
                    </span>
                </>
            )}
        </div>
    )
}

export default ImageViewer
