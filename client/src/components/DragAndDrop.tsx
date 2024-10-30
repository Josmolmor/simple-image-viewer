import { useState, MouseEvent } from 'react'
import { SquareArrowDown } from 'lucide-react'

interface Props {
    onContainerClick: (event: MouseEvent) => void
    onFileDropped: (file: File) => void
}

const DragAndDrop = ({ onContainerClick, onFileDropped }: Props) => {
    const [dragging, setDragging] = useState(false)

    return (
        <div
            onClick={onContainerClick}
            onDrop={(event) => {
                event.preventDefault()
                event.stopPropagation()
                setDragging(false)
                const { files } = event.dataTransfer

                if (!files) {
                    console.error('No files found')
                    return
                }

                if (files && files.length > 1) {
                    console.error('Only 1 file allowed at a time')
                } else {
                    onFileDropped(files[0])
                }
            }}
            onDragEnter={(event) => {
                event.preventDefault()
                setDragging(true)
            }}
            onDragLeave={(event) => {
                event.preventDefault()
                setDragging(false)
            }}
            onDragOver={(event) => event.preventDefault()}
            className="border border-dotted border-green-500 rounded-lg p-6 w-full cursor-pointer text-gray-400 transition-colors hover:bg-[#effff0]"
            style={dragging ? { background: '#effff0' } : {}}
        >
            <span className="pointer-events-none select-none flex flex-col items-center gap-2 text-pretty">
                <SquareArrowDown className="h-6 w-6 text-gray-400" />
                {dragging
                    ? 'Drop it!'
                    : 'Chose an image or drag it here (JPG or PNG)'}
            </span>
        </div>
    )
}

export default DragAndDrop
