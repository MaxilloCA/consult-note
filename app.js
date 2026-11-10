'use strict';
// Only static phrase options are extracted from cnote.htm. No production runtime is loaded.
const SECTIONS = [
  ['History', [['Accompanied','Accompanied by',true],['ReferralType','Referral'],['CC','Chief concern',true],['Info_History_CC','History details','text'],['ASA','ASA classification'],['Brodsky','Brodsky classification'],['Info_History_ASA','Medical history notes','text']]],
  ['Examination', [['ExamLoc','Exam location'],['Rads','Radiographs',true],['Scale','Behavior'],['Info_Exam_Bx','Examination / behavior notes','text']]],
  ['Diagnosis', [['Dx','General diagnosis',true],['DxSpecifics','Specific findings',true],['Info_Dx','Diagnosis notes','text'],['CRA','Caries risk / counseling',true],['Habits','Habits']]],
  ['Treatment plan', [['TxMod','Treatment modality / discussion',true],['TxSpecifics','Treatment specifics',true],['Info_Tx','Treatment and consent discussion notes','text']]],
  ['Next visit', [['NV','Next visit'],['Units','Units']]]
];
const TREATMENT_FIELDS = ['TxMod', 'TxSpecifics'];
const HISTORY_PHRASES = [
  ['No pain', 'guardian reports no pain'],
  ['No radiographs', 'no radiographs taken'],
  ['No treatment', 'no treatment attempted'],
  ['Referral radiographs', 'radiographs from referral'],
  ['Pain at night', 'pain at night'],
  ['Pain with chewing or brushing', 'pain off and on to chew and brush'],
];
const TREATMENT_LABELS = new Map([
  ['Caries control - long term temporary restorations to control decay that may in time need to be replaced', 'Caries Control'],
  ['Pit and Fissure Sealants for healthy teeth at risk for decay', 'Sealants'],
]);
function choiceLabel(option) {
  if (option.startsWith('Parent(s) was advised that should new decay develop')) return 'CDCP timeout considerations';
  return TREATMENT_LABELS.get(option) || option;
}
function emptyState() {
  const state = { treatmentDetails: { TxMod: {}, TxSpecifics: {} } };
  for (const [, fields] of SECTIONS) for (const [key,, kind] of fields) state[key] = kind === true ? [] : '';
  return state;
}
function buildNote(state) {
  const lines = [];
  for (const [section, fields] of SECTIONS) {
    const entries = [];
    for (const [key, label] of fields) {
      let value = state[key];
      if (Array.isArray(value)) {
        if (key === 'Accompanied') {
          value = value.filter(v => v !== 'Foster').map(v => state.Accompanied.includes('Foster') && v !== 'none - Patient alone' ? `Foster ${v}` : v).join(', ');
        } else if (TREATMENT_FIELDS.includes(key)) {
          value = value.map(option => {
            const detail = state.treatmentDetails?.[key]?.[option]?.trim();
            return detail ? `${option} | ${detail}` : option;
          }).join('\n');
        } else {
          value = value.join(' | ');
        }
      }
      if (String(value || '').trim()) entries.push(`${label}: ${String(value).trim()}`);
    }
    if (entries.length) lines.push(section.toUpperCase(), ...entries, '');
  }
  return lines.join('\n').trim();
}
function toggleChoice(state, key, option, multi) {
  if (!multi) return { ...state, [key]: state[key] === option ? '' : option };
  let values = state[key].includes(option) ? state[key].filter(v => v !== option) : [...state[key], option];
  if (key === 'Accompanied') {
    if (option === 'none - Patient alone' && values.includes(option)) values = [option];
    else if (option !== 'none - Patient alone') values = values.filter(v => v !== 'none - Patient alone');
    if (!values.some(v => v !== 'Foster')) values = [];
  }
  return { ...state, [key]: values };
}
function demoState(options) {
  return { ...emptyState(), Accompanied:['Parent'], ReferralType:'Self Referred', CC:['Routine Dental Care'], Info_History_CC:'SYNTHETIC EXAMPLE — invented consultation; no real patient.', ExamLoc:'In chair', Rads:['NO RADS taken'], Dx:['No Decay'], Info_Dx:'Example findings for interface demonstration only.', NV:'Recare in-office' };
}
function needsDiscardConfirmation(state, preview) {
  return String(preview) !== buildNote(state);
}
if (typeof module !== 'undefined') module.exports = { SECTIONS, emptyState, buildNote, toggleChoice, demoState, needsDiscardConfirmation };
if (typeof document !== 'undefined') start();
async function start() {
  const status = document.getElementById('status');
  try {
    const response = await fetch('./template-options.json');
    if (!response.ok) throw new Error('Template unavailable');
    const options = await response.json();
    let state = emptyState();
    const form = document.getElementById('form');
    const preview = document.getElementById('preview');
    function allowRebuild() { return !needsDiscardConfirmation(state, preview.value) || window.confirm('This change will rebuild the draft and discard your direct preview edits. Continue?'); }
    function allowReset() { return (!preview.value.trim() && !buildNote(state)) || window.confirm('Replace the current draft? Any selections and edits will be discarded.'); }
    function updatePreview() { preview.value = buildNote(state); status.textContent = 'Draft updated · review before copying'; }
    function render() {
      form.replaceChildren();
      for (const [title, fields] of SECTIONS) {
        const section = document.createElement('section'); section.className = 'section';
        const heading = document.createElement('h2'); heading.textContent = title; section.append(heading);
        for (const [key,label,kind] of fields) {
          const field = document.createElement('div'); field.className = 'field';
          if (kind === 'text') {
            const caption = document.createElement('label'); caption.htmlFor = key; caption.textContent = label;
            const input = document.createElement('textarea'); input.id = key; input.value = state[key];
            const phraseButtons = [];
            const historyEntries = () => state[key].split(',').map(value => value.trim()).filter(Boolean);
            function updatePhraseButtons() {
              const entries = historyEntries();
              for (const [button, phrase] of phraseButtons) {
                button.setAttribute('aria-pressed', String(entries.includes(phrase)));
              }
            }
            input.addEventListener('input', () => {
              if (!allowRebuild()) {
                input.value = state[key];
                return;
              }
              state[key] = input.value;
              if (phraseButtons.length) updatePhraseButtons();
              updatePreview();
            });
            field.append(caption,input);
            if (key === 'Info_History_CC') {
              const choices = document.createElement('div');
              choices.className = 'choices';
              choices.setAttribute('role', 'group');
              choices.setAttribute('aria-label', 'History detail phrases');
              for (const [label, phrase] of HISTORY_PHRASES) {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'choice';
                button.textContent = label;
                button.addEventListener('click', () => {
                  if (!allowRebuild()) return;
                  const entries = historyEntries();
                  const active = entries.includes(phrase);
                  state[key] = active
                    ? entries.filter(value => value !== phrase).join(', ')
                    : [state[key].trim().replace(/,+$/, ''), phrase].filter(Boolean).join(', ');
                  input.value = state[key];
                  updatePhraseButtons();
                  updatePreview();
                });
                phraseButtons.push([button, phrase]);
                choices.append(button);
              }
              field.append(choices);
              updatePhraseButtons();
            }
          } else {
            const set = document.createElement('fieldset'); const legend = document.createElement('legend'); legend.textContent = label; set.append(legend);
            const choices = document.createElement('div'); choices.className = 'choices';
            const withDetails = TREATMENT_FIELDS.includes(key);
            if (withDetails) choices.classList.add('treatment-choices');
            for (const option of options[key]) {
              const button = document.createElement('button'); button.type = 'button'; button.className = 'choice'; button.textContent = choiceLabel(option);
              const active = kind === true ? state[key].includes(option) : state[key] === option;
              button.setAttribute('aria-pressed',String(active));
              button.disabled = key === 'Accompanied' && option === 'Foster' && !state.Accompanied.some(v => v !== 'Foster' && v !== 'none - Patient alone');
              button.addEventListener('click', () => {
                if (!allowRebuild()) return;
                state = toggleChoice(state, key, option, kind === true);
                render();
                const group = document.getElementById(key);
                const nextButton = group.querySelectorAll('button')[options[key].indexOf(option)];
                const nextInput = withDetails && nextButton.nextElementSibling;
                (nextInput || nextButton).focus();
              });
              if (withDetails) {
                const row = document.createElement('div');
                row.className = 'treatment-choice';
                row.append(button);
                if (active) {
                  const input = document.createElement('input');
                  input.type = 'text';
                  input.autocomplete = 'off';
                  input.placeholder = 'Add detail (optional)';
                  input.setAttribute('aria-label', `Detail for ${choiceLabel(option)}`);
                  const details = state.treatmentDetails[key];
                  input.value = details[option] || '';
                  input.addEventListener('input', () => {
                    if (!allowRebuild()) {
                      input.value = details[option] || '';
                      return;
                    }
                    details[option] = input.value;
                    updatePreview();
                  });
                  row.append(input);
                }
                choices.append(row);
              } else {
                choices.append(button);
              }
            }
            choices.id = key; set.append(choices); field.append(set);
          }
          section.append(field);
        }
        form.append(section);
      }
      updatePreview();
    }
    document.getElementById('clear').addEventListener('click', () => { if (!allowReset()) return; state = emptyState(); render(); status.textContent = 'Draft cleared'; });
    document.getElementById('demo').addEventListener('click', () => { if (!allowReset()) return; state = demoState(options); render(); status.textContent = 'Synthetic example loaded'; });
    document.getElementById('copy').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(preview.value); status.textContent = 'Draft copied · clipboard is outside this app'; }
      catch { preview.focus(); preview.select(); status.textContent = 'Clipboard unavailable. Press Ctrl/Cmd+C to copy the selected draft.'; }
    });
    render(); status.textContent = 'Blank draft · select only confirmed findings';
  } catch { status.textContent = 'Unable to load template. Start the local server using npm start.'; }
}
