'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { EmptyState } from '@/components/ui/empty-state';
import { RejectPlacementModal } from './modals/reject-placement-modal';
import { FacultyPlacementFilterBar } from './faculty-placement-filter-bar';
import { FacultyPlacementItemCard } from './cards/faculty-placement-item-card';
import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import type { InternshipPlacement } from '../types/placement.types';

export function FacultyPlacementApprovalView() {
  const [placements, setPlacements] = useState<InternshipPlacement[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [selectedTermId, setSelectedTermId] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING_APPROVAL' | 'TRANSFER_REQUESTED' | 'APPROVED' | 'REJECTED'>('PENDING_APPROVAL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [placementToReject, setPlacementToReject] = useState<InternshipPlacement | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const termsRes = await apiClient.get<any[]>('/api/v1/terms/by-department/current');
        if (termsRes.data && Array.isArray(termsRes.data) && termsRes.data.length > 0) {
          setTerms(termsRes.data);
          setSelectedTermId(termsRes.data[0].id);
        }
      } catch {
        // Fallback empty
      }
    }
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!selectedTermId) {
      setIsLoading(false);
      return;
    }

    async function fetchPlacements() {
      setIsLoading(true);
      try {
        const res = await apiClient.get<InternshipPlacement[]>(`/api/v1/placements/by-term/${selectedTermId}`);
        if (res.data && Array.isArray(res.data)) {
          setPlacements(res.data);
        } else {
          setPlacements([]);
        }
      } catch {
        setPlacements([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPlacements();
  }, [selectedTermId]);

  const handleApprovePlacement = async (placementId: string) => {
    setActionLoadingId(placementId);
    try {
      await apiClient.patch(`/api/v1/placements/${placementId}/approve`);
      setPlacements((prev) =>
        prev.map((p) => (p.id === placementId ? { ...p, status: 'APPROVED' } : p))
      );
      setMessage({
        type: 'success',
        text: 'Đã phê duyệt đơn tiếp nhận thực tập và kích hoạt tài khoản Mentor thành công!',
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Phê duyệt thất bại.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleApproveTransfer = async (placementId: string) => {
    setActionLoadingId(placementId);
    try {
      await apiClient.patch(`/api/v1/placements/${placementId}/approve-transfer`);
      setPlacements((prev) =>
        prev.map((p) => (p.id === placementId ? { ...p, status: 'TRANSFERRED' } : p))
      );
      setMessage({
        type: 'success',
        text: 'Đã duyệt yêu cầu chuyển đổi đơn vị thực tập của sinh viên thành công!',
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Duyệt chuyển đổi thất bại.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectConfirm = async (placementId: string, reason: string) => {
    setActionLoadingId(placementId);
    try {
      await apiClient.patch(`/api/v1/placements/${placementId}/reject`, { reason });
      setPlacements((prev) =>
        prev.map((p) =>
          p.id === placementId ? { ...p, status: 'REJECTED', rejectionReason: reason } : p
        )
      );
      setMessage({
        type: 'success',
        text: 'Đã từ chối đơn đăng ký và gửi email phản hồi lý do đến sinh viên.',
      });
      setPlacementToReject(null);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Từ chối thất bại.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredPlacements = placements.filter((p) => {
    const matchesStatus = statusFilter === 'ALL' ? true : p.status === statusFilter;
    const matchesSearch =
      !searchKeyword ||
      p.studentName?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      p.studentCode?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      p.companyName?.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Xét Duyệt Đơn Vị Thực Tập (Tự Liên Hệ & Chuyển Đổi)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Thẩm định tính phù hợp chuyên ngành, cơ sở vật chất (Mẫu 04), miễn GGT và duyệt phân công.
          </p>
        </div>
      </div>

      {message && (
        <div
          role="alert"
          aria-live="polite"
          className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      <FacultyPlacementFilterBar
        terms={terms}
        selectedTermId={selectedTermId}
        onSelectTerm={setSelectedTermId}
        statusFilter={statusFilter}
        onSelectStatus={setStatusFilter}
        searchKeyword={searchKeyword}
        onSearchChange={setSearchKeyword}
      />

      {isLoading ? (
        <div className="p-12 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-sky-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Đang tải danh sách đơn tiếp nhận...</p>
        </div>
      ) : filteredPlacements.length === 0 ? (
        <EmptyState
          title="Không có đơn đăng ký nào"
          description="Hiện không có đơn đăng ký chỗ thực tập nào phù hợp với bộ lọc hiện tại."
        />
      ) : (
        <div className="space-y-4">
          {filteredPlacements.map((p) => (
            <FacultyPlacementItemCard
              key={p.id}
              placement={p}
              actionLoadingId={actionLoadingId}
              onApprove={handleApprovePlacement}
              onApproveTransfer={handleApproveTransfer}
              onOpenRejectModal={setPlacementToReject}
            />
          ))}
        </div>
      )}

      <RejectPlacementModal
        isOpen={!!placementToReject}
        onClose={() => setPlacementToReject(null)}
        onConfirm={handleRejectConfirm}
        placement={placementToReject}
        isLoading={!!actionLoadingId}
      />
    </div>
  );
}

export default FacultyPlacementApprovalView;
