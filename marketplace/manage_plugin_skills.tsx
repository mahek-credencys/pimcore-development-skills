import { useState, useMemo } from "react";

const SKILL_PACK = {
  id: "php-symfony-pimcore-expert-v1",
  name: "PHP · Symfony · Pimcore — Expert Pack",
  version: "1.0.0",
  author: "Team Lead",
  created: "2026-03-19",
  defaultLevel: "Expert",
  defaultStatus: "Not started",
  skills: [
    { category: "PHP foundations", skill: "PHP 8.x", detail: "Fibers, match, enums" },
    { category: "PHP foundations", skill: "OOP & SOLID", detail: "Interfaces, DI, patterns" },
    { category: "PHP foundations", skill: "Composer", detail: "Autoloading, versioning" },
    { category: "PHP foundations", skill: "OPcache config", detail: "Preloading, cache tuning" },
    { category: "Symfony core", skill: "Service container", detail: "DI, autowiring, tagging" },
    { category: "Symfony core", skill: "Routing & controllers", detail: "Attributes, param converters" },
    { category: "Symfony core", skill: "Event system", detail: "Subscribers, listeners" },
    { category: "Symfony core", skill: "Lazy services", detail: "Load only on use" },
    { category: "Doctrine ORM", skill: "Entities & mapping", detail: "Attributes, relations" },
    { category: "Doctrine ORM", skill: "QueryBuilder / DQL", detail: "Custom queries" },
    { category: "Doctrine ORM", skill: "Lazy loading", detail: "Avoid N+1, fetch EXTRA_LAZY" },
    { category: "Doctrine ORM", skill: "Migrations", detail: "Schema evolution" },
    { category: "Pimcore", skill: "Data objects", detail: "Classes, bricks, fields" },
    { category: "Pimcore", skill: "Documents & pages", detail: "Editables, areas" },
    { category: "Pimcore", skill: "Datahub / API", detail: "GraphQL, REST" },
    { category: "Pimcore", skill: "Full-page cache", detail: "Output caching" },
    { category: "Superpower skills", skill: "Messenger / queues", detail: "Async, workers, retry" },
    { category: "Superpower skills", skill: "Console commands", detail: "Batch jobs, imports" },
    { category: "Superpower skills", skill: "Custom bundles", detail: "Extend Pimcore core" },
    { category: "Superpower skills", skill: "Security", detail: "Voters, firewalls" },
    { category: "Performance & ops", skill: "Profiling", detail: "Blackfire, Xdebug" },
    { category: "Performance & ops", skill: "Redis caching", detail: "Sessions, cache pools" },
    { category: "Performance & ops", skill: "Elasticsearch", detail: "Search, product listing" },
    { category: "Performance & ops", skill: "CI/CD & Docker", detail: "Deploy, containers" },
    { category: "Testing & DX", skill: "PHPUnit", detail: "Unit & integration" },
    { category: "Testing & DX", skill: "Functional testing", detail: "WebTestCase, BrowserKit" },
    { category: "Testing & DX", skill: "PHPStan / Psalm", detail: "Static analysis" },
    { category: "Testing & DX", skill: "CS Fixer / standards", detail: "Linting, PSR-12" },
  ]
};

const catColors = {
  "PHP foundations": "#534AB7",
  "Symfony core": "#0F6E56",
  "Doctrine ORM": "#854F0B",
  "Pimcore": "#185FA5",
  "Superpower skills": "#993556",
  "Performance & ops": "#993C1D",
  "Testing & DX": "#3B6D11",
};
const catBg = {
  "PHP foundations": "#EEEDFE",
  "Symfony core": "#E1F5EE",
  "Doctrine ORM": "#FAEEDA",
  "Pimcore": "#E6F1FB",
  "Superpower skills": "#FBEAF0",
  "Performance & ops": "#FAECE7",
  "Testing & DX": "#EAF3DE",
};
const categories = [...new Set(SKILL_PACK.skills.map(r => r.category))];
const LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];
const STATUS = ["Not started", "In progress", "Completed"];
const FORMATS = ["JSON", "CSV", "SQL", "YAML"];

function initUserSkills() {
  const m = {};
  SKILL_PACK.skills.forEach(r => {
    m[r.skill] = { level: "Expert", status: "Not started", notes: "", added: true };
  });
  return m;
}

function jsonPack() {
  return JSON.stringify({
    ...SKILL_PACK,
    exportedAt: new Date().toISOString(),
    skills: SKILL_PACK.skills.map(s => ({ ...s, level: "Expert", status: "Not started", notes: "" }))
  }, null, 2);
}

function csvPack() {
  const header = "category,skill,detail,level,status,notes";
  const rows = SKILL_PACK.skills.map(s =>
    `"${s.category}","${s.skill}","${s.detail}","Expert","Not started",""`
  );
  return [header, ...rows].join("\n");
}

function sqlPack() {
  const rows = SKILL_PACK.skills.map(s =>
    `  ('${s.category.replace(/'/g,"\\'")}', '${s.skill.replace(/'/g,"\\'")}', '${s.detail.replace(/'/g,"\\'")}', 'Expert', 'Not started', '')`
  ).join(",\n");
  return `-- Plugin: ${SKILL_PACK.name} v${SKILL_PACK.version}
-- Generated: ${new Date().toISOString()}
-- Install for a user: replace :user_id with actual value

CREATE TABLE IF NOT EXISTS plugin_skills (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  category    VARCHAR(100),
  skill       VARCHAR(100),
  detail      VARCHAR(200),
  level       VARCHAR(50) DEFAULT 'Expert',
  status      VARCHAR(50) DEFAULT 'Not started',
  notes       TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO plugin_skills (category, skill, detail, level, status, notes)
VALUES
${rows};

-- To assign to a specific user, run:
-- UPDATE plugin_skills SET user_id = :user_id WHERE user_id = 0;`;
}

function yamlPack() {
  const skills = SKILL_PACK.skills.map(s =>
    `  - category: "${s.category}"\n    skill: "${s.skill}"\n    detail: "${s.detail}"\n    level: Expert\n    status: Not started\n    notes: ""`
  ).join("\n");
  return `# ${SKILL_PACK.name}
# Version: ${SKILL_PACK.version}
# Generated: ${new Date().toISOString()}

plugin:
  id: ${SKILL_PACK.id}
  name: "${SKILL_PACK.name}"
  version: "${SKILL_PACK.version}"

skills:
${skills}`;
}

function download(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [tab, setTab] = useState("preview");
  const [fmt, setFmt] = useState("JSON");
  const [copied, setCopied] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [userSkills, setUserSkills] = useState(initUserSkills);
  const [search, setSearch] = useState("");
  const [selCat, setSelCat] = useState("All");

  const payload = fmt === "JSON" ? jsonPack() : fmt === "CSV" ? csvPack() : fmt === "SQL" ? sqlPack() : yamlPack();
  const ext = fmt.toLowerCase();
  const mime = fmt === "JSON" ? "application/json" : fmt === "CSV" ? "text/csv" : "text/plain";

  const copy = () => {
    navigator.clipboard.writeText(payload).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const install = () => { setInstalled(true); setTab("installed"); };

  const update = (skill, field, val) =>
    setUserSkills(s => ({ ...s, [skill]: { ...s[skill], [field]: val } }));

  const filtered = useMemo(() => SKILL_PACK.skills.filter(r => {
    const catOk = selCat === "All" || r.category === selCat;
    const q = search.toLowerCase();
    return catOk && (!q || r.skill.toLowerCase().includes(q) || r.detail.toLowerCase().includes(q));
  }), [selCat, search]);

  const completedCount = SKILL_PACK.skills.filter(r => userSkills[r.skill]?.status === "Completed").length;
  const inProgressCount = SKILL_PACK.skills.filter(r => userSkills[r.skill]?.status === "In progress").length;

  const tabs = [
    { id: "preview", label: "Pack preview" },
    { id: "export", label: "Export & share" },
    { id: "install", label: "Install for user" },
    ...(installed ? [{ id: "installed", label: "My skills" }] : []),
  ];

  return (
    <div style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-primary)", paddingBottom: 48 }}>

      {/* Header */}
      <div style={{ background: "var(--color-background-secondary)", borderBottom: "1px solid var(--color-border-tertiary)", padding: "18px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 500 }}>{SKILL_PACK.name}</div>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 3 }}>
              v{SKILL_PACK.version} &nbsp;·&nbsp; {SKILL_PACK.skills.length} skills &nbsp;·&nbsp; {categories.length} categories &nbsp;·&nbsp; Default level: <span style={{ color: "#534AB7", fontWeight: 500 }}>Expert</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["JSON","CSV","SQL","YAML"].map(f => (
              <button key={f} onClick={() => { setFmt(f); setTab("export"); }} style={{
                padding: "4px 10px", borderRadius: 6, border: "1px solid var(--color-border-secondary)",
                background: fmt === f && tab === "export" ? "var(--color-text-primary)" : "transparent",
                color: fmt === f && tab === "export" ? "var(--color-background-primary)" : "var(--color-text-secondary)",
                fontSize: 11, fontWeight: 500, cursor: "pointer"
              }}>{f}</button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 0 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "8px 16px", border: "none", background: "transparent", cursor: "pointer",
              fontSize: 13, fontWeight: tab === t.id ? 500 : 400,
              color: tab === t.id ? "var(--color-text-primary)" : "var(--color-text-secondary)",
              borderBottom: tab === t.id ? "2px solid var(--color-text-primary)" : "2px solid transparent",
              transition: "all 0.15s"
            }}>{t.label}{t.id === "installed" ? ` (${completedCount}/${SKILL_PACK.skills.length})` : ""}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 24px 0" }}>

        {/* PACK PREVIEW */}
        {tab === "preview" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {categories.map(cat => {
                const items = SKILL_PACK.skills.filter(s => s.category === cat);
                return (
                  <div key={cat} style={{ border: `1px solid ${catColors[cat]}33`, borderRadius: 12, overflow: "hidden" }}>
                    <div style={{ background: catBg[cat], padding: "10px 14px", borderBottom: `1px solid ${catColors[cat]}22` }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: catColors[cat] }}>{cat}</span>
                      <span style={{ fontSize: 11, color: catColors[cat], marginLeft: 8, opacity: 0.7 }}>{items.length} skills</span>
                    </div>
                    {items.map(s => (
                      <div key={s.skill} style={{ padding: "8px 14px", borderBottom: "1px solid var(--color-border-tertiary)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{s.skill}</div>
                          <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{s.detail}</div>
                        </div>
                        <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: "#EEEDFE", color: "#534AB7", border: "1px solid #534AB733", whiteSpace: "nowrap", flexShrink: 0 }}>Expert</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
              <button onClick={() => setTab("export")} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "var(--color-text-primary)", color: "var(--color-background-primary)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                Export pack
              </button>
              <button onClick={install} style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid var(--color-border-secondary)", background: "transparent", color: "var(--color-text-primary)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                Install for me
              </button>
            </div>
          </div>
        )}

        {/* EXPORT */}
        {tab === "export" && (
          <div>
            <div style={{ marginBottom: 14, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Format:</span>
              {FORMATS.map(f => (
                <button key={f} onClick={() => setFmt(f)} style={{
                  padding: "5px 14px", borderRadius: 8, border: "1px solid var(--color-border-secondary)",
                  background: fmt === f ? "var(--color-text-primary)" : "transparent",
                  color: fmt === f ? "var(--color-background-primary)" : "var(--color-text-secondary)",
                  fontSize: 12, fontWeight: 500, cursor: "pointer"
                }}>{f}</button>
              ))}
              <button onClick={copy} style={{
                marginLeft: "auto", padding: "6px 16px", borderRadius: 8, border: "1px solid var(--color-border-secondary)",
                background: copied ? "#E1F5EE" : "var(--color-background-secondary)",
                color: copied ? "#0F6E56" : "var(--color-text-primary)",
                fontSize: 13, fontWeight: 500, cursor: "pointer"
              }}>{copied ? "Copied!" : "Copy"}</button>
              <button onClick={() => download(payload, `skill-pack-expert.${ext}`, mime)} style={{
                padding: "6px 16px", borderRadius: 8, border: "none",
                background: "var(--color-text-primary)", color: "var(--color-background-primary)",
                fontSize: 13, fontWeight: 500, cursor: "pointer"
              }}>Download .{ext}</button>
            </div>
            <pre style={{
              background: "var(--color-background-secondary)", border: "1px solid var(--color-border-tertiary)",
              borderRadius: 10, padding: 16, fontSize: 11, lineHeight: 1.6,
              overflowX: "auto", overflowY: "auto", maxHeight: 480,
              color: "var(--color-text-primary)", fontFamily: "var(--font-mono)", whiteSpace: "pre"
            }}>{payload}</pre>
            <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 10, background: "var(--color-background-secondary)", border: "1px solid var(--color-border-tertiary)", fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
              <strong style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>How to share with multiple users:</strong><br />
              1. Download the file above in your preferred format.<br />
              2. Share the file via email, Slack, or your team's wiki/repo.<br />
              3. Each user opens the Manage Plugin section and clicks <em>Install from file</em> (JSON/CSV/YAML) or runs the SQL script against their DB.<br />
              4. All 28 skills will be installed with <strong style={{ color: "#534AB7" }}>Expert</strong> level and <em>Not started</em> status — ready for each user to track their own progress independently.
            </div>
          </div>
        )}

        {/* INSTALL */}
        {tab === "install" && (
          <div>
            <div style={{ padding: "16px 20px", borderRadius: 12, border: "1px solid #1D9E7544", background: "#E1F5EE", marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#085041", marginBottom: 4 }}>One-click install</div>
              <div style={{ fontSize: 13, color: "#0F6E56", lineHeight: 1.7 }}>
                Clicking "Install all skills" below will load all 28 skills at <strong>Expert</strong> level into your personal plugin workspace. Each user runs this independently — progress is tracked separately per user.
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {categories.map(cat => {
                const items = SKILL_PACK.skills.filter(s => s.category === cat);
                return (
                  <div key={cat} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, border: `1px solid ${catColors[cat]}33`, background: catBg[cat] }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: catColors[cat], flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: catColors[cat], flex: 1 }}>{cat}</span>
                    <span style={{ fontSize: 12, color: catColors[cat] }}>{items.length} skills</span>
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "#EEEDFE", color: "#534AB7", border: "1px solid #534AB733" }}>Expert</span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, border: "1px solid var(--color-border-secondary)", background: "var(--color-background-secondary)", marginBottom: 20, fontSize: 13, color: "var(--color-text-secondary)" }}>
              Total: <strong style={{ color: "var(--color-text-primary)", marginLeft: 4 }}>{SKILL_PACK.skills.length} skills</strong>
              <span style={{ margin: "0 6px" }}>·</span>
              <strong style={{ color: "#534AB7" }}>{categories.length} categories</strong>
              <span style={{ margin: "0 6px" }}>·</span>
              Default level: <strong style={{ color: "#534AB7", marginLeft: 4 }}>Expert</strong>
            </div>

            <button onClick={install} style={{
              padding: "11px 28px", borderRadius: 10, border: "none",
              background: installed ? "#1D9E75" : "var(--color-text-primary)",
              color: "var(--color-background-primary)", fontSize: 14, fontWeight: 500, cursor: "pointer"
            }}>
              {installed ? "Installed — view my skills" : `Install all ${SKILL_PACK.skills.length} skills`}
            </button>
          </div>
        )}

        {/* MY SKILLS (post-install tracker) */}
        {tab === "installed" && (
          <div>
            {/* Stats bar */}
            <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              {[
                { label: "Total skills", val: SKILL_PACK.skills.length, color: "#534AB7" },
                { label: "Completed", val: completedCount, color: "#1D9E75" },
                { label: "In progress", val: inProgressCount, color: "#BA7517" },
                { label: "Not started", val: SKILL_PACK.skills.length - completedCount - inProgressCount, color: "var(--color-text-secondary)" },
              ].map(s => (
                <div key={s.label} style={{ flex: 1, minWidth: 100, padding: "12px 16px", borderRadius: 10, border: "1px solid var(--color-border-tertiary)", background: "var(--color-background-secondary)", textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 500, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ height: 6, borderRadius: 6, background: "var(--color-border-tertiary)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(completedCount / SKILL_PACK.skills.length) * 100}%`, background: "#1D9E75", borderRadius: 6, transition: "width 0.4s" }} />
              </div>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
              <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{
                padding: "6px 12px", borderRadius: 8, border: "1px solid var(--color-border-secondary)",
                background: "var(--color-background-secondary)", color: "var(--color-text-primary)", fontSize: 12, outline: "none", width: 170
              }} />
              {["All", ...categories].map(c => (
                <button key={c} onClick={() => setSelCat(c)} style={{
                  padding: "4px 10px", borderRadius: 20, border: "1px solid",
                  borderColor: selCat === c ? (catColors[c] || "var(--color-text-primary)") : "var(--color-border-tertiary)",
                  background: selCat === c ? (catBg[c] || "var(--color-background-secondary)") : "transparent",
                  color: selCat === c ? (catColors[c] || "var(--color-text-primary)") : "var(--color-text-secondary)",
                  fontSize: 11, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap"
                }}>{c}</button>
              ))}
            </div>

            {/* Skill rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {filtered.map(r => {
                const s = userSkills[r.skill];
                const statusColor = s.status === "Completed" ? "#1D9E75" : s.status === "In progress" ? "#BA7517" : "var(--color-text-tertiary)";
                return (
                  <div key={r.skill} style={{
                    border: "1px solid var(--color-border-tertiary)", borderRadius: 10,
                    padding: "10px 14px", background: "var(--color-background-secondary)"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{r.skill}</span>
                        <span style={{ fontSize: 11, color: "var(--color-text-secondary)", marginLeft: 8 }}>{r.detail}</span>
                      </div>
                      <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: catBg[r.category], color: catColors[r.category], border: `1px solid ${catColors[r.category]}33`, whiteSpace: "nowrap" }}>{r.category}</span>
                      <select value={s.level} onChange={e => update(r.skill, "level", e.target.value)} style={{
                        fontSize: 11, padding: "3px 8px", borderRadius: 6, border: "1px solid var(--color-border-secondary)",
                        background: "var(--color-background-primary)", color: "var(--color-text-primary)", cursor: "pointer"
                      }}>
                        {LEVELS.map(l => <option key={l}>{l}</option>)}
                      </select>
                      <select value={s.status} onChange={e => update(r.skill, "status", e.target.value)} style={{
                        fontSize: 11, padding: "3px 8px", borderRadius: 6, border: "1px solid var(--color-border-secondary)",
                        background: "var(--color-background-primary)", color: "var(--color-text-primary)", cursor: "pointer"
                      }}>
                        {STATUS.map(st => <option key={st}>{st}</option>)}
                      </select>
                    </div>
                    <textarea placeholder="Notes..." value={s.notes} onChange={e => update(r.skill, "notes", e.target.value)} rows={1}
                      style={{
                        marginTop: 8, width: "100%", fontSize: 11, padding: "5px 10px", borderRadius: 6,
                        border: "1px solid var(--color-border-tertiary)", background: "var(--color-background-primary)",
                        color: "var(--color-text-primary)", resize: "vertical", fontFamily: "var(--font-sans)", boxSizing: "border-box"
                      }} />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
