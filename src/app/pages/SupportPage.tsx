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

export function SupportPage() {
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
              Support
            </h1>
            <p className="text-[var(--lg-cocoa)] mb-10" style={{ fontSize: "0.9rem" }}>
              How to get help, report issues, or manage your data.
            </p>

            <div className="prose-latergram space-y-8 text-[var(--lg-ink)] leading-[1.8]" style={{ fontSize: "0.97rem" }}>
              <section>
                <h2 className="trust-heading">General support</h2>
                <p>
                  For questions, issues, or feedback about Latergram, email <SupportContact />.
                </p>
              </section>

              <section>
                <h2 className="trust-heading">Report an abusive Late Letter</h2>
                <p>
                  If you received a Late Letter that is harassing, threatening, or abusive:
                </p>
                <ul className="trust-list">
                  <li>Use the "Report this letter" option on the letter page if you still have the link.</li>
                  <li>You can also block future letters from the same sender through that link.</li>
                  <li>If you no longer have the link, email <SupportContact /> with as much detail as you can provide.</li>
                </ul>
                <p>
                  Reports are reviewed for safety. The sender's identity is not disclosed to you.
                </p>
              </section>

              <section>
                <h2 className="trust-heading">Opt out of future letters</h2>
                <p>
                  If you received a Late Letter and want to stop receiving letters from that sender or from all Latergram senders:
                </p>
                <ul className="trust-list">
                  <li>Use the opt-out option on the letter page to block future letters from that sender.</li>
                  <li>If you no longer have the link, email <SupportContact /> and we can add your email to the opt-out list.</li>
                </ul>
              </section>

              <section>
                <h2 className="trust-heading">Delivery issues</h2>
                <p>
                  Late Letters are scheduled for future delivery but delivery is not guaranteed. If a letter you sent appears stuck or failed:
                </p>
                <ul className="trust-list">
                  <li>Check the letter status in your archive — it will show scheduled, sending, sent, failed, or cancelled.</li>
                  <li>Failed letters may be due to invalid email addresses, recipient opt-outs, or delivery provider issues.</li>
                  <li>Latergram cannot resend a failed letter automatically. You may need to schedule a new one.</li>
                  <li>For persistent delivery issues, contact <SupportContact />.</li>
                </ul>
              </section>

              <section>
                <h2 className="trust-heading">Delete your data</h2>
                <h3 className="trust-subheading">Local/device data</h3>
                <p>
                  Data saved only on your device (when not signed in) can be removed by:
                </p>
                <ul className="trust-list">
                  <li>Using the remove/delete actions within the app for individual items.</li>
                  <li>Clearing your browser's local storage for this site.</li>
                </ul>

                <h3 className="trust-subheading">Account-backed data</h3>
                <p>
                  When signed in, you can delete individual items:
                </p>
                <ul className="trust-list">
                  <li><strong>Private Lategrams:</strong> remove from your archive within the app.</li>
                  <li><strong>Time Since counters:</strong> remove from your archive within the app.</li>
                  <li><strong>Late Letters:</strong> cancel before sending. After a letter is sent, the content cannot be recalled from the recipient, but you can remove the record from your archive.</li>
                </ul>

                <h3 className="trust-subheading">Full account deletion</h3>
                <p>
                  Self-serve full account deletion is not yet available. To request complete account and data deletion, email <SupportContact />. We will remove your account and all associated data. Some data may temporarily remain in database backups or delivery provider logs until those systems rotate.
                </p>

                <h3 className="trust-subheading">Memory Cards</h3>
                <p>
                  Downloaded Memory Card PNGs live on your device. Latergram does not store card history or metadata. To remove a downloaded card, delete the file from your device.
                </p>
              </section>

              <section>
                <h2 className="trust-heading">The Garden</h2>
                <p>
                  The Garden is currently closed in the product UI. When it opens, Garden posts will be moderated. If you need to report or remove a Garden post, contact <SupportContact />.
                </p>
              </section>

              <section className="bg-[var(--lg-paper)] border border-[var(--lg-border)] rounded-2xl p-5">
                <h2 className="trust-heading" style={{ marginTop: 0 }}>If you are in danger</h2>
                <p>
                  Latergram is not an emergency service and cannot help in crisis situations.
                </p>
                <p>
                  If you or someone you know is in immediate danger, please contact local emergency services or reach out to a trusted person nearby.
                </p>
                <p className="text-[var(--lg-cocoa)] mt-3" style={{ fontSize: "0.9rem" }}>
                  Do not use Latergram to communicate urgent or life-threatening information.
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
