import React from "react";
import { BookOpen, Wallet } from "lucide-react";

interface HeaderProps {
  connected: boolean;
  address: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function Header({
  connected,
  address,
  onConnect,
  onDisconnect,
}: HeaderProps) {
  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-orange-500 to-purple-600 p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent">
                Book Lending dApp
              </h1>
              <p className="text-sm text-gray-600">
                Decentralized library with sBTC deposits
              </p>
            </div>
          </div>

          <div>
            {connected ? (
              <div className="flex items-center space-x-3">
                <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-700">
                    {address && truncateAddress(address)}
                  </p>
                </div>
                <button
                  onClick={onDisconnect}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={onConnect}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                <Wallet className="h-5 w-5" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
