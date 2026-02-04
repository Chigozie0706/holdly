import React from "react";
import { BookOpen, Wallet, LogOut } from "lucide-react";

interface HeaderProps {
  userData: any;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function Header({
  userData,
  onConnect,
  onDisconnect,
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-orange-500 to-purple-600 p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
                TrustHold
              </h1>
              <p className="text-xs text-gray-500">Decentralized Lending</p>
            </div>
          </div>

          {userData ? (
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">
                  {userData.address.slice(0, 6)}...{userData.address.slice(-4)}
                </p>
                <p className="text-xs text-gray-500">Connected</p>
              </div>
              <button
                onClick={onDisconnect}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Disconnect</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onConnect}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              <Wallet className="h-4 w-4" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
