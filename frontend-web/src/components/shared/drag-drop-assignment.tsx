"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { 
    User, 
    GraduationCap, 
    GripVertical, 
    Search, 
    UserCheck, 
    X, 
    AlertCircle, 
    ChevronDown, 
    ChevronUp,
    Briefcase,
    Sparkles
} from "lucide-react";

export interface AssignableStudent {
    id: string;
    studentCode: string;
    fullName: string;
    majorName?: string;
    companyName?: string;
    topicName?: string;
    assignedLecturerId?: string | null;
}

export interface LecturerQuota {
    id: string;
    fullName: string;
    title?: string; // e.g. TS., ThS., PGS.TS.
    email?: string;
    department?: string;
    currentAssigned: number;
    maxQuota: number;
    assignedStudents?: AssignableStudent[];
}

export interface DragDropAssignmentProps {
    students: AssignableStudent[];
    lecturers: LecturerQuota[];
    onAssign: (studentId: string, lecturerId: string) => void | Promise<void>;
    onUnassign: (studentId: string) => void | Promise<void>;
    isLoading?: boolean;
    className?: string;
}

export function DragDropAssignment({
    students,
    lecturers,
    onAssign,
    onUnassign,
    isLoading = false,
    className,
}: DragDropAssignmentProps) {
    const [searchStudent, setSearchStudent] = useState("");
    const [selectedMajor, setSelectedMajor] = useState<string>("ALL");
    const [draggingStudentId, setDraggingStudentId] = useState<string | null>(null);
    const [dragOverLecturerId, setDragOverLecturerId] = useState<string | null>(null);
    const [expandedLecturerId, setExpandedLecturerId] = useState<string | null>(null);

    // Unassigned students
    const unassignedStudents = useMemo(() => {
        return students.filter((s) => !s.assignedLecturerId);
    }, [students]);

    // Unique majors for filter dropdown
    const majors = useMemo(() => {
        const set = new Set<string>();
        students.forEach((s) => {
            if (s.majorName) set.add(s.majorName);
        });
        return Array.from(set);
    }, [students]);

    // Filtered unassigned students
    const filteredStudents = useMemo(() => {
        let list = unassignedStudents;
        if (selectedMajor !== "ALL") {
            list = list.filter((s) => s.majorName === selectedMajor);
        }
        if (searchStudent.trim()) {
            const q = searchStudent.toLowerCase().trim();
            list = list.filter(
                (s) =>
                    s.fullName.toLowerCase().includes(q) ||
                    s.studentCode.toLowerCase().includes(q) ||
                    s.companyName?.toLowerCase().includes(q) ||
                    s.topicName?.toLowerCase().includes(q)
            );
        }
        return list;
    }, [unassignedStudents, selectedMajor, searchStudent]);

    const handleDragStart = (e: React.DragEvent, studentId: string) => {
        setDraggingStudentId(studentId);
        e.dataTransfer.setData("text/plain", studentId);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragEnd = () => {
        setDraggingStudentId(null);
        setDragOverLecturerId(null);
    };

    const handleDragOver = (e: React.DragEvent, lecturerId: string, isFull: boolean) => {
        if (isFull) return;
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "move";
        if (dragOverLecturerId !== lecturerId) {
            setDragOverLecturerId(lecturerId);
        }
    };

    const handleDragLeave = (e: React.DragEvent, lecturerId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        if (dragOverLecturerId === lecturerId) {
            setDragOverLecturerId(null);
        }
    };

    const handleDrop = async (e: React.DragEvent, lecturerId: string, isFull: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverLecturerId(null);

        if (isFull) return;

        const studentId = e.dataTransfer.getData("text/plain") || draggingStudentId;
        if (!studentId) return;

        await onAssign(studentId, lecturerId);
        setDraggingStudentId(null);
    };

    return (
        <div className={cn("grid grid-cols-1 lg:grid-cols-12 gap-5", className)}>
            {/* LEFT COLUMN: Unassigned Students Pool (5 cols) */}
            <div className="lg:col-span-5 flex flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                            <User className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="font-bold text-xs text-slate-900">Sinh viên chờ phân công</h3>
                            <p className="text-[11px] text-slate-500">
                                Kéo thẻ sinh viên sang cột GVHD
                            </p>
                        </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                        {filteredStudents.length} / {unassignedStudents.length} SV
                    </span>
                </div>

                {/* Filters */}
                <div className="py-3 space-y-2 border-b border-slate-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                            type="text"
                            value={searchStudent}
                            onChange={(e) => setSearchStudent(e.target.value)}
                            placeholder="Tìm theo MSSV, tên, công ty..."
                            className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    {majors.length > 0 && (
                        <select
                            value={selectedMajor}
                            onChange={(e) => setSelectedMajor(e.target.value)}
                            className="w-full h-8 px-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                        >
                            <option value="ALL">Tất cả chuyên ngành ({unassignedStudents.length})</option>
                            {majors.map((m) => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Students List */}
                <div className="flex-1 overflow-y-auto max-h-[calc(100vh-320px)] space-y-2 pt-3 pr-1">
                    {filteredStudents.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 text-xs">
                            <UserCheck className="h-8 w-8 mx-auto mb-2 opacity-40 text-emerald-600" />
                            <p className="font-semibold text-slate-600">Tất cả sinh viên đã được phân công!</p>
                            <p className="text-[11px] mt-0.5">Không còn sinh viên nào đang chờ gán GVHD.</p>
                        </div>
                    ) : (
                        filteredStudents.map((student) => {
                            const isDragging = draggingStudentId === student.id;

                            return (
                                <div
                                    key={student.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, student.id)}
                                    onDragEnd={handleDragEnd}
                                    className={cn(
                                        "group flex items-start gap-2.5 p-3 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all cursor-grab active:cursor-grabbing",
                                        isDragging && "opacity-30 border-blue-400 bg-blue-50/50"
                                    )}
                                >
                                    <GripVertical className="h-4 w-4 text-slate-300 group-hover:text-slate-500 shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1">
                                            <span className="font-bold text-xs text-slate-800 truncate">
                                                {student.fullName}
                                            </span>
                                            <span className="font-mono text-[11px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded shrink-0">
                                                {student.studentCode}
                                            </span>
                                        </div>

                                        {student.majorName && (
                                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                                {student.majorName}
                                            </p>
                                        )}

                                        {student.companyName && (
                                            <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-medium mt-1 truncate">
                                                <Briefcase className="h-3 w-3 shrink-0" />
                                                <span className="truncate">{student.companyName}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* RIGHT COLUMN: Lecturer Quota Cards Grid (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-blue-600" />
                        <h3 className="font-bold text-xs text-slate-900">
                            Danh sách Giảng viên & Hạn mức hướng dẫn ({lecturers.length})
                        </h3>
                    </div>
                    <span className="text-[11px] text-slate-500">
                        Thả sinh viên vào thẻ GVHD để gán
                    </span>
                </div>

                {/* Lecturer Cards List */}
                <div className="space-y-3 max-h-[calc(100vh-270px)] overflow-y-auto pr-1">
                    {lecturers.map((lecturer) => {
                        const ratio = lecturer.maxQuota > 0 ? lecturer.currentAssigned / lecturer.maxQuota : 0;
                        const isFull = lecturer.currentAssigned >= lecturer.maxQuota;
                        const isWarning = ratio >= 0.8 && !isFull;
                        const isOver = dragOverLecturerId === lecturer.id;
                        const isExpanded = expandedLecturerId === lecturer.id;

                        const assignedList = lecturer.assignedStudents || [];

                        return (
                            <div
                                key={lecturer.id}
                                onDragOver={(e) => handleDragOver(e, lecturer.id, isFull)}
                                onDragLeave={(e) => handleDragLeave(e, lecturer.id)}
                                onDrop={(e) => handleDrop(e, lecturer.id, isFull)}
                                className={cn(
                                    "rounded-2xl border bg-white p-4 transition-all duration-200 shadow-2xs",
                                    isOver
                                        ? "ring-2 ring-blue-500 bg-blue-50/40 border-blue-400 shadow-md scale-[1.01]"
                                        : "border-slate-200/90 hover:border-slate-300",
                                    isFull && "bg-slate-50/70 border-slate-200"
                                )}
                            >
                                {/* Top Row: Lecturer info + Capacity badge */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div
                                            className={cn(
                                                "h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0",
                                                isFull
                                                    ? "bg-rose-100 text-rose-700"
                                                    : isWarning
                                                    ? "bg-amber-100 text-amber-700"
                                                    : "bg-emerald-100 text-emerald-700"
                                            )}
                                        >
                                            {lecturer.fullName
                                                .split(" ")
                                                .slice(-2)
                                                .map((w) => w[0])
                                                .join("")
                                                .toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                {lecturer.title && (
                                                    <span className="text-[11px] font-semibold text-slate-500">
                                                        {lecturer.title}
                                                    </span>
                                                )}
                                                <h4 className="font-bold text-xs text-slate-900 truncate">
                                                    {lecturer.fullName}
                                                </h4>
                                            </div>
                                            <p className="text-[11px] text-slate-500 truncate">
                                                {lecturer.department || lecturer.email}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quota Tag */}
                                    <div className="text-right shrink-0">
                                        <span
                                            className={cn(
                                                "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold",
                                                isFull
                                                    ? "bg-rose-100 text-rose-800"
                                                    : isWarning
                                                    ? "bg-amber-100 text-amber-800"
                                                    : "bg-emerald-100 text-emerald-800"
                                            )}
                                        >
                                            {lecturer.currentAssigned} / {lecturer.maxQuota} SV
                                        </span>
                                    </div>
                                </div>

                                {/* Quota Progress Bar */}
                                <div className="mt-3 space-y-1">
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-300",
                                                isFull ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-emerald-500"
                                            )}
                                            style={{ width: `${Math.min(100, Math.round(ratio * 100))}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                                        <span>Tải trọng: {Math.round(ratio * 100)}%</span>
                                        {isFull ? (
                                            <span className="text-rose-600 font-bold">Đã đủ chỉ tiêu</span>
                                        ) : (
                                            <span>Còn nhận: {lecturer.maxQuota - lecturer.currentAssigned} SV</span>
                                        )}
                                    </div>
                                </div>

                                {/* Assigned Students Drawer / Toggle */}
                                {assignedList.length > 0 && (
                                    <div className="mt-3 pt-2.5 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => setExpandedLecturerId(isExpanded ? null : lecturer.id)}
                                            className="flex items-center justify-between w-full text-[11px] font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                                        >
                                            <span>Danh sách sinh viên đang phụ trách ({assignedList.length})</span>
                                            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                        </button>

                                        {isExpanded && (
                                            <div className="mt-2 space-y-1.5 animate-in fade-in duration-150">
                                                {assignedList.map((st) => (
                                                    <div
                                                        key={st.id}
                                                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                                                    >
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-slate-800 truncate">
                                                                    {st.fullName}
                                                                </span>
                                                                <span className="font-mono text-[11px] text-slate-500">
                                                                    ({st.studentCode})
                                                                </span>
                                                            </div>
                                                            {st.companyName && (
                                                                <p className="text-[10px] text-slate-500 truncate">
                                                                    CT: {st.companyName}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => onUnassign(st.id)}
                                                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 ml-2"
                                                            title="Gỡ phân công sinh viên này"
                                                        >
                                                            <X className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
