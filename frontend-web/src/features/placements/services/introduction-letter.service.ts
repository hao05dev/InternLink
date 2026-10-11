import { apiClient } from '@/lib/api-client';
import {
    IntroductionLetter,
    CreateIntroductionLetterPayload,
    ReviewIntroductionLetterPayload
} from '../types/introduction-letter.types';

export const introductionLetterService = {
    async create(payload: CreateIntroductionLetterPayload): Promise<IntroductionLetter> {
        const res = await apiClient.post<IntroductionLetter>('/api/v1/introduction-letters', payload);
        return res.data;
    },

    async getMine(): Promise<IntroductionLetter[]> {
        const res = await apiClient.get<IntroductionLetter[]>('/api/v1/introduction-letters/mine');
        return res.data || [];
    },

    async cancel(id: string): Promise<IntroductionLetter> {
        const res = await apiClient.patch<IntroductionLetter>(`/api/v1/introduction-letters/${id}/cancel`);
        return res.data;
    },

    async getByTerm(termId: string): Promise<IntroductionLetter[]> {
        const res = await apiClient.get<IntroductionLetter[]>(`/api/v1/introduction-letters/term/${termId}`);
        return res.data || [];
    },

    async review(id: string, payload: ReviewIntroductionLetterPayload): Promise<IntroductionLetter> {
        const res = await apiClient.patch<IntroductionLetter>(`/api/v1/introduction-letters/${id}/review`, payload);
        return res.data;
    },

    async confirmReceived(id: string): Promise<IntroductionLetter> {
        const res = await apiClient.patch<IntroductionLetter>(`/api/v1/introduction-letters/${id}/confirm-received`);
        return res.data;
    }
};
