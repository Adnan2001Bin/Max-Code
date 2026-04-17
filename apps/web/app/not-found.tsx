import Link from "next/link";

export default function NotFoundPage() {
  return (
    <section
      className="card-glass"
      style={{
        padding: "48px 32px",
        textAlign: "center",
        maxWidth: "500px",
        margin: "40px auto",
      }}
    >
      <div
        style={{
          fontSize: "3rem",
          color: "var(--gold-dim)",
          marginBottom: "16px",
        }}
      >
        ✦
      </div>
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          color: "var(--text-primary)",
        }}
      >
        Page not found
      </h1>
      <p
        style={{
          marginTop: "8px",
          color: "var(--text-secondary)",
          fontSize: "0.9rem",
        }}
      >
        The requested Surah is unavailable. Please choose from the list.
      </p>
      <Link href="/" className="btn-gold" style={{ marginTop: "24px" }}>
        Back to Surah List
      </Link>
    </section>
  );
}
