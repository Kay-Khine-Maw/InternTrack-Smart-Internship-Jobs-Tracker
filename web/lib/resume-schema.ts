import { z } from "zod";

export const resumeSchema = z.object({
  displayName: z.string().nullable().default(null),
  contact: z.object({ phone: z.string().nullable().default(null), email: z.string().nullable().default(null) }).default({ phone: null, email: null }),
  address: z.string().nullable().default(null),
  year: z.string().nullable().default(null),
  major: z.string().nullable().default(null),
  education: z.array(z.object({
    school: z.string(),
    degree: z.string().nullable().default(null),
    major: z.string().nullable().default(null),
    dates: z.string().nullable().default(null),
  })).default([]),
  skills: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
  projects: z.array(z.object({ name: z.string(), summary: z.string().nullable().default(null), technologies: z.array(z.string()).default([]) })).default([]),
  experience: z.array(z.object({ company: z.string(), role: z.string().nullable().default(null), dates: z.string().nullable().default(null), summary: z.string().nullable().default(null) })).default([]),
  languages: z.array(z.object({ language: z.string(), proficiency: z.string().nullable().default(null) })).default([]),
  links: z.object({ portfolio: z.string().nullable().default(null), linkedin: z.string().nullable().default(null), github: z.string().nullable().default(null) }).default({ portfolio: null, linkedin: null, github: null }),
  summary: z.string().nullable().default(null),
});

export type ResumeDraft = z.infer<typeof resumeSchema>;
