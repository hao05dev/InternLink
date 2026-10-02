'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { AcademicTermFilter } from '@/components/ui/academic-term-filter';
import { 
    DragDropAssignment, 
    AssignableStudent, 
    LecturerQuota 
} from '@/components/shared/drag-drop-assignment';
import { 
    GraduationCap, 
    Users, 
    Briefcase, 
    Layers, 
    Table as TableIcon, 
    CheckCircle2, 
    AlertCircle, 
    RefreshCw,
    Search,
    UserCheck
} from 'lucide-react';
import type { InternshipPlacement } from '@/features/placements/types/placement.types';

type Term = { id: string; code: string; termName: string; academicYear?: string; semester?: string; status?: string; };
type Lecturer = { id: string; fullName: string; departmentName?: string; email?: string; title?: string };
type Agreement = { id: string; termId: string; studentName: string; studentCode?: string; majorName?: string; companyName: string; status: string };

export default function FacultyAssignmentsView() {
    const { user } = useAuth();
    const [terms, setTerms] = useState<Term[]>([]);
    const [termId, setTermId] = useState('');
    const [lecturers, setLecturers] = useState<Lecturer[]>([]);
    const [agreements, setAgreements] = useState<Agreement[]>([]);
    const [placements, setPlacements] = useState<InternshipPlacement[]>([]);
    const [selected, setSelected] = useState<{ kind: 'agreement' | 'placement'; id: string; studentName: string } | null>(null);
    const [lecturerId, setLecturerId] = useState('');
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [busy, setBusy] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    // View mode: 'dnd' (Drag and Drop) or 'table' (Traditional Table)
    const [viewMode, setViewMode] = useState<'dnd' | 'table'>('dnd');

    // Table view pagination & search
    const [tableSearch, setTableSearch] = useState('');
    const [tablePage, setTablePage] = useState(1);
    const [tablePageSize, setTablePageSize] = useState(10);

    const reloadTerm = useCallback(async (selectedTermId: string, departmentId: string) => {
        try {
            const [placementResult, agreementResult] = await Promise.all([
                apiClient.get<InternshipPlacement[]>(`/api/v1/placements/term/${selectedTermId}`),
                apiClient.get<Agreement[]>(`/api/v1/agreements/department/${departmentId}?status=APPROVED`),
            ]);
            const currentPlacements = placementResult.data ?? [];
            setPlacements(currentPlacements);
            setAgreements(
                (agreementResult.data ?? []).filter(
                    (agreement) =>
                        agreement.termId === selectedTermId &&
                        !currentPlacements.some((placement) => placement.agreementId === agreement.id)
                )
            );
        } catch (error) {
            setMessage({
                text: error instanceof Error ? error.message : 'Không tải được dữ liệu phân công.',
                type: 'error',
            });
        }
    }, []);

    useEffect(() => {
        if (!user?.departmentId) return;
        const departmentId = user.departmentId;
        setIsLoading(true);
        Promise.all([
            apiClient.get<Term[]>(`/api/v1/terms/by-department/${departmentId}`),
            apiClient.get<Lecturer[]>('/api/v1/faculty/lecturers'),
        ])
            .then(async ([termResult, lecturerResult]) => {
                const foundTerms = termResult.data ?? [];
                setTerms(foundTerms);
                setLecturers(lecturerResult.data ?? []);
                if (foundTerms.length) {
                    setTermId(foundTerms[0].id);
                    await reloadTerm(foundTerms[0].id, departmentId);
                }
            })
            .catch((error) =>
                setMessage({
                    text: error instanceof Error ? error.message : 'Không tải được dữ liệu phân công.',
                    type: 'error',
                })
            )
            .finally(() => setIsLoading(false));
    }, [user?.departmentId, reloadTerm]);

    const changeTerm = async (id: string) => {
        setTermId(id);
        if (!user?.departmentId) return;
        setIsLoading(true);
        try {
            await reloadTerm(id, user.departmentId);
        } catch (error) {
            setMessage({
                text: error instanceof Error ? error.message : 'Không tải được kỳ thực tập.',
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const currentTerm = terms.find((t) => t.id === termId);
    const isTermClosed = currentTerm?.status === 'CLOSED';

    // Drag and drop assign handler
    const handleDnDAssign = async (studentId: string, targetLecturerId: string) => {
        if (!user?.departmentId) return;
        if (isTermClosed) {
            setMessage({
                text: 'Học kỳ đã đóng (CLOSED). Không thể thay đổi phân công GVHD.',
                type: 'error',
            });
            return;
        }
        setBusy(true);
        try {
            // Check if studentId belongs to unassigned agreement
            const agreement = agreements.find((a) => a.id === studentId);
            if (agreement) {
                await apiClient.post(`/api/v1/placements/activate?agreementId=${studentId}&lecturerId=${targetLecturerId}`);
                setMessage({
                    text: `Đã phân công GVHD thành công cho sinh viên ${agreement.studentName}.`,
                    type: 'success',
                });
            } else {
                // Changing lecturer for an existing placement
                await apiClient.patch(`/api/v1/placements/${studentId}/lecturer?lecturerId=${targetLecturerId}`);
                setMessage({
                    text: `Đã cập nhật GVHD cho sinh viên.`,
                    type: 'success',
                });
            }
            await reloadTerm(termId, user.departmentId);
        } catch (error) {
            setMessage({
                text: error instanceof Error ? error.message : 'Không phân công được GVHD.',
                type: 'error',
            });
        } finally {
            setBusy(false);
        }
    };

    // Manual form submit
    const assign = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!selected || !lecturerId || !user?.departmentId) return;
        if (isTermClosed) {
            setMessage({
                text: 'Học kỳ đã đóng (CLOSED). Không thể thay đổi phân công GVHD.',
                type: 'error',
            });
            return;
        }
        setBusy(true);
        try {
            if (selected.kind === 'agreement') {
                await apiClient.post(`/api/v1/placements/activate?agreementId=${selected.id}&lecturerId=${lecturerId}`);
            } else {
                await apiClient.patch(`/api/v1/placements/${selected.id}/lecturer?lecturerId=${lecturerId}`);
            }
            setSelected(null);
            setMessage({
                text: `Đã lưu phân công GVHD cho ${selected.studentName}.`,
                type: 'success',
            });
            await reloadTerm(termId, user.departmentId);
        } catch (error) {
            setMessage({
                text: error instanceof Error ? error.message : 'Không phân công được GVHD.',
                type: 'error',
            });
        } finally {
            setBusy(false);
        }
    };

    // Prepare data structures for DragDropAssignment
    const assignableStudents: AssignableStudent[] = useMemo(() => {
        const unassigned: AssignableStudent[] = agreements.map((a) => ({
            id: a.id,
            studentCode: a.studentCode || `SV-${a.id.slice(0, 5)}`,
            fullName: a.studentName,
            majorName: a.majorName || 'Khoa CNTT',
            companyName: a.companyName,
            assignedLecturerId: null,
        }));

        return unassigned;
    }, [agreements]);

    const lecturerQuotas: LecturerQuota[] = useMemo(() => {
        return lecturers.map((lec) => {
            const assigned = placements.filter((p) => p.lecturerId === lec.id);
            return {
                id: lec.id,
                fullName: lec.fullName,
                title: lec.title || 'Giảng viên',
                email: lec.email,
                department: lec.departmentName || 'Khoa CNTT',
                currentAssigned: assigned.length,
                maxQuota: 15, // Standard department guidance quota
                assignedStudents: assigned.map((p) => ({
                    id: p.id,
                    studentCode: p.studentCode || `SV-${p.id.slice(0, 5)}`,
                    fullName: p.studentName || 'Sinh viên',
                    companyName: p.companyName,
                    assignedLecturerId: lec.id,
                })),
            };
        });
    }, [lecturers, placements]);

    // Table view filtered data
    const filteredPlacements = useMemo(() => {
        if (!tableSearch.trim()) return placements;
        const q = tableSearch.toLowerCase().trim();
        return placements.filter(
            (p) =>
                (p.studentName && p.studentName.toLowerCase().includes(q)) ||
                (p.companyName && p.companyName.toLowerCase().includes(q)) ||
                (p.lecturerName && p.lecturerName.toLowerCase().includes(q))
        );
    }, [placements, tableSearch]);

    const paginatedPlacements = useMemo(() => {
        const start = (tablePage - 1) * tablePageSize;
        return filteredPlacements.slice(start, start + tablePageSize);
    }, [filteredPlacements, tablePage, tablePageSize]);

    const totalTablePages = Math.ceil(filteredPlacements.length / tablePageSize) || 1;

    return (
        <div className="space-y-6 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-5 h-5 text-blue-700" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Phân Công Giảng Viên Hướng Dẫn</h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Kích hoạt thực tập từ thỏa thuận đã duyệt và phân bổ GVHD theo hạn mức tải trọng
                        </p>
                    </div>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                        type="button"
                        onClick={() => setViewMode('dnd')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            viewMode === 'dnd'
                                ? 'bg-white text-blue-700 shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Kéo thả (D&D)</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('table')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            viewMode === 'table'
                                ? 'bg-white text-blue-700 shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <TableIcon className="w-3.5 h-3.5" />
                        <span>Dạng bảng ({placements.length})</span>
                    </button>
                </div>
            </div>

            {/* Alert Message */}
            {message && (
                <div
                    role="alert"
                    className={`p-3.5 rounded-xl flex items-center justify-between text-xs font-medium animate-in fade-in duration-150 ${
                        message.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                >
                    <div className="flex items-center gap-2.5">
                        {message.type === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <span>{message.text}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setMessage(null)}
                        className="text-slate-400 hover:text-slate-600 text-base leading-none"
                    >
                        &times;
                    </button>
                </div>
            )}

            {/* Term Selector Bar & Stat Badges */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <AcademicTermFilter
                    terms={terms}
                    selectedTermId={termId}
                    onTermChange={(id) => void changeTerm(id)}
                    variant="inline"
                    showStatusBadge={true}
                />

                <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold">
                        <Users className="w-3.5 h-3.5 text-amber-600" />
                        <span>Chờ phân công: <strong>{agreements.length}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Đang thực tập: <strong>{placements.length}</strong></span>
                    </div>
                </div>
            </div>

            {isTermClosed && (
                <div className="p-4 rounded-xl flex items-center gap-3 text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>Học kỳ này đã kết thúc (CLOSED). Phân công GVHD đã được hoàn tất và chuyển sang chế độ chỉ xem. Không thể thay đổi hoặc phân công mới.</span>
                </div>
            )}

            {/* Main Content Area */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                    <p className="text-xs text-slate-500">Đang tải dữ liệu phân công...</p>
                </div>
            ) : viewMode === 'dnd' ? (
                /* DRAG AND DROP WORKSPACE */
                <DragDropAssignment
                    students={assignableStudents}
                    lecturers={lecturerQuotas}
                    onAssign={handleDnDAssign}
                    onUnassign={async (placementId) => {
                        // Unassign or reset
                        if (!user?.departmentId) return;
                        if (isTermClosed) {
                            setMessage({ text: 'Học kỳ đã đóng (CLOSED). Không thể gỡ phân công GVHD.', type: 'error' });
                            return;
                        }
                        setBusy(true);
                        try {
                            await apiClient.patch(`/api/v1/placements/${placementId}/lecturer?lecturerId=`);
                            setMessage({ text: 'Đã gỡ phân công GVHD.', type: 'success' });
                            await reloadTerm(termId, user.departmentId);
                        } catch {
                            // If unassign endpoint expects something else
                        } finally {
                            setBusy(false);
                        }
                    }}
                />
            ) : (
                /* ADVANCED TABLE VIEW */
                <div className="space-y-4">
                    {/* Unassigned Agreements Section */}
                    {agreements.length > 0 && (
                        <div className="space-y-2.5">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                Thỏa thuận đã duyệt — Chờ phân công ({agreements.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {agreements.map((agreement) => (
                                    <Card key={agreement.id} className="border-amber-200/80 bg-amber-50/20 shadow-2xs">
                                        <CardContent className="p-3.5 space-y-2.5">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h4 className="font-bold text-xs text-slate-900">{agreement.studentName}</h4>
                                                    <p className="text-[11px] text-slate-500">{agreement.companyName}</p>
                                                </div>
                                                <Badge variant="warning" className="text-[10px]">Chờ GVHD</Badge>
                                            </div>
                                            <Button
                                                size="sm"
                                                className="w-full text-xs"
                                                disabled={isTermClosed}
                                                title={isTermClosed ? 'Học kỳ đã đóng (CLOSED)' : undefined}
                                                onClick={() => {
                                                    setSelected({ kind: 'agreement', id: agreement.id, studentName: agreement.studentName });
                                                    setLecturerId(lecturers[0]?.id ?? '');
                                                }}
                                            >
                                                Chọn GVHD & Kích hoạt
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Active Placements Table */}
                    <div className="space-y-2.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                Danh sách sinh viên đang thực tập ({placements.length})
                            </h3>
                            <div className="relative max-w-xs w-full">
                                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={tableSearch}
                                    onChange={(e) => {
                                        setTableSearch(e.target.value);
                                        setTablePage(1);
                                    }}
                                    placeholder="Tìm theo SV, công ty, GVHD..."
                                    className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <Card className="min-w-0 overflow-hidden border-slate-200/80 shadow-xs">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[700px] text-left text-xs">
                                    <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[10px] tracking-wider">
                                        <tr>
                                            <th className="px-4 py-3 w-12 text-center">STT</th>
                                            <th className="px-4 py-3">Sinh viên</th>
                                            <th className="px-4 py-3">Doanh nghiệp thực tập</th>
                                            <th className="px-4 py-3">GVHD phụ trách</th>
                                            <th className="px-4 py-3 text-center">Trạng thái</th>
                                            <th className="px-4 py-3 text-right">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-800">
                                        {paginatedPlacements.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-xs">
                                                    Không tìm thấy sinh viên nào trong kỳ thực tập này.
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedPlacements.map((placement, idx) => {
                                                const globalIdx = (tablePage - 1) * tablePageSize + idx + 1;
                                                return (
                                                    <tr key={placement.id} className="hover:bg-sky-50/40 transition-colors">
                                                        <td className="px-4 py-3 text-center text-slate-400 font-medium">
                                                            {globalIdx}
                                                        </td>
                                                        <td className="px-4 py-3 font-semibold text-slate-900">
                                                            {placement.studentName || 'Sinh viên'}
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-600">
                                                            {placement.companyName || '—'}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {placement.lecturerName ? (
                                                                <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full text-[11px]">
                                                                    {placement.lecturerName}
                                                                </span>
                                                            ) : (
                                                                <span className="text-rose-600 font-medium text-[11px]">
                                                                    Chưa có GVHD
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <Badge variant="success" className="text-[10px]">
                                                                Đang thực tập
                                                            </Badge>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-xs"
                                                                disabled={isTermClosed}
                                                                title={isTermClosed ? 'Học kỳ đã đóng (CLOSED)' : undefined}
                                                                onClick={() => {
                                                                    setSelected({
                                                                        kind: 'placement',
                                                                        id: placement.id,
                                                                        studentName: placement.studentName ?? 'sinh viên',
                                                                    });
                                                                    setLecturerId(placement.lecturerId ?? lecturers[0]?.id ?? '');
                                                                }}
                                                            >
                                                                Đổi GVHD
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {filteredPlacements.length > 0 && (
                                <div className="border-t border-slate-100 bg-slate-50/50 px-3 py-1">
                                    <Pagination
                                        currentPage={tablePage}
                                        totalPages={totalTablePages}
                                        totalItems={filteredPlacements.length}
                                        pageSize={tablePageSize}
                                        pageSizeOptions={[10, 25, 50]}
                                        onPageChange={setTablePage}
                                        onPageSizeChange={(sz) => {
                                            setTablePageSize(sz);
                                            setTablePage(1);
                                        }}
                                        itemLabel="sinh viên"
                                    />
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            )}

            {/* Modal / Dialog for manual lecturer selection */}
            {selected && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
                    <Card className="max-w-md w-full shadow-2xl border-slate-200">
                        <CardContent className="p-5 space-y-4">
                            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                                <GraduationCap className="w-5 h-5 text-blue-600" />
                                <h3 className="font-bold text-sm text-slate-900">
                                    Phân công GVHD cho {selected.studentName}
                                </h3>
                            </div>
                            <form onSubmit={assign} className="space-y-4">
                                <Select
                                    label="Giảng viên phụ trách"
                                    value={lecturerId}
                                    onChange={(event) => setLecturerId(event.target.value)}
                                    options={lecturers.map((lecturer) => ({
                                        value: lecturer.id,
                                        label: lecturer.fullName,
                                    }))}
                                    required
                                />
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setSelected(null)}
                                        className="text-xs"
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        type="submit"
                                        isLoading={busy}
                                        disabled={!lecturers.length}
                                        className="text-xs"
                                    >
                                        Lưu phân công
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
