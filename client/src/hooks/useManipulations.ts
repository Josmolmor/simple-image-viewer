import { useEffect, useReducer, useState } from 'react'

type Action =
    | {
          type: 'rotate' | 'zoom' | 'flipHorizontal' | 'flipVertical'
          value: number
      }
    | { type: 'reset' | 'undo' | 'redo' }

type ManipulationsState = Action[]

const initialState: ManipulationsState = []

const reducer = (
    state: ManipulationsState,
    action: Action
): ManipulationsState => {
    switch (action.type) {
        case 'rotate':
        case 'zoom':
        case 'flipHorizontal':
        case 'flipVertical':
            return [...state, action]
        case 'reset':
            return initialState
        case 'undo':
            return state.slice(0, -1)
        case 'redo':
        default:
            return state
    }
}

const useManipulations = () => {
    const [manipulations, dispatch] = useReducer(reducer, initialState)
    const [reDoArray, setReDoArray] = useState<Action[]>(manipulations)
    const [undoIndex, setUndoIndex] = useState(0)

    // Keep both arrays synced
    useEffect(() => {
        if (manipulations.length > reDoArray.length) {
            setReDoArray([...manipulations])
        }
    }, [manipulations, reDoArray.length])

    const addRotation = (value: number) => {
        dispatch({ type: 'rotate', value })
    }

    const lastRotation = () => {
        const lastRotationAction = manipulations
            .filter(
                (action): action is { type: 'rotate'; value: number } =>
                    action.type === 'rotate'
            )
            .slice(-1)[0]

        return lastRotationAction?.value ?? 0
    }

    const addZoom = (value: number) => {
        dispatch({ type: 'zoom', value })
    }

    const lastZoom = () => {
        const lastHorizontalZoomAction = manipulations
            .filter(
                (action): action is { type: 'zoom'; value: number } =>
                    action.type === 'zoom'
            )
            .slice(-1)[0]

        return lastHorizontalZoomAction?.value ?? 1
    }

    const flipHorizontal = () => {
        dispatch({ type: 'flipHorizontal', value: -lastHorizontalFlip() })
    }

    const lastHorizontalFlip = () => {
        const lastHorizontalFlipAction = manipulations
            .filter(
                (action): action is { type: 'flipHorizontal'; value: number } =>
                    action.type === 'flipHorizontal'
            )
            .slice(-1)[0]

        return lastHorizontalFlipAction?.value ?? 1
    }

    const flipVertical = () => {
        dispatch({ type: 'flipVertical', value: -lastVerticalFlip() })
    }

    const lastVerticalFlip = () => {
        const lastVerticalFlipAction = manipulations
            .filter(
                (action): action is { type: 'flipVertical'; value: number } =>
                    action.type === 'flipVertical'
            )
            .slice(-1)[0]

        return lastVerticalFlipAction?.value ?? 1
    }

    const resetManipulations = () => {
        setReDoArray([])
        setUndoIndex(0)
        dispatch({ type: 'reset' })
    }

    const undoLastAction = () => {
        dispatch({ type: 'undo' })

        if (manipulations.length > 0) {
            setUndoIndex(manipulations.length - 1)
        } else {
            resetManipulations()
            setReDoArray([])
        }
    }

    const redoLastAction = () => {
        dispatch({ type: 'redo' })
        const lastAction = reDoArray[undoIndex]
        if (lastAction) {
            dispatch(lastAction)
            setUndoIndex(undoIndex + 1)
        }
    }

    return {
        manipulations,
        reDoArray,
        addRotation,
        addZoom,
        resetManipulations,
        undoLastAction,
        redoLastAction,
        flipHorizontal,
        flipVertical,
        lastHorizontalFlip,
        lastVerticalFlip,
        lastRotation,
        lastZoom,
    }
}

export default useManipulations
