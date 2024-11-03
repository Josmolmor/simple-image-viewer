import { renderHook, act } from '@testing-library/react'
import { useDrawing } from '@/hooks/useDrawing'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MouseEvent } from 'react'

describe('useDrawing', () => {
    const mockDimensions = { width: 800, height: 600 }

    // Mock canvas and context
    const mockContext = {
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        strokeStyle: '#000000',
        lineWidth: 2,
    }

    const mockCanvas = {
        getContext: vi.fn(() => mockContext),
        getBoundingClientRect: vi.fn(() => ({
            left: 0,
            top: 0,
        })),
    }

    beforeEach(() => {
        // Reset all mocks before each test
        vi.clearAllMocks()
    })

    it('should initialize with default values', () => {
        const { result } = renderHook(() => useDrawing(mockDimensions))

        expect(result.current.isDrawing).toBe(false)
        expect(result.current.drawingColor).toBe('#000000')
        expect(result.current.canvasRef.current).toBe(null)
    })

    it('should update drawing color', () => {
        const { result } = renderHook(() => useDrawing(mockDimensions))

        act(() => {
            result.current.setDrawingColor('#FF0000')
        })

        expect(result.current.drawingColor).toBe('#FF0000')
    })

    it('should handle start and stop drawing', () => {
        const { result } = renderHook(() => useDrawing(mockDimensions))

        // Mock the canvas ref
        Object.defineProperty(result.current.canvasRef, 'current', {
            writable: true,
            value: mockCanvas as unknown as HTMLCanvasElement,
        })

        const mockEvent = {
            clientX: 100,
            clientY: 100,
            preventDefault: vi.fn(),
            currentTarget: mockCanvas,
        } as unknown as MouseEvent<HTMLCanvasElement>

        act(() => {
            result.current.startDrawing(mockEvent)
        })

        expect(result.current.isDrawing).toBe(true)
        expect(mockContext.beginPath).toHaveBeenCalled()
        expect(mockContext.moveTo).toHaveBeenCalledWith(100, 100)

        act(() => {
            result.current.stopDrawing()
        })

        expect(result.current.isDrawing).toBe(false)
    })

    it('should handle drawing movement', () => {
        const { result } = renderHook(() => useDrawing(mockDimensions))

        // Mock the canvas ref
        Object.defineProperty(result.current.canvasRef, 'current', {
            writable: true,
            value: mockCanvas as unknown as HTMLCanvasElement,
        })

        // Start drawing
        act(() => {
            result.current.startDrawing({
                clientX: 100,
                clientY: 100,
                preventDefault: vi.fn(),
                currentTarget: mockCanvas,
            } as unknown as MouseEvent<HTMLCanvasElement>)
        })

        // Move while drawing
        act(() => {
            result.current.draw({
                clientX: 150,
                clientY: 150,
                preventDefault: vi.fn(),
                currentTarget: mockCanvas,
            } as unknown as MouseEvent<HTMLCanvasElement>)
        })

        expect(mockContext.lineTo).toHaveBeenCalledWith(150, 150)
        expect(mockContext.stroke).toHaveBeenCalled()
    })

    it('should not draw when isDrawing is false', () => {
        const { result } = renderHook(() => useDrawing(mockDimensions))

        Object.defineProperty(result.current.canvasRef, 'current', {
            writable: true,
            value: mockCanvas as unknown as HTMLCanvasElement,
        })

        act(() => {
            result.current.draw({
                clientX: 150,
                clientY: 150,
                preventDefault: vi.fn(),
                currentTarget: mockCanvas,
            } as unknown as MouseEvent<HTMLCanvasElement>)
        })

        expect(mockContext.lineTo).not.toHaveBeenCalled()
        expect(mockContext.stroke).not.toHaveBeenCalled()
    })

    it('should update drawing color', () => {
        const { result } = renderHook(() => useDrawing(mockDimensions))

        act(() => {
            result.current.setDrawingColor('#FF0000')
        })

        expect(result.current.drawingColor).toBe('#FF0000')
    })
})
