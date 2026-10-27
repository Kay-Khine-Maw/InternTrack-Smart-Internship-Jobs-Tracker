export type StudentProfile = {
  displayName: string;
  major: string;
  year: string;
  bio: string;
  university: string;
  email: string;
  location: string;
  preferredFields: string[];
  preferredLocation: string;
  skills: string[];
  tools: string[];
  resumeSummary: string;
  resumeContact: { phone?: string; email?: string };
  resumeEducation: Array<{ school: string; degree?: string | null; major?: string | null; dates?: string | null }>;
  resumeExperience: Array<{ company: string; role?: string | null; dates?: string | null; summary?: string | null }>;
  resumeProjects: Array<{ name: string; summary?: string | null; technologies?: string[] }>;
  resumeLanguages: Array<{ language: string; proficiency?: string | null }>;
  resumeLinks: { portfolio?: string | null; linkedin?: string | null; github?: string | null };
  relocationWillingness: boolean | null;
  internshipPeriod: { start: string; end: string };
  profileVersion: number;
};

export const DEFAULT_PROFILE: StudentProfile = {
  displayName: "Nway Ei Hlaing",
  major: "Computer Engineering",
  year: "3rd Year",
  bio: "Computer Engineering student passionate about building impactful technology. Seeking internships in software engineering and product development.",
  university: "Chulalongkorn University",
  email: "nway.ei@student.chula.ac.th",
  location: "Bangkok, Thailand",
  preferredFields: ["Software Engineering", "Full-Stack Development", "Machine Learning"],
  preferredLocation: "",
  skills: ["Java", "Python", "React"],
  tools: ["Git", "Figma", "VS Code"],
  resumeSummary: "",
  resumeContact: {},
  resumeEducation: [],
  resumeExperience: [],
  resumeProjects: [],
  resumeLanguages: [],
  resumeLinks: {},
  relocationWillingness: null,
  internshipPeriod: { start: "", end: "" },
  profileVersion: 1,
};

export function createEmptyProfile(displayName = "", email = ""): StudentProfile {
  return {
    displayName,
    major: "",
    year: "",
    bio: "",
    university: "",
    email,
    location: "",
    preferredFields: [],
    preferredLocation: "",
    skills: [],
    tools: [],
    resumeSummary: "",
    resumeContact: {},
    resumeEducation: [],
    resumeExperience: [],
    resumeProjects: [],
    resumeLanguages: [],
    resumeLinks: {},
    relocationWillingness: null,
    internshipPeriod: { start: "", end: "" },
    profileVersion: 1,
  };
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function asObjectList(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object" && !Array.isArray(item))) : [];
}

export function toStudentProfile(value: unknown): StudentProfile {
  const row = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    displayName: String(row.displayName ?? DEFAULT_PROFILE.displayName).trim() || DEFAULT_PROFILE.displayName,
    major: String(row.major ?? "").trim(),
    year: String(row.year ?? "").trim(),
    bio: String(row.bio ?? ""),
    university: String(row.university ?? "").trim(),
    email: String(row.email ?? "").trim(),
    location: String(row.location ?? "").trim(),
    preferredFields: asStringList(row.preferredFields),
    preferredLocation: String(row.preferredLocation ?? "").trim(),
    skills: asStringList(row.skills),
    tools: asStringList(row.tools),
    resumeSummary: String(row.resumeSummary ?? ""),
    resumeContact: asObject(row.resumeContact) as StudentProfile["resumeContact"],
    resumeEducation: asObjectList(row.resumeEducation) as StudentProfile["resumeEducation"],
    resumeExperience: asObjectList(row.resumeExperience) as StudentProfile["resumeExperience"],
    resumeProjects: asObjectList(row.resumeProjects) as StudentProfile["resumeProjects"],
    resumeLanguages: asObjectList(row.resumeLanguages) as StudentProfile["resumeLanguages"],
    resumeLinks: asObject(row.resumeLinks) as StudentProfile["resumeLinks"],
    relocationWillingness: typeof row.relocationWillingness === "boolean" ? row.relocationWillingness : null,
    internshipPeriod: {
      start: String((row.internshipPeriod as Record<string, unknown> | null)?.start ?? "").trim(),
      end: String((row.internshipPeriod as Record<string, unknown> | null)?.end ?? "").trim(),
    },
    profileVersion: Number(row.profileVersion) || 1,
  };
}

export function profileInitial(name: string) {
  return (name.trim().charAt(0) || "N").toUpperCase();
}
