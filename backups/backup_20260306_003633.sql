--
-- PostgreSQL database dump
--

\restrict X57zNyDz7NmWVKLVPtItoL9cKqNsgdQ3liM8e3tmNTmxzVi4B9xOK0qpQl6mfib

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: findings; Type: TABLE; Schema: public; Owner: velox_prod
--

CREATE TABLE public.findings (
    id character varying NOT NULL,
    scan_id character varying NOT NULL,
    tool character varying,
    title character varying NOT NULL,
    description text,
    severity character varying,
    location character varying,
    false_positive boolean
);


ALTER TABLE public.findings OWNER TO velox_prod;

--
-- Name: scans; Type: TABLE; Schema: public; Owner: velox_prod
--

CREATE TABLE public.scans (
    id character varying NOT NULL,
    target_id character varying,
    session_id character varying,
    scan_type character varying NOT NULL,
    status character varying,
    options json,
    created_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    findings_count integer,
    critical_count integer,
    high_count integer
);


ALTER TABLE public.scans OWNER TO velox_prod;

--
-- Name: targets; Type: TABLE; Schema: public; Owner: velox_prod
--

CREATE TABLE public.targets (
    id character varying NOT NULL,
    name character varying NOT NULL,
    url character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.targets OWNER TO velox_prod;

--
-- Data for Name: findings; Type: TABLE DATA; Schema: public; Owner: velox_prod
--

COPY public.findings (id, scan_id, tool, title, description, severity, location, false_positive) FROM stdin;
\.


--
-- Data for Name: scans; Type: TABLE DATA; Schema: public; Owner: velox_prod
--

COPY public.scans (id, target_id, session_id, scan_type, status, options, created_at, completed_at, findings_count, critical_count, high_count) FROM stdin;
\.


--
-- Data for Name: targets; Type: TABLE DATA; Schema: public; Owner: velox_prod
--

COPY public.targets (id, name, url, created_at) FROM stdin;
\.


--
-- Name: findings findings_pkey; Type: CONSTRAINT; Schema: public; Owner: velox_prod
--

ALTER TABLE ONLY public.findings
    ADD CONSTRAINT findings_pkey PRIMARY KEY (id);


--
-- Name: scans scans_pkey; Type: CONSTRAINT; Schema: public; Owner: velox_prod
--

ALTER TABLE ONLY public.scans
    ADD CONSTRAINT scans_pkey PRIMARY KEY (id);


--
-- Name: targets targets_pkey; Type: CONSTRAINT; Schema: public; Owner: velox_prod
--

ALTER TABLE ONLY public.targets
    ADD CONSTRAINT targets_pkey PRIMARY KEY (id);


--
-- Name: ix_scans_session_id; Type: INDEX; Schema: public; Owner: velox_prod
--

CREATE INDEX ix_scans_session_id ON public.scans USING btree (session_id);


--
-- Name: findings findings_scan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: velox_prod
--

ALTER TABLE ONLY public.findings
    ADD CONSTRAINT findings_scan_id_fkey FOREIGN KEY (scan_id) REFERENCES public.scans(id);


--
-- Name: scans scans_target_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: velox_prod
--

ALTER TABLE ONLY public.scans
    ADD CONSTRAINT scans_target_id_fkey FOREIGN KEY (target_id) REFERENCES public.targets(id);


--
-- PostgreSQL database dump complete
--

\unrestrict X57zNyDz7NmWVKLVPtItoL9cKqNsgdQ3liM8e3tmNTmxzVi4B9xOK0qpQl6mfib

