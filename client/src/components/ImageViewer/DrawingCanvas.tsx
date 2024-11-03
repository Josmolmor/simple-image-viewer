import { useImperativeHandle, forwardRef } from 'react'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Trash2 } from 'lucide-react'
import { useDrawing } from '@/hooks/useDrawing'

type Props = {
    width: number
    height: number
    className?: string
}

type DrawingCanvasRef = {
    clearCanvas: () => void
    getCanvas: () => HTMLCanvasElement | null
}

const DrawingCanvas = forwardRef<DrawingCanvasRef, Props>(
    ({ width, height, className = '' }, ref) => {
        const {
            canvasRef,
            startDrawing,
            draw,
            stopDrawing,
            clearCanvas,
            drawingColor,
            setDrawingColor,
        } = useDrawing({ height, width })

        // Expose the canvas and the clear method through ref.
        // Anti-pattern but it'll do for this demo.
        useImperativeHandle(ref, () => ({
            getCanvas: () => canvasRef.current,
            clearCanvas: () => clearCanvas(),
        }))

        return (
            <div className="flex flex-col items-center space-y-4 relative row-start-1 row-end-1 col-start-1 col-end-1">
                <canvas
                    id="drawingCanvas"
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseOut={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className={`cursor-crosshair h-full w-full touch-none ${className}`}
                />
                <div className="flex space-x-4 absolute top-2 right-2">
                    <Select
                        onValueChange={setDrawingColor}
                        defaultValue={drawingColor}
                    >
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
    }
)

export default DrawingCanvas
