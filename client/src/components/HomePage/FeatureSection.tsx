import React from 'react';

const FeatureSection: React.FC = () => {
  return (
    <section id="features" className="py-16 bg-white">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-8">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-gray-50 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Live Collaboration</h3>
            <p>Work together with others in real-time, with instant updates and synchronized changes.</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Syntax Highlighting</h3>
            <p>Enjoy syntax highlighting for various programming languages to make code easier to read and debug.</p>
          </div>
          <div className="p-6 bg-gray-50 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Integrated Chat</h3>
            <p>Communicate with your team directly within the editor for a seamless development experience.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
