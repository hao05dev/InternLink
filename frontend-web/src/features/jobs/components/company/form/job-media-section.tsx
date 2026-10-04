"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  FileUploader,
  type UploadedFileItem,
} from "@/components/ui/file-uploader";
import { MediaImageInput } from "@/components/ui/media-image-input";
import { uploadMedia } from "@/lib/media-upload";
import { Image as ImageIcon } from "lucide-react";
type Props = {
  companyId: string;
  bannerUrl: string;
  onBannerUrlChange: (value: string) => void;
  attachmentUrls: UploadedFileItem[];
  onAttachmentsChange: (items: UploadedFileItem[]) => void;
  disabled?: boolean;
  onUploadStateChange?: (busy: boolean) => void;
};
export function JobMediaSection({
  companyId,
  bannerUrl,
  onBannerUrlChange,
  attachmentUrls,
  onAttachmentsChange,
  disabled,
  onUploadStateChange,
}: Props) {
  return (
    <Card className="border border-slate-200">
      <CardHeader className="border-b pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <ImageIcon className="h-4 w-4 text-sky-600" />
          3. Hình ảnh truyền thông & Tài liệu đính kèm
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 p-5">
        <MediaImageInput
          label="Poster / Banner tuyển dụng (Tùy chọn)"
          purpose="JOB_BANNER"
          contextId={companyId}
          value={bannerUrl}
          onChange={onBannerUrlChange}
          disabled={disabled || !companyId}
          onUploadStateChange={onUploadStateChange}
        />
        <FileUploader
          label="Tài liệu đính kèm"
          description="PDF, DOCX, XLSX, TXT hoặc ảnh PNG/JPEG, tối đa 20 MiB; ảnh tối đa 5 MiB."
          accept=".pdf,.docx,.xlsx,.txt,.png,.jpg,.jpeg"
          maxSizeMb={20}
          value={attachmentUrls}
          onChange={onAttachmentsChange}
          allowUrlInput={false}
          disabled={disabled || !companyId}
          onUploadStateChange={onUploadStateChange}
          upload={async (file) => {
            const asset = await uploadMedia(file, {
              purpose: "JOB_ATTACHMENT",
              contextId: companyId,
            });
            return {
              id: asset.id,
              fileName: asset.fileName,
              fileUrl: asset.url,
              fileSize: Math.ceil(asset.sizeBytes / 1024) + " KB",
              fileType: asset.mimeType.startsWith("image/") ? "IMAGE" : "OTHER",
            };
          }}
        />
      </CardContent>
    </Card>
  );
}
