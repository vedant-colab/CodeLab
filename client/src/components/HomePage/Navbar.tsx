import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserCircle, Settings, LogOut, Moon, Sun } from "lucide-react"
import SignUpComponent from './SignUp';
import LoginComponent from './Login';
import { useAuth } from '../Misc/AuthContext'  // Import the useAuth hook
import axios, { AxiosRequestConfig } from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '../ui/ThemeProvider';


const Navbar: React.FC = () => {
  const [showSignUp, setShowSignUp] = React.useState(false);
  const [showLogin, setShowLogin] = React.useState(false);
  const { isAuthenticated, logout } = useAuth();  // Use the authentication context
  const navigate = useNavigate();
  const { toast } = useToast()
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    try {
      const token = sessionStorage.getItem('authToken');
      
      // If token is not available, stop the function
      if (!token) {
        console.error("No auth token found in sessionStorage");
        return;
      }
      console.log(token)
      const config: AxiosRequestConfig = {
        headers: {
          Authorization: `Bearer ${token}`,  // Add 'Bearer ' before the token
        },
      };
  
      const response = await axios.get('http://localhost:3000/api/v1/auth/logoutUser', config);
  
      if (response.status === 200) {  // response.status, not response.data.status
        logout();  // Call the logout function from AuthContext
        toast({
          title: "Logout successful",
          description: "You have been successfully logged out.",
        })
        navigate('/')
      }
    } catch (error: unknown) {  
      if (error instanceof Error) {
        console.log(error.message);  // Log error message
      }
    }
  };
  
 const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <nav className="bg-white text-black border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <span className="text-2xl font-bold">CodeLab</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-4">
            <Button variant="ghost">Features</Button>
            <Link to="/room-selection">
              <Button variant="ghost">Editor</Button>
            </Link>
            <Link to='/contact'>
            <Button variant="ghost">Contact</Button>
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'light' ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  {isAuthenticated ? (
                    <Avatar>
                      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  ) : (
                    <UserCircle className="h-6 w-6" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isAuthenticated ? (
                  <>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link to="/dashboard" className="flex items-center">
                        <UserCircle className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link to="/profile" className="flex items-center">
                        <UserCircle className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link to="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onSelect={() => setShowLogin(true)}>
                      Login
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setShowSignUp(true)}>
                      Sign Up
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Sign Up Modal */}
      <Dialog open={showSignUp} onOpenChange={setShowSignUp}>
        <DialogContent className="sm:max-w-[425px]">
          <SignUpComponent closeModal={() => setShowSignUp(false)} />
        </DialogContent>
      </Dialog>

      {/* Login Modal */}
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className="sm:max-w-[425px]">
          <LoginComponent closeModal={() => setShowLogin(false)} />
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default Navbar;