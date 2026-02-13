import React from "react";
import { Lock } from "lucide-react";

interface WelcomeScreenProps {
  onConnect: () => void;
}

export default function WelcomeScreen({ onConnect }: WelcomeScreenProps) {
  return (
    <div className="text-center py-20">
      <div className="bg-gradient-to-br from-orange-500 to-purple-600 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
        <Lock className="h-10 w-10 text-white" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        Welcome to Holdly
      </h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        A decentralized lending platform secured by Bitcoin. Lend and borrow
        with sBTC deposits.
      </p>
      <button
        onClick={onConnect}
        className="px-8 py-3 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
      >
        Connect Wallet to Get Started
      </button>
    </div>
  );
}
