import { useState, useRef } from "react";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Check, X, Crop as CropIcon } from "lucide-react";

interface ImageCropperProps {
    imageSrc: string;
    onCropComplete: (croppedImageBlob: Blob) => void;
    onCancel: () => void;
}

export function ImageCropper({ imageSrc, onCropComplete, onCancel }: ImageCropperProps) {
    const [crop, setCrop] = useState<Crop>({
        unit: "%",
        width: 90,
        height: 90,
        x: 5,
        y: 5,
    });
    const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const handleCropComplete = async () => {
        if (!completedCrop || !imgRef.current) return;

        const canvas = document.createElement("canvas");
        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

        canvas.width = completedCrop.width * scaleX;
        canvas.height = completedCrop.height * scaleY;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(
            imgRef.current,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            canvas.width,
            canvas.height
        );

        canvas.toBlob((blob) => {
            if (blob) {
                onCropComplete(blob);
            }
        }, "image/jpeg", 0.95);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-[#111111] p-1 border border-white/10 w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#161616]">
                    <div className="flex items-center gap-2 text-white uppercase tracking-widest text-xs font-bold">
                        <CropIcon className="w-4 h-4" />
                        <h3>Edit Source</h3>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-1 text-neutral-500 hover:text-white transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Crop Area */}
                <div className="p-6 bg-[#111111] flex-1 overflow-auto flex items-center justify-center">
                    <ReactCrop
                        crop={crop}
                        onChange={c => setCrop(c)}
                        onComplete={c => setCompletedCrop(c)}
                        aspect={undefined}
                        className="max-w-full border border-white/10"
                    >
                        <img
                            ref={imgRef}
                            src={imageSrc}
                            alt="Crop preview"
                            className="max-w-full max-h-[60vh] object-contain mx-auto"
                        />
                    </ReactCrop>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-white/10 bg-[#161616] flex justify-between items-center">
                    <span className="text-[10px] text-neutral-500 font-mono">DRAG TO RESIZE SELECTION</span>
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="px-6 py-3 border border-white/10 hover:bg-white/5 text-neutral-400 hover:text-white text-xs font-bold uppercase tracking-widest transition"
                        >
                            Discard
                        </button>
                        <button
                            onClick={handleCropComplete}
                            className="px-6 py-3 bg-white hover:bg-neutral-200 text-black text-xs font-bold uppercase tracking-widest transition flex items-center gap-2"
                        >
                            <Check size={14} />
                            Confirm Crop
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}