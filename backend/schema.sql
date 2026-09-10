--
-- PostgreSQL database dump
--

\restrict 4tauYaFMlrrdN3e8kA1mTpldmwjUDaBsZYejiDbyBQ2MYvjwjs5mokRL2GQUZI9

-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: applications_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.applications_status_enum AS ENUM (
    'waiting',
    'accepted',
    'rejected'
);


--
-- Name: jobs_geocodingstatus_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.jobs_geocodingstatus_enum AS ENUM (
    'valid',
    'to_verify'
);


--
-- Name: reports_reason_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.reports_reason_enum AS ENUM (
    'fraud',
    'misleading',
    'discriminatory',
    'non_compliant',
    'other'
);


--
-- Name: reports_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.reports_status_enum AS ENUM (
    'pending',
    'resolved'
);


--
-- Name: user_role_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role_enum AS ENUM (
    'seeker',
    'employer',
    'admin'
);


--
-- Name: user_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_status_enum AS ENUM (
    'active',
    'suspended'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.applications (
    id integer NOT NULL,
    "jobId" integer NOT NULL,
    "jobSeekerId" integer NOT NULL,
    status public.applications_status_enum DEFAULT 'waiting'::public.applications_status_enum NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: applications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.applications_id_seq OWNED BY public.applications.id;


--
-- Name: employer_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employer_profiles (
    "userId" integer NOT NULL,
    "companyName" character varying NOT NULL,
    "companyDesc" character varying NOT NULL,
    "verifiedAt" timestamp without time zone
);


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobs (
    id integer NOT NULL,
    "employerId" integer NOT NULL,
    title character varying NOT NULL,
    description text NOT NULL,
    adress character varying NOT NULL,
    "locationPrecision" character varying DEFAULT 'commune'::character varying NOT NULL,
    lat numeric(10,7),
    lng numeric(10,7),
    "geocodingSource" character varying,
    "geocodingScore" numeric(5,4),
    "geocodedAt" timestamp without time zone,
    "GeocodingStatus" public.jobs_geocodingstatus_enum DEFAULT 'to_verify'::public.jobs_geocodingstatus_enum NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "archivedAt" timestamp without time zone,
    views integer DEFAULT 0 NOT NULL
);


--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    "receverId" integer NOT NULL,
    "applicationId" integer NOT NULL,
    title character varying NOT NULL,
    message text NOT NULL,
    "readAt" timestamp without time zone,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reports (
    id integer NOT NULL,
    "jobId" integer NOT NULL,
    "reporterId" integer,
    reason public.reports_reason_enum NOT NULL,
    description text NOT NULL,
    status public.reports_status_enum DEFAULT 'pending'::public.reports_status_enum NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "resolvedAt" timestamp without time zone
);


--
-- Name: reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reports_id_seq OWNED BY public.reports.id;


--
-- Name: seeker; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seeker (
    "userId" integer NOT NULL,
    skills text,
    experience character varying,
    availability character varying
);


--
-- Name: user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."user" (
    id integer NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    firstname character varying NOT NULL,
    lastname character varying NOT NULL,
    role public.user_role_enum DEFAULT 'seeker'::public.user_role_enum NOT NULL,
    status public.user_status_enum DEFAULT 'active'::public.user_status_enum NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "lastLogin" timestamp without time zone
);


--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- Name: applications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications ALTER COLUMN id SET DEFAULT nextval('public.applications_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports ALTER COLUMN id SET DEFAULT nextval('public.reports_id_seq'::regclass);


--
-- Name: user id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- Name: seeker PK_20bb01672b489f23ffb33c07ca3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seeker
    ADD CONSTRAINT "PK_20bb01672b489f23ffb33c07ca3" PRIMARY KEY ("userId");


--
-- Name: notifications PK_6a72c3c0f683f6462415e653c3a; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY (id);


--
-- Name: applications PK_938c0a27255637bde919591888f; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT "PK_938c0a27255637bde919591888f" PRIMARY KEY (id);


--
-- Name: employer_profiles PK_9800cae27bdc0b9cbbc16e1556a; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employer_profiles
    ADD CONSTRAINT "PK_9800cae27bdc0b9cbbc16e1556a" PRIMARY KEY ("userId");


--
-- Name: user PK_cace4a159ff9f2512dd42373760; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);


--
-- Name: jobs PK_cf0a6c42b72fcc7f7c237def345; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT "PK_cf0a6c42b72fcc7f7c237def345" PRIMARY KEY (id);


--
-- Name: reports PK_d9013193989303580053c0b5ef6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT "PK_d9013193989303580053c0b5ef6" PRIMARY KEY (id);


--
-- Name: applications UQ_cfae91c8ddceec0e0fbd53a06c6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT "UQ_cfae91c8ddceec0e0fbd53a06c6" UNIQUE ("jobSeekerId", "jobId");


--
-- Name: user UQ_e12875dfb3b1d92d7d7c5377e22; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE (email);


--
-- Name: IDX_17099dfd96e996ed0d9c0ccea2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_17099dfd96e996ed0d9c0ccea2" ON public.notifications USING btree ("receverId");


--
-- Name: notifications FK_17099dfd96e996ed0d9c0ccea20; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "FK_17099dfd96e996ed0d9c0ccea20" FOREIGN KEY ("receverId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: seeker FK_20bb01672b489f23ffb33c07ca3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seeker
    ADD CONSTRAINT "FK_20bb01672b489f23ffb33c07ca3" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: reports FK_4353be8309ce86650def2f8572d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT "FK_4353be8309ce86650def2f8572d" FOREIGN KEY ("reporterId") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: jobs FK_62e3afafda3cf7db0a08982a5b1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT "FK_62e3afafda3cf7db0a08982a5b1" FOREIGN KEY ("employerId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: notifications FK_773d33b6896fe6e8077ae32ebb6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "FK_773d33b6896fe6e8077ae32ebb6" FOREIGN KEY ("applicationId") REFERENCES public.applications(id) ON DELETE CASCADE;


--
-- Name: applications FK_7b7df3d80970a3a0811f669d9d0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT "FK_7b7df3d80970a3a0811f669d9d0" FOREIGN KEY ("jobSeekerId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: reports FK_9245b192024ef523a193e8dec57; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT "FK_9245b192024ef523a193e8dec57" FOREIGN KEY ("jobId") REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- Name: employer_profiles FK_9800cae27bdc0b9cbbc16e1556a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employer_profiles
    ADD CONSTRAINT "FK_9800cae27bdc0b9cbbc16e1556a" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: applications FK_f6ebb8bc5061068e4dd97df3c77; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT "FK_f6ebb8bc5061068e4dd97df3c77" FOREIGN KEY ("jobId") REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 4tauYaFMlrrdN3e8kA1mTpldmwjUDaBsZYejiDbyBQ2MYvjwjs5mokRL2GQUZI9

