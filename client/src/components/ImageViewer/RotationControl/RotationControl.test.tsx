import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { RotationControl } from './RotationControl'

describe('RotationControl', () => {
    const defaultProps = {
        disabled: false,
        lastRotation: () => 0,
        addRotation: vi.fn(),
    }

    it('renders all rotation options', () => {
        render(<RotationControl {...defaultProps} />)

        const options = [-135, -90, -45, 0, 45, 90, 135]
        options.forEach((degree) => {
            expect(screen.getByLabelText(`${degree}°`)).toBeInTheDocument()
        })
    })

    it('shows current rotation value', () => {
        render(<RotationControl {...defaultProps} />)
        expect(screen.getByText('Rotation: 0°')).toBeInTheDocument()
    })

    it('calls addRotation when option is selected', () => {
        render(<RotationControl {...defaultProps} />)

        fireEvent.click(screen.getByLabelText('90°'))
        expect(defaultProps.addRotation).toHaveBeenCalledWith(90)
    })

    it('disables all inputs when disabled prop is true', () => {
        render(<RotationControl {...defaultProps} disabled={true} />)

        const inputs = screen.getAllByRole('radio')
        inputs.forEach((input) => {
            expect(input).toBeDisabled()
        })
    })
})
