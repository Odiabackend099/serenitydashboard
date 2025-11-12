import { useEffect, useState } from 'react';
import { supabaseFunctions } from '../services/supabaseFunctions';

interface SettingsData {
  vapi_api_key?: string;
  n8n_webhook_url?: string;
  google_calendar_enabled?: boolean;
  twilio_account_sid?: string;
  twilio_auth_token?: string;
  twilio_phone_number?: string;
}

export default function Settings() {
  const [settings, setSettings] = useState<SettingsData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await supabaseFunctions.getSettings();
      
      if (response.success && response.data) {
        setSettings(response.data.settings);
      } else {
        console.error('Error loading settings:', response.error);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');
      
      const response = await supabaseFunctions.updateSettings(settings);
      
      if (response.success) {
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Error saving settings: ' + response.error);
      }
    } catch (error) {
      setMessage('Error saving settings: ' + error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof SettingsData, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-xl">
        <h2 className="text-xl font-semibold">Settings</h2>
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-xl">
      <h2 className="text-xl font-semibold">Settings</h2>
      
      {message && (
        <div className={`p-3 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm">VAPI API Key</span>
          <input 
            className="border w-full p-2" 
            value={settings.vapi_api_key || ''}
            onChange={(e) => handleChange('vapi_api_key', e.target.value)}
            placeholder="Enter VAPI API Key"
          />
        </label>
        <label className="block">
          <span className="text-sm">n8n Webhook URL</span>
          <input 
            className="border w-full p-2" 
            value={settings.n8n_webhook_url || ''}
            onChange={(e) => handleChange('n8n_webhook_url', e.target.value)}
            placeholder="Enter n8n Webhook URL"
          />
        </label>
        <label className="block">
          <span className="text-sm">Google Calendar Enabled</span>
          <select 
            className="border w-full p-2"
            value={settings.google_calendar_enabled ? 'true' : 'false'}
            onChange={(e) => handleChange('google_calendar_enabled', e.target.value === 'true')}
          >
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm">Twilio Account SID</span>
          <input 
            className="border w-full p-2" 
            value={settings.twilio_account_sid || ''}
            onChange={(e) => handleChange('twilio_account_sid', e.target.value)}
            placeholder="Enter Twilio Account SID"
          />
        </label>
        <label className="block">
          <span className="text-sm">Twilio Auth Token</span>
          <input 
            className="border w-full p-2" 
            type="password"
            value={settings.twilio_auth_token || ''}
            onChange={(e) => handleChange('twilio_auth_token', e.target.value)}
            placeholder="Enter Twilio Auth Token"
          />
        </label>
        <label className="block">
          <span className="text-sm">Twilio Phone Number</span>
          <input 
            className="border w-full p-2" 
            value={settings.twilio_phone_number || ''}
            onChange={(e) => handleChange('twilio_phone_number', e.target.value)}
            placeholder="Enter Twilio Phone Number"
          />
        </label>
      </div>
      <button 
        className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}