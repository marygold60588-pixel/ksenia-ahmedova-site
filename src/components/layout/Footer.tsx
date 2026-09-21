import { site } from "@/content";

type Props = {
  showPractice?: boolean;
};

export default function Footer({ showPractice = true }: Props) {
  const { freePractice } = site;

  return (
    <footer className="site-footer">
      <p className="footer-note">
        © 2026 Ксения Ахмедова · Врач-психотерапевт, психоаналитик
      </p>
      {showPractice ? (
        <a className="footer-practice" href={freePractice.href}>
          {freePractice.title}
        </a>
      ) : null}
    </footer>
  );
}
