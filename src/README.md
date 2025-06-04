# 🧾 Product Requirements Document: Intuitive Lyzr Credits Calculator

## 📌 Overview

**Goal:**
Create a user-friendly, self-service **credits calculator** for business users evaluating the Lyzr platform. The calculator will demystify credit-based pricing and provide instant, transparent cost estimates for common use cases — without requiring technical knowledge.

**Target User:**
Non-technical business stakeholders (e.g., product managers, marketing leads, operations execs) who are exploring Lyzr but are hesitant to move forward due to unclear or intimidating cost structures.

---

## 🎯 Objectives

* ✅ Help users understand how different actions (e.g., document analysis, email replies, workflows) consume credits.
* ✅ Show the **cost impact** of advanced functions like self-reflection, memory usage, or multi-agent workflows in plain English.
* ✅ Provide a **simple and guided UI** to simulate common scenarios and get instant pricing.
* ✅ Build trust and transparency in Lyzr’s pricing by avoiding jargon and surfacing trade-offs.

---

## 🖼️ User Interface

### **1. Home Tab: "Estimate My Credits"**

* Friendly welcome message: *“Let’s estimate how many credits your use case might consume.”*
* Step-by-step question flow:

  * "What do you want to do?" (dropdown: analyze text, answer emails, build chatbot, query data, etc.)
  * "How often will it run?" (once, daily, weekly, etc.)
  * "How many users or agents are involved?" (numeric input)
  * "Do you need deep reasoning or just quick responses?" (slider or buttons: Base / Medium / Advanced)
* Optional toggle: “Include advanced features like self-reflection, grounding, or relevance checking?”

  * Tooltip on hover explaining each:

    * *Self-Reflection: The agent double-checks its answer, increasing accuracy (uses more credits).*
    * *Groundedness Check: Ensures responses are aligned with facts.*
    * *Context Relevance: Keeps the agent focused on your business.*

### **2. Output Panel**

* Displays:

  * Estimated **per run** credits
  * Estimated **monthly** credits
  * Estimated **monthly cost in USD**
  * Cost breakdown by function type (in plain English)
* Button: "Download PDF estimate" or "Email me this estimate"

---

## 🧠 Logic & Credit Calculation

Use the internal Lyzr pricing model and apply multipliers as follows:

| Function Type            | Base Credits | Notes                                 |
| ------------------------ | ------------ | ------------------------------------- |
| Basic LLM call           | 1            | Standard GPT-4o inference             |
| Self-reflection          | 1 (× tier)   | Adds clarity, multiplies credit usage |
| Groundedness check       | 1 (× tier)   | Verifies factual integrity            |
| Context relevance check  | 1 (× tier)   | Ensures domain consistency            |
| Memory (short/long-term) | 0.25–0.5     | Based on token count                  |
| RAG ingestion/query      | 0.5–1        | Based on data load                    |
| Workflow or Tool Calls   | 1            | Per call or step                      |

* Tier multipliers:

  * Base = 1×
  * Medium = 8×
  * Advanced = 15×

Assume **\$0.01 per credit** by default.

---

## 🔌 API Integration

Back the UI with a live call to a Lyzr agent:

* Endpoint: `https://agent-dev.test.studio.lyzr.ai/v3/inference/chat/`
* Agent ID: `683dbd69c6b0207f29f2432f`
* Pass parameters as JSON for instant return of cost breakdown.

---

## ✨ Additional Features (Stretch Goals)

* 🌐 International currency selector (USD, EUR, INR)
* 📈 Save & compare multiple use cases
* 🔁 Real-time API estimation for recurring workloads
* 💡 Recommend ways to **reduce cost** (e.g., use Base tier, skip reflection, batch data)

---

## 📦 Deliverables

* Fully functional UI (web-based, mobile responsive)
* Connected backend via Lyzr API
* PDF & email report generation
* Embedded tooltips for non-technical education
* Live credit usage demo examples
