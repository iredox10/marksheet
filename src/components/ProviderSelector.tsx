import { Key, ExternalLink } from "lucide-react";
import type { Provider } from "../types";

interface ProviderSelectorProps {
  provider: Provider;
  setProvider: (provider: Provider) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  hasServerGeminiKey?: boolean;
  hasServerGroqKey?: boolean;
}

const PROVIDER_INFO = {
  gemini: {
    name: "Gemini 1.5 Pro",
    label: "Google Gemini API Key",
    link: "https://aistudio.google.com/apikey",
    linkText: "Google AI Studio",
  },
  groq: {
    name: "Groq (Llama 4 Scout)",
    label: "Groq API Key",
    link: "https://console.groq.com/keys",
    linkText: "Groq Console",
  },
};

export function ProviderSelector({
  provider,
  setProvider,
  apiKey,
  setApiKey,
  hasServerGeminiKey,
  hasServerGroqKey,
}: ProviderSelectorProps) {
  const info = PROVIDER_INFO[provider];
  const hasServerKey = provider === "gemini" ? hasServerGeminiKey : hasServerGroqKey;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        AI Provider
      </label>
      <div className="flex gap-4 mb-4">
        {(["gemini", "groq"] as Provider[]).map((p) => (
          <label key={p} className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="provider"
              value={p}
              checked={provider === p}
              onChange={() => setProvider(p)}
              className="mr-2"
            />
            <span className="text-sm">{PROVIDER_INFO[p].name}</span>
            {(p === "gemini" ? hasServerGeminiKey : hasServerGroqKey) && (
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                Key Set
              </span>
            )}
          </label>
        ))}
      </div>

      <label className="block text-sm font-medium text-gray-700 mb-2">
        <Key className="inline w-4 h-4 mr-1" />
        {info.label}
        {hasServerKey && (
          <span className="text-xs text-gray-400 ml-2">
            (optional - using server key)
          </span>
        )}
      </label>
      <input
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder={hasServerKey ? "Leave empty to use server key" : "Enter your API key"}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <p className="text-xs text-gray-500 mt-1">
        Get your free API key from{" "}
        <a
          href={info.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline inline-flex items-center gap-1"
        >
          {info.linkText}
          <ExternalLink size={12} />
        </a>
      </p>
    </div>
  );
}
