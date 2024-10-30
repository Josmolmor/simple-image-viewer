import {
    useRef,
    useState,
    useEffect,
    useImperativeHandle,
    MouseEvent,
    forwardRef,
} from 'react'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Trash2 } from 'lucide-react'

interface Props {
    width: number
    height: number
    className?: string
}

const DrawingCanvas = forwardRef<
    { getCanvas: () => HTMLCanvasElement | null },
    Props
>(({ width, height, className = '' }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // Expose the canvas and the clear method through ref. Anti-pattern but it'll do for this demo.
    useImperativeHandle(ref, () => ({
        getCanvas: () => canvasRef.current,
        clearCanvas: () => clearCanvas(),
    }))

    const [isDrawing, setIsDrawing] = useState(false)
    const [color, setColor] = useState('#000000')

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        // Canvas2D: Multiple readback operations using getImageData are faster with the willReadFrequently attribute set to true.
        // See: https://html.spec.whatwg.org/multipage/canvas.html#concept-canvas-will-read-frequently
        const context = canvas.getContext('2d', { willReadFrequently: true })
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
    }, [height, width])

    const startDrawing = (e: MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const context = canvas.getContext('2d')
        if (context) {
            context.beginPath()
            context.moveTo(x, y)
            setIsDrawing(true)
        }
    }

    const draw = (e: MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return

        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const context = canvas.getContext('2d')
        if (context) {
            context.strokeStyle = color
            context.lineTo(x, y)
            context.stroke()
        }
    }

    const stopDrawing = () => {
        setIsDrawing(false)
    }

    const clearCanvas = () => {
        const canvas = canvasRef.current
        const context = canvas?.getContext('2d')
        if (context) {
            context.clearRect(0, 0, canvas!.width, canvas!.height)
        }
    }

    return (
        <div className="flex flex-col items-center space-y-4 relative">
            <canvas
                id="drawingCanvas"
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                className={`cursor-crosshair ${className}`}
            />
            <div className="flex space-x-4 absolute top-2 right-2">
                <Select onValueChange={setColor} defaultValue={color}>
                    <SelectTrigger className="w-[84x] bg-white">
                        <SelectValue placeholder="Select a color" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="#000000">Black</SelectItem>
                        <SelectItem value="#FF0000">Red</SelectItem>
                        <SelectItem value="#00FF00">Green</SelectItem>
                        <SelectItem value="#0000FF">Blue</SelectItem>
                        <SelectItem value="#FFFF00">Yellow</SelectItem>
                        <SelectItem value="#FFFFFF">White</SelectItem>
                    </SelectContent>
                </Select>
                <Button onClick={clearCanvas} title="Clear Canvas">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
})

export default DrawingCanvas
