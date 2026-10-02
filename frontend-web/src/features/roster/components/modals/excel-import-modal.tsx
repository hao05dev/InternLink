'use client';

import React, { useState, useRef } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    FileSpreadsheet,
    Download,
    UploadCloud,
    AlertCircle,
    CheckCircle2,
    X,
    FileText,
    RefreshCw,
} from 'lucide-react';
import { AcademicProgramOption } from '../../types/roster.types';
import {
    downloadRosterTemplate,
    parseRosterExcelFile,
    ParseRosterResult,
    StudentRosterImportPayload,
} from '../../utils/roster-excel-utils';

interface ExcelImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (items: StudentRosterImportPayload[]) => Promise<boolean>;
    isLoading: boolean;
    selectedTermId: string;
    programs: AcademicProgramOption[];
}

export function ExcelImportModal({
    isOpen,
    onClose,
    onSubmit,
    isLoading,
    selectedTermId,
    programs,
}: ExcelImportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [parseResult, setParseResult] = useState<ParseRosterResult | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [parseError, setParseError] = useState<string | null>(null);
    const [filterTab, setFilterTab] = useState<'all' | 'valid' | 'invalid'>('all');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleReset = () => {
        setFile(null);
        setParseResult(null);
        setParseError(null);
        setFilterTab('all');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleModalClose = () => {
        if (isLoading) return;
        handleReset();
        onClose();
    };

    const processFile = async (selectedFile: File) => {
        const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
        if (!['xlsx', 'xls', 'csv'].includes(fileExt || '')) {
            setParseError('Chỉ hỗ trợ tệp định dạng .xlsx, .xls hoặc .csv');
            return;
        }

        setFile(selectedFile);
        setIsParsing(true);
        setParseError(null);

        try {
            const result = await parseRosterExcelFile(selectedFile, programs);
            setParseResult(result);
        } catch (err: unknown) {
            setParseError(err instanceof Error ? err.message : 'Không thể đọc dữ liệu từ tệp Excel');
            setParseResult(null);
        } finally {
            setIsParsing(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) processFile(selected);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const dropped = e.dataTransfer.files?.[0];
        if (dropped) processFile(dropped);
    };

    const handleSubmit = async () => {
        if (!parseResult || parseResult.validPayloads.length === 0) return;
        const success = await onSubmit(parseResult.validPayloads);
        if (success) {
            handleModalClose();
        }
    };

    const displayedRows = parseResult?.rows.filter(r => {
        if (filterTab === 'valid') return r.isValid;
        if (filterTab === 'invalid') return !r.isValid;
        return true;
    }) || [];

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleModalClose}
            title="Import Danh Sách Sinh Viên từ Excel"
            description="Tải lên tệp bảng tính danh sách sinh viên đăng ký kỳ thực tập"
            maxWidth="4xl"
        >
            <div className="space-y-5">
                {/* Header Actions: Template Download */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                    <div className="flex items-center gap-2.5">
                        <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                            <p className="text-xs font-semibold text-slate-800">Chưa có tệp dữ liệu chuẩn?</p>
                            <p className="text-[11px] text-slate-500">Tải mẫu Excel kèm danh mục mã ngành để nhập nhanh</p>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => downloadRosterTemplate(programs)}
                        className="gap-2 shrink-0 border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Tải file mẫu (.xlsx)
                    </Button>
                </div>

                {/* Upload Area / Dropzone */}
                {!file ? (
                    <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
                            isDragging
                                ? 'border-sky-500 bg-sky-50/50 scale-[0.99]'
                                : 'border-slate-200 hover:border-sky-400 hover:bg-slate-50/70'
                        }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                            <UploadCloud className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-800">
                                Kéo thả file Excel vào đây hoặc <span className="text-sky-600 underline">chọn tệp từ máy</span>
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                Định dạng hỗ trợ: .xlsx, .xls, .csv (Tối đa 1.000 dòng)
                            </p>
                        </div>
                    </div>
                ) : (
                    /* Selected File Bar */
                    <div className="flex items-center justify-between bg-sky-50/70 border border-sky-200 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
                                <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleReset}
                            disabled={isLoading || isParsing}
                            className="text-slate-400 hover:text-rose-600 gap-1 text-xs"
                        >
                            <X className="w-4 h-4" />
                            Chọn file khác
                        </Button>
                    </div>
                )}

                {/* Parsing Status / Error */}
                {isParsing && (
                    <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-500">
                        <RefreshCw className="w-4 h-4 animate-spin text-sky-600" />
                        Đang phân tích dữ liệu bảng tính...
                    </div>
                )}

                {parseError && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 text-xs">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold">Lỗi đọc file:</p>
                            <p className="mt-0.5">{parseError}</p>
                        </div>
                    </div>
                )}

                {/* Live Preview Table */}
                {parseResult && (
                    <div className="space-y-3">
                        {/* Summary & Filter Tabs */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-700">Xem trước kết quả:</span>
                                <Badge variant="secondary" className="text-xs">
                                    Tổng: {parseResult.totalRows}
                                </Badge>
                                <Badge variant="success" className="text-xs">
                                    Hợp lệ: {parseResult.validCount}
                                </Badge>
                                {parseResult.errorCount > 0 && (
                                    <Badge variant="destructive" className="text-xs">
                                        Lỗi: {parseResult.errorCount}
                                    </Badge>
                                )}
                            </div>

                            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs self-start sm:self-auto">
                                <button
                                    type="button"
                                    onClick={() => setFilterTab('all')}
                                    className={`px-2.5 py-1 rounded-md font-medium transition ${
                                        filterTab === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    Tất cả ({parseResult.totalRows})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFilterTab('valid')}
                                    className={`px-2.5 py-1 rounded-md font-medium transition ${
                                        filterTab === 'valid' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    Hợp lệ ({parseResult.validCount})
                                </button>
                                {parseResult.errorCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setFilterTab('invalid')}
                                        className={`px-2.5 py-1 rounded-md font-medium transition ${
                                            filterTab === 'invalid' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                                        }`}
                                    >
                                        Có lỗi ({parseResult.errorCount})
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Table */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 text-slate-600 font-semibold">
                                    <tr>
                                        <th className="py-2.5 px-3 w-12 text-center">#</th>
                                        <th className="py-2.5 px-3">MSSV</th>
                                        <th className="py-2.5 px-3">Họ và tên</th>
                                        <th className="py-2.5 px-3">Email</th>
                                        <th className="py-2.5 px-3">Ngành</th>
                                        <th className="py-2.5 px-3">Khóa / Lớp</th>
                                        <th className="py-2.5 px-3">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {displayedRows.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-6 text-center text-slate-400 text-xs">
                                                Không có dòng dữ liệu nào trong danh mục này.
                                            </td>
                                        </tr>
                                    ) : (
                                        displayedRows.map((row) => (
                                            <tr
                                                key={row.rowNumber}
                                                className={`transition ${
                                                    row.isValid ? 'hover:bg-slate-50/60' : 'bg-rose-50/40 hover:bg-rose-50/70'
                                                }`}
                                            >
                                                <td className="py-2 px-3 text-center text-slate-400 font-mono">
                                                    {row.rowNumber}
                                                </td>
                                                <td className="py-2 px-3 font-medium text-slate-900">
                                                    {row.studentCode || <span className="text-rose-500 italic">Trống</span>}
                                                </td>
                                                <td className="py-2 px-3 text-slate-700">
                                                    {row.fullName || <span className="text-rose-500 italic">Trống</span>}
                                                </td>
                                                <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">
                                                    {row.officialEmail}
                                                </td>
                                                <td className="py-2 px-3">
                                                    {row.programName ? (
                                                        <span className="text-slate-800">{row.programName}</span>
                                                    ) : (
                                                        <span className="text-rose-500 font-mono">{row.programCode || 'Trống'}</span>
                                                    )}
                                                </td>
                                                <td className="py-2 px-3 text-slate-500">
                                                    {row.academicYear} {row.classCode ? `· ${row.classCode}` : ''}
                                                </td>
                                                <td className="py-2 px-3">
                                                    {row.isValid ? (
                                                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                            Hợp lệ
                                                        </span>
                                                    ) : (
                                                        <div className="space-y-0.5">
                                                            {row.errors.map((err, i) => (
                                                                <span key={i} className="inline-flex items-center gap-1 text-rose-600 text-[11px] block">
                                                                    <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                                                                    {err}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {parseResult.errorCount > 0 && (
                            <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                                💡 Lưu ý: Chỉ <strong>{parseResult.validCount} sinh viên hợp lệ</strong> sẽ được import vào hệ thống. Các dòng có lỗi sẽ tự động được bỏ qua.
                            </p>
                        )}
                    </div>
                )}

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleModalClose}
                        disabled={isLoading}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        onClick={handleSubmit}
                        isLoading={isLoading}
                        disabled={!parseResult || parseResult.validCount === 0 || !selectedTermId}
                        className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        {parseResult && parseResult.validCount > 0
                            ? `Xác nhận Import (${parseResult.validCount} sinh viên)`
                            : 'Xác nhận Import'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
