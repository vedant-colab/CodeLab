// import React, { useState } from 'react';
// import { FaUserCircle } from 'react-icons/fa';
// import SignUp from './SignUp'; // Import SignUp component
// import Login from './Login'; // Import Login component

// const Header: React.FC = () => {
//   const [isDropdownOpen, setDropdownOpen] = useState(false);
//   const [isSignUpOpen, setSignUpOpen] = useState(false);
//   const [isLoginOpen, setLoginOpen] = useState(false);

//   const toggleDropdown = () => {
//     setDropdownOpen(!isDropdownOpen);
//   };

//   const openSignUp = () => {
//     setSignUpOpen(true);
//     setDropdownOpen(false); // Close dropdown when opening Sign Up
//   };

//   const openLogin = () => {
//     setLoginOpen(true);
//     setDropdownOpen(false); // Close dropdown when opening Login
//   };

//   return (
//     <header className="bg-transparent backdrop-blur-md shadow-md fixed w-full top-0 left-0 z-50">
//       <nav className="container mx-auto flex justify-between items-center py-4 px-6">
//         <div className="text-2xl font-bold text-black hover:text-gray-800 transition-transform transform hover:translate-x-2 hover:scale-105">
//           CodeCollab
//         </div>
//         <ul className="flex space-x-6 items-center">
//           <li>
//             <a
//               href="#features"
//               className="text-black hover:text-gray-800 relative group"
//             >
//               <span className="relative z-10">Features</span>
//               <span className="block h-0.5 bg-gray-800 absolute bottom-0 left-0 w-0 group-hover:w-full transition-all duration-300"></span>
//             </a>
//           </li>
//           <li>
//             <a
//               href="#editor"
//               className="text-black hover:text-gray-800 relative group"
//             >
//               <span className="relative z-10">Editor</span>
//               <span className="block h-0.5 bg-gray-800 absolute bottom-0 left-0 w-0 group-hover:w-full transition-all duration-300"></span>
//             </a>
//           </li>
//           <li>
//             <a
//               href="#contact"
//               className="text-black hover:text-gray-800 relative group"
//             >
//               <span className="relative z-10">Contact</span>
//               <span className="block h-0.5 bg-gray-800 absolute bottom-0 left-0 w-0 group-hover:w-full transition-all duration-300"></span>
//             </a>
//           </li>
//           <li className="relative">
//             <button
//               className="text-black focus:outline-none"
//               onClick={toggleDropdown}
//             >
//               <FaUserCircle size={24} />
//             </button>
//             {isDropdownOpen && (
//               <div className="absolute right-0 mt-2 bg-white text-black border border-gray-300 rounded-md shadow-lg z-50 p-4 flex items-center space-x-4">
//                 <button
//                   className="px-4 py-2 border rounded-md hover:bg-gray-100"
//                   onClick={openLogin}
//                 >
//                   Login
//                 </button>
//                 <button
//                   className="px-4 py-2 border rounded-md hover:bg-gray-100"
//                   onClick={openSignUp}
//                 >
//                   Sign Up
//                 </button>
//               </div>
//             )}
//           </li>
//         </ul>
//       </nav>
//       {isSignUpOpen && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//           <SignUp />
//         </div>
//       )}
//       {isLoginOpen && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//           <Login />
//         </div>
//       )}
//     </header>
//   );
// };

// export default Header;

// import React, { useState } from 'react';
// import { FaUserCircle } from 'react-icons/fa';
// import SignUp from './SignUp'; // Import SignUp component
// import Login from './Login'; // Import Login component
// import { Button } from '../ui/button';
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
// import { UserCircle } from 'lucide-react';
// import { Dialog, DialogContent } from '@radix-ui/react-dialog';
// import SignUpComponent from './SignUp';
// import LoginComponent from './Login';

const MainPage: React.FC = () => {
  // const [showSignUp, setShowSignUp] = useState(false);
  // const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to CodeCollab</h1>
        <p className="text-xl">Collaborate on code in real-time with your team.</p>
      </main>

    </div>
  );
};

export default MainPage;
