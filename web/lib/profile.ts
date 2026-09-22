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
};

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
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
    preferredFields: asStringList(row.preferredFields).length
      ? asStringList(row.preferredFields)
      : DEFAULT_PROFILE.preferredFields,
    preferredLocation:
      String(row.preferredLocation ?? DEFAULT_PROFILE.preferredLocation).trim() || DEFAULT_PROFILE.preferredLocation,
    skills: asStringList(row.skills).length ? asStringList(row.skills) : DEFAULT_PROFILE.skills,
    tools: asStringList(row.tools).length ? asStringList(row.tools) : DEFAULT_PROFILE.tools,
  };
}

export function profileInitial(name: string) {
  return (name.trim().charAt(0) || "N").toUpperCase();
}
