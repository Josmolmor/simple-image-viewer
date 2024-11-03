import { useRef, useState, MouseEvent, TouchEvent, useEffect } from 'react'

type UseDrawingProps = {
    height: number
    width: number
}

type UseDrawingReturn = {
    canvasRef: React.RefObject<HTMLCanvasElement>
    isDrawing: boolean
    startDrawing: (
        e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>
    ) => void
    draw: (
        e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>
    ) => void
    stopDrawing: () => void
    clearCanvas: () => void
    drawingColor: string
    setDrawingColor: (color: string) => void
}

export const useDrawing = ({
    height,
    width,
}: UseDrawingProps): UseDrawingReturn => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [drawingColor, setDrawingColor] = useState('#000000')

    const startDrawing = (
        e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>
    ) => {
        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const point =
            'touches' in e
                ? {
                      x: e.touches[0].clientX - rect.left,
                      y: e.touches[0].clientY - rect.top,
                  }
                : { x: e.clientX - rect.left, y: e.clientY - rect.top }

        const context = canvas.getContext('2d')
        if (context) {
            context.beginPath()
            context.moveTo(point.x, point.y)
            setIsDrawing(true)
        }
    }

    const draw = (
        e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>
    ) => {
        if (!isDrawing) return

        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const point =
            'touches' in e
                ? {
                      x: e.touches[0].clientX - rect.left,
                      y: e.touches[0].clientY - rect.top,
                  }
                : { x: e.clientX - rect.left, y: e.clientY - rect.top }

        const context = canvas.getContext('2d')
        if (context) {
            context.strokeStyle = drawingColor
            context.lineTo(point.x, point.y)
            context.stroke()
        }
    }

    const stopDrawing = () => {
        setIsDrawing(false)
    }

    const clearCanvas = () => {
        const canvas = canvasRef.current
        const context = canvas?.getContext('2d')
        if (context && canvas) {
            context.clearRect(0, 0, canvas.width, canvas.height)
        }
    }

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        // Canvas2D: Multiple readback operations using getImageData are faster with the willReadFrequently attribute set to true.
        // See: https://html.spec.whatwg.org/multipage/canvas.html#concept-canvas-will-read-frequently
        const context = canvas.getContext('2d', {
            willReadFrequently: true,
        })
        if (!context) return

        // Only try to save previous state if canvas has dimensions
        let previousImageData: ImageData | null = null
        const previousWidth = canvas.width
        const previousHeight = canvas.height

        // Can't execute "getImageData" when value is 0
        if (previousWidth > 0 && previousHeight > 0) {
            previousImageData = context.getImageData(
                0,
                0,
                previousWidth,
                previousHeight
            )
        }
        canvas.width = width
        canvas.height = height

        context.lineCap = 'round'
        context.lineJoin = 'round'
        context.lineWidth = 3

        // Only restore the drawing state if we had previous content
        if (previousImageData && previousWidth > 0 && previousHeight > 0) {
            context.save()
            const tempCanvas = document.createElement('canvas')
            tempCanvas.width = previousWidth
            tempCanvas.height = previousHeight
            const tempContext = tempCanvas.getContext('2d')
            if (tempContext) {
                tempContext.putImageData(previousImageData, 0, 0)
                context.drawImage(
                    tempCanvas,
                    0,
                    0,
                    previousWidth,
                    previousHeight
                )
            }
            context.restore()
        }
        console.log(height, width)
    }, [height, width])

    return {
        canvasRef,
        isDrawing,
        startDrawing,
        draw,
        stopDrawing,
        clearCanvas,
        drawingColor,
        setDrawingColor,
    }
}
