import React, { useState, useRef } from 'react';
import { CreateCampaignDraft, Campaign, PolicyStatus } from '../types';
import { generateKeywords, autoRateCampaign, generateSemanticDescription } from '../services/geminiService';
import { CampaignService } from '../services/campaignService';

interface CreateCampaignProps {
  onSave: (campaign: Campaign) => void;
  onCancel: () => void;
}

export const CreateCampaign: React.FC<CreateCampaignProps> = ({ onSave, onCancel }) => {
  const [draft, setDraft] = useState<CreateCampaignDraft>({
    name: '',
    budget: 1000,
    adTextContent: '',
    adImageContent: null,
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create local preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        // We still set adImageContent to base64 for the Gemini API analysis locally
        // but we will upload the actual file to storage for persistence.
        const base64String = (reader.result as string).replace('data:', '').replace(/^.+,/, '');
        setDraft(prev => ({ ...prev, adImageContent: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // 1. Generate Keywords (AI)
      setLoadingStep('Analzying context & Suggesting keywords...');
      const keywords = await generateKeywords(draft.adTextContent, draft.adImageContent);

      // 2. Auto-Rate Policy (AI Agent)
      setLoadingStep('Running Auto-Rater Policy Agent...');
      const policyReview = await autoRateCampaign(draft.adTextContent, draft.adImageContent);

      // 3. Train Offline Embedding (Simulated via Semantic Description)
      setLoadingStep('Training offline embedding & vectorizing...');
      const semanticDescription = await generateSemanticDescription(draft.adTextContent, draft.adImageContent);

      // 4. Upload Image to Backend Storage (Supabase)
      let finalImageUrl = null;
      if (imageFile) {
        setLoadingStep('Uploading assets to Supabase Storage...');
        finalImageUrl = await CampaignService.uploadImage(imageFile);
      }

      // 5. Save to Database
      setLoadingStep('Saving campaign to database...');
      const newCampaign: Campaign = {
        id: crypto.randomUUID(),
        name: draft.name,
        budget: draft.budget,
        adTextContent: draft.adTextContent,
        // Use the storage URL if upload succeeded, otherwise null (or base64 if we wanted to fallback, but URL is better)
        adImageContent: finalImageUrl, 
        keywords,
        reviewPolicy: {
          ...policyReview,
          timestamp: Date.now()
        },
        semanticDescription,
        createdAt: Date.now()
      };

      await CampaignService.createCampaign(newCampaign);

      onSave(newCampaign);
    } catch (error) {
      console.error("Campaign creation failed", error);
      alert("Failed to create campaign. Check console for details.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">New Campaign</h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">Cancel</button>
      </div>

      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center h-96 p-8 text-center space-y-6">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-indigo-600 font-bold text-xs">AI</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Processing Campaign</h3>
              <p className="text-sm text-indigo-600 mt-2 font-mono animate-pulse">{loadingStep}</p>
            </div>
            <div className="max-w-md text-xs text-gray-400">
              Buyside AI is analyzing your creative assets, running safety checks against our policy engine, and generating vector embeddings for retrieval optimization.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  placeholder="e.g. Summer Sale 2025"
                  value={draft.name}
                  onChange={e => setDraft({ ...draft, name: e.target.value })}
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  value={draft.budget}
                  onChange={e => setDraft({ ...draft, budget: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ad Text Content</label>
              <textarea
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                placeholder="Describe your product or offer..."
                value={draft.adTextContent}
                onChange={e => setDraft({ ...draft, adTextContent: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500">This text will be analyzed for keyword extraction and safety compliance.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Creative Image</label>
              <div 
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition ${previewUrl ? 'border-indigo-300 bg-indigo-50' : ''}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="space-y-1 text-center">
                  {previewUrl ? (
                    <div className="relative">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="mx-auto h-48 object-cover rounded-md shadow-sm"
                      />
                      <p className="text-xs text-indigo-600 mt-2 font-medium">Click to change image</p>
                    </div>
                  ) : (
                    <>
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600 justify-center">
                        <span className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                          Upload a file
                        </span>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </>
                  )}
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!draft.name || !draft.adTextContent}
                className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Launch Campaign
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};