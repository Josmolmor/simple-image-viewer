type ZoomControlProps = {
    disabled: boolean
    lastZoom: () => number
    addZoom: (value: number) => void
}

const zoomOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3]

export const ZoomControl = ({
    disabled,
    lastZoom,
    addZoom,
}: ZoomControlProps) => (
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
                    <span className="text-sm">{Math.round(value * 100)}%</span>
                </label>
            ))}
        </div>
    </div>
)
