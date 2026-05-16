import { Link } from "react-router";
import { Header } from "../components/Header";
import { Grain } from "../components/Grain";
import { BackgroundPetals } from "../components/BackgroundPetals";
import { TrustFooter } from "../components/TrustFooter";
import { SUPPORT_EMAIL, SUPPORT_EMAIL_CONFIGURED } from "../constants";

function SupportContact() {
  if (SUPPORT_EMAIL_CONFIGURED) {
    return <>{SUPPORT_EMAIL}</>;
  }

  return <span className="italic text-[var(--lg-cocoa)]">{SUPPORT_EMAIL} (inbox pending before public launch)</span>;
}

export function BetaPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[var(--lg-cream)]">
      <BackgroundPetals />
      <Grain />
      <div className="relative z-10">
        <Header current="landing" variant="minimal" />

        <main className="px-4 sm:px-6 md:px-12 pb-16 pt-6 sm:pt-10">
          <article className="max-w-[720px] mx-auto">
            <p className="font-cute text-[var(--lg-rose)] mb-4" style={{ fontSize: "1.35rem" }}>
              private beta
            </p>
            <h1
              className="text-[var(--lg-ink)] mb-4"
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 300,
                fontSize: "clamp(2.25rem, 5.2vw, 3.6rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.025em",
              }}
            >
              Latergram is being prepared for a small, real private beta.
            </h1>
            <p className="text-[var(--lg-cocoa)] leading-[1.8] mb-10" style={{ fontSize: "1rem" }}>
              This is not a public launch. Access is being shared manually with a small group of real testers so the core product can be checked for trust, clarity, safety, and reliability before Latergram opens more widely.
            </p>

            <div className="prose-latergram space-y-8 text-[var(--lg-ink)] leading-[1.8]" style={{ fontSize: "0.97rem" }}>
              <section className="bg-[var(--lg-paper)] border border-[var(--lg-border)] rounded-2xl p-5">
                <h2 className="trust-heading" style={{ marginTop: 0 }}>Current beta access</h2>
                <p>
                  Latergram does not currently enforce invite codes or an allowlist in the app. Private beta access is controlled by manual, off-platform invite distribution for now.
                </p>
                <p>
                  Do not treat a direct link as proof that public launch has happened. No fake waitlist, fake beta count, fake testimonials, or fake invite status is shown here.
                </p>
              </section>

              <section>
                <h2 className="trust-heading">What beta testers should test</h2>
                <ul className="trust-list">
                  <li>Sign up, sign in, sign out, and password reset.</li>
                  <li>Write a Latergram and save it privately on this device or to an account.</li>
                  <li>Import local saves into an account only if you choose to test that flow.</li>
                  <li>Create a Time Since counter.</li>
                  <li>Export a Memory Card from real saved content.</li>
                  <li>Schedule a Late Letter to yourself or to a trusted test recipient.</li>
                  <li>Open the secure recipient link after a real email arrives.</li>
                  <li>Try recipient report, sender block, and opt-out controls.</li>
                  <li>Use the mobile writing flow, refresh the page, and check draft restore.</li>
                  <li>Read the privacy, terms, and support pages for clarity.</li>
                </ul>
              </section>

              <section>
                <h2 className="trust-heading">What is included</h2>
                <ul className="trust-list">
                  <li>Private writing and device-only saves.</li>
                  <li>Account-backed private Lategrams and Time Since counters when signed in.</li>
                  <li>Explicit local-to-account import.</li>
                  <li>Late Letter scheduling records and real delivery when the configured server job and Resend setup are running.</li>
                  <li>Recipient link opening, reporting, sender blocking, and global opt-out controls.</li>
                  <li>Memory Card PNG export from real saved Lategrams or Time Since counters.</li>
                </ul>
              </section>

              <section>
                <h2 className="trust-heading">What is not included yet</h2>
                <ul className="trust-list">
                  <li>Public launch.</li>
                  <li>Public Garden browsing, posting, reactions, or reports in the product UI.</li>
                  <li>Anonymous Garden access.</li>
                  <li>Saved Memory Card history, sharing, upload, or cloud sync.</li>
                  <li>Analytics collection by default. Privacy-safe instrumentation is prepared, but it no-ops unless explicitly configured.</li>
                  <li>Payments, AI, or public launch infrastructure.</li>
                  <li>Self-serve full account deletion.</li>
                </ul>
              </section>

              <section>
                <h2 className="trust-heading">The Garden</h2>
                <p>
                  The Garden remains closed for the initial private beta. It will be tested only after a separate safety checkpoint confirms that access gating, moderation review, reporting, and operational capacity are ready.
                </p>
                <p>
                  No Garden posts, reactions, reports, anonymous activity, or fake Garden activity are shown in the product UI.
                </p>
              </section>

              <section>
                <h2 className="trust-heading">How to report issues</h2>
                <p>
                  During private beta, report bugs, confusing moments, trust concerns, and delivery issues through the real channel used to invite you. If a support inbox is configured, contact <SupportContact />.
                </p>
                {!SUPPORT_EMAIL_CONFIGURED && (
                  <p>
                    The support inbox is still pending before public launch, so do not rely on email-only support until that setup is complete.
                  </p>
                )}
                <p>
                  Please do not send private emotional content to the founder as feedback. It is enough to describe where you felt confused, unsafe, uncertain, or blocked.
                </p>
              </section>

              <section>
                <h2 className="trust-heading">Safety reminders</h2>
                <ul className="trust-list">
                  <li>Do not use Latergram for emergencies, crisis support, threats, harassment, or urgent communication.</li>
                  <li>Do not send Late Letters to people who have not agreed to help you test.</li>
                  <li>Do not include secrets, passwords, financial details, medical details, or legal instructions in beta content.</li>
                  <li>If a Late Letter feels unwanted or unsafe, use the recipient report and block controls.</li>
                </ul>
                <p>
                  Latergram is not therapy, counseling, medical advice, legal advice, crisis intervention, or an emergency service. If you or someone else may be in immediate danger, contact local emergency services or a trusted person nearby.
                </p>
              </section>

              <section>
                <h2 className="trust-heading">Useful links</h2>
                <p className="flex flex-wrap gap-4">
                  <Link to="/privacy" className="text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] underline underline-offset-4">
                    Privacy
                  </Link>
                  <Link to="/terms" className="text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] underline underline-offset-4">
                    Terms
                  </Link>
                  <Link to="/support" className="text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] underline underline-offset-4">
                    Support
                  </Link>
                  <Link to="/app" className="text-[var(--lg-rose)] hover:text-[var(--lg-focus-rose)] underline underline-offset-4">
                    Open app
                  </Link>
                </p>
              </section>
            </div>
          </article>
          <TrustFooter className="mt-12 border-t border-[var(--lg-border)]" />
        </main>
      </div>
    </div>
  );
}
