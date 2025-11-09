import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Save, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface AgentConfigData {
  system_prompt: string;
  voice_id: string;
  assistant_id: string;
}

export default function AgentConfig() {
  const { user } = useAuth();
  const [config, setConfig] = useState<AgentConfigData>({
    system_prompt: '',
    voice_id: 'jennifer',
    assistant_id: process.env.VITE_VAPI_ASSISTANT_ID || 'your-vapi-assistant-id'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('agent_config')
        .select('*')
        .order('version', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // Ignore "no rows" error
        throw error;
      }

      if (data) {
        setConfig({
          system_prompt: data.system_prompt || '',
          voice_id: data.voice_id || 'jennifer',
          assistant_id: data.assistant_id || process.env.VITE_VAPI_ASSISTANT_ID || 'your-vapi-assistant-id'
        });
      }
    } catch (error: any) {
      console.error('Error loading config:', error);
      setMessage({ type: 'error', text: 'Failed to load configuration: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config.system_prompt.trim()) {
      setMessage({ type: 'error', text: 'System prompt cannot be empty' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      // Get current max version
      const { data: latest } = await supabase
        .from('agent_config')
        .select('version')
        .order('version', { ascending: false })
        .limit(1)
        .single();

      const newVersion = (latest?.version || 0) + 1;

      // Insert new version
      const { error } = await supabase
        .from('agent_config')
        .insert({
          ...config,
          version: newVersion,
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Sync configuration to VAPI
      try {
        const { data: syncData, error: syncError } = await supabase.functions.invoke('sync-vapi-config', {
          body: {
            assistant_id: config.assistant_id,
            system_prompt: config.system_prompt,
            voice_id: config.voice_id
          }
        });

        if (syncError) {
          console.error('VAPI sync error:', syncError);
          setMessage({
            type: 'error',
            text: `Configuration saved (v${newVersion}) but VAPI sync failed: ${syncError.message}`
          });
          return;
        }

        setMessage({
          type: 'success',
          text: `Configuration saved and synced to VAPI! Version ${newVersion}`
        });

        // Auto-dismiss success message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } catch (syncErr: any) {
        console.error('VAPI sync exception:', syncErr);
        setMessage({
          type: 'error',
          text: `Configuration saved (v${newVersion}) but VAPI sync failed: ${syncErr.message}`
        });
      }
    } catch (error: any) {
      console.error('Error saving config:', error);
      setMessage({ type: 'error', text: 'Failed to save: ' + error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-healthcare-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Agent Configuration</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Configure the AI assistant's behavior and voice settings
        </p>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            System Prompt
          </label>
          <textarea
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-healthcare-primary dark:focus:ring-healthcare-accent"
            rows={10}
            value={config.system_prompt}
            onChange={(e) => setConfig({ ...config, system_prompt: e.target.value })}
            placeholder="You are a helpful hospital assistant for Serenity Royale Hospital. You help patients with appointment scheduling, answering questions, and providing information."
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            This prompt guides the AI's personality and behavior. Be specific about the hospital's
            policies and procedures.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            Voice ID
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-healthcare-primary dark:focus:ring-healthcare-accent"
            value={config.voice_id}
            onChange={(e) => setConfig({ ...config, voice_id: e.target.value })}
            placeholder="jennifer"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            ElevenLabs voice ID for the assistant's voice (e.g., "jennifer", "sarah")
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
            VAPI Assistant ID
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-healthcare-primary dark:focus:ring-healthcare-accent"
            value={config.assistant_id}
            onChange={(e) => setConfig({ ...config, assistant_id: e.target.value })}
            placeholder={process.env.VITE_VAPI_ASSISTANT_ID || 'your-vapi-assistant-id'}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Your VAPI assistant ID from the dashboard. Changes will sync to VAPI on save.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-6 py-3 bg-healthcare-primary text-white rounded-lg hover:bg-healthcare-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
          >
            {saving ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Configuration
              </>
            )}
          </button>

          <button
            onClick={loadConfig}
            disabled={loading || saving}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            Reset
          </button>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
          How It Works
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• Changes create a new version (rollback support via database)</li>
          <li>• System prompt will sync to VAPI assistant configuration</li>
          <li>• Voice calls use the latest configuration automatically</li>
          <li>• Realtime updates propagate across all widgets</li>
        </ul>
      </div>
    </div>
  );
}