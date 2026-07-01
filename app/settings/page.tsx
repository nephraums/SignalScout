import { SettingsForm } from "@/components/settings-form";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal text-ink">Settings</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-steel">
          Configure preferred industries, target markets, Board labels, and named accounts for the target-account watch view.
        </p>
      </div>
      <SettingsForm />
    </div>
  );
}
