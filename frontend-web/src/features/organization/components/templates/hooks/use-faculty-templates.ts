'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

export interface ReportTemplateItem {
  id: string;
  termId: string;
  termName?: string;
  departmentId?: string;
  departmentName?: string;
  programId?: string;
  programCode?: string;
  programName?: string;
  title: string;
  description?: string;
  reportType: string;
  fileUrl: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  versionNumber: number;
  isMandatory: boolean;
  isActive: boolean;
  uploadedByName?: string;
  createdAt: string;
}

export function useFacultyTemplates() {
  const [terms, setTerms] = useState<Array<{ id: string; code: string; termName: string }>>([]);
  const [selectedTermId, setSelectedTermId] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [templates, setTemplates] = useState<ReportTemplateItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function fetchTerms() {
      try {
        const res = await apiClient.get<Array<{ id: string; code: string; termName: string }>>('/api/v1/terms');
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setTerms(res.data);
          setSelectedTermId(res.data[0].id);
        }
      } catch {
        setTerms([]);
      }
    }
    fetchTerms();
  }, []);

  const fetchTemplates = useCallback(async () => {
    if (!selectedTermId) return;
    setIsLoading(true);
    try {
      const query = new URLSearchParams({ termId: selectedTermId });
      if (selectedDepartmentId) query.set('departmentId', selectedDepartmentId);
      query.set('activeOnly', 'false');
      const res = await apiClient.get<ReportTemplateItem[]>(`/api/v1/organization/templates?${query.toString()}`);
      setTemplates(res.data || []);
    } catch {
      setTemplates([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTermId, selectedDepartmentId]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const toggleActive = async (id: string) => {
    try {
      await apiClient.patch(`/api/v1/organization/templates/${id}/toggle-active`, {});
      setMessage({ type: 'success', text: 'Đã thay đổi trạng thái áp dụng biểu mẫu.' });
      fetchTemplates();
    } catch {
      setMessage({ type: 'error', text: 'Không thể thay đổi trạng thái biểu mẫu.' });
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      await apiClient.delete(`/api/v1/organization/templates/${id}`);
      setMessage({ type: 'success', text: 'Đã xóa biểu mẫu thành công.' });
      fetchTemplates();
    } catch {
      setMessage({ type: 'error', text: 'Không thể xóa biểu mẫu.' });
    }
  };

  return {
    terms,
    selectedTermId,
    setSelectedTermId,
    selectedDepartmentId,
    setSelectedDepartmentId,
    templates,
    isLoading,
    message,
    setMessage,
    fetchTemplates,
    toggleActive,
    deleteTemplate,
  };
}
