'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileUploader, UploadedFileItem } from '@/components/ui/file-uploader';
import { Image as ImageIcon, Paperclip } from 'lucide-react';

interface JobMediaSectionProps {
    bannerUrl: string;
    onBannerUrlChange: (val: string) => void;
    attachmentUrls: UploadedFileItem[];
    onAttachmentsChange: (items: UploadedFileItem[]) => void;
}

export function JobMediaSection({
    bannerUrl,
    onBannerUrlChange,
    attachmentUrls,
    onAttachmentsChange,
}: JobMediaSectionProps) {
    return (
        <Card className="border border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-sky-600" />
                    <span>3. Hình ảnh truyền thông & Tài liệu đính kèm</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
                <div className="space-y-2">
                    <Input
                        label="Poster / Banner tuyển dụng (URL hình ảnh - Tùy chọn)"
                        value={bannerUrl}
                        onChange={(e) => onBannerUrlChange(e.target.value)}
                        placeholder="https://images.unsplash.com/... hoặc link CDN ảnh poster"
                        hint="Hình ảnh sẽ hiển thị trên danh sách tìm kiếm thực tập của sinh viên"
                    />
                    {bannerUrl && (
                        <div className="rounded-xl overflow-hidden border border-slate-200 h-44 bg-slate-100 max-w-md">
                            <img
                                src={bannerUrl}
                                alt="Xem trước poster"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                }}
                            />
                        </div>
                    )}
                </div>

                <div className="space-y-1.5 pt-2">
                    <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                        <span>Tệp tài liệu đính kèm (File JD chi tiết, Quy chế tiếp nhận, Đề bài test mẫu)</span>
                    </label>
                    <FileUploader
                        value={attachmentUrls}
                        onChange={onAttachmentsChange}
                        accept=".pdf,.docx,.xlsx,.zip"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
