"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Plus, X, Search } from "lucide-react";
import { jobService } from "@/features/jobs/services/job.service";
import { JobSkillQuickPicks } from "./job-skill-quick-picks";
import {
  ApprovedTaxonomySkill,
  findApprovedSkill,
  resolveApprovedSkills,
} from "@/features/jobs/utils/job-skill-input-utils";

interface JobSkillInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function JobSkillInputField({
  value,
  onChange,
  disabled = false,
}: JobSkillInputFieldProps) {
  const [skillInput, setSkillInput] = useState("");
  const [taxonomySkills, setTaxonomySkills] = useState<ApprovedTaxonomySkill[]>([]);
  const [validationError, setValidationError] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    jobService.getTaxonomySkills().then((res) => {
      if (isMounted && res && res.length > 0) {
        setTaxonomySkills(res);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentSkills = value
    ? value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const addApprovedSkill = (skill: ApprovedTaxonomySkill) => {
    if (currentSkills.some((s) => s.toLowerCase() === skill.skillName.toLowerCase())) {
      setSkillInput("");
      return;
    }
    const updated = [...currentSkills, skill.skillName];
    onChange(updated.join(", "));
    setSkillInput("");
    setValidationError("");
    setShowDropdown(false);
  };

  const addTypedSkill = () => {
    const approved = findApprovedSkill(skillInput, taxonomySkills);
    if (!approved) {
      setValidationError("Kỹ năng chưa có trong danh mục đã duyệt. Hãy chọn một gợi ý bên dưới.");
      return;
    }
    addApprovedSkill(approved);
  };

  const removeSkill = (name: string) => {
    const updated = currentSkills.filter((s) => s.toLowerCase() !== name.toLowerCase());
    onChange(updated.join(", "));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTypedSkill();
    } else if (e.key === "Backspace" && !skillInput && currentSkills.length > 0) {
      removeSkill(currentSkills[currentSkills.length - 1]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    if (pasted.includes(",")) {
      e.preventDefault();
      const parts = pasted.split(",").map((p) => p.trim()).filter(Boolean);
      const { approved, rejected } = resolveApprovedSkills(parts, taxonomySkills);
      if (rejected.length > 0) {
        setValidationError(`Chưa có trong danh mục: ${rejected.join(", ")}.`);
        return;
      }
      const combined = [...currentSkills];
      for (const skill of approved) {
        if (!combined.some((s) => s.toLowerCase() === skill.skillName.toLowerCase())) {
          combined.push(skill.skillName);
        }
      }
      onChange(combined.join(", "));
      setSkillInput("");
      setValidationError("");
    }
  };

  const filteredSuggestions = skillInput.trim()
    ? taxonomySkills.filter(
        (t) =>
          t.skillName.toLowerCase().includes(skillInput.trim().toLowerCase()) &&
          !currentSkills.some((s) => s.toLowerCase() === t.skillName.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">
          Kỹ năng yêu cầu *
          <span className="text-slate-400 font-normal ml-1.5">
            ({currentSkills.length} kỹ năng đã chọn)
          </span>
        </label>
        <span className="text-[11px] text-sky-600 flex items-center gap-1 font-medium">
          <Sparkles className="w-3 h-3" />
          Đối sánh năng lực sinh viên
        </span>
      </div>

      {/* Danh sách kỹ năng đã chọn dạng Badge */}
      <div className="min-h-[46px] p-2 bg-slate-50/70 border border-slate-200 rounded-xl flex flex-wrap gap-1.5 items-center">
        {currentSkills.length === 0 ? (
          <span className="text-xs text-slate-400 px-1 italic">
            Chưa chọn kỹ năng nào. Tìm và chọn từ danh mục bên dưới.
          </span>
        ) : (
          currentSkills.map((skill) => (
            <Badge
              key={skill}
              variant="primary"
              className="flex items-center gap-1.5 py-1 px-2.5 bg-blue-100/70 text-blue-800 border-blue-200 font-medium text-xs hover:bg-blue-100"
            >
              <span>{skill}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-blue-500 hover:text-blue-800 rounded p-0.5 transition-colors cursor-pointer"
                  title={`Xóa ${skill}`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </Badge>
          ))
        )}
      </div>

      {/* Ô nhập kỹ năng có Autocomplete Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              disabled={disabled}
              placeholder="Tìm kỹ năng đã được duyệt (VD: Java, Spring Boot...)"
              value={skillInput}
              onChange={(e) => {
                setSkillInput(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
            {showDropdown && filteredSuggestions.length > 0 && !disabled && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-52 overflow-auto py-1">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Gợi ý từ từ điển kỹ năng
                </div>
                {filteredSuggestions.slice(0, 8).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-sky-50 hover:text-sky-800 flex items-center justify-between transition-colors cursor-pointer"
                    onClick={() => addApprovedSkill(item)}
                  >
                    <span className="font-medium">{item.skillName}</span>
                    <span className="text-[10px] text-slate-400">{item.id}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            disabled={disabled || !skillInput.trim()}
            onClick={addTypedSkill}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors shrink-0 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm</span>
          </button>
        </div>
      </div>
      {validationError && <p role="alert" className="text-xs text-amber-700">{validationError}</p>}

      <JobSkillQuickPicks
        currentSkills={currentSkills}
        taxonomySkills={taxonomySkills}
        disabled={disabled}
        onAdd={addApprovedSkill}
        onRemove={removeSkill}
      />
    </div>
  );
}
