import { render, screen, fireEvent } from '@testing-library/react'
import { ZoomControl } from '@/components/ImageViewer/ZoomControl/ZoomControl'
import { describe, it, expect, vi } from 'vitest'

describe('ZoomControl', () => {
    const defaultProps = {
        disabled: false,
        lastZoom: () => 1,
        addZoom: vi.fn(),
    }

    it('renders all zoom options', () => {
        render(<ZoomControl {...defaultProps} />)

        const options = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
        options.forEach((zoom) => {
            expect(screen.getByLabelText(`${zoom * 100}%`)).toBeInTheDocument()
        })
    })

    it('shows current zoom value', () => {
        render(<ZoomControl {...defaultProps} />)
        expect(screen.getByText('Zoom: 100%')).toBeInTheDocument()
    })

    it('calls addZoom when option is selected', () => {
        render(<ZoomControl {...defaultProps} />)

        fireEvent.click(screen.getByLabelText('150%'))
        expect(defaultProps.addZoom).toHaveBeenCalledWith(1.5)
    })

    it('disables all inputs when disabled prop is true', () => {
        render(<ZoomControl {...defaultProps} disabled={true} />)

        const inputs = screen.getAllByRole('radio')
        inputs.forEach((input) => {
            expect(input).toBeDisabled()
        })
    })

    it('highlights the current zoom level', () => {
        const customProps = {
            ...defaultProps,
            lastZoom: () => 1.5,
        }
        render(<ZoomControl {...customProps} />)

        const selectedInput = screen.getByLabelText('150%') as HTMLInputElement
        expect(selectedInput.checked).toBe(true)
    })

    it('maintains proper formatting of zoom values', () => {
        render(<ZoomControl {...defaultProps} />)

        // Check if decimal values are properly formatted
        expect(screen.getByLabelText('25%')).toBeInTheDocument()
        expect(screen.getByLabelText('50%')).toBeInTheDocument()
        expect(screen.getByLabelText('75%')).toBeInTheDocument()
    })

    it('handles zoom changes in sequence', () => {
        render(<ZoomControl {...defaultProps} />)

        fireEvent.click(screen.getByLabelText('50%'))
        expect(defaultProps.addZoom).toHaveBeenCalledWith(0.5)

        fireEvent.click(screen.getByLabelText('200%'))
        expect(defaultProps.addZoom).toHaveBeenCalledWith(2)
    })
})
