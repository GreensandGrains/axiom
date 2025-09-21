import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { loginWithDiscord } from "@/lib/auth";
import Navbar from "@/components/navbar";
import backgroundImage from "@assets/uKEPXc_1757871248097.jpg";

export default function Login() {
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    loginWithDiscord(rememberMe);
  };

  const handleDiscordServerRedirect = () => {
    // Replace with your actual Discord server invite URL
    const newWindow = window.open("https://discord.gg/your-server", "_blank", "noopener");
    if (newWindow) newWindow.opener = null;
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {/* Dark overlay to make background much darker */}
      <div className="absolute inset-0  bg-[#1d1d36]/80"></div>
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 rounded-box">
        <div className="w-full w-[500px] h-[500px] rounded-box">
        <div className="bg-[#1d1d36] rounded-xl p-8 shadow-2xl h-[530px] w-[450px] absolute left-[545px]">
          {/* Logo and Company Name */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3">
              {/* Logo placeholder - replace with your actual logo */}
              
                <img 
                  src="/assets/axiom-logo.png" 
                  width="42"
                  height="42"
                  alt="Axiom Logo" 
                  className=" object-contain rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(124,58,237,0.9)] absolute top-[22px] left-[30px]"
                  onError={(e) => {
                    console.error('Logo failed to load:', e);
                    e.currentTarget.style.display = 'block';
                  }}
                />
              <h2 className="text-white text-size-[20px] font-semibold absolute top-[33px] left-[68px] text-xl" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>Axiom</h2>
            </div>
          </div>
          {/* Username Input */}
          <div className="mb-4 absolute top-[140px]">
            <Label 
              htmlFor="username" 
              className="text-sm text-gray-300 absolute left-[7px] top-[-11px]"
            >
              Username
            </Label>
            <input
              type="text"
              id="username"
              placeholder="Username"
              className="w-[350px] px-4 py-2 rounded-md bg-[#343541] text-gray-400 border border-gray-700 focus:outline-none focus:border-blue-500 absolute left-[4px] top-[20px] top transition-all duration-300 rounded-xl"
              data-testid="input-username"
            />
          </div>

          {/* Password Input */}
          <div className="mb-6 absolute top-[240px]">
            <Label 
              htmlFor="password" 
              className="text-sm text-gray-300 absolute left-[5px] top-[-20px]"
            >
              Password
            </Label>
            <input
              type="password"
              id="password"
              placeholder="Password"
              className="w-[350px] px-4 py-2 rounded-md bg-[#343541] text-gray-400 border border-gray-700 focus:outline-none focus:border-blue-500 absolute left-[5px] top-[15px] transition-all duration-300 rounded-xl"
              data-testid="input-password"
            />
          </div>

          {/* Login Title */}
          <div className="text-center mb-6">
            <h2 className="text-white text-xl font-semibold absolute top-[90px] left-[33px]">Login to Continue</h2>
          </div>
          {/* Remember Me Option */}
          <div className="flex items-center space-x-2 mb-6 absolute top-[340px]">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              data-testid="checkbox-remember-me"
            />
            <Label 
              htmlFor="remember-me" 
              className="text-sm text-gray-300 cursor-pointer"
            >
              Keep me signed in for 90 days
            </Label>
          </div>

          {/* Discord Login Button */}
          <Button
            onClick={handleLogin}
            className="w-[400px] bg-[#5865F2] hover:bg-[#4752C4] text-white transition-all duration-300 hover:scale-105 hover:shadow-lg mb-6 absolute top-[400px] left-[19px]"
            size="lg"
            data-testid="button-login-discord"
          >
            <svg className="mr-2 w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Continue with Discord
          </Button>

          {/* Call Discord Link */}
          <div className="text-center">
            <button 
              onClick={handleDiscordServerRedirect}
              className="flex items-center text-gray-300 hover:text-gray-700 transition-colors duration-200 absolute top-[480px] left-[184px]"
              data-testid="link-call-discord text-gray-300"
            >
               <svg className="mr-2 w-4 h-4" viewBox="0 0 24 24" fill="currentColor" >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                <span className="text-m ">Discord</span>
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}