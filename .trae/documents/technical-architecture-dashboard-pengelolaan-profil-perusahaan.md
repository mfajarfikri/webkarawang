## 1.Architecture design
```mermaid
graph TD
  A["User Browser"] --> B["React Frontend Application"]
  B --> C["Supabase SDK"]
  C --> D["Supabase Auth"]
  C --> E["Supabase Database (PostgreSQL)"]
  C --> F["Supabase Storage"]

  subgraph "Frontend Layer"
    B
  end

  subgraph "Service Layer (Provided by Supabase)"
    D
    E
    F
  end
```

## 2.Technology Description
- Frontend: React@18 + TypeScript + vite + tailwindcss@3
- Backend: Supabase (Auth + PostgreSQL + Storage)

## 3.Route definitions
| Route | Purpose |
|-------|---------|
| /login | Halaman masuk dan reset kata sandi |
| /dashboard/profile | Area kerja pengelolaan profil: editor, upload gambar, riwayat versi, pratinjau responsif |

## 6.Data model(if applicable)

### 6.1 Data model definition
```mermaid
erDiagram
  COMPANY_PROFILE ||--o{ COMPANY_PROFILE_VERSION : "has_versions"

  COMPANY_PROFILE {
    uuid id PK
    text company_name
    text about
    text address
    text email
    text phone
    text website
    text social_links_json
    text logo_path
    text cover_path
    text gallery_paths_json
    text status
    timestamptz published_at
    uuid published_version_id
    uuid updated_by
    timestamptz updated_at
    timestamptz created_at
  }

  COMPANY_PROFILE_VERSION {
    uuid id PK
    uuid company_profile_id
    int version_number
    text snapshot_json
    text change_note
    text state
    uuid created_by
    timestamptz created_at
  }
```

### 6.2 Data Definition Language
Company Profile (company_profiles)
```
CREATE TABLE company_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  about TEXT,
  address TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  social_links_json TEXT,
  logo_path TEXT,
  cover_path TEXT,
  gallery_paths_json TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  published_version_id UUID,
  updated_by UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_company_profiles_status ON company_profiles(status);
CREATE INDEX idx_company_profiles_updated_at ON company_profiles(updated_at DESC);

-- 권한 (contoh sesuai guideline)
GRANT SELECT ON company_profiles TO anon;
GRANT ALL PRIVILEGES ON company_profiles TO authenticated;
```

Company Profile Versions (company_profile_versions)
```
CREATE TABLE company_profile_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_profile_id UUID NOT NULL,
  version_number INTEGER NOT NULL,
  snapshot_json TEXT NOT NULL,
  change_note TEXT,
  state TEXT NOT NULL DEFAULT 'draft',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_company_profile_versions_profile_id ON company_profile_versions(company_profile_id);
CREATE INDEX idx_company_profile_versions_created_at ON company_profile_versions(created_at DESC);

GRANT SELECT ON company_profile_versions TO anon;
GRANT ALL PRIVILEGES ON company_profile_versions TO authenticated;
```

Storage
- Bucket: company-assets
- Path convention (contoh): company/{company_profile_id}/logo/*, cover/*, gallery/*
