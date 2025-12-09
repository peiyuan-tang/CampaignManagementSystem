import React from 'react';
import { Campaign, PolicyStatus } from '../types';

interface CampaignCardProps {
  campaign: Campaign;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  const isApproved = campaign.reviewPolicy.status === PolicyStatus.APPROVED;
  const isRejected = campaign.reviewPolicy.status === PolicyStatus.REJECTED;

  // Helper to determine image source (URL or Base64)
  const getImageSrc = (content: string) => {
    if (content.startsWith('http')) {
      return content;
    }
    return `data:image/jpeg;base64,${content}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
      <div className="relative h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
        {campaign.adImageContent ? (
          <img 
            src={getImageSrc(campaign.adImageContent)} 
            alt={campaign.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-400 flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">No Image</span>
          </div>
        )}
        
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isApproved ? 'bg-green-100 text-green-800' : 
            isRejected ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {isApproved && <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></>}
            {isRejected && <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></>}
            {campaign.reviewPolicy.status}
          </span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 truncate pr-2">{campaign.name}</h3>
          <span className="text-sm font-semibold text-gray-600">${campaign.budget.toLocaleString()}</span>
        </div>
        
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 italic">"{campaign.adTextContent}"</p>

        {/* Policy Reason (if any) */}
        {!isApproved && (
           <div className="mb-4 p-2 bg-red-50 rounded border border-red-100 text-xs text-red-700">
             <strong>Policy Check:</strong> {campaign.reviewPolicy.reason}
           </div>
        )}

        {/* Keywords */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {campaign.keywords.slice(0, 4).map((k, i) => (
              <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-100">
                #{k}
              </span>
            ))}
            {campaign.keywords.length > 4 && (
              <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-xs rounded-md border border-gray-100">
                +{campaign.keywords.length - 4}
              </span>
            )}
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
              <span className="text-[6px] text-white font-bold">AI</span>
            </div>
            <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">Embedding Active</p>
          </div>
          <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{campaign.semanticDescription}</p>
        </div>
      </div>
    </div>
  );
};