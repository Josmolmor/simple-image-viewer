import { createContext } from 'react'

export type ToastVariant = 'success' | 'error'

export interface ToastContext {
    toastMessage: string
    variant: ToastVariant
    setToastMessage: (message: string, variant?: ToastVariant) => void
}

export const ToastContext = createContext<ToastContext | undefined>({
    toastMessage: '',
    variant: 'error',
    setToastMessage: () => {},
})
