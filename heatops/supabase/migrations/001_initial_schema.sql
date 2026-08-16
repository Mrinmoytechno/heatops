create extension if not exists "pgcrypto";

create table organizations (
    id uuid primary key default gen_random_uuid(),
        name text not null,
            created_at timestamptz not null default now()
            );

            create table sites (
                id uuid primary key default gen_random_uuid(),
                    organization_id uuid not null references organizations(id) on delete cascade,

                        name text not null,
                            site_type text not null default 'warehouse',

                                latitude double precision not null,
                                    longitude double precision not null,

                                        timezone text not null default 'America/New_York',

                                            operating_start time not null,
                                                operating_end time not null,

                                                    created_at timestamptz not null default now(),
                                                        updated_at timestamptz not null default now()
                                                        );

                                                        create table zones (
                                                            id uuid primary key default gen_random_uuid(),
                                                                site_id uuid not null references sites(id) on delete cascade,

                                                                    name text not null,
                                                                        zone_type text not null,

                                                                            temperature_sensitivity numeric not null default 0.5
                                                                                    check (
                                                                                                temperature_sensitivity >= 0
                                                                                                            and temperature_sensitivity <= 1
                                                                                                                    ),

                                                                                                                        operational_priority numeric not null default 0.5
                                                                                                                                check (
                                                                                                                                            operational_priority >= 0
                                                                                                                                                        and operational_priority <= 1
                                                                                                                                                                ),

                                                                                                                                                                    latitude double precision,
                                                                                                                                                                        longitude double precision,

                                                                                                                                                                            created_at timestamptz not null default now(),
                                                                                                                                                                                updated_at timestamptz not null default now()
                                                                                                                                                                                );

                                                                                                                                                                                create table operations (
                                                                                                                                                                                    id uuid primary key default gen_random_uuid(),
                                                                                                                                                                                        site_id uuid not null references sites(id) on delete cascade,
                                                                                                                                                                                            zone_id uuid references zones(id) on delete set null,

                                                                                                                                                                                                name text not null,
                                                                                                                                                                                                    operation_type text not null,

                                                                                                                                                                                                        scheduled_start time not null,
                                                                                                                                                                                                            scheduled_end time not null,

                                                                                                                                                                                                                workforce_count integer not null default 0
                                                                                                                                                                                                                        check (workforce_count >= 0),

                                                                                                                                                                                                                            operational_priority numeric not null default 0.5
                                                                                                                                                                                                                                    check (
                                                                                                                                                                                                                                                operational_priority >= 0
                                                                                                                                                                                                                                                            and operational_priority <= 1
                                                                                                                                                                                                                                                                    ),

                                                                                                                                                                                                                                                                        created_at timestamptz not null default now(),
                                                                                                                                                                                                                                                                            updated_at timestamptz not null default now()
                                                                                                                                                                                                                                                                            );

                                                                                                                                                                                                                                                                            create table inventory_profiles (
                                                                                                                                                                                                                                                                                id uuid primary key default gen_random_uuid(),
                                                                                                                                                                                                                                                                                    site_id uuid not null references sites(id) on delete cascade,
                                                                                                                                                                                                                                                                                        zone_id uuid references zones(id) on delete set null,

                                                                                                                                                                                                                                                                                            name text not null,

                                                                                                                                                                                                                                                                                                temperature_sensitivity numeric not null default 0.5
                                                                                                                                                                                                                                                                                                        check (
                                                                                                                                                                                                                                                                                                                    temperature_sensitivity >= 0
                                                                                                                                                                                                                                                                                                                                and temperature_sensitivity <= 1
                                                                                                                                                                                                                                                                                                                                        ),

                                                                                                                                                                                                                                                                                                                                            description text,

                                                                                                                                                                                                                                                                                                                                                created_at timestamptz not null default now(),
                                                                                                                                                                                                                                                                                                                                                    updated_at timestamptz not null default now()
                                                                                                                                                                                                                                                                                                                                                    );

                                                                                                                                                                                                                                                                                                                                                    create table workforce_profiles (
                                                                                                                                                                                                                                                                                                                                                        id uuid primary key default gen_random_uuid(),
                                                                                                                                                                                                                                                                                                                                                            site_id uuid not null references sites(id) on delete cascade,
                                                                                                                                                                                                                                                                                                                                                                zone_id uuid references zones(id) on delete set null,

                                                                                                                                                                                                                                                                                                                                                                    name text not null,

                                                                                                                                                                                                                                                                                                                                                                        worker_count integer not null default 0
                                                                                                                                                                                                                                                                                                                                                                                check (worker_count >= 0),

                                                                                                                                                                                                                                                                                                                                                                                    activity_type text,

                                                                                                                                                                                                                                                                                                                                                                                        created_at timestamptz not null default now(),
                                                                                                                                                                                                                                                                                                                                                                                            updated_at timestamptz not null default now()
                                                                                                                                                                                                                                                                                                                                                                                            );

                                                                                                                                                                                                                                                                                                                                                                                            create index sites_organization_id_idx
                                                                                                                                                                                                                                                                                                                                                                                                on sites(organization_id);

                                                                                                                                                                                                                                                                                                                                                                                                create index zones_site_id_idx
                                                                                                                                                                                                                                                                                                                                                                                                    on zones(site_id);

                                                                                                                                                                                                                                                                                                                                                                                                    create index operations_site_id_idx
                                                                                                                                                                                                                                                                                                                                                                                                        on operations(site_id);

                                                                                                                                                                                                                                                                                                                                                                                                        create index operations_zone_id_idx
                                                                                                                                                                                                                                                                                                                                                                                                            on operations(zone_id);

                                                                                                                                                                                                                                                                                                                                                                                                            create index inventory_profiles_site_id_idx
                                                                                                                                                                                                                                                                                                                                                                                                                on inventory_profiles(site_id);

                                                                                                                                                                                                                                                                                                                                                                                                                create index workforce_profiles_site_id_idx
                                                                                                                                                                                                                                                                                                                                                                                                                    on workforce_profiles(site_id);