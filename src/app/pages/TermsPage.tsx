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

export function TermsPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[var(--lg-cream)]">
      <BackgroundPetals />
      <Grain />
      <div className="relative z-10">
        <Header current="landing" variant="minimal" />

        <main className="px-4 sm:px-6 md:px-12 pb-16 pt-6 sm:pt-10">
          <article className="max-w-[680px] mx-auto">
            <h1
              className="text-[var(--lg-ink)] mb-3"
              style={{
                fontFamily: "'Fraunces', serif",
                fontWeight: 300,
                fontSize: "clamp(2rem, 4.5vw, 3rem)",
                lineHeight: 1.1,
                letterSpacing: "-0.025em",
              }}
            >
              Terms of Service
            </h1>
            <p className="text-[var(--lg-cocoa)] mb-10" style={{ fontSize: "0.9rem" }}>
              Last updated: May 2026
            </p>

            <div className="prose-latergram space-y-8 text-[var(--lg-ink)] leading-[1.8]" style={{ fontSize: "0.97rem" }}>
              <section>
                <h2 className="trust-heading">Using Latergram</h2>
                <p>
                  By using Latergram, you agree to these terms. Latergram is a writing and letter-scheduling tool. You are responsible for what you write and send.
                </p>
              </section>

              <section>
                <h2 className="trust-heading">What you agree not to do</h2>
                <ul className="trust-list">
                  <li>Send harassing, threatening, abusive, or hateful content through Late Letters.</li>
                  <li>Use Latergram to spam, impersonate others, or send illegal content.</li>
                  <li>Attempt to circumvent recipient opt-outs or blocks.</li>
                  <li>Use Latergram to exploit, harm, or endanger others.</li>
                  <li>Interfere with the service's operation or security.</li>
                </ul>
              </section>

              <section>
                <h2 className="trust-heading">Late Letters</h2>
                <p>
                  Late Letters are scheduled for future delivery. You should understand:
                </p>
                <ul className="trust-list">
                  <li>Letters may fail to deliver, be delayed, or not arrive at all. Delivery is not guaranteed.</li>
                  <li>Recipients can report letters, block future letters from you, or opt out entirely.</li>
                  <li>If a recipient reports your letter, it may be reviewed for safety.</li>
                  <li>You can cancel a letter before it is sent. After sending, the letter cannot be recalled.</li>
                  <li>Latergram does not provide read receipts or guaranteed delivery confirmation.</li>
                </ul>
              </section>

              <section>
                <h2 className="trust-heading">The Garden</h2>
                <p>
                  The Garden is a space for publicly shared writing. It is currently closed in the product UI. When it opens:
                </p>
                <ul className="trust-list">
                  <li>Garden posts are moderated and may be rejected or removed.</li>
                  <li>Submission does not guarantee publication.</li>
                  <li>Other users may report Garden posts.</li>
                </ul>
              </section>

              <section>
                <h2 className="trust-heading">Memory Cards</h2>
                <p>
                  Memory Card export creates a PNG image from your saved content. The image is generated on your device. Once downloaded, you are responsible for how you use or share it. Latergram does not store, upload, or sync exported cards.
                </p>
              </section>

              <section>
                <h2 className="trust-heading">What Latergram is not</h2>
                <p>
                  Latergram is not therapy, medical advice, legal advice, crisis help, or an emergency service. Do not use Latergram for urgent or life-threatening situations. If you or someone you know is in immediate danger, contact local emergency services or a trusted person nearby.
                </p>
              </section>

              <section>
                <h2 className="trust-heading">Account suspension</h2>
                <p>
                  We may suspend or remove accounts that violate these terms, particularly for abuse, harassment, or illegal activity. We will attempt to notify you if possible, but reserve the right to act immediately for safety.
                </p>
              </section>

              <section>
                <h2 className="trust-heading">Service availability</h2>
                <p>
                  Latergram may experience downtime, changes, or interruptions. We do not guarantee uninterrupted availability. Features may change over time.
                </p>
              </section>

              <section>
                <h2 className="trust-heading">Contact</h2>
                <p>
                  For questions about these terms, contact <SupportContact />.
                </p>
              </section>

              <section className="border-t border-[var(--lg-border)] pt-6 mt-10">
                <p className="text-[var(--lg-cocoa)] italic" style={{ fontSize: "0.88rem" }}>
                  These terms are written in plain language to be honest about how Latergram works. They may require formal legal review before public launch.
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
