export interface ApprovedTaxonomySkill {
  id: string;
  skillName: string;
}

export function findApprovedSkill(
  value: string,
  taxonomy: ApprovedTaxonomySkill[],
): ApprovedTaxonomySkill | undefined {
  const normalized = value.trim().toLocaleLowerCase();
  if (!normalized) return undefined;
  return taxonomy.find(
    (skill) =>
      skill.id.toLocaleLowerCase() === normalized ||
      skill.skillName.toLocaleLowerCase() === normalized,
  );
}

export function resolveApprovedSkills(
  values: string[],
  taxonomy: ApprovedTaxonomySkill[],
): { approved: ApprovedTaxonomySkill[]; rejected: string[] } {
  const approved: ApprovedTaxonomySkill[] = [];
  const rejected: string[] = [];
  for (const value of values) {
    const match = findApprovedSkill(value, taxonomy);
    if (match) approved.push(match);
    else if (value.trim()) rejected.push(value.trim());
  }
  return { approved, rejected };
}
