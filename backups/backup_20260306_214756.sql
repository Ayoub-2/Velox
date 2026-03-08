--
-- PostgreSQL database dump
--

\restrict 6N8aC1DxCsp6jIFCEc8uBGb6cwwaZGSb70CAxcxtHvdKwx49TK86b9JYmKGdLTW

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
14cb4276-2e3b-49d5-acf8-e5dae31d4f59	1a409dec-742d-4d25-80dc-367376ec1bbe	nuclei	HTTP Missing Security Headers	This template searches for missing HTTP security headers. The impact of these missing headers can vary.\n	info	http://web:3000/	f
26ba5ab5-6a4c-4e29-9eb2-1fc431225e48	1a409dec-742d-4d25-80dc-367376ec1bbe	nuclei	HTTP Missing Security Headers	This template searches for missing HTTP security headers. The impact of these missing headers can vary.\n	info	http://web:3000/	f
e63217ec-2843-4c60-bb35-7b9503b99371	1a409dec-742d-4d25-80dc-367376ec1bbe	nuclei	HTTP Missing Security Headers	This template searches for missing HTTP security headers. The impact of these missing headers can vary.\n	info	http://web:3000/	f
f7563fd8-8dfa-415c-b209-dfa51cf8635e	1a409dec-742d-4d25-80dc-367376ec1bbe	nuclei	HTTP Missing Security Headers	This template searches for missing HTTP security headers. The impact of these missing headers can vary.\n	info	http://web:3000/	f
01da552a-114e-45fd-bee8-0b7e6673c067	1a409dec-742d-4d25-80dc-367376ec1bbe	nuclei	HTTP Missing Security Headers	This template searches for missing HTTP security headers. The impact of these missing headers can vary.\n	info	http://web:3000/	f
ba682e7b-ef45-4908-bc36-c7ae3c3a115e	1a409dec-742d-4d25-80dc-367376ec1bbe	nuclei	HTTP Missing Security Headers	This template searches for missing HTTP security headers. The impact of these missing headers can vary.\n	info	http://web:3000/	f
cc47bf8e-18d4-4874-bafe-46eb22e8b3f9	1a409dec-742d-4d25-80dc-367376ec1bbe	nuclei	Weak Content Security Policy - Detect	Detected misconfigured CSP directives containing unsafe and overly permissive keywords that weakened resource loading restrictions. This configuration allowed high-risk script behaviors, resulting in reduced protection against XSS attacks.\n	info	http://web:3000/	f
e9c58f47-8664-4c94-ae20-563f484f8efc	1a409dec-742d-4d25-80dc-367376ec1bbe	nuclei	XSS-Protection Header - Cross-Site Scripting	Setting the XSS-Protection header is deprecated. Setting the header to anything other than `0` can actually introduce an XSS vulnerability.	info	http://web:3000/	f
383b864e-9ed9-44cc-b69a-94ce06473442	62efd7b3-26a7-4bc4-835a-bc9d90426e59	nuclei	Weak Content Security Policy - Detect	Detected misconfigured CSP directives containing unsafe and overly permissive keywords that weakened resource loading restrictions. This configuration allowed high-risk script behaviors, resulting in reduced protection against XSS attacks.\n	info	http://web:3000/	f
1345a307-f243-477a-8656-a5657b4cecea	62efd7b3-26a7-4bc4-835a-bc9d90426e59	nuclei	XSS-Protection Header - Cross-Site Scripting	Setting the XSS-Protection header is deprecated. Setting the header to anything other than `0` can actually introduce an XSS vulnerability.	info	http://web:3000/	f
49a25e94-2ecf-4d93-9e92-fe32cc9bcb93	62efd7b3-26a7-4bc4-835a-bc9d90426e59	nuclei	HTTP Missing Security Headers	This template searches for missing HTTP security headers. The impact of these missing headers can vary.\n	info	http://web:3000/	f
8cef2e3c-5319-45db-accf-7f950016b4fc	62efd7b3-26a7-4bc4-835a-bc9d90426e59	nuclei	HTTP Missing Security Headers	This template searches for missing HTTP security headers. The impact of these missing headers can vary.\n	info	http://web:3000/	f
15caedd6-a668-49c7-8402-8c01018463f9	62efd7b3-26a7-4bc4-835a-bc9d90426e59	nuclei	HTTP Missing Security Headers	This template searches for missing HTTP security headers. The impact of these missing headers can vary.\n	info	http://web:3000/	f
35dcab49-fdd7-4a97-907a-269f52c98e3d	62efd7b3-26a7-4bc4-835a-bc9d90426e59	nuclei	HTTP Missing Security Headers	This template searches for missing HTTP security headers. The impact of these missing headers can vary.\n	info	http://web:3000/	f
f316ef1a-1a6c-429d-bd21-9635466a859c	62efd7b3-26a7-4bc4-835a-bc9d90426e59	nuclei	HTTP Missing Security Headers	This template searches for missing HTTP security headers. The impact of these missing headers can vary.\n	info	http://web:3000/	f
faff614e-75ee-4d6c-97df-00948602e11e	62efd7b3-26a7-4bc4-835a-bc9d90426e59	nuclei	HTTP Missing Security Headers	This template searches for missing HTTP security headers. The impact of these missing headers can vary.\n	info	http://web:3000/	f
\.


--
-- Data for Name: scans; Type: TABLE DATA; Schema: public; Owner: velox_prod
--

COPY public.scans (id, target_id, session_id, scan_type, status, options, created_at, completed_at, findings_count, critical_count, high_count) FROM stdin;
de0cc8dc-c929-4517-9f18-76125dd34fc0	18244e11-4e3a-4221-a89e-d21ea3bc2206	zfktpsh3scmme602zb	nuclei	failed	{"rate_limit": 50, "concurrency": 25, "auth_headers": null, "use_ajax_spider": false, "include_active_scan": false, "nuclei_tags": "cve,misconfig,exposures"}	2026-03-06 00:43:54.529655+00	\N	0	0	0
d7707bee-f272-4d1a-b630-dc3612f69b0f	18244e11-4e3a-4221-a89e-d21ea3bc2206	zfktpsh3scmme602zb	nuclei	failed	{"rate_limit": 50, "concurrency": 25, "auth_headers": null, "use_ajax_spider": false, "include_active_scan": false, "nuclei_tags": "cve,misconfig,exposures"}	2026-03-06 00:48:43.067937+00	\N	0	0	0
1b13b5dc-15fc-43b0-8bce-3228ce11cff3	18244e11-4e3a-4221-a89e-d21ea3bc2206	zfktpsh3scmme602zb	nuclei	failed	{"rate_limit": 50, "concurrency": 25, "auth_headers": null, "use_ajax_spider": false, "include_active_scan": false, "nuclei_tags": "cve,misconfig,exposures"}	2026-03-06 00:50:28.182842+00	\N	0	0	0
6d610418-244e-4fd6-b8a8-9be55fe97f5e	18244e11-4e3a-4221-a89e-d21ea3bc2206	zfktpsh3scmme602zb	nuclei	failed	{"rate_limit": 50, "concurrency": 25, "auth_headers": null, "use_ajax_spider": false, "include_active_scan": false, "nuclei_tags": "cve,misconfig,exposures"}	2026-03-06 00:52:43.252422+00	\N	0	0	0
7e626501-c607-4ee5-b51c-2c6379adf4f7	18244e11-4e3a-4221-a89e-d21ea3bc2206	zfktpsh3scmme602zb	nuclei	failed	{"rate_limit": 50, "concurrency": 25, "auth_headers": null, "use_ajax_spider": false, "include_active_scan": false, "nuclei_tags": "cve,misconfig,exposures"}	2026-03-06 01:02:32.000993+00	\N	0	0	0
f05cf15b-3f2a-4352-9311-6d27dd5a1222	4e81369a-d920-40d3-869a-e2ff24e9de44	zfktpsh3scmme602zb	nuclei	failed	{"rate_limit": 50, "concurrency": 25, "auth_headers": null, "use_ajax_spider": false, "include_active_scan": false, "nuclei_tags": "cve,misconfig,exposures"}	2026-03-06 01:17:47.644943+00	\N	0	0	0
1a409dec-742d-4d25-80dc-367376ec1bbe	18244e11-4e3a-4221-a89e-d21ea3bc2206	zfktpsh3scmme602zb	nuclei	completed	{"rate_limit": 50, "concurrency": 25, "auth_headers": null, "use_ajax_spider": false, "include_active_scan": false, "nuclei_tags": "cve,misconfig,exposures"}	2026-03-06 01:21:41.233304+00	2026-03-06 01:23:11.024196+00	8	0	0
62efd7b3-26a7-4bc4-835a-bc9d90426e59	18244e11-4e3a-4221-a89e-d21ea3bc2206	zfktpsh3scmme602zb	nuclei	completed	{"rate_limit": 50, "concurrency": 25, "auth_headers": null, "use_ajax_spider": false, "include_active_scan": false, "nuclei_tags": "cve,misconfig,exposures"}	2026-03-06 19:31:57.228787+00	2026-03-06 19:34:02.026735+00	8	0	0
\.


--
-- Data for Name: targets; Type: TABLE DATA; Schema: public; Owner: velox_prod
--

COPY public.targets (id, name, url, created_at) FROM stdin;
18244e11-4e3a-4221-a89e-d21ea3bc2206	http://web:3000/	http://web:3000/	2026-03-06 00:43:54.511057+00
4e81369a-d920-40d3-869a-e2ff24e9de44	http://web/3000	http://web/3000	2026-03-06 01:17:47.618971+00
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

\unrestrict 6N8aC1DxCsp6jIFCEc8uBGb6cwwaZGSb70CAxcxtHvdKwx49TK86b9JYmKGdLTW

