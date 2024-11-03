import { createContext } from 'react'

export type ToastVariant = 'success' | 'error'

export type ToastContext = {
    toastMessage: string
    variant: ToastVariant
    setToastMessage: (message: string, variant?: ToastVariant) => void
}

export const ToastContext = createContext<ToastContext | undefined>({
    toastMessage: '',
    variant: 'error',
    setToastMessage: () => {},
})
