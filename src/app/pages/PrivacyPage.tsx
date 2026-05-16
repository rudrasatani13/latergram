import { Header } from "../components/Header";
import { Grain } from "../components/Grain";
import { BackgroundPetals } from "../components/BackgroundPetals";
import { TrustFooter } from "../components/TrustFooter";
import { SUPPORT_EMAIL } from "../constants";

export function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-[var(--lg-cocoa)] mb-10" style={{ fontSize: "0.9rem" }}>
              Last updated: May 2026
            </p>

            <div className="prose-latergram space-y-8 text-[var(--lg-ink)] leading-[1.8]" style={{ fontSize: "0.97rem" }}>
              <section>
                <h2 className="trust-heading">What Latergram is</h2>
                <p>
                  Latergram is a quiet writing space for words you didn't say in time. You can write privately on your device, save to an account, schedule letters to be delivered later, track meaningful dates, and export memory cards from your saved writing.
                </p>
                <p>
                  Latergram is not a social network, messaging app, therapy service, or emergency resource.
                </p>
              </section>

              <section>
                <h2 className="trust-heading">What is stored when you are not signed in</h2>
                <p>
                  If you use Latergram without an account, your writing stays on your device only. Latergram stores your local draft and any saved Lategrams or Time Since counters in your browser's local storage. This data never leaves your device and is not sent to any server.
                </p>
                <p>
                  If you clear your browser data or switch devices, local-only content is gone. Latergram cannot recover it.
                </p>
              </section>

              <section>
                <h2 className="trust-heading">What is stored when you are signed in</h2>
                <p>
                  When you create an account and sign in, Latergram stores the following in our database (hosted on Supabase):
                </p>
                <ul className="trust-list">
                  <li><strong>Profile:</strong> your email address and optional display name.</li>
                  <li><strong>Private Lategrams:</strong> the text you explicitly save to your account archive, along with recipient label, subject, mood, and destination metadata.</li>
                  <li><strong>Time Since counters:</strong> counter titles, start dates, and optional context text.</li>
                  <li><strong>Late Letters:</strong> letter body, recipient name, recipient email address, subject, scheduled delivery time, and delivery status.</li>
                  <li><strong>Garden submissions:</strong> if you submit to the Garden (currently closed in the product UI), the post body and moderation state.</li>
                </ul>
                <p>
                  Your local device writing remains separate from your account data unless you explicitly import it.
                </p>
              </section>

              <section>
                <h2 className="trust-heading">Recipient email addresses</h2>
                <p>
                  When you schedule a Late Letter, you provide a recipient email address. This address is used solely to deliver your letter at the scheduled time. Recipient email addresses are treated as sensitive data.
                </p>
                <ul className="trust-list">
                  <li>Recipient emails are never used for marketing, newsletters, or promotional contact.</li>
                  <li>Recipient emails are never sold or shared with third parties for their own purposes.</li>
                  <li>After a letter is saved, the recipient email is masked in your UI for privacy.</li>
                  <li>Recipients can opt out of future letters or report a letter through their recipient link.</li>
                </ul>
              </section>

              <section>
                <h2 className="trust-heading">Email delivery</h2>
                <p>
                  Late Letters are delivered through Resend (our email delivery provider). When a letter is sent, Resend processes the recipient email address and letter content to perform delivery. Resend may retain delivery logs (message IDs, delivery status, timestamps) according to their own data retention policies.
                </p>
                <p>
                  Latergram does not guarantee delivery, read receipts, or specific delivery timing.
                </p>
              </section>

              <section>
                <h2 className="trust-heading">Who reads your content</h2>
                <p>
                  Your private Lategrams, Time Since counters, and Late Letters are not read by humans under normal operation. Automated systems process delivery; no one at Latergram reads your private writing.
                </p>
                <p>
                  <strong>Exceptions:</strong>
                </p>
                <ul className="trust-list">
                  <li>If a recipient reports a Late Letter for abuse or safety concerns, the reported letter content may be reviewed by authorized support staff to assess the report.</li>
                  <li>If the Garden opens in the future, publicly submitted Garden posts that are reported or queued for moderation may be reviewed by authorized moderators.</li>
                </ul>
                <p>
                  Private Lategrams that are never sent or submitted publicly are not subject to moderation review.
                </p>
              </section>

              <section>
                <h2 className="trust-heading">Memory Card export</h2>
                <p>
                  Memory Card export generates a PNG image on your device from a selected saved Lategram or Time Since counter. The image is created entirely client-side using your browser's canvas. The generated PNG is not uploaded to Latergram's servers.
                </p>
                <ul className="trust-list">
                  <li>No saved card history or metadata is stored by Latergram.</li>
                  <li>No cloud sync or automatic sharing occurs.</li>
                  <li>Once downloaded, the PNG lives on your device. You are responsible for how you share it.</li>
                </ul>
              </section>

              <section>
                <h2 className="trust-heading">Data retention and deletion</h2>
                <p>
                  Your account data is kept as long as your account exists. Soft-deleted records (cancelled letters, removed Lategrams) remain in the database with a deletion timestamp and may be permanently purged in future cleanup operations.
                </p>
                <p>
                  To delete your data:
                </p>
                <ul className="trust-list">
                  <li><strong>Local/device data:</strong> clear your browser's local storage or use the remove actions in the app.</li>
                  <li><strong>Account data:</strong> you can delete individual Lategrams, counters, and letters from within the app. To request full account and data deletion, contact {SUPPORT_EMAIL}.</li>
                </ul>
                <p>
                  Self-serve full account deletion is not yet available. When you request deletion through support, we will remove your account and associated data. Some data may temporarily remain in database backups or provider logs (e.g., Resend delivery records) before those systems rotate.
                </p>
              </section>

              <section>
                <h2 className="trust-heading">Analytics and tracking</h2>
                <p>
                  Latergram does not currently run analytics, tracking pixels, or third-party advertising scripts. If analytics are added in the future, this policy will be updated.
                </p>
              </section>

              <section>
                <h2 className="trust-heading">What we do not do</h2>
                <ul className="trust-list">
                  <li>We do not sell your personal data.</li>
                  <li>We do not send marketing emails to letter recipients.</li>
                  <li>We do not claim HIPAA, GDPR, or CCPA compliance — these require formal legal review that has not been completed.</li>
                  <li>We do not provide end-to-end encryption. Data is encrypted in transit (HTTPS) and at rest by our infrastructure provider, but service-level access technically exists for database administration.</li>
                  <li>We do not guarantee instant deletion from all backups.</li>
                </ul>
              </section>

              <section>
                <h2 className="trust-heading">Not a crisis or emergency service</h2>
                <p>
                  Latergram is not therapy, counseling, crisis intervention, or an emergency service. If you or someone you know is in immediate danger, contact local emergency services or a trusted person nearby.
                </p>
              </section>

              <section>
                <h2 className="trust-heading">Contact</h2>
                <p>
                  For privacy questions or data deletion requests, reach us at {SUPPORT_EMAIL}.
                </p>
              </section>

              <section className="border-t border-[var(--lg-border)] pt-6 mt-10">
                <p className="text-[var(--lg-cocoa)] italic" style={{ fontSize: "0.88rem" }}>
                  This privacy policy is written in plain language to be honest about how Latergram works. It may require formal legal review before public launch.
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
