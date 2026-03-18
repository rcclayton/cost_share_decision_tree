/**
 * Data-driven decision tree (quiz) derived from Tier 1–4 framework in private_docs/notes.md.
 *
 * Node types:
 * - question: user selects one choice -> next node
 * - outcome: end state showing plan of action (summary + next steps)
 */

export const STAGES = [
  { id: "tier1", label: "TIER 1" },
  { id: "tier2", label: "TIER 2" },
  { id: "tier3", label: "TIER 3" },
  { id: "tier4", label: "TIER 4" },
];

/** @type {Record<string, any>} */
export const NODES = {
  // Tier 1
  q_requiresCostShare: {
    type: "question",
    id: "q_requiresCostShare",
    stage: "tier1",
    prompt: "Does the sponsor require cost share for this proposal?",
    helpText:
      "If cost share is not required, any cost share is voluntary and typically should be contained within the PI/Department.",
    choices: [
      { label: "No (voluntary only)", value: "no", next: "q_voluntaryReason" },
      { label: "Yes (sponsor-required)", value: "yes", next: "q_requiredPercentBand" },
      { label: "Not sure / unclear", value: "unknown", next: "o_needSponsorClarification" },
    ],
  },

  q_voluntaryReason: {
    type: "question",
    id: "q_voluntaryReason",
    stage: "tier1",
    prompt: "If cost share is not required, why are you considering including it?",
    choices: [
      { label: "PI insists / competitiveness", value: "pi_insists", next: "o_voluntary_piDept" },
      { label: "Sponsor suggests but does not require", value: "suggested", next: "o_voluntary_piDept" },
      { label: "Not sure", value: "unknown", next: "o_voluntary_reviewNeeded" },
    ],
  },

  // Tier 2
  q_requiredPercentBand: {
    type: "question",
    id: "q_requiredPercentBand",
    stage: "tier2",
    prompt: "What is the sponsor-required cost share percentage?",
    helpText:
      "Institutional handling can vary by percentage and by sponsor constraints. Use the sponsor’s RFP/terms as the source of truth.",
    choices: [
      { label: "≤ 20%", value: "le20", next: "q_categorySpecific" },
      { label: "> 20%", value: "gt20", next: "o_escalate_over20" },
      { label: "A specific % but I don’t know the policy handling", value: "unknown_policy", next: "o_needPolicyDecision" },
      { label: "Not sure / unclear", value: "unknown", next: "o_needSponsorClarification" },
    ],
  },

  q_categorySpecific: {
    type: "question",
    id: "q_categorySpecific",
    stage: "tier2",
    prompt: "Is the sponsor-required cost share limited to specific budget categories (e.g., PI effort only)?",
    choices: [
      { label: "No (applies broadly)", value: "no", next: "q_matchingSources" },
      { label: "Yes (category-specific)", value: "yes", next: "o_categorySpecific_escalate" },
      { label: "Not sure", value: "unknown", next: "o_needSponsorClarification" },
    ],
  },

  // Tier 3
  q_matchingSources: {
    type: "question",
    id: "q_matchingSources",
    stage: "tier3",
    prompt: "Which matching sources are available (select the best fit)?",
    helpText:
      "This tool provides a recommended plan. Actual commitments may require confirmation by the relevant units.",
    choices: [
      { label: "PI effort / salary support and/or Department funds are available", value: "pi_dept", next: "q_thirdPartyAllowed" },
      { label: "College/School match is available", value: "college", next: "q_thirdPartyAllowed" },
      { label: "Central administration / research office match is available", value: "central", next: "q_thirdPartyAllowed" },
      { label: "Unsure which sources are available", value: "unknown", next: "o_sources_unknown" },
    ],
  },

  q_thirdPartyAllowed: {
    type: "question",
    id: "q_thirdPartyAllowed",
    stage: "tier3",
    prompt: "Is third-party cost share/match allowed and feasible for this sponsor?",
    choices: [
      { label: "No / not applicable", value: "no", next: "q_budgetDistortion" },
      { label: "Yes", value: "yes", next: "o_thirdParty_review" },
      { label: "Not sure", value: "unknown", next: "o_needSponsorClarification" },
    ],
  },

  // Tier 4
  q_budgetDistortion: {
    type: "question",
    id: "q_budgetDistortion",
    stage: "tier4",
    prompt: "Will cost share meaningfully affect the sponsor budget or F&A calculations (i.e., require iterative rebalancing)?",
    helpText:
      "Cost share can change total project cost, sponsor share, and the F&A base. If the numbers are sensitive, treat as complex and coordinate early.",
    choices: [
      { label: "No (straightforward)", value: "no", next: "o_required_le20_standardSplit" },
      { label: "Yes (complex/iterative)", value: "yes", next: "o_budgetImpact_iterative" },
      { label: "Not sure", value: "unknown", next: "o_budgetImpact_iterative" },
    ],
  },

  // Outcomes
  o_voluntary_piDept: {
    type: "outcome",
    id: "o_voluntary_piDept",
    title: "Voluntary cost share: keep commitments contained",
    recommendation: "If cost share is not sponsor-required, it should generally be covered by the PI/Department.",
    nextSteps: [
      "Confirm cost share is truly voluntary (check sponsor terms/RFP).",
      "Document the rationale for including voluntary cost share (if used).",
      "Identify PI effort/salary and/or Department funds to cover the commitment.",
      "Ensure the budget narrative clearly describes the voluntary commitment and source.",
    ],
    escalationNotes: [
      "Avoid unintentionally obligating higher-level units when cost share is not required.",
    ],
    policyNotes: [
      "Voluntary cost share is typically discouraged; include only when justified.",
    ],
  },

  o_voluntary_reviewNeeded: {
    type: "outcome",
    id: "o_voluntary_reviewNeeded",
    title: "Voluntary cost share: review before committing",
    recommendation:
      "Because the reason for voluntary cost share is unclear, review sponsor guidance and internal expectations before committing.",
    nextSteps: [
      "Verify sponsor language (required vs. suggested vs. optional).",
      "Discuss with PI why cost share is being considered.",
      "If still voluntary, plan to contain the commitment within PI/Department sources.",
    ],
    escalationNotes: ["If internal approval is required for voluntary commitments, route accordingly."],
    policyNotes: [],
  },

  o_required_le20_standardSplit: {
    type: "outcome",
    id: "o_required_le20_standardSplit",
    title: "Sponsor-required cost share (≤ 20%): apply standard split",
    recommendation:
      "For sponsor-required cost share at or below 20%, apply the standard 1/3–1/3–1/3 split unless an exception applies.",
    nextSteps: [
      "Confirm the required cost share percentage in the sponsor terms.",
      "Draft a proposed split: PI/Department (33.3%), College/School (33.3%), Central/Research Office (33.3%).",
      "Confirm each unit’s ability to commit (effort/salary, funds, match programs).",
      "Build the draft budget and verify the sponsor share still meets all rules.",
    ],
    escalationNotes: [
      "If any unit cannot commit, identify alternate sources or escalate for match program support.",
    ],
    policyNotes: [
      "Some sponsors restrict what can count as match; confirm allowability early.",
    ],
  },

  o_escalate_over20: {
    type: "outcome",
    id: "o_escalate_over20",
    title: "Sponsor-required cost share (> 20%): escalate for approval",
    recommendation:
      "Cost share above 20% should be escalated to the appropriate approving office (e.g., Dean’s office / Research Office) before committing.",
    nextSteps: [
      "Confirm the required percentage and any caps/constraints from the sponsor.",
      "Prepare a preliminary budget showing sponsor share vs. cost share share.",
      "Request approval and identify match sources beyond PI/Department as needed.",
      "Document the final approved split and sources in proposal records.",
    ],
    escalationNotes: [
      "High cost share levels can create unsustainable commitments; approval protects units and the institution.",
    ],
    policyNotes: [],
  },

  o_sources_unknown: {
    type: "outcome",
    id: "o_sources_unknown",
    title: "Matching sources unclear: identify commitments before final budget",
    recommendation:
      "Before finalizing the proposal budget, identify which units will cover cost share and confirm allowability and availability.",
    nextSteps: [
      "Ask PI/Department to identify potential sources (effort, salary, discretionary funds).",
      "Consult College/School and central match programs for availability.",
      "Confirm sponsor allowability (including whether third-party match is allowed).",
    ],
    escalationNotes: ["If match cannot be identified, escalate early to avoid last-minute budget issues."],
    policyNotes: [],
  },

  o_needSponsorClarification: {
    type: "outcome",
    id: "o_needSponsorClarification",
    title: "Clarify sponsor requirements first",
    recommendation:
      "Sponsor cost share requirements are unclear. Confirm the requirement and calculation basis before committing any cost share.",
    nextSteps: [
      "Locate the sponsor’s authoritative guidance (RFP/terms).",
      "Confirm whether cost share is required, and if so, the required percentage and basis.",
      "Confirm any restrictions (category-specific match, third-party match, caps).",
      "Return to this decision tool once requirements are confirmed.",
    ],
    escalationNotes: [],
    policyNotes: [],
  },

  o_needPolicyDecision: {
    type: "outcome",
    id: "o_needPolicyDecision",
    title: "Policy handling needed for this percentage",
    recommendation:
      "The sponsor’s required percentage is known, but the institutional handling is not defined here. Coordinate with the appropriate office for the approved approach.",
    nextSteps: [
      "Confirm sponsor-required percentage and how it is calculated.",
      "Consult internal guidance for handling non-standard percentages.",
      "If needed, seek approval from College/School or central office before committing.",
    ],
    escalationNotes: ["Route to the office that owns cost share policy/approvals for guidance."],
    policyNotes: [],
  },

  o_categorySpecific_escalate: {
    type: "outcome",
    id: "o_categorySpecific_escalate",
    title: "Category-specific cost share: coordinate early",
    recommendation:
      "When cost share is limited to specific categories (e.g., PI effort only), the budget approach can be nuanced and should be coordinated early.",
    nextSteps: [
      "Confirm exactly which categories are subject to match and any caps/limits.",
      "Coordinate with unit approvers to identify allowable sources for those categories.",
      "Build a draft budget and verify compliance with sponsor rules.",
    ],
    escalationNotes: ["Consider escalating to the research office if interpretation is unclear."],
    policyNotes: [],
  },

  o_thirdParty_review: {
    type: "outcome",
    id: "o_thirdParty_review",
    title: "Third-party match: validate allowability and documentation",
    recommendation:
      "Third-party cost share can be an option only if allowed by the sponsor and supported by clear documentation.",
    nextSteps: [
      "Confirm the sponsor allows third-party cost share and what documentation is required.",
      "Identify the third-party source and obtain written commitment/valuation documentation.",
      "Ensure the budget and justification clearly describe the third-party contribution.",
    ],
    escalationNotes: ["If third-party valuation is complex, coordinate with the appropriate office early."],
    policyNotes: [],
  },

  o_budgetImpact_iterative: {
    type: "outcome",
    id: "o_budgetImpact_iterative",
    title: "Budget impact: plan for iterative recalculation",
    recommendation:
      "Cost share can change sponsor share, totals, and F&A calculations. Treat this as a budgeting exercise that may require iteration until the numbers stabilize.",
    nextSteps: [
      "Set the sponsor-required percentage and calculate an initial cost share amount.",
      "Recalculate sponsor portion and F&A impact.",
      "Check totals still meet sponsor rules; adjust and repeat until stable.",
      "Document assumptions and final values used in the proposal budget.",
    ],
    escalationNotes: [
      "If the budget is sensitive or time is short, coordinate early with the research office or experienced budget support.",
    ],
    policyNotes: [],
  },
};

export const START_NODE_ID = "q_requiresCostShare";

