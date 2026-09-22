INSERT INTO "Profile" (id, "userId", "displayName", major, year, bio, university, email, location, "preferredFields", "preferredLocation", skills, tools, "createdAt", "updatedAt")
SELECT
  'demo-profile-nway',
  id,
  'Nway Ei Hlaing',
  'Computer Engineering',
  '3rd Year',
  'Computer Engineering student passionate about building impactful technology. Seeking internships in software engineering and product development.',
  'Chulalongkorn University',
  'nway.ei@student.chula.ac.th',
  'Bangkok, Thailand',
  '["Software Engineering","Full-Stack Development","Machine Learning"]'::jsonb,
  'Bangkok, Thailand',
  '["Java","Python","React"]'::jsonb,
  '["Git","Figma","VS Code"]'::jsonb,
  NOW(),
  NOW()
FROM "User"
WHERE email = 'nway@interntrack.local'
ON CONFLICT ("userId") DO NOTHING;
