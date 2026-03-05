import React, { useState } from "react";
import { setGeminiKey } from "./geminiAI";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { KeyRound, ExternalLink } from "lucide-react";

export default function ApiKeySetup({ onSaved }) {
  const [key, setKey] = useState("");

  const handleSave = () => {
    if (!key.trim()) return;
    setGeminiKey(key.trim());
    onSaved();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-amber-100/30 border border-gray-100 p-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-5">
          <KeyRound className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Enter Your Gemini API Key</h2>
        <p className="text-gray-500 text-sm text-center mb-6">
          NutriScan uses Google Gemini AI to analyze food photos. Your key is stored only in your browser — nothing is sent to any server.
        </p>
        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-sm text-amber-600 hover:text-amber-700 mb-5"
        >
          <ExternalLink className="w-4 h-4" />
          Get a free API key from Google AI Studio
        </a>
        <Input
          placeholder="AIza..."
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="rounded-xl mb-3"
          type="password"
        />
        <Button
          onClick={handleSave}
          disabled={!key.trim()}
          className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white"
        >
          Save & Continue
        </Button>
      </div>
    </div>
  );
}