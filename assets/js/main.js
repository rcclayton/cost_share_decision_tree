import { NODES, START_NODE_ID, STAGES } from "./questions.js";

const $ = (sel) => /** @type {HTMLElement} */ (document.querySelector(sel));

const els = {
  stepperList: /** @type {HTMLOListElement} */ ($("#stepperList")),
  prompt: /** @type {HTMLHeadingElement} */ ($("#questionPrompt")),
  help: /** @type {HTMLParagraphElement} */ ($("#questionHelp")),
  form: /** @type {HTMLFormElement} */ ($("#choicesForm")),
  backBtn: /** @type {HTMLButtonElement} */ ($("#backBtn")),
  nextBtn: /** @type {HTMLButtonElement} */ ($("#nextBtn")),
  restartBtn: /** @type {HTMLButtonElement} */ ($("#restartBtn")),
};

/** @typedef {{nodeId: string, choiceValue: string, choiceLabel: string, stage: string}} Answer */

/** @type {{ currentNodeId: string, history: string[], answers: Answer[] }} */
const state = {
  currentNodeId: START_NODE_ID,
  history: [],
  answers: [],
};

function buildStepper() {
  els.stepperList.innerHTML = "";
  for (const s of STAGES) {
    const li = document.createElement("li");
    li.className = "step";
    li.dataset.stage = s.id;

    const dot = document.createElement("span");
    dot.className = "stepDot";
    dot.setAttribute("aria-hidden", "true");

    const label = document.createElement("span");
    label.className = "stepLabel";
    label.textContent = s.label;

    li.append(dot, label);
    els.stepperList.append(li);
  }
}

function stageIndex(stageId) {
  const idx = STAGES.findIndex((s) => s.id === stageId);
  return idx < 0 ? 0 : idx;
}

function updateStepper(activeStageId) {
  const activeIdx = stageIndex(activeStageId);
  const items = [...els.stepperList.querySelectorAll(".step")];
  items.forEach((li, i) => {
    li.classList.toggle("isActive", i === activeIdx);
    li.classList.toggle("isComplete", i < activeIdx);
  });
}

function setHelpText(text) {
  if (text && text.trim().length > 0) {
    els.help.hidden = false;
    els.help.textContent = text;
  } else {
    els.help.hidden = true;
    els.help.textContent = "";
  }
}

function renderQuestion(node) {
  updateStepper(node.stage);
  els.prompt.textContent = node.prompt;
  setHelpText(node.helpText);

  els.form.innerHTML = "";

  const groupId = `q_${node.id}`;
  els.form.setAttribute("role", "radiogroup");
  els.form.setAttribute("aria-labelledby", "questionPrompt");

  const prior = state.answers.findLast?.((a) => a.nodeId === node.id) ?? state.answers.filter((a) => a.nodeId === node.id).slice(-1)[0];
  const preselectedValue = prior?.choiceValue ?? null;

  node.choices.forEach((c, idx) => {
    const optionId = `${groupId}_${idx}`;

    const label = document.createElement("label");
    label.className = "choiceCard";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = groupId;
    input.value = c.value;
    input.id = optionId;
    input.className = "choiceInput";
    input.checked = preselectedValue === c.value;

    const radio = document.createElement("span");
    radio.className = "choiceRadio";
    radio.setAttribute("aria-hidden", "true");

    const text = document.createElement("span");
    text.className = "choiceText";
    text.textContent = c.label;

    label.append(input, radio, text);
    els.form.append(label);
  });

  // Fallback for browsers without :has() support: toggle a class on the selected card.
  const applySelectedClasses = () => {
    const cards = [...els.form.querySelectorAll(".choiceCard")];
    cards.forEach((card) => {
      const input = card.querySelector("input");
      card.classList.toggle("isSelected", Boolean(input && input.checked));
    });
  };
  applySelectedClasses();

  els.nextBtn.textContent = "Next";
  els.nextBtn.disabled = !getSelectedChoiceValue(node.id);
  els.backBtn.disabled = state.history.length === 0;
  els.restartBtn.hidden = true;

  // Ensure keyboard selection updates button state.
  els.form.addEventListener("change", () => {
    els.nextBtn.disabled = !getSelectedChoiceValue(node.id);
    applySelectedClasses();
  });
}

function renderOutcome(node) {
  updateStepper("tier4");
  els.prompt.textContent = node.title;
  setHelpText("");

  els.form.innerHTML = "";
  els.form.removeAttribute("role");
  els.form.removeAttribute("aria-labelledby");

  const rec = document.createElement("div");
  rec.className = "outcome";

  const recommendation = document.createElement("p");
  recommendation.className = "outcomeRecommendation";
  recommendation.textContent = node.recommendation;
  rec.append(recommendation);

  rec.append(renderSummary());
  rec.append(renderListSection("Next steps", node.nextSteps));
  if (node.escalationNotes?.length) rec.append(renderListSection("Escalation notes", node.escalationNotes));
  if (node.policyNotes?.length) rec.append(renderListSection("Policy notes", node.policyNotes));

  els.form.append(rec);

  els.nextBtn.textContent = "Done";
  els.nextBtn.disabled = false;
  els.backBtn.disabled = state.history.length === 0;
  els.restartBtn.hidden = false;
}

function renderSummary() {
  const wrap = document.createElement("section");
  wrap.className = "summary";

  const h = document.createElement("h3");
  h.className = "summaryTitle";
  h.textContent = "Summary of your answers";
  wrap.append(h);

  const dl = document.createElement("dl");
  dl.className = "summaryList";

  const answers = state.answers;
  for (const a of answers) {
    const node = NODES[a.nodeId];
    if (!node || node.type !== "question") continue;

    const dt = document.createElement("dt");
    dt.textContent = node.prompt;
    const dd = document.createElement("dd");
    dd.textContent = a.choiceLabel;
    dl.append(dt, dd);
  }

  wrap.append(dl);
  return wrap;
}

function renderListSection(title, items) {
  const sec = document.createElement("section");
  sec.className = "section";

  const h = document.createElement("h3");
  h.className = "sectionTitle";
  h.textContent = title;
  sec.append(h);

  const ul = document.createElement("ul");
  ul.className = "bullets";
  for (const it of items ?? []) {
    const li = document.createElement("li");
    li.textContent = it;
    ul.append(li);
  }
  sec.append(ul);
  return sec;
}

function getSelectedChoiceValue(nodeId) {
  const groupId = `q_${nodeId}`;
  const selected = /** @type {HTMLInputElement|null} */ (els.form.querySelector(`input[name="${groupId}"]:checked`));
  return selected?.value ?? null;
}

function getSelectedChoiceLabel(nodeId, value) {
  const node = NODES[nodeId];
  const found = node?.choices?.find((c) => c.value === value);
  return found?.label ?? value ?? "";
}

function answerCurrentQuestionAndAdvance() {
  const node = NODES[state.currentNodeId];
  if (!node || node.type !== "question") return;

  const selectedValue = getSelectedChoiceValue(node.id);
  if (!selectedValue) return;

  const selectedChoice = node.choices.find((c) => c.value === selectedValue);
  if (!selectedChoice) return;

  // Record answer (replace any previous answer for this node).
  state.answers = state.answers.filter((a) => a.nodeId !== node.id);
  state.answers.push({
    nodeId: node.id,
    choiceValue: selectedValue,
    choiceLabel: selectedChoice.label,
    stage: node.stage,
  });

  state.history.push(state.currentNodeId);
  state.currentNodeId = selectedChoice.next;
  render();
  focusPrompt();
}

function goBack() {
  if (state.history.length === 0) return;
  const prev = state.history.pop();
  state.currentNodeId = prev;
  render();
  focusPrompt();
}

function restart() {
  state.currentNodeId = START_NODE_ID;
  state.history = [];
  state.answers = [];
  render();
  focusPrompt();
}

function focusPrompt() {
  els.prompt.setAttribute("tabindex", "-1");
  els.prompt.focus({ preventScroll: false });
  // Remove tabindex after focus to keep DOM clean.
  setTimeout(() => els.prompt.removeAttribute("tabindex"), 0);
}

function render() {
  const node = NODES[state.currentNodeId];
  if (!node) {
    // Fallback if data is miswired.
    renderOutcome({
      title: "Something went wrong",
      recommendation: "The decision tree could not find the next step.",
      nextSteps: ["Click “Start over” or refresh the page."],
      escalationNotes: [],
      policyNotes: [],
    });
    return;
  }

  if (node.type === "question") renderQuestion(node);
  else renderOutcome(node);
}

function onNext() {
  const node = NODES[state.currentNodeId];
  if (!node) return;

  if (node.type === "question") answerCurrentQuestionAndAdvance();
  else restart();
}

function init() {
  buildStepper();
  render();

  els.nextBtn.addEventListener("click", onNext);
  els.backBtn.addEventListener("click", goBack);
  els.restartBtn.addEventListener("click", restart);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const active = document.activeElement;
      const isRadio = active && active instanceof HTMLInputElement && active.type === "radio";
      // Allow Enter to advance while a radio is focused.
      if (isRadio || active === els.nextBtn) {
        e.preventDefault();
        onNext();
      }
    }
  });
}

init();
