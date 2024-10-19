import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../src/components/Misc/AuthContext';
import { Toaster } from './components/ui/toaster';
import Navbar from '@/components/HomePage/Navbar';
import Footer from '@/components/HomePage/Footer'; // Import the new Footer component
import LandingPage from './components/HomePage/LandingPage';
import EditorPage from './components/editor/EditorPage';
import { ProtectedRoutes } from './components/Misc/ProtectedRoutes';
import ContactForm from './components/HomePage/Contact';
import RoomSelection from './components/editor/RoomSelection';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Toaster />
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route element={<ProtectedRoutes />}>
              <Route path="/room-selection" element={<RoomSelection />} />
                <Route path="/editor" element={<EditorPage />} />
              </Route>
              <Route path='/contact' element={<ContactForm />}/>
              {/* Add other routes as needed */}
            </Routes>
          </main>
          <Footer /> {/* Add the Footer component here */}
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;