import React from 'react';
import ThemeLayout from './components/ThemeLayout';
import DebtCalculatorTool from './components/DebtCalculatorTool';
import SeoArticle from './components/SeoArticle';

const App: React.FC = () => {
  return (
    <ThemeLayout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
            Debt Payoff <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Calculator</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Your journey to financial freedom starts here. Use our tool to compare the Snowball and Avalanche methods and create your personalized payoff plan.
          </p>
        </header>
        
        <main>
          <DebtCalculatorTool />
          <SeoArticle />
        </main>
      </div>
    </ThemeLayout>
  );
};

export default App;
