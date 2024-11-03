import { FC } from 'react'
import { Button } from '../ui/button'
import { ManipulationsState } from './types'
import {
    FlipHorizontal2,
    FlipVertical2,
    Redo2,
    RefreshCw,
    Undo2,
    Upload,
} from 'lucide-react'

type Props = {
    disabled: boolean
    manipulations: ManipulationsState
    reDoArray: ManipulationsState
    onUndoLastAction: () => void
    onRedoLastAction: () => void
    onFlipHorizontal: () => void
    onFlipVertical: () => void
    onReset: () => void
    onUpload: () => void
}

const ActionButtons: FC<Props> = ({
    disabled,
    manipulations,
    reDoArray,
    onUndoLastAction,
    onRedoLastAction,
    onFlipHorizontal,
    onFlipVertical,
    onReset,
    onUpload,
}) => {
    return (
        <>
            <div className="flex flex-wrap justify-around gap-4 w-full">
                <Button
                    onClick={onUndoLastAction}
                    disabled={disabled || manipulations.length === 0}
                    variant="secondary"
                    className="w-full sm:max-w-[calc(25%-1rem)]"
                >
                    <Undo2 className="w-4 h-4" />
                    Undo
                </Button>
                <Button
                    onClick={onRedoLastAction}
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
                    onClick={onFlipHorizontal}
                    disabled={disabled}
                    variant="secondary"
                    className="w-full sm:max-w-[calc(25%-1rem)]"
                >
                    <FlipHorizontal2 className="w-4 h-4" />
                    Flip horizontal
                </Button>
                <Button
                    onClick={onFlipVertical}
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
                    onClick={onReset}
                    disabled={disabled}
                    variant="secondary"
                    className="w-full sm:max-w-[calc(50%-0.5rem)]"
                >
                    <RefreshCw className="w-4 h-4" />
                    Reset
                </Button>
                <Button
                    onClick={onUpload}
                    disabled={disabled}
                    className="w-full sm:max-w-[calc(50%-0.5rem)]"
                >
                    <Upload className="w-4 h-4" />
                    Upload
                </Button>
            </div>
        </>
    )
}

export default ActionButtons
