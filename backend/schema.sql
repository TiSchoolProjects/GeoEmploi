--
-- PostgreSQL database dump
--

\restrict 3F6yJsevAsbP1F7X2SbccKshDc26zbeQ0qoVKDCHzhN99DXoi5oFXdDFAtD05vS

-- Dumped from database version 16.15
-- Dumped by pg_dump version 18.6 (Ubuntu 18.6-0ubuntu0.26.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: applications_status_enum; Type: TYPE; Schema: public; Owner: GeoUser
--

CREATE TYPE public.applications_status_enum AS ENUM (
    'waiting',
    'accepted',
    'rejected'
);


ALTER TYPE public.applications_status_enum OWNER TO "GeoUser";

--
-- Name: jobs_geocodingstatus_enum; Type: TYPE; Schema: public; Owner: GeoUser
--

CREATE TYPE public.jobs_geocodingstatus_enum AS ENUM (
    'valid',
    'to_verify'
);


ALTER TYPE public.jobs_geocodingstatus_enum OWNER TO "GeoUser";

--
-- Name: user_role_enum; Type: TYPE; Schema: public; Owner: GeoUser
--

CREATE TYPE public.user_role_enum AS ENUM (
    'seeker',
    'employer',
    'admin'
);


ALTER TYPE public.user_role_enum OWNER TO "GeoUser";

--
-- Name: user_status_enum; Type: TYPE; Schema: public; Owner: GeoUser
--

CREATE TYPE public.user_status_enum AS ENUM (
    'active',
    'suspended'
);


ALTER TYPE public.user_status_enum OWNER TO "GeoUser";

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: applications; Type: TABLE; Schema: public; Owner: GeoUser
--

CREATE TABLE public.applications (
    id integer NOT NULL,
    "jobId" integer NOT NULL,
    "jobSeekerId" integer NOT NULL,
    status public.applications_status_enum DEFAULT 'waiting'::public.applications_status_enum NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.applications OWNER TO "GeoUser";

--
-- Name: applications_id_seq; Type: SEQUENCE; Schema: public; Owner: GeoUser
--

CREATE SEQUENCE public.applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.applications_id_seq OWNER TO "GeoUser";

--
-- Name: applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: GeoUser
--

ALTER SEQUENCE public.applications_id_seq OWNED BY public.applications.id;


--
-- Name: employer_profiles; Type: TABLE; Schema: public; Owner: GeoUser
--

CREATE TABLE public.employer_profiles (
    "userId" integer NOT NULL,
    "companyName" character varying NOT NULL,
    "companyDesc" character varying NOT NULL,
    "verifiedAt" timestamp without time zone
);


ALTER TABLE public.employer_profiles OWNER TO "GeoUser";

--
-- Name: jobs; Type: TABLE; Schema: public; Owner: GeoUser
--

CREATE TABLE public.jobs (
    id integer NOT NULL,
    "employerId" integer NOT NULL,
    title character varying NOT NULL,
    description text NOT NULL,
    adress character varying NOT NULL,
    lat numeric(10,7),
    lng numeric(10,7),
    "geocodingSource" character varying,
    "geocodingScore" numeric(5,4),
    "geocodedAt" timestamp without time zone,
    "GeocodingStatus" public.jobs_geocodingstatus_enum DEFAULT 'to_verify'::public.jobs_geocodingstatus_enum NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "archivedAt" timestamp without time zone
);


ALTER TABLE public.jobs OWNER TO "GeoUser";

--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: GeoUser
--

CREATE SEQUENCE public.jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_id_seq OWNER TO "GeoUser";

--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: GeoUser
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: seeker; Type: TABLE; Schema: public; Owner: GeoUser
--

CREATE TABLE public.seeker (
    "userId" integer NOT NULL,
    skills text,
    experience character varying,
    availability character varying
);


ALTER TABLE public.seeker OWNER TO "GeoUser";

--
-- Name: user; Type: TABLE; Schema: public; Owner: GeoUser
--

CREATE TABLE public."user" (
    id integer NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    firstname character varying NOT NULL,
    lastname character varying NOT NULL,
    role public.user_role_enum DEFAULT 'seeker'::public.user_role_enum NOT NULL,
    status public.user_status_enum DEFAULT 'active'::public.user_status_enum NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."user" OWNER TO "GeoUser";

--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: GeoUser
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_id_seq OWNER TO "GeoUser";

--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: GeoUser
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- Name: applications id; Type: DEFAULT; Schema: public; Owner: GeoUser
--

ALTER TABLE ONLY public.applications ALTER COLUMN id SET DEFAULT nextval('public.applications_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: GeoUser
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: user id; Type: DEFAULT; Schema: public; Owner: GeoUser
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: GeoUser
--

COPY public.applications (id, "jobId", "jobSeekerId", status, "createdAt") FROM stdin;
3	1	4	waiting	2026-09-04 09:36:01.921306
\.


--
-- Data for Name: employer_profiles; Type: TABLE DATA; Schema: public; Owner: GeoUser
--

COPY public.employer_profiles ("userId", "companyName", "companyDesc", "verifiedAt") FROM stdin;
1	f	f	\N
2	q	q	\N
3	t	t	\N
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: GeoUser
--

COPY public.jobs (id, "employerId", title, description, adress, lat, lng, "geocodingSource", "geocodingScore", "geocodedAt", "GeocodingStatus", "createdAt", "archivedAt") FROM stdin;
1	2	test	test secu	Villejuif	48.7934680	2.3609960	api-adresse	0.9541	2026-09-04 07:43:15.87	valid	2026-09-04 07:43:15.887373	\N
\.


--
-- Data for Name: seeker; Type: TABLE DATA; Schema: public; Owner: GeoUser
--

COPY public.seeker ("userId", skills, experience, availability) FROM stdin;
4	NestJS,React,PostgreSQL	2 ans	Immédiate
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: GeoUser
--

COPY public."user" (id, email, password, firstname, lastname, role, status, "createdAt") FROM stdin;
1	f@f.comf	$2b$10$2whT2Xkdmg2wxsAdnaFgHuBGc6g/LhIBrYlozdisAG7fkgpNwe3m2	f	f	employer	active	2026-09-04 07:42:05.481159
2	q@q.com	$2b$10$0ElQMnPYMG9k4yDA8tee3OVOzzWmnX5hq7cuZjOHs1CZOTjbIbwa.	q	q	employer	active	2026-09-04 07:42:28.875482
3	t@t.com	$2b$10$sDWyusx8bPNGvNiHiof1f.nVTVKAY8ELDfxEQKnUs1lw7QU3QCJia	t	t	employer	active	2026-09-04 07:43:44.490373
4	seeker-test2@test.local	$2b$10$Oprxldtv8CRfD4ktf2t3quuEuHDK7qKn4VT1dquqNIjvOruVZ9oyS	Seeker	Test2	seeker	active	2026-09-04 08:52:21.789906
\.


--
-- Name: applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: GeoUser
--

SELECT pg_catalog.setval('public.applications_id_seq', 3, true);


--
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: GeoUser
--

SELECT pg_catalog.setval('public.jobs_id_seq', 1, true);


--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: GeoUser
--

SELECT pg_catalog.setval('public.user_id_seq', 4, true);


--
-- Name: seeker PK_20bb01672b489f23ffb33c07ca3; Type: CONSTRAINT; Schema: public; Owner: GeoUser
--

ALTER TABLE ONLY public.seeker
    ADD CONSTRAINT "PK_20bb01672b489f23ffb33c07ca3" PRIMARY KEY ("userId");


--
-- Name: applications PK_938c0a27255637bde919591888f; Type: CONSTRAINT; Schema: public; Owner: GeoUser
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT "PK_938c0a27255637bde919591888f" PRIMARY KEY (id);


--
-- Name: employer_profiles PK_9800cae27bdc0b9cbbc16e1556a; Type: CONSTRAINT; Schema: public; Owner: GeoUser
--

ALTER TABLE ONLY public.employer_profiles
    ADD CONSTRAINT "PK_9800cae27bdc0b9cbbc16e1556a" PRIMARY KEY ("userId");


--
-- Name: user PK_cace4a159ff9f2512dd42373760; Type: CONSTRAINT; Schema: public; Owner: GeoUser
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);


--
-- Name: jobs PK_cf0a6c42b72fcc7f7c237def345; Type: CONSTRAINT; Schema: public; Owner: GeoUser
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT "PK_cf0a6c42b72fcc7f7c237def345" PRIMARY KEY (id);


--
-- Name: applications UQ_cfae91c8ddceec0e0fbd53a06c6; Type: CONSTRAINT; Schema: public; Owner: GeoUser
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT "UQ_cfae91c8ddceec0e0fbd53a06c6" UNIQUE ("jobSeekerId", "jobId");


--
-- Name: user UQ_e12875dfb3b1d92d7d7c5377e22; Type: CONSTRAINT; Schema: public; Owner: GeoUser
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE (email);


--
-- Name: seeker FK_20bb01672b489f23ffb33c07ca3; Type: FK CONSTRAINT; Schema: public; Owner: GeoUser
--

ALTER TABLE ONLY public.seeker
    ADD CONSTRAINT "FK_20bb01672b489f23ffb33c07ca3" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: jobs FK_62e3afafda3cf7db0a08982a5b1; Type: FK CONSTRAINT; Schema: public; Owner: GeoUser
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT "FK_62e3afafda3cf7db0a08982a5b1" FOREIGN KEY ("employerId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: applications FK_7b7df3d80970a3a0811f669d9d0; Type: FK CONSTRAINT; Schema: public; Owner: GeoUser
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT "FK_7b7df3d80970a3a0811f669d9d0" FOREIGN KEY ("jobSeekerId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: employer_profiles FK_9800cae27bdc0b9cbbc16e1556a; Type: FK CONSTRAINT; Schema: public; Owner: GeoUser
--

ALTER TABLE ONLY public.employer_profiles
    ADD CONSTRAINT "FK_9800cae27bdc0b9cbbc16e1556a" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: applications FK_f6ebb8bc5061068e4dd97df3c77; Type: FK CONSTRAINT; Schema: public; Owner: GeoUser
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT "FK_f6ebb8bc5061068e4dd97df3c77" FOREIGN KEY ("jobId") REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 3F6yJsevAsbP1F7X2SbccKshDc26zbeQ0qoVKDCHzhN99DXoi5oFXdDFAtD05vS

