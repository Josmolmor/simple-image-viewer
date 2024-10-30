import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export async function convertImageUrlToFile(
    imageUrl: string,
    fileName: string
) {
    const response = await fetch(imageUrl)
    const blob = await response.blob()

    // Create a File object from the Blob
    const file = new File([blob], fileName, { type: blob.type })
    return file
}
