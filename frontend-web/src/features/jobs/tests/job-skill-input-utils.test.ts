import { describe, expect, it } from "vitest";
import {
  findApprovedSkill,
  resolveApprovedSkills,
} from "../utils/job-skill-input-utils";

const taxonomy = [
  { id: "SK-JAVA", skillName: "Java" },
  { id: "SK-SPRING-BOOT", skillName: "Spring Boot" },
];

describe("job skill taxonomy validation", () => {
  it("accepts an approved ID or canonical name", () => {
    expect(findApprovedSkill("sk-java", taxonomy)?.skillName).toBe("Java");
    expect(findApprovedSkill(" spring boot ", taxonomy)?.id).toBe("SK-SPRING-BOOT");
  });

  it("does not silently create an unknown skill", () => {
    expect(findApprovedSkill("Apache Kafka", taxonomy)).toBeUndefined();
  });

  it("reports rejected values when resolving a pasted list", () => {
    expect(resolveApprovedSkills(["Java", "Apache Kafka"], taxonomy)).toEqual({
      approved: [taxonomy[0]],
      rejected: ["Apache Kafka"],
    });
  });
});
