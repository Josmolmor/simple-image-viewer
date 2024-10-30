import { useState, ReactNode, FC, useContext, useEffect } from 'react'
import { ToastContext, ToastVariant } from './types.ts'

export const ToastProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [toastMessage, setToastMessage] = useState('')
    const [toastVariant, setToastVariant] = useState<ToastVariant>('error')

    const setToastMessageAndVariant = (
        message: string,
        variant: ToastVariant = 'error'
    ) => {
        setToastMessage(message)
        setToastVariant(variant)
    }

    useEffect(() => {
        if (toastMessage !== '') {
            const timer = setTimeout(() => {
                setToastMessage('')
            }, 4000)
            return () => clearTimeout(timer)
        }
    }, [toastMessage])

    return (
        <ToastContext.Provider
            value={{
                toastMessage,
                setToastMessage: setToastMessageAndVariant,
                variant: toastVariant,
            }}
        >
            {children}
        </ToastContext.Provider>
    )
}

export const useToast = (): ToastContext => {
    const context = useContext(ToastContext)
    if (context === undefined) {
        throw new Error('useToastContext must be used within a ToastProvider')
    }
    return context
}
