# Phase 2 Consolidated Roadmap: Optimization & Intelligence

**Date**: 2026-01-25
**Status**: PROPOSED
**Context**: Post-Optimization (Tooling is ready, Infrastructure is next).

## 1. Overview
We have successfully upgraded the *Scanning Engine* (Phase 2.0 + Optimization) to support Enterprise features (Auth, Ajax, Rate Limits).
The next evolution focuses on **Data Persistence** and **Business Intelligence**.

We propose splitting the next work into two sub-phases:
*   **Phase 2.1 (Foundation)**: "Remembering" (Database & Assets).
*   **Phase 2.2 (Insight)**: "Understanding" (KPIs & Trends).

## 2. Phase 2.1: The Persistent Foundation (Next Sprint)
*Goal: Move from "Transient Scans" to "Managed Assets".*

| Priority | Feature | Description | Value |
| :--- | :--- | :--- | :--- |
| **1** | **PostgreSQL Migration** | Migrate from In-Memory `SCAN_DB` to Persistent Postgres. | **Critical**. Enables history retention and is a prerequisite for all KPIs. |
| **2** | **Target Management** | Create "Projects" (Targets) to group scans. | **High**. Moving from "Scanning a URL" to "Securing an Asset". |
| **3** | **Auth Configuration UI** | Frontend UI to input Credentials/Cookies (connecting to our new backend support). | **High**. Unlocks scanning of 90% of real-world apps (Login protected). |

## 3. Phase 2.2: The Insight Layer
*Goal: Move from "Raw Data" to "Business Decisions".*

| Priority | Feature | Description | Value |
| :--- | :--- | :--- | :--- |
| **1** | **KPI Dashboard** | Graphs for "Risk over Time", "MTTR", and "Success Rate". | **Strategic**. Shows ROI of security to management. |
| **2** | **Scheduled Scanning** | "Run scan every Sunday". | **Operational**. Automates assurance. |
| **3** | **PDF Executive Reports** | Downloadable, professional summaries. | **Business**. For compliance and stakeholders. |

## 4. Summary of Completed Optimizations (Phase 2.5)
We have already delivered the *technical* enablers for the above:
*   ✅ **ZAP Ajax Spider**: Capable of scanning modern React apps.
*   ✅ **Auth Injection Backend**: backend logic to pass headers/cookies.
*   ✅ **Rate Limiting**: Protection for production assets.

## 5. Recommendation
**Immediate Action**: Approve **Phase 2.1**.
1.  Add Postgres to Docker.
2.  Implement `Target` and `Scan` SQL models.
3.  Update UI to support "Create Target" workflow.
