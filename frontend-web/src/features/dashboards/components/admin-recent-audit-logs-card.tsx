"use client";

import React from "react";
import Link from "next/link";
import { Clock, ShieldCheck, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AuditLog } from "../types/admin-dashboard.types";

interface AdminRecentAuditLogsCardProps {
    auditLogs: AuditLog[];
}

export function AdminRecentAuditLogsCard({ auditLogs }: AdminRecentAuditLogsCardProps) {
    return (
        <Card>
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600" />
                        Nhật ký hoạt động gần đây
                    </CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Các sự kiện và thao tác được ghi nhận mới nhất
                    </p>
                </div>
                <Link href="/admin/audit-logs">
                    <Button variant="secondary" size="sm" className="text-xs gap-1 cursor-pointer">
                        Tất cả <ArrowRight className="w-3 h-3" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="pt-3">
                {auditLogs.length > 0 ? (
                    <div className="space-y-3">
                        {auditLogs.slice(0, 5).map((log) => (
                            <div
                                key={log.id}
                                className="text-xs border-b border-slate-100 pb-2.5 last:border-0 last:pb-0"
                            >
                                <div className="flex items-center justify-between text-[11px] text-slate-400">
                                    <span>{log.actorName}</span>
                                    <span>{new Date(log.createdAt).toLocaleTimeString("vi-VN")}</span>
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                    <p className="font-semibold text-slate-800">
                                        {log.action} <span className="font-normal text-slate-500">({log.entityType})</span>
                                    </p>
                                    <Badge
                                        variant={log.result === "SUCCESS" ? "success" : "destructive"}
                                        className="text-[9px] px-1.5 py-0"
                                    >
                                        {log.result}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 text-slate-400 text-xs">
                        <ShieldCheck className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        Chưa có nhật ký phát sinh mới
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
