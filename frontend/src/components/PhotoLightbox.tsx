'use client';

import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';

interface PhotoLightboxProps {
    photos: string[];         // array of full API URLs
    initialIndex: number;
    onClose: () => void;
}

export default function PhotoLightbox({ photos, initialIndex, onClose }: PhotoLightboxProps) {
    const current = initialIndex;

    const handleKey = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [handleKey]);

    if (!photos.length) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Close */}
            <button
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                onClick={onClose}
            >
                <X className="w-5 h-5" />
            </button>

            {/* Image */}
            <div
                className="relative max-w-4xl max-h-[90vh] w-full mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <Image
                    src={photos[current]}
                    alt={`Photo ${current + 1} of ${photos.length}`}
                    width={1200}
                    height={800}
                    className="w-full h-full object-contain rounded-lg max-h-[85vh]"
                />
                {photos.length > 1 && (
                    <p className="text-center text-white/60 text-sm mt-2">
                        {current + 1} / {photos.length}
                    </p>
                )}
            </div>
        </div>
    );
}

// ─── Hook ────────────────────────────────────────────────────────────────────
// Usage: const { lightbox, open } = useLightbox(allPhotoUrls)
// Then: <img onClick={() => open(index)} />
//       {lightbox}

import { useState } from 'react';

export function useLightbox(photos: string[]) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const open = (index: number) => setOpenIndex(index);
    const close = () => setOpenIndex(null);

    const lightbox = openIndex !== null ? (
        <PhotoLightbox photos={photos} initialIndex={openIndex} onClose={close} />
    ) : null;

    return { lightbox, open, close };
}
