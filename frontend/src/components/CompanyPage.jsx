import { useEffect, useState } from "react";

const createDefaultButtons = () => [
  {
    id: "default-button",
    label: "Explore Assets",
    link: "/explore",
    textColor: "#0f1724",
    backgroundColor: "#ffffff"
  }
];

const pageContent = {
  about: {
    title: "About GFXunlimit",
    eyebrow: "Trusted by creators, agencies, and global brands",
    intro:
      "GFXunlimit is a premium digital marketplace built for teams that need striking visuals, fast delivery, and reliable licensing. We combine curated content with a polished contributor experience so every asset feels professional and production-ready.",
    highlights: [
      "Curated collections for marketing, web, editorial, and product storytelling",
      "A global contributor network with strict quality standards",
      "Flexible access for businesses that need consistent visual output"
    ],
    stats: [
      { label: "Assets curated", value: "50K+" },
      { label: "Active contributors", value: "2.5K" },
      { label: "Global clients", value: "1.2K" }
    ],
    footerTitle: "Built for ambitious brands",
    heroImage: null,
    buttons: createDefaultButtons()
  },
  pricing: {
    title: "Simple pricing for every team",
    eyebrow: "Choose a plan that grows with your workflow",
    intro:
      "Whether you are a solo creator or a large marketing team, our pricing is designed to stay transparent, flexible, and simple. Start small and scale without friction.",
    highlights: [
      "Starter access for independent creators and freelancers",
      "Team plans with shared libraries and prioritized support",
      "Enterprise licensing for high-volume campaigns and multi-brand use"
    ],
    stats: [
      { label: "Starter", value: "$19/mo" },
      { label: "Team", value: "$99/mo" },
      { label: "Enterprise", value: "Custom" }
    ],
    footerTitle: "No hidden fees. No surprises.",
    heroImage: null,
    buttons: createDefaultButtons()
  },
  careers: {
    title: "Join the team at GFXunlimit",
    eyebrow: "Build the next generation of creative infrastructure",
    intro:
      "We are hiring world-class designers, developers, operations specialists, and community builders who want to shape the future of digital content creation.",
    highlights: [
      "Remote-first culture with global collaboration",
      "High-impact roles across product, engineering, and content",
      "Competitive compensation, mentorship, and growth opportunities"
    ],
    stats: [
      { label: "Open roles", value: "18" },
      { label: "Remote teams", value: "8" },
      { label: "Growth path", value: "Fast" }
    ],
    footerTitle: "Bring your talent to a company that scales with purpose.",
    heroImage: null,
    buttons: createDefaultButtons()
  },
  contact: {
    title: "Contact GFXunlimit",
    eyebrow: "Let's talk about your next creative launch",
    intro:
      "Need help choosing a plan, onboarding your team, or learning more about our marketplace? Reach out to our team and we will guide you through the right next step.",
    highlights: [
      "Email: hello@gfxunlimit.com",
      "Phone: +1 (800) 555-0148",
      "Hours: Mon–Fri, 8:00 AM to 6:00 PM UTC"
    ],
    stats: [
      { label: "Response time", value: "< 1 hr" },
      { label: "Support channels", value: "Email + Chat" },
      { label: "Coverage", value: "24/7" }
    ],
    footerTitle: "We are ready when you are.",
    heroImage: null,
    buttons: createDefaultButtons()
  }
};

const cloneContent = (source) => ({
  ...source,
  highlights: [...(source.highlights || [])],
  stats: (source.stats || []).map((item) => ({ ...item })),
  buttons: (source.buttons || []).map((button) => ({ ...button }))
});

const getStoredPageContent = (slug) => {
  try {
    const raw = localStorage.getItem("company-page-content");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.[slug] || null;
  } catch (err) {
    console.error("Failed to load company page content", err);
    return null;
  }
};

const buildContentState = (slug) => {
  const baseContent = pageContent[slug] || pageContent.about;
  const savedContent = getStoredPageContent(slug);
  const merged = savedContent ? { ...baseContent, ...savedContent } : baseContent;
  return cloneContent({
    ...merged,
    highlights: savedContent?.highlights || baseContent.highlights || [],
    stats: savedContent?.stats || baseContent.stats || [],
    buttons: savedContent?.buttons || baseContent.buttons || createDefaultButtons(),
    heroImage: savedContent?.heroImage || baseContent.heroImage || null
  });
};

export default function CompanyPage({ slug = "about" }) {
  const [content, setContent] = useState(() => buildContentState(slug));
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    setContent(buildContentState(slug));
  }, [slug]);

  const isAdmin = typeof window !== "undefined" && !!localStorage.getItem("token") && String(localStorage.getItem("userRole") || "").toLowerCase() === "admin";

  const handleFieldChange = (field, value) => {
    setContent((prev) => ({ ...prev, [field]: value }));
  };

  const handleHighlightsChange = (value) => {
    const nextHighlights = value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    setContent((prev) => ({ ...prev, highlights: nextHighlights }));
  };

  const handleStatChange = (index, field, value) => {
    setContent((prev) => ({
      ...prev,
      stats: prev.stats.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item))
    }));
  };

  const handleButtonChange = (index, field, value) => {
    setContent((prev) => ({
      ...prev,
      buttons: prev.buttons.map((button, buttonIndex) => (buttonIndex === index ? { ...button, [field]: value } : button))
    }));
  };

  const addButton = () => {
    setContent((prev) => ({
      ...prev,
      buttons: [
        ...prev.buttons,
        {
          id: `button-${Date.now()}`,
          label: "New Button",
          link: "/",
          textColor: "#ffffff",
          backgroundColor: "#2563eb"
        }
      ]
    }));
  };

  const removeButton = (index) => {
    setContent((prev) => ({
      ...prev,
      buttons: prev.buttons.filter((_, buttonIndex) => buttonIndex !== index)
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setContent((prev) => ({ ...prev, heroImage: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const saveContent = () => {
    try {
      const raw = localStorage.getItem("company-page-content");
      const parsed = raw ? JSON.parse(raw) : {};
      parsed[slug] = cloneContent(content);
      localStorage.setItem("company-page-content", JSON.stringify(parsed));
      setSaveMessage("Page content saved.");
      setTimeout(() => setSaveMessage(""), 1800);
    } catch (err) {
      console.error("Failed to save company page content", err);
      setSaveMessage("Could not save changes.");
    }
  };

  const resetContent = () => {
    setContent(buildContentState(slug));
    setSaveMessage("Restored the default page content.");
    setTimeout(() => setSaveMessage(""), 1800);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f6f8fc", color: "#0f1724", padding: "24px 20px 60px" }}>
      <div style={{ maxWidth: "1380px", margin: "0 auto", display: "grid", gridTemplateColumns: isAdmin ? "300px minmax(0, 1fr)" : "1fr", gap: "22px" }}>
        {isAdmin && (
          <aside style={{ background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)", borderRadius: "24px", padding: "22px", boxShadow: "0 16px 40px rgba(15, 23, 36, 0.08)", border: "1px solid #e2e8f0", height: "fit-content", position: "sticky", top: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "linear-gradient(135deg, #2563eb, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800 }}>✦</div>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "#2563eb" }}>Page Editor</div>
                <h2 style={{ margin: "2px 0 0", fontSize: "1.05rem", color: "#0f1724" }}>{content.title}</h2>
              </div>
            </div>
            <p style={{ margin: "0 0 16px", color: "#64748b", fontSize: "0.92rem", lineHeight: 1.5 }}>Edit this page only. Changes appear instantly in the live preview.</p>

            <div style={{ display: "grid", gap: "12px" }}>
              <div style={{ padding: "12px", borderRadius: "14px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <label style={{ display: "grid", gap: "6px" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#334155" }}>Title</span>
                  <input value={content.title} onChange={(e) => handleFieldChange("title", e.target.value)} style={{ padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "white" }} />
                </label>
              </div>

              <div style={{ padding: "12px", borderRadius: "14px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <label style={{ display: "grid", gap: "6px" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#334155" }}>Eyebrow</span>
                  <input value={content.eyebrow} onChange={(e) => handleFieldChange("eyebrow", e.target.value)} style={{ padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "white" }} />
                </label>
              </div>

              <div style={{ padding: "12px", borderRadius: "14px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <label style={{ display: "grid", gap: "6px" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#334155" }}>Intro</span>
                  <textarea value={content.intro} onChange={(e) => handleFieldChange("intro", e.target.value)} rows={4} style={{ padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1", resize: "vertical", background: "white" }} />
                </label>
              </div>

              <div style={{ padding: "12px", borderRadius: "14px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <label style={{ display: "grid", gap: "6px" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#334155" }}>Highlights</span>
                  <textarea value={content.highlights.join("\n")} onChange={(e) => handleHighlightsChange(e.target.value)} rows={6} style={{ padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1", resize: "vertical", background: "white" }} />
                </label>
              </div>

              <div style={{ padding: "12px", borderRadius: "14px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#334155" }}>Stats</span>
                </div>
                <div style={{ display: "grid", gap: "8px" }}>
                  {content.stats.map((stat, index) => (
                    <div key={`${stat.label}-${index}`} style={{ display: "grid", gap: "6px" }}>
                      <input value={stat.label} onChange={(e) => handleStatChange(index, "label", e.target.value)} placeholder="Label" style={{ padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "white" }} />
                      <input value={stat.value} onChange={(e) => handleStatChange(index, "value", e.target.value)} placeholder="Value" style={{ padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "white" }} />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: "12px", borderRadius: "14px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <label style={{ display: "grid", gap: "6px" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#334155" }}>Footer Message</span>
                  <input value={content.footerTitle} onChange={(e) => handleFieldChange("footerTitle", e.target.value)} style={{ padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "white" }} />
                </label>
              </div>

              <div style={{ padding: "12px", borderRadius: "14px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <label style={{ display: "grid", gap: "6px" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#334155" }}>Hero Image</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ padding: "8px 0" }} />
                  {content.heroImage ? <img src={content.heroImage} alt="Hero preview" style={{ width: "100%", borderRadius: "10px", border: "1px solid #e2e8f0", objectFit: "cover", maxHeight: "140px" }} /> : null}
                </label>
              </div>

              <div style={{ padding: "12px", borderRadius: "14px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#334155" }}>Buttons</span>
                  <button type="button" onClick={addButton} style={{ background: "#2563eb", color: "white", border: "none", padding: "8px 10px", borderRadius: "8px", cursor: "pointer", fontWeight: 700 }}>Add</button>
                </div>
                <div style={{ display: "grid", gap: "8px" }}>
                  {(content.buttons || []).map((button, index) => (
                    <div key={button.id || index} style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "10px", display: "grid", gap: "8px", background: "white" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong style={{ fontSize: "0.9rem", color: "#0f1724" }}>Button {index + 1}</strong>
                        {(content.buttons || []).length > 1 ? <button type="button" onClick={() => removeButton(index)} style={{ background: "#ef4444", color: "white", border: "none", padding: "6px 8px", borderRadius: "8px", cursor: "pointer" }}>Remove</button> : null}
                      </div>
                      <input value={button.label} onChange={(e) => handleButtonChange(index, "label", e.target.value)} placeholder="Button label" style={{ padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1" }} />
                      <input value={button.link} onChange={(e) => handleButtonChange(index, "link", e.target.value)} placeholder="Button link" style={{ padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1" }} />
                      <div style={{ display: "grid", gap: "6px" }}>
                        <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                          <span style={{ fontSize: "0.85rem", color: "#475569" }}>Text color</span>
                          <input type="color" value={button.textColor || "#ffffff"} onChange={(e) => handleButtonChange(index, "textColor", e.target.value)} />
                        </label>
                        <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                          <span style={{ fontSize: "0.85rem", color: "#475569" }}>Background</span>
                          <input type="color" value={button.backgroundColor || "#2563eb"} onChange={(e) => handleButtonChange(index, "backgroundColor", e.target.value)} />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button type="button" onClick={saveContent} style={{ background: "linear-gradient(135deg, #2563eb, #4f46e5)", color: "white", border: "none", padding: "10px 14px", borderRadius: "10px", cursor: "pointer", fontWeight: 700 }}>Save</button>
                <button type="button" onClick={resetContent} style={{ background: "#e2e8f0", color: "#0f1724", border: "none", padding: "10px 14px", borderRadius: "10px", cursor: "pointer", fontWeight: 700 }}>Reset</button>
              </div>
              {saveMessage ? <div style={{ color: "#2563eb", fontSize: "0.9rem", fontWeight: 600 }}>{saveMessage}</div> : null}
            </div>
          </aside>
        )}

        <div style={{ display: "grid", gap: "22px" }}>
          <section style={{ background: "linear-gradient(135deg, #0f1724 0%, #1d4ed8 100%)", borderRadius: "28px", padding: "40px 36px", color: "white", boxShadow: "0 18px 45px rgba(15, 23, 36, 0.16)" }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
              <div style={{ maxWidth: "680px" }}>
                <div style={{ display: "inline-block", padding: "8px 12px", borderRadius: "999px", background: "rgba(255,255,255,0.16)", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "12px" }}>
                  {content.eyebrow}
                </div>
                <h1 style={{ fontSize: "clamp(2rem, 3vw, 3rem)", margin: "0 0 12px", lineHeight: 1.15 }}>{content.title}</h1>
                <p style={{ fontSize: "1.05rem", lineHeight: 1.7, margin: 0, opacity: 0.95 }}>{content.intro}</p>
              </div>
              {content.buttons && content.buttons.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {content.buttons.map((button, index) => (
                    <a
                      key={button.id || index}
                      href={button.link || "/"}
                      style={{
                        background: button.backgroundColor || "#ffffff",
                        color: button.textColor || "#0f1724",
                        textDecoration: "none",
                        padding: "12px 18px",
                        borderRadius: "999px",
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      {button.label || "Button"}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </section>

          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
            {content.stats.map((item) => (
              <div key={item.label} style={{ background: "white", borderRadius: "18px", padding: "20px", boxShadow: "0 10px 28px rgba(15, 23, 36, 0.08)" }}>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#1d4ed8", marginBottom: "6px" }}>{item.value}</div>
                <div style={{ color: "#475569", fontWeight: 600 }}>{item.label}</div>
              </div>
            ))}
          </section>

          <section style={{ display: "grid", gridTemplateColumns: "1.25fr 0.75fr", gap: "18px" }}>
            <div style={{ background: "white", borderRadius: "24px", padding: "28px", boxShadow: "0 10px 28px rgba(15, 23, 36, 0.08)" }}>
              <h2 style={{ margin: "0 0 12px", fontSize: "1.25rem" }}>Why teams choose us</h2>
              <ul style={{ margin: 0, paddingLeft: "18px", color: "#334155", display: "grid", gap: "10px", lineHeight: 1.7 }}>
                {content.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div style={{ background: "#0f1724", borderRadius: "24px", padding: "28px", color: "white", boxShadow: "0 10px 28px rgba(15, 23, 36, 0.08)" }}>
              <h2 style={{ margin: "0 0 10px", fontSize: "1.25rem" }}>Company promise</h2>
              <p style={{ margin: 0, lineHeight: 1.7, opacity: 0.9 }}>{content.footerTitle}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
