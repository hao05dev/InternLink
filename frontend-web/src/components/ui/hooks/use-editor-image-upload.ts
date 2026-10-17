import { useRef, useState } from "react";
import type React from "react";
import type { Editor } from "@tiptap/react";
import { uploadMedia, type MediaScope } from "@/lib/media-upload";

export function useEditorImageUpload(editor: Editor | null, mediaScope?: MediaScope, onUploadStateChange?: (busy: boolean) => void) {
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editor) return;

        if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
            setUploadError('Chỉ hỗ trợ tệp ảnh PNG, JPEG hoặc WEBP.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setUploadError('Ảnh tối đa 5 MiB.');
            return;
        }

        if (!mediaScope) {
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    editor.chain().focus().setImage({ src: reader.result, alt: file.name }).run();
                }
            };
            reader.readAsDataURL(file);
            return;
        }

        setIsUploadingImage(true);
        setUploadError(null);
        onUploadStateChange?.(true);

        try {
            const asset = await uploadMedia(file, mediaScope);
            editor.chain().focus().setImage({ src: asset.url, alt: file.name }).run();
        } catch (err: unknown) {
            setUploadError(err instanceof Error ? err.message : 'Tải ảnh thất bại.');
        } finally {
            setIsUploadingImage(false);
            onUploadStateChange?.(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return { isUploadingImage, uploadError, setUploadError, fileInputRef, handleImageFileChange };
}
