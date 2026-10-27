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
  workArrangement: string;
  relocationWillingness: boolean | null;
  startAvailability: string;
  internshipDuration: string;
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
  preferredLocation: "Bangkok, Thailand",
  skills: ["Java", "Python", "React"],
  tools: ["Git", "Figma", "VS Code"],
  resumeSummary: "",
  resumeContact: {},
  resumeEducation: [],
  resumeExperience: [],
  resumeProjects: [],
  resumeLanguages: [],
  resumeLinks: {},
  workArrangement: "",
  relocationWillingness: null,
  startAvailability: "",
  internshipDuration: "",
  profileVersion: 1,
};

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
    major: String(row.major ?? DEFAULT_PROFILE.major).trim() || DEFAULT_PROFILE.major,
    year: String(row.year ?? DEFAULT_PROFILE.year).trim() || DEFAULT_PROFILE.year,
    bio: String(row.bio ?? DEFAULT_PROFILE.bio),
    university: String(row.university ?? DEFAULT_PROFILE.university).trim() || DEFAULT_PROFILE.university,
    email: String(row.email ?? DEFAULT_PROFILE.email).trim() || DEFAULT_PROFILE.email,
    location: String(row.location ?? DEFAULT_PROFILE.location).trim() || DEFAULT_PROFILE.location,
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
    workArrangement: String(row.workArrangement ?? "").trim(),
    relocationWillingness: typeof row.relocationWillingness === "boolean" ? row.relocationWillingness : null,
    startAvailability: String(row.startAvailability ?? "").trim(),
    internshipDuration: String(row.internshipDuration ?? "").trim(),
    profileVersion: Number(row.profileVersion) || 1,
  };
}

export function profileInitial(name: string) {
  return (name.trim().charAt(0) || "N").toUpperCase();
}
