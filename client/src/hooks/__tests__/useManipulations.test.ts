import { renderHook, act } from '@testing-library/react'
import useManipulations from '@/hooks/useManipulations'
import { describe, it, expect } from 'vitest'

describe('useManipulations', () => {
    it('should initialize with default values', () => {
        const { result } = renderHook(() => useManipulations())

        expect(result.current.manipulations).toEqual([])
        expect(result.current.lastRotation()).toBe(0)
        expect(result.current.lastZoom()).toBe(1)
        expect(result.current.lastHorizontalFlip()).toBe(1)
        expect(result.current.lastVerticalFlip()).toBe(1)
    })

    it('should add rotation correctly', () => {
        const { result } = renderHook(() => useManipulations())

        act(() => {
            result.current.addRotation(90)
        })

        expect(result.current.lastRotation()).toBe(90)
    })

    it('should handle zoom operations', () => {
        const { result } = renderHook(() => useManipulations())

        act(() => {
            result.current.addZoom(1.5)
        })

        expect(result.current.lastZoom()).toBe(1.5)
    })

    it('should handle flip operations', () => {
        const { result } = renderHook(() => useManipulations())

        act(() => {
            result.current.flipHorizontal()
        })

        expect(result.current.lastHorizontalFlip()).toBe(-1)

        act(() => {
            result.current.flipVertical()
        })

        expect(result.current.lastVerticalFlip()).toBe(-1)
    })

    it('should reset manipulations', () => {
        const { result } = renderHook(() => useManipulations())

        act(() => {
            result.current.addRotation(90)
            result.current.addZoom(1.5)
            result.current.flipHorizontal()
            result.current.resetManipulations()
        })

        expect(result.current.manipulations).toEqual([])
        expect(result.current.lastRotation()).toBe(0)
        expect(result.current.lastZoom()).toBe(1)
        expect(result.current.lastHorizontalFlip()).toBe(1)
    })

    it('should handle undo/redo operations', () => {
        const { result } = renderHook(() => useManipulations())

        act(() => {
            result.current.addRotation(90)
            result.current.addZoom(1.5)
        })

        act(() => {
            result.current.undoLastAction()
        })

        expect(result.current.lastZoom()).toBe(1)
        expect(result.current.lastRotation()).toBe(90)

        act(() => {
            result.current.redoLastAction()
        })

        expect(result.current.lastZoom()).toBe(1.5)
    })
})
