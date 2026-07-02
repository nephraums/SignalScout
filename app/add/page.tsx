import { AddSignalForm } from "@/components/add-signal-form";

export default function AddSignalPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal text-ink">Manually add signal</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-steel">
          Submit a public news, company announcement, job ad, or manually observed public URL. The prototype classifies the signal and creates sales-ready context.
        </p>
      </div>
      <AddSignalForm />
      <div className="rounded-md border border-line bg-white p-4 text-sm leading-6 text-steel">
        This prototype does not scrape LinkedIn, send messages, integrate with CRM, or store confidential information.
      </div>
    </div>
  );
}
