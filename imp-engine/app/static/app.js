const $ = (id) => document.getElementById(id);
let chosenFiles = [];
let currentVoice = null;

// ---- file picking (drag/drop + click) ----
const drop = $("drop"), fileInput = $("file");
drop.onclick = () => fileInput.click();
drop.ondragover = (e) => { e.preventDefault(); drop.classList.add("over"); };
drop.ondragleave = () => drop.classList.remove("over");
drop.ondrop = (e) => { e.preventDefault(); drop.classList.remove("over"); addFiles(e.dataTransfer.files); };
fileInput.onchange = () => addFiles(fileInput.files);
function addFiles(list) {
  for (const f of list) chosenFiles.push(f);
  $("filelist").textContent = chosenFiles.length
    ? `${chosenFiles.length} file(s): ` + chosenFiles.map(f => f.name).join(", ")
    : "";
}

// ---- tone slider ----
const tone = $("tone");
tone.oninput = () => {
  const v = +tone.value;
  $("tonelbl").textContent = v < 40 ? "Subtle" : v < 75 ? "Medium" : "Full voice";
};

// ---- build voice ----
$("build").onclick = async () => {
  $("builderr").textContent = "";
  const fd = new FormData();
  fd.append("name", $("vname").value || "My voice");
  fd.append("text", $("paste").value || "");
  chosenFiles.forEach(f => fd.append("files", f));
  setBusy($("build"), $("buildmsg"), "Reading your writing, measuring fingerprint, building 8 formats… (~20s)");
  try {
    const r = await fetch("/api/voices", { method: "POST", body: fd });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || "build failed");
    await loadVoiceList(j.id);
    await selectVoice(j.id);
    $("buildmsg").textContent = `Built “${j.name}” from ${j.word_count.toLocaleString()} words.`;
  } catch (e) { $("builderr").textContent = e.message; $("buildmsg").textContent = ""; }
  finally { $("build").disabled = false; }
};

// ---- voice list / selection ----
async function loadVoiceList(sel) {
  const r = await fetch("/api/voices"); const v = await r.json();
  const s = $("voicelist");
  s.innerHTML = '<option value="">— new voice —</option>' +
    v.map(x => `<option value="${x.id}">${x.name} (${x.word_count.toLocaleString()}w)</option>`).join("");
  if (sel) s.value = sel;
}
$("voicelist").onchange = () => $("voicelist").value && selectVoice($("voicelist").value);

async function selectVoice(id) {
  const r = await fetch(`/api/voices/${id}`); const v = await r.json();
  if (!r.ok) return;
  currentVoice = v;
  $("vsummary").textContent =
    `“${v.name}” · ${v.word_count.toLocaleString()} words · ${v.passages} passages`;
  const fp = v.fingerprint;
  const cells = [
    ["avg sentence", fp.avg_sentence_length + "w"],
    ["FK grade", fp.flesch_kincaid_grade],
    ["semicolons/1k", fp.semicolons_per_1k],
    ["em-dashes/1k", fp.em_dashes_per_1k],
    ["questions/1k", fp.questions_per_1k],
    ["adj+adv/1k", fp.adj_adv_density_per_1k],
  ];
  $("fp").innerHTML = cells.map(([k, x]) => `<span class="pill">${k}: <b>${x}</b></span>`).join("");
  const order = ["voice_memo", "hybrid", "persona_prompt", "anti_patterns", "rules_list", "trait_vector", "example_pairs", "statistical"];
  $("format").innerHTML = order.filter(k => v.formats[k])
    .map(k => `<option value="${k}">${v.formats[k]}</option>`).join("");
  $("voicecard").classList.remove("hidden");
  $("rewritepanel").classList.remove("hidden");
}

// ---- rewrite ----
$("run").onclick = async () => {
  if (!currentVoice) return;
  $("runerr").textContent = "";
  setBusy($("run"), $("runmsg"), "Filtering through your voice…");
  try {
    const r = await fetch("/api/rewrite", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        voice_id: currentVoice.id, structure: $("format").value,
        draft: $("draft").value, tone: +$("tone").value, content_type: $("ctype").value,
      }),
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || "rewrite failed");
    $("orig").textContent = j.original;
    $("rew").innerHTML = j.diff_html;
    $("result").classList.remove("hidden");
    $("runmsg").textContent = "";
  } catch (e) { $("runerr").textContent = e.message; $("runmsg").textContent = ""; }
  finally { $("run").disabled = false; }
};

function setBusy(btn, msg, text) { btn.disabled = true; msg.textContent = text; }

loadVoiceList();
