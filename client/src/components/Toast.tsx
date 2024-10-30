import { useToast } from '@/context'
import { CheckCircle, CircleX } from 'lucide-react'

const Toast = () => {
    const { toastMessage, variant } = useToast()

    return (
        <div
            className={`flex items-center gap-2 ${variant === 'success' ? 'bg-primary' : 'bg-destructive'} text-background font-semibold text-sm py-2 pl-3 pr-4 rounded-md fixed top-8 right-8 z-50 shadow-sm ${toastMessage ? 'animate-slide-in' : ''}`}
            style={{
                visibility: toastMessage ? 'visible' : 'hidden',
            }}
        >
            {variant === 'success' ? (
                <CheckCircle size={16} />
            ) : (
                <CircleX size={16} />
            )}
            {toastMessage}
        </div>
    )
}

export default Toast
