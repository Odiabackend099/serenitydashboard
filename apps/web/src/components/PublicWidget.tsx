import React from 'react';
import ChatWidget from './ChatWidget';

/**
 * PublicWidget - Standalone chat widget for public website embedding
 *
 * This component is designed to be embedded on https://srhcareai.odia.dev
 * for lead capture, FAQ answering, and initial patient engagement.
 *
 * Features:
 * - No authentication required
 * - Simple, clean interface
 * - Embeddable on any website
 * - Focuses on conversational AI for lead generation
 */
export default function PublicWidget() {
  return (
    <div className="h-screen w-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Branding Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            SRH Care AI
          </h1>
          <p className="text-lg text-gray-600">
            Your 24/7 Healthcare Assistant
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Get instant answers to your healthcare questions, book appointments, and connect with our team.
          </p>
        </div>

        {/* Chat Widget - Centered and Prominent */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ height: '600px' }}>
          <ChatWidget
            mode="public"
            showWelcomeMessage={true}
            initialOpen={true}
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Powered by Advanced AI Technology</p>
          <p className="mt-1">Your privacy is important to us. All conversations are secure and confidential.</p>
        </div>
      </div>
    </div>
  );
}
