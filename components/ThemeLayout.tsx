import React, { useState } from 'react';
import Modal from './Modal';

interface ThemeLayoutProps {
  children: React.ReactNode;
}

const ThemeLayout: React.FC<ThemeLayoutProps> = ({ children }) => {
  const [activeInfoModal, setActiveInfoModal] = useState<string | null>(null);

  const renderModalContent = () => {
    switch (activeInfoModal) {
      case 'about':
        return (
          <div className="space-y-4 text-gray-300">
            <p>Welcome to the Debt Payoff Calculator by Doodax. Our mission is to empower individuals to take control of their financial future through transparent, easy-to-use tools.</p>
            <p>This application was built with precision and care to help you visualize your path to becoming debt-free using proven financial strategies.</p>
          </div>
        );
      case 'contact':
        return (
          <div className="space-y-4 text-gray-300">
            <p>We value your feedback and are here to assist you.</p>
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="font-bold text-white">Contact Information:</p>
              <p className="mt-2">Email: <a href="mailto:hsini.web@gmail.com" className="text-purple-400 hover:text-purple-300">hsini.web@gmail.com</a></p>
              <p>Website: <a href="https://doodax.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">doodax.com</a></p>
            </div>
            <p>For technical support or feature requests, please reach out via email.</p>
          </div>
        );
      case 'privacy':
        return (
          <div className="space-y-4 text-gray-300">
            <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
            <p>At Doodax.com, we take your privacy seriously. This calculator runs entirely in your browser ("Client-Side"). We do not store, transmit, or save your financial data on any server.</p>
            <h3 className="font-bold text-white">Data Collection</h3>
            <p>We do not collect personal financial data. Any numbers you enter into the calculator remain on your device and are cleared when you refresh the page.</p>
            <h3 className="font-bold text-white">Cookies</h3>
            <p>We may use basic cookies for site functionality and analytics to improve user experience.</p>
          </div>
        );
      case 'terms':
        return (
          <div className="space-y-4 text-gray-300">
            <p><strong>Terms of Service</strong></p>
            <p>By using this website, you agree to the following terms:</p>
            <ul className="list-disc list-inside">
              <li>This tool is for educational and informational purposes only.</li>
              <li>The results provided are estimates and should not be considered professional financial advice.</li>
              <li>You are responsible for verifying all financial data before making decisions.</li>
              <li>Doodax.com is not liable for any financial losses incurred based on the use of this tool.</li>
            </ul>
          </div>
        );
      case 'dmca':
        return (
          <div className="space-y-4 text-gray-300">
            <p><strong>DMCA Compliance</strong></p>
            <p>Doodax respects the intellectual property rights of others. If you believe that content on this website violates your copyright, please contact us immediately at hsini.web@gmail.com.</p>
          </div>
        );
      case 'guide':
        return (
          <div className="space-y-4 text-gray-300">
            <p><strong>Quick Start Guide</strong></p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Gather your latest statements for all credit cards and loans.</li>
              <li>Enter the Name, Balance, Interest Rate (APR), and Minimum Payment for each debt in the "Enter Your Debts" section.</li>
              <li>Scroll down to the Strategy section. Enter any extra money you can afford to pay monthly.</li>
              <li>Toggle between "Avalanche" and "Snowball" to see how the payoff date and total interest change.</li>
              <li>Review the "Amortization Schedule" to see your month-by-month plan.</li>
            </ol>
          </div>
        );
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    if (!activeInfoModal) return '';
    return activeInfoModal.charAt(0).toUpperCase() + activeInfoModal.slice(1) + (activeInfoModal === 'dmca' ? '' : '');
  };

  return (
    <div className="relative min-h-screen w-full bg-gray-900 text-white font-sans overflow-x-hidden flex flex-col">
      {/* Immersive Smoky Galaxy Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[#0f0c29] bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]"></div>
        <div className="absolute inset-0 opacity-40 bg-gradient-to-r from-purple-900 via-transparent to-blue-900 animate-nebula blur-3xl transform scale-150"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-pink-900 via-transparent to-transparent animate-pulse"></div>
        {/* Stars Overlay */}
        <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '50px 50px', opacity: 0.1}}></div>
      </div>

      <div className="relative z-10 flex-grow">
        {children}
      </div>

      {/* Enhanced Gold Footer */}
      <footer className="relative z-10 mt-24 pt-12 pb-8 bg-gray-900/80 backdrop-blur-md border-t border-gold-600/30 text-center text-gray-300">
        <div className="container mx-auto px-4">
          
          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm font-medium">
            {['about', 'contact', 'guide', 'privacy', 'terms', 'dmca'].map((item) => (
              <button
                key={item}
                onClick={() => setActiveInfoModal(item)}
                className="hover:text-gold-400 transition-colors uppercase tracking-wider"
              >
                {item === 'dmca' ? 'DMCA' : item.replace('-', ' ')}
              </button>
            ))}
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent mb-8"></div>

          <div className="flex flex-col items-center justify-center space-y-4">
            <p className="text-lg font-semibold text-white">
              &copy; {new Date().getFullYear()} <span className="text-gold-500">Doodax.com</span>. All Rights Reserved.
            </p>
            <p className="text-sm text-gray-400 max-w-2xl">
              Empowering your journey to financial freedom. 
            </p>
            
            <div className="mt-6 pt-4 border-t border-gray-800 w-full max-w-xs mx-auto">
              <p className="text-sm text-gray-500">Powered by</p>
              <a 
                href="https://github.com/hsinidev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block mt-1 text-gold-400 hover:text-white font-bold text-lg transition-all hover:scale-105"
              >
                HSINI MOHAMED
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Info Modal */}
      <Modal 
        isOpen={activeInfoModal !== null} 
        onClose={() => setActiveInfoModal(null)} 
        title={getModalTitle()}
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default ThemeLayout;