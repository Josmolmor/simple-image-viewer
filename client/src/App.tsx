import './App.css'
import { ToastProvider } from '@/context/ToastContext'
import Toast from '@/components/Toast.tsx'
import ImageGallery from '@/components/ImageGallery.tsx'
import { ImageListProvider } from '@/context/ImageListContext'
import { Images } from 'lucide-react'
import ImageViewer from './components/ImageViewer/ImageViewer'

function App() {
    return (
        <ToastProvider>
            <ImageListProvider>
                <Toast />
                <main className="max-w-3xl mx-auto py-8 sm:py-12 px-8">
                    <section className="flex flex-col gap-8">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Images size={32} />
                            <h1 className="text-2xl sm:text-3xl font-bold">
                                Simple Image Viewer
                            </h1>
                        </div>
                        <ImageViewer />
                        <ImageGallery />
                    </section>
                </main>
            </ImageListProvider>
        </ToastProvider>
    )
}

export default App
