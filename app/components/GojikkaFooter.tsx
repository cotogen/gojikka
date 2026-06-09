export default function GojikkaFooter() {
  return (
    <footer className="gojikka-container gojikka-footer">
      <p className="text-xs tracking-wide gojikka-muted">
        © {new Date().getFullYear()} GOJIKKA
      </p>
    </footer>
  );
}
