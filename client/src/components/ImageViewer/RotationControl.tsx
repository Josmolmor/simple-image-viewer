interface RotationControlProps {
    disabled: boolean
    lastRotation: () => number
    addRotation: (value: number) => void
}

// -180 is the same as 180 and 180 is flipping it vertical, so I don't include them here
const rotationOptions = [-135, -90, -45, 0, 45, 90, 135]

export const RotationControl = ({
    disabled,
    lastRotation,
    addRotation,
}: RotationControlProps) => (
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
)
