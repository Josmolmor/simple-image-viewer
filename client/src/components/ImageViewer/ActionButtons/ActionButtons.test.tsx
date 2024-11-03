import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ActionButtons from './ActionButtons'

describe('ActionButtons', () => {
    const defaultProps = {
        disabled: false,
        manipulations: [],
        reDoArray: [],
        onUndoLastAction: vi.fn(),
        onRedoLastAction: vi.fn(),
        onFlipHorizontal: vi.fn(),
        onFlipVertical: vi.fn(),
        onReset: vi.fn(),
        onUpload: vi.fn(),
    }

    it('renders all buttons', () => {
        render(<ActionButtons {...defaultProps} />)

        expect(screen.getByText('Undo')).toBeInTheDocument()
        expect(screen.getByText('Re-do')).toBeInTheDocument()
        expect(screen.getByText('Flip horizontal')).toBeInTheDocument()
        expect(screen.getByText('Flip vertical')).toBeInTheDocument()
        expect(screen.getByText('Reset')).toBeInTheDocument()
        expect(screen.getByText('Upload')).toBeInTheDocument()
    })

    it('disables buttons when disabled prop is true', () => {
        render(<ActionButtons {...defaultProps} disabled={true} />)

        expect(screen.getByText('Upload')).toBeDisabled()
        expect(screen.getByText('Reset')).toBeDisabled()
        expect(screen.getByText('Flip horizontal')).toBeDisabled()
        expect(screen.getByText('Flip vertical')).toBeDisabled()
    })

    it('calls correct handlers when buttons are clicked', () => {
        render(<ActionButtons {...defaultProps} />)

        fireEvent.click(screen.getByText('Flip horizontal'))
        expect(defaultProps.onFlipHorizontal).toHaveBeenCalled()

        fireEvent.click(screen.getByText('Reset'))
        expect(defaultProps.onReset).toHaveBeenCalled()

        fireEvent.click(screen.getByText('Upload'))
        expect(defaultProps.onUpload).toHaveBeenCalled()
    })
})
