export default function Settings() {
  return (
    <div className="space-y-4 max-w-xl">
      <h2 className="text-xl font-semibold">Settings</h2>
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm">VAPI API Key</span>
          <input className="border w-full p-2" />
        </label>
        <label className="block">
          <span className="text-sm">n8n Webhook URL</span>
          <input className="border w-full p-2" />
        </label>
        <label className="block">
          <span className="text-sm">Google Calendar Enabled</span>
          <select className="border w-full p-2"><option>true</option><option>false</option></select>
        </label>
      </div>
      <button className="px-3 py-1 bg-blue-600 text-white rounded">Save</button>
    </div>
  );
}