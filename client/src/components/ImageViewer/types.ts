export type Action =
    | {
          type: 'rotate' | 'zoom' | 'flipHorizontal' | 'flipVertical'
          value: number
      }
    | { type: 'reset' | 'undo' | 'redo' }

export type ManipulationsState = Action[]

export type DrawingCanvasRef = {
    getCanvas: () => HTMLCanvasElement | null
    clearCanvas: () => void
}

export type Dimensions = {
    width: number
    height: number
}
