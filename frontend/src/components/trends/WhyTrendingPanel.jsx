import React from 'react';
import TripPlanCTA from './TripPlanCTA';
import { CheckCircle2 } from 'lucide-react';

export default function WhyTrendingPanel({ destination }) {
  return (
    <div className="border-t border-gray-200 px-4 pb-4 pt-3">
      <p className="text-sm text-gray-700 leading-relaxed mb-4">
        {destination.trendReason}
      </p>
      
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Highlights</h4>
        <ul className="space-y-1.5">
          {destination.highlights.map((h, i) => (
            <li key={i} className="flex items-start text-sm text-gray-700">
              <CheckCircle2 size={16} className="text-[#0F6E56] mr-2 mt-0.5 flex-shrink-0" />
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded border border-gray-200">
          📅 Best months: {destination.bestMonths}
        </span>
        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded border border-gray-200">
          💰 {destination.avgBudgetINR}
        </span>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-900 mb-4">
        <strong>💡 Pro Tip:</strong> {destination.planningTip}
      </div>

      <TripPlanCTA destination={destination} />
    </div>
  );
}
