import { useEffect, useState } from "react";

function Footer({ onOpenLogin, onOpenJoin, isLoggedIn = false }) {
  const SOCIAL_LINKS_STORAGE_KEY = "footer-social-links";
  const SOCIAL_LINKS_EVENT = "footer-social-links-changed";
  const SOCIAL_LINK_LABELS = {
    twitter: "Twitter",
    instagram: "Instagram",
    facebook: "Facebook",
    linkedin: "LinkedIn",
    youtube: "YouTube",
    pinterest: "Pinterest",
    tiktok: "TikTok",
    snapchat: "Snapchat",
    reddit: "Reddit",
    telegram: "Telegram",
    discord: "Discord",
    github: "GitHub",
    dribbble: "Dribbble",
    behance: "Behance",
    medium: "Medium",
    mastodon: "Mastodon",
    x: "X"
  };

  const getStoredSocialLinks = () => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(SOCIAL_LINKS_STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed)
        ? parsed.filter((item) => item?.platform && item?.url)
        : [];
    } catch (err) {
      console.error("Failed to load footer social links", err);
      return [];
    }
  };

  const getIndianYear = () => {
    const now = new Date();
    const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    return istTime.getFullYear();
  };

  const [socialLinks, setSocialLinks] = useState(getStoredSocialLinks);
  const currentYear = getIndianYear();

  useEffect(() => {
    const updateSocialLinks = () => setSocialLinks(getStoredSocialLinks());
    updateSocialLinks();
    window.addEventListener(SOCIAL_LINKS_EVENT, updateSocialLinks);
    return () => window.removeEventListener(SOCIAL_LINKS_EVENT, updateSocialLinks);
  }, []);

  return (
    <footer style={{ marginTop: 40, background: "#0f1724", color: "#e6eef8", padding: "36px 20px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 20 }}>
        <div>
          <h4 style={{ margin: "0 0 8px 0" }}>About</h4>
          <p style={{ margin: 0, opacity: 0.9 }}>We provide high-quality stock images for creators, designers and teams.</p>
        </div>

        <div>
          <h4 style={{ margin: "0 0 8px 0" }}>Company</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li><a href="/about" style={{ color: "#cfe8ff" }}>About Us</a></li>
            <li><a href="/pricing" style={{ color: "#cfe8ff" }}>Pricing</a></li>
            <li><a href="/careers" style={{ color: "#cfe8ff" }}>Careers</a></li>
            <li><a href="/contact" style={{ color: "#cfe8ff" }}>Contact</a></li>
          </ul>
        </div>

        <div>
          <h4 style={{ margin: "0 0 8px 0" }}>Legal</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li><a href="/privacy" style={{ color: "#cfe8ff" }}>Privacy Policy</a></li>
            <li><a href="/terms" style={{ color: "#cfe8ff" }}>Terms & Conditions</a></li>
            <li><a href="/cookies" style={{ color: "#cfe8ff" }}>Cookie Policy</a></li>
          </ul>
        </div>

        <div>
          <h4 style={{ margin: "0 0 8px 0" }}>For You</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {!isLoggedIn && (
              <>
                <li>
                  <button
                    type="button"
                    onClick={onOpenLogin}
                    style={{
                      color: "#cfe8ff",
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      textDecoration: "underline"
                    }}
                  >
                    Login
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onOpenJoin("contributor")}
                    style={{
                      color: "#cfe8ff",
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      textDecoration: "underline"
                    }}
                  >
                    Become a Contributor
                  </button>
                </li>
              </>
            )}
            <li><a href="/help" style={{ color: "#cfe8ff" }}>Help Center</a></li>
          </ul>
        </div>

        <div>
          <h4 style={{ margin: "0 0 8px 0" }}>Resources</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li><a href="/blog" style={{ color: "#cfe8ff" }}>Blog</a></li>
            <li><a href="/developers" style={{ color: "#cfe8ff" }}>Developers</a></li>
            <li><a href="/partners" style={{ color: "#cfe8ff" }}>Partners</a></li>
          </ul>
        </div>
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 28, paddingTop: 18 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ opacity: 0.9 }}>© {currentYear} Stock Photo Website. All rights reserved.</div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            {socialLinks.map((link) => (
              <a
                key={`${link.platform}-${link.url}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#cfe8ff" }}
              >
                {SOCIAL_LINK_LABELS[link.platform] || link.platform}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;