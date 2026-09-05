import { site } from "@/content";

export default function Footer() {
  return (
    <footer className="site-footer">
      <p className="footer-name">{site.identity.fullName}</p>
      <p className="footer-note">{site.footer.note}</p>
    </footer>
  );
}
