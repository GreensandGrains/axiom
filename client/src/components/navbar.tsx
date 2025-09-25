
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth, loginWithDiscord, logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { User, Server, Trophy, ShoppingCart, LogOut, Bot, Calendar, Plus, Users, Hash, Settings, Coins, ChevronDown, HelpCircle, Mail, Ticket, Twitter, Instagram, Youtube, Facebook, Search, Menu, X } from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location, navigate] = useLocation();
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [supportDropdownOpen, setSupportDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogin = () => {
    loginWithDiscord(false);
  };

  if (isLoading) {
    return (
      <nav className="bg-card from-purple-900 via-blue-900 to-indigo-900 border-b border-[#16213e] sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3 group" data-testid="link-home">
                <div className="relative">
                  <img
                    src="/assets/axiom-logo.png"
                    alt="Axiom Logo"
                    className="w-10 h-10 object-contain rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(124,58,237,0.9)]"
                    onError={(e) => {
                      console.error('Logo failed to load:', e);
                      e.currentTarget.style.display = 'block';
                    }}
                  />
                  <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg scale-150 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                </div>
                <span className="font-bold text-xl text-white bg-300% transition-all duration-300 group-hover:scale-105" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                  Axiom
                </span>
              </Link>
            </div>
            <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-card from-purple-900 via-blue-900 to-indigo-900 border-b border-[#16213e] sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group" data-testid="link-home">
              <div className="relative">
                <img
                  src="/assets/axiom-logo.png"
                  alt="Axiom Logo"
                  className="w-10 h-10 object-contain rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(124,58,237,0.9)]"
                  onError={(e) => {
                    console.error('Logo failed to load:', e);
                    e.currentTarget.style.display = 'block';
                  }}
                />
                <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg scale-150 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              </div>
              <span className="font-bold text-lg text-white bg-300% transition-all duration-300 group-hover:scale-105" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
                Axiom
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center ml-10 space-x-8">
              <Link
                href="/explore"
                className={`flex items-center text-gray-400 hover:text-purple-400 transition-all duration-300 hover:scale-105 ${
                  location === "/explore" ? "text-purple-400" : ""
                }`}
                data-testid="link-explore"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
                Explore
              </Link>

              {/* Service Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setServiceDropdownOpen(true)}
                onMouseLeave={() => setServiceDropdownOpen(false)}
              >
                <button
                  className="flex items-center text-gray-400 hover:text-purple-400 transition-colors duration-200"
                  data-testid="dropdown-service"
                >
                  <Server className="w-4 h-4 mr-1" />
                  Service
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>

                {serviceDropdownOpen && (
                  <div className="absolute top-full mt-2 w-[600px] bg-card rounded-xl shadow-2xl border border-card p-6 z-50">
                    <div className="grid grid-cols-2 gap-4">
                      <Link href="/your-servers" className="group p-4 rounded-lg hover:bg-[#16213e] transition-colors" data-testid="link-advertise-server">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                            <Server className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold text-sm mb-1">Advertise Servers</h3>
                            <p className="text-gray-400 text-xs leading-relaxed">Advertise own Discord server for you and your friends</p>
                          </div>
                        </div>
                      </Link>
                      
                      <Link href="/your-bots" className="group p-4 rounded-lg hover:bg-[#16213e] transition-colors" data-testid="link-your-servers">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                            <Bot className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold text-sm mb-1">Advertise Bots</h3>
                            <p className="text-gray-400 text-xs leading-relaxed">Advertise discord bot with our coding projects</p>
                          </div>
                        </div>
                      </Link>
                      
                      <Link href="/events" className="group p-4 rounded-lg hover:bg-[#16213e] transition-colors" data-testid="link-advertise-event">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                            <Calendar className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold text-sm mb-1">Advertise Event</h3>
                            <p className="text-gray-400 text-xs leading-relaxed">Host your own event server for you and your friends</p>
                          </div>
                        </div>
                      </Link>
                      
                      <Link href="/partnership" className="group p-4 rounded-lg hover:bg-[#16213e] transition-colors" data-testid="link-partnership">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                            <Users className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold text-sm mb-1">Partnership Hub</h3>
                            <p className="text-gray-400 text-xs leading-relaxed">Browse our full community partnerships</p>
                          </div>
                        </div>
                      </Link>
                      
                      <Link href="/server-templates" className="group p-4 rounded-lg hover:bg-[#16213e] transition-colors" data-testid="link-template">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                            <Hash className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold text-sm mb-1">Server Templates</h3>
                            <p className="text-gray-400 text-xs leading-relaxed">Browse our full range of server templates</p>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/join-members"
                className={`flex items-center text-gray-400 hover:text-purple-400 transition-all duration-300 hover:scale-105 ${
                  location === "/join-members" ? "text-purple-400" : ""
                }`}
                data-testid="link-join-members"
              >
                <Users className="w-4 h-4 mr-1" />
                Join Member
              </Link>

              <Link
                href="/store"
                className={`flex items-center text-gray-400 hover:text-purple-400 transition-all duration-300 hover:scale-105 ${
                  location === "/store" ? "text-purple-400" : ""
                }`}
                data-testid="link-store"
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                Store
              </Link>
              <Link
                href="/jobs"
                className={`flex items-center text-gray-400 hover:text-purple-400 transition-all duration-300 hover:scale-105 ${
                  location === "/jobs" ? "text-purple-400" : ""
                }`}
                data-testid="link-jobs"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="w-4 h-4 mr-1" viewBox="0 0 16 16">
                  <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1.5A.5.5 0 0 0 1 4.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a1.5 1.5 0 0 1 1.5-1.5h13A1.5 1.5 0 0 1 16 4.5z"/>
                </svg>
                Job
              </Link>

              {/* Support Dropdown */}
              <div
                className="relative text-sm"
                onMouseEnter={() => setSupportDropdownOpen(true)}
                onMouseLeave={() => setSupportDropdownOpen(false)}
              >
                <button
                  className="flex items-center text-gray-400 hover:text-purple-400 transition-colors duration-200 text-sm"
                  data-testid="dropdown-support"
                >
                  <HelpCircle className="w-4 h-4 mr-1" />
                  Support
                  <ChevronDown className="w-4 h-4 ml-1" />
                </button>

                {supportDropdownOpen && (
                  <div className="absolute top-full mt-2 w-56 bg-card rounded-lg shadow-lg border border-card text-sm py-2 z-50 right-0">
                    <Link href="/blog" className="flex items-center px-4 py-2 text-white hover:bg-gray-700 transition-colors" data-testid="link-support-ticket">
                      <Ticket className="w-4 h-4 mr-3" />
                      Blog
                    </Link>
                    <Link href="/help" className="flex items-center px-4 py-2 text-white hover:bg-gray-700 transition-colors" data-testid="link-help">
                      <HelpCircle className="w-4 h-4 mr-3" />
                      Help
                    </Link>
                    <Link href="/contact-us" className="flex items-center px-4 py-2 text-white hover:bg-gray-700 transition-colors" data-testid="link-contact-us">
                      <Mail className="w-4 h-4 mr-3" />
                      Contact Us
                    </Link>
                    <Link href="/support-ticket" className="flex items-center px-4 py-2 text-white hover:bg-gray-700 transition-colors" data-testid="link-support-ticket">
                      <Ticket className="w-4 h-4 mr-3" />
                      Support Ticket
                    </Link>
                    
                    <div className="border-t border-gray-600 my-2"></div>
                    
                    <div className="px-4 py-2">
                      <h4 className="text-gray-400 text-sm font-semibold mb-2">Social</h4>
                      
                      <a href="https://discord.gg/your-server" target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-2 text-white hover:bg-gray-700 transition-colors text-sm" data-testid="link-discord">
                        <svg className="w-4 h-4 mr-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                        </svg>
                        Discord
                      </a>
                      <a href="https://x.com/Axiomadvertises" target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-2 text-white hover:bg-gray-700 transition-colors text-sm" data-testid="link-twitter">
                        <Twitter className="w-4 h-4 mr-3" />
                        Twitter
                      </a>
                      <a href="https://facebook.com/your-page" target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-2 text-white hover:bg-gray-700 transition-colors text-sm" data-testid="link-facebook">
                        <Facebook className="w-4 h-4 mr-3" />
                        Facebook
                      </a>
                      <a href="https://instagram.com/your-account" target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-2 text-white hover:bg-gray-700 transition-colors text-sm" data-testid="link-instagram">
                        <Instagram className="w-4 h-4 mr-3" />
                        Instagram
                      </a>
                      <a href="https://youtube.com/your-channel" target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-2 text-white hover:bg-gray-700 transition-colors text-sm" data-testid="link-youtube">
                        <Youtube className="w-4 h-4 mr-3" />
                        Youtube
                      </a>
                    </div>
                  </div>
                )}
              </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:text-purple-400"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>

          {/* Desktop Login/Profile Section */}
          <div className="hidden lg:flex items-center gap-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 bg-secondary/20 hover:bg-secondary/30 transition-all duration-300 hover:scale-105"
                    data-testid="button-user-menu"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={user?.avatar ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png` : undefined}
                        alt="User Avatar"
                      />
                      <AvatarFallback>{user?.username?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <span data-testid="text-displayname">{user?.username}</span>
                    <i className="fas fa-chevron-down text-sm transition-all duration-300 group-hover:text-primary"></i>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" forceMount className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-yellow-500">
                        <Coins className="w-3 h-3" />
                        <span>{user?.coins || 0} coins</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" data-testid="Profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/your-events" data-testid="Events">
                      <Calendar className="mr-2 h-4 w-4" />
                      Your Event
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/your-servers" data-testid="button-your-servers">
                      <Server className="mr-2 h-4 w-4" />
                      Your Servers
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/your-bots" data-testid="Bots">
                      <Bot className="mr-2 h-4 w-4" />
                      Your Bot
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/jobs')}>
                    <Users className="mr-2 h-4 w-4" />
                    <span>Job Board</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/partnership')}>
                    <Users className="mr-2 h-4 w-4" />
                    <span>Partnership Hub</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/server-templates')}>
                    <Hash className="mr-2 h-4 w-4" />
                    <span>Server Templates</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/store')}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    <span>Store</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/join-members')}>
                    <Users className="mr-2 h-4 w-4" />
                    <span>Join Members</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem data-testid="button-settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  {user?.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" data-testid="button-admin-panel">
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-red-400 focus:text-red-400"
                    data-testid="button-logout"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                asChild
                className="bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/50"
                data-testid="button-login"
              >
                <Link href="/login">
                  <svg className="mr-2 w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                  Login
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#16213e] bg-card">
            <div className="px-4 py-4 space-y-4">
              <Link
                href="/explore"
                className="flex items-center text-gray-400 hover:text-purple-400 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Search className="w-4 h-4 mr-2" />
                Explore
              </Link>
              
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-300">Services</p>
                <Link href="/your-servers" className="flex items-center text-gray-400 hover:text-purple-400 py-1 pl-4" onClick={() => setMobileMenuOpen(false)}>
                  <Server className="w-4 h-4 mr-2" />
                  Advertise Servers
                </Link>
                <Link href="/your-bots" className="flex items-center text-gray-400 hover:text-purple-400 py-1 pl-4" onClick={() => setMobileMenuOpen(false)}>
                  <Bot className="w-4 h-4 mr-2" />
                  Advertise Bots
                </Link>
                <Link href="/events" className="flex items-center text-gray-400 hover:text-purple-400 py-1 pl-4" onClick={() => setMobileMenuOpen(false)}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Events
                </Link>
                <Link href="/partnership" className="flex items-center text-gray-400 hover:text-purple-400 py-1 pl-4" onClick={() => setMobileMenuOpen(false)}>
                  <Users className="w-4 h-4 mr-2" />
                  Partnership
                </Link>
                <Link href="/server-templates" className="flex items-center text-gray-400 hover:text-purple-400 py-1 pl-4" onClick={() => setMobileMenuOpen(false)}>
                  <Hash className="w-4 h-4 mr-2" />
                  Templates
                </Link>
              </div>

              <Link href="/join-members" className="flex items-center text-gray-400 hover:text-purple-400 py-2" onClick={() => setMobileMenuOpen(false)}>
                <Users className="w-4 h-4 mr-2" />
                Join Members
              </Link>

              <Link href="/store" className="flex items-center text-gray-400 hover:text-purple-400 py-2" onClick={() => setMobileMenuOpen(false)}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Store
              </Link>

              <Link href="/jobs" className="flex items-center text-gray-400 hover:text-purple-400 py-2" onClick={() => setMobileMenuOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="w-4 h-4 mr-2" viewBox="0 0 16 16">
                  <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1zm3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1.5A.5.5 0 0 0 1 4.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a1.5 1.5 0 0 1 1.5-1.5h13A1.5 1.5 0 0 1 16 4.5z"/>
                </svg>
                Jobs
              </Link>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-300">Support</p>
                <Link href="/blog" className="flex items-center text-gray-400 hover:text-purple-400 py-1 pl-4" onClick={() => setMobileMenuOpen(false)}>
                  <Ticket className="w-4 h-4 mr-2" />
                  Blog
                </Link>
                <Link href="/help" className="flex items-center text-gray-400 hover:text-purple-400 py-1 pl-4" onClick={() => setMobileMenuOpen(false)}>
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help
                </Link>
                <Link href="/contact-us" className="flex items-center text-gray-400 hover:text-purple-400 py-1 pl-4" onClick={() => setMobileMenuOpen(false)}>
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Us
                </Link>
                <Link href="/support-ticket" className="flex items-center text-gray-400 hover:text-purple-400 py-1 pl-4" onClick={() => setMobileMenuOpen(false)}>
                  <Ticket className="w-4 h-4 mr-2" />
                  Support Ticket
                </Link>
              </div>

              {/* Mobile Login/Profile */}
              <div className="pt-4 border-t border-[#16213e]">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 py-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={user?.avatar ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png` : undefined}
                          alt="User Avatar"
                        />
                        <AvatarFallback>{user?.username?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-white font-medium">{user?.username}</p>
                        <div className="flex items-center gap-1 text-xs text-yellow-500">
                          <Coins className="w-3 h-3" />
                          <span>{user?.coins || 0} coins</span>
                        </div>
                      </div>
                    </div>
                    <Link href="/profile" className="flex items-center text-gray-400 hover:text-purple-400 py-1" onClick={() => setMobileMenuOpen(false)}>
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                    <button 
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      className="flex items-center text-red-400 hover:text-red-300 py-1 w-full text-left"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link href="/login" className="flex items-center justify-center bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
                    <svg className="mr-2 w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                    Login with Discord
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
