// Example: How to use QuickSetupModal in your Home.jsx or App.jsx

import React, { useState } from 'react';
import QuickSetupModal from './components/QuickSetupModal';
import { MdAdd } from 'react-icons/md';

function App() {
  const [isQuickSetupOpen, setIsQuickSetupOpen] = useState(false);

  const handleQuickSetupSuccess = () => {
    // Refresh your data after successful setup
    console.log('Quick Setup completed successfully!');
    
    // Example: Reload shipments, warehouses, or drivers data
    // loadViewData('shipments');
    // loadViewData('warehouses');
    // loadViewData('drivers');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Your existing content */}
      
      {/* Quick Setup Button */}
      <button
        onClick={() => setIsQuickSetupOpen(true)}
        className="fixed bottom-8 right-8 bg-[#f06529] hover:bg-[#d95520] text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110"
        title="Quick Setup"
      >
        <MdAdd size={32} />
      </button>

      {/* Quick Setup Modal */}
      <QuickSetupModal
        isOpen={isQuickSetupOpen}
        onClose={() => setIsQuickSetupOpen(false)}
        onSuccess={handleQuickSetupSuccess}
      />
    </div>
  );
}

export default App;

// ============================================
// Alternative: Integrate into existing Home.jsx
// ============================================

// In your Home.jsx, replace the existing Quick Setup modal code with:

import QuickSetupModal from '../components/QuickSetupModal';

// Inside your Home component:
const [isQuickSetupOpen, setIsQuickSetupOpen] = useState(false);

const handleQuickSetupSuccess = () => {
  // Reload current view data
  loadViewData(currentView);
  // Reload dashboard stats
  loadViewData('dashboard');
};

// In your JSX, replace the existing modal with:
<QuickSetupModal
  isOpen={isQuickSetupOpen}
  onClose={() => setIsQuickSetupOpen(false)}
  onSuccess={handleQuickSetupSuccess}
/>

// Keep your existing button that opens the modal:
<button onClick={() => setIsQuickSetupOpen(true)}>
  <MdAdd />
</button>
