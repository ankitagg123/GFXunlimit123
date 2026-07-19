function Footer() {
  const token = typeof window !== 'undefined' && localStorage.getItem('token');

  if (token) return null;

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
            <li><a href="/login" style={{ color: "#cfe8ff" }}>Login</a></li>
            <li><a href="/register?type=contributor" style={{ color: "#cfe8ff" }}>Become a Contributor</a></li>
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
          <div style={{ opacity: 0.9 }}>© {new Date().getFullYear()} Stock Photo Website. All rights reserved.</div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <a href="https://twitter.com" style={{ color: "#cfe8ff" }}>Twitter</a>
            <a href="https://instagram.com" style={{ color: "#cfe8ff" }}>Instagram</a>
            <a href="https://facebook.com" style={{ color: "#cfe8ff" }}>Facebook</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;