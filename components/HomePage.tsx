
import React from 'react';

interface HomePageProps {
    onNavigate: (view: 'CUSTOMER' | 'ADMIN') => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="relative flex flex-col items-center justify-center h-full text-center p-8 overflow-hidden rounded-lg">
       <div className="absolute top-0 left-0 w-full h-full bg-gray-50 z-0"></div>
      <div className="relative z-20 max-w-2xl">
        <h1 className="text-5xl font-extrabold mb-4 text-teal-600">
          Welcome to Stanley's Cafe
        </h1>
        <p className="text-lg mb-10 text-gray-600">
          Your favorite spot for delicious coffee, pastries, and more. Order online for a quick and easy experience.
        </p>
        <div className="mt-8">
          <button
            onClick={() => onNavigate('CUSTOMER')}
            className="bg-teal-600 text-white font-bold py-4 px-8 rounded-full text-lg shadow-lg hover:bg-teal-700 transition-transform transform hover:scale-105 duration-300 ease-in-out"
          >
            Start Your Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;