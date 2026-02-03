"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Edit, User, LogOut, Copy, Check, Gift, Users, ExternalLink } from "lucide-react";
import { navbars } from "~/constants/navbars";
import Logo from "~/components/ui/logo";
import { routers, NavbarType } from "~/constants/routers";
import { useUser } from "~/hooks/useUser";
import { WalletAvatar } from "~/components/WalletAvatar";
import NotificationBell from "~/components/ui/notification-bell";
import { useToastContext } from "~/components/toast-provider";
import WelcomeModalReferrals from "~/components/home/WelcomeModalReferrals";

function UserAvatar({ session }: { session: any }) {
  const [imageError, setImageError] = useState(false);

  const avatarElement = (session.user as { image?: string })?.image && !imageError ? (
    <img
      src={(session.user as { image?: string }).image!}
      alt="User Avatar"
      className="w-8 h-8 rounded-full border border-gray-300 dark:border-white object-cover"
      onError={() => setImageError(true)}
    />
  ) : (
    <WalletAvatar address={(session.user as { address?: string })?.address || null} size={32} className="border border-gray-300 dark:border-white" />
  );

  return (
    <div className="relative group">
      {avatarElement}
    </div>
  );
}

function MobileUserInfo({ session, onClose, onShowModal }: { session: any; onClose: () => void; onShowModal: () => void }) {
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralCount, setReferralCount] = useState<number>(0);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [isReferralsModalOpen, setIsReferralsModalOpen] = useState(false);
  const [isLoadingReferralCode, setIsLoadingReferralCode] = useState(true);
  const { showSuccess, showInfo, showError } = useToastContext();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await fetch('/api/user');        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.success && userData.data) {
            setName(userData.data.name || '');
          } else {
            if (session.user?.name) {
              setName(session.user.name);
            }
          }
        } else {
          if (session.user?.name) {
            setName(session.user.name);
          }
        }

        const referralResponse = await fetch('/api/user/referral-code');
        if (referralResponse.ok) {
          const referralData = await referralResponse.json();
          if (referralData.success && referralData.data) {
            setReferralCode(referralData.data.referralCode);
          }
        }
      } catch (error) {
        if (session.user?.name) {
          setName(session.user.name);
        }
      } finally {
        setIsLoadingReferralCode(false);
      }
    };

    fetchUserData();
  }, [session.user?.name]);

  // Fetch referral stats for mobile
  useEffect(() => {
    const fetchReferralStats = async () => {
      try {
        const userResponse = await fetch('/api/user');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.success && userData.data?.id) {
            const statsResponse = await fetch(`/api/user/${userData.data.id}/referrals`);
            if (statsResponse.ok) {
              const statsData = await statsResponse.json();
              if (statsData.success && statsData.data) {
                setReferralCount(statsData.data.referralCount || 0);
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch referral stats:', error);
      }
    };

    if (session?.user) {
      fetchReferralStats();
    }
  }, [session?.user]);


  const handleGenerateClick = () => {
    onShowModal();
  };

  return (
    <>
      <div className="flex items-center space-x-3 mb-4">
        <UserAvatar session={session} />
        <div className="flex-1 min-w-0">
          <div className="space-y-2">
            <div 
              onClick={() => {
                navigator.clipboard.writeText(name || 'No name set');
                showSuccess('Copied to clipboard!');
              }}
              className="cursor-pointer group"
              title="Click to copy name"
            >
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {name || 'No name set'}
              </p>
            </div>
            
            {(session.user as { address?: string })?.address && (
              <div 
                onClick={() => {
                  navigator.clipboard.writeText((session.user as { address?: string }).address!);
                  showSuccess('Copied to clipboard!');
                }}
                className="cursor-pointer group"
                title="Click to copy address"
              >
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  {(session.user as { address?: string }).address && (session.user as { address?: string }).address!.length > 20 
                    ? `${(session.user as { address?: string }).address!.slice(0, 10)}...${(session.user as { address?: string }).address!.slice(-8)}`
                    : (session.user as { address?: string }).address
                  }
                </p>
              </div>
            )}
            
            {(session.user as { email?: string })?.email && (
              <div 
                onClick={() => {
                  navigator.clipboard.writeText((session.user as { email?: string }).email!);
                  showSuccess('Copied to clipboard!');
                }}
                className="cursor-pointer group"
                title="Click to copy email"
              >
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                  {(session.user as { email?: string }).email && (session.user as { email?: string }).email!.length > 25
                    ? `${(session.user as { email?: string }).email!.slice(0, 12)}...${(session.user as { email?: string }).email!.slice(-10)}`
                    : (session.user as { email?: string }).email
                  }
                </p>
              </div>
            )}
            
            {referralCode && (
              <div className="flex items-center gap-2">
                <div 
                  onClick={() => {
                    navigator.clipboard.writeText(referralCode);
                    showSuccess('Referral code copied!');
                  }}
                  className="cursor-pointer group"
                  title="Click to copy referral code"
                >
                  <p className="text-xs text-purple-600 dark:text-purple-400 truncate hover:text-purple-700 dark:hover:text-purple-300 transition-colors font-mono">
                    {referralCode.length > 15
                      ? `${referralCode.slice(0, 8)}...${referralCode.slice(-4)}`
                      : referralCode
                    }
                  </p>
                </div>
                <button
                  onClick={() => {
                    const shareUrl = `${window.location.origin}#contact&code=${referralCode}`;
                    navigator.clipboard.writeText(shareUrl);
                    showSuccess('Share link copied!');
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  title="Click to copy share link"
                >
                  <ExternalLink className="w-3 h-3 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400" />
                </button>
              </div>
            )}
            
            {referralCode && (
              <div 
                onClick={() => setIsReferralsModalOpen(true)}
                className="flex items-center gap-1 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded px-1 py-0.5 transition-colors"
                title="Click to view referrals"
              >
                <Users className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {referralCount} referral{referralCount !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        {!isLoadingReferralCode && (
          <button
            onClick={() => {
              showInfo('Edit name feature coming soon');
            }}
            className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded"
          >
            <Edit className="w-4 h-4 mr-3" />
            Edit Name
          </button>
        )}
        {!referralCode && !isLoadingReferralCode && (
          <button
            onClick={handleGenerateClick}
            disabled={isGeneratingCode}
            className="w-full flex items-center px-3 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors rounded disabled:opacity-50"
          >
            <Gift className="w-4 h-4 mr-3" />
            {isGeneratingCode ? 'Generating...' : 'Generate Referral Code'}
          </button>
        )}
        <button
          onClick={() => {
            signOut();
            onClose();
          }}
          className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </button>
      </div>

      {/* Referrals Modal */}
      <WelcomeModalReferrals isOpen={isReferralsModalOpen} onClose={() => setIsReferralsModalOpen(false)} />
    </>
  );
}

function UserDropdown({ session, onClose, onShowModal, autoEdit = false }: { session: any; onClose: () => void; onShowModal: () => void; autoEdit?: boolean }) {
  const [isEditing, setIsEditing] = useState(autoEdit);
  const [name, setName] = useState('');
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralCount, setReferralCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [isReferralsModalOpen, setIsReferralsModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isLoadingReferralCode, setIsLoadingReferralCode] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError } = useToastContext();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await fetch('/api/user');        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.success && userData.data) {
            setName(userData.data.name || '');
          } else {
            if (session.user?.name) {
              setName(session.user.name);
            }
          }
        } else {
          if (session.user?.name) {
            setName(session.user.name);
          }
        }

        const referralResponse = await fetch('/api/user/referral-code');
        if (referralResponse.ok) {
          const referralData = await referralResponse.json();
          if (referralData.success && referralData.data) {
            setReferralCode(referralData.data.referralCode);
          }
        }
      } catch (error) {
        if (session.user?.name) {
          setName(session.user.name);
        }
      } finally {
        setIsLoadingReferralCode(false);
      }
    };

    fetchUserData();
  }, [session.user?.name]);

  // Fetch referral stats separately
  useEffect(() => {
    const fetchReferralStats = async () => {
      try {
        // Lấy user ID từ session hoặc API
        const userResponse = await fetch('/api/user');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.success && userData.data?.id) {
            const statsResponse = await fetch(`/api/user/${userData.data.id}/referrals`);
            if (statsResponse.ok) {
              const statsData = await statsResponse.json();
              if (statsData.success && statsData.data) {
                setReferralCount(statsData.data.referralCount || 0);
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch referral stats:', error);
      }
    };

    if (session?.user) {
      fetchReferralStats();
    }
  }, [session?.user]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      showError('Name cannot be empty');
      return;
    }

    if (name.trim().length < 2) {
      showError('Name must be at least 2 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (response.ok) {
        showSuccess('Name updated successfully!');
        setIsEditing(false);
        try {
          const userResponse = await fetch('/api/user');
          if (userResponse.ok) {
            const userData = await userResponse.json();
            if (userData.success && userData.data) {
              setName(userData.data.name || '');
            }
          }
        } catch (fetchError) {
        }
        window.dispatchEvent(new CustomEvent('session-update'));
      } else {
        const error = await response.json();
        showError(error.message || 'An error occurred');
      }
    } catch (error) {
      showError('An error occurred while updating name');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      const response = await fetch('/api/user');
      if (response.ok) {
        const userData = await response.json();
        if (userData.success && userData.data) {
          setName(userData.data.name || '');
        }
      } else {
      }
    } catch (error) {
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      const message = field === 'referral' ? 'Referral code copied!' : 'Copied to clipboard!';
      showSuccess(message);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      showError('Failed to copy to clipboard');
    }
  };


  const handleGenerateClick = () => {
    onShowModal();
  };

  return (
    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <UserAvatar session={session} />
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your name"
                  maxLength={50}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-2 py-1 text-xs bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
                         ) : (
                               <div className="space-y-2">
                                     <div 
                     onClick={() => handleCopy(name || 'No name set', 'name')}
                     className="cursor-pointer group"
                     title="Click to copy name"
                   >
                     <p className="text-sm font-medium text-gray-900 dark:text-white truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                       {name || 'No name set'}
                     </p>
                   </div>
                  
                  {(session.user as { address?: string })?.address && (
                    <div 
                      onClick={() => handleCopy((session.user as { address?: string }).address!, 'address')}
                      className="cursor-pointer group"
                      title="Click to copy address"
                    >
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                        {(session.user as { address?: string }).address && (session.user as { address?: string }).address!.length > 20 
                          ? `${(session.user as { address?: string }).address!.slice(0, 10)}...${(session.user as { address?: string }).address!.slice(-8)}`
                          : (session.user as { address?: string }).address
                        }
                      </p>
                    </div>
                  )}
                                {(session.user as { email?: string })?.email && (
                    <div 
                      onClick={() => handleCopy((session.user as { email?: string }).email!, 'email')}
                      className="cursor-pointer group"
                      title="Click to copy email"
                    >
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                        {(session.user as { email?: string }).email && (session.user as { email?: string }).email!.length > 25
                          ? `${(session.user as { email?: string }).email!.slice(0, 12)}...${(session.user as { email?: string }).email!.slice(-10)}`
                          : (session.user as { email?: string }).email
                        }
                      </p>
                    </div>
                  )}
                  
                  {referralCode && (
                    <div className="flex items-center gap-2">
                      <div 
                        onClick={() => handleCopy(referralCode, 'referral')}
                        className="cursor-pointer group"
                        title="Click to copy referral code"
                      >
                        <p className={`text-xs truncate font-mono transition-colors ${
                          copiedField === 'referral' 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300'
                        }`}>
                          {referralCode.length > 15
                            ? `${referralCode.slice(0, 8)}...${referralCode.slice(-4)}`
                            : referralCode
                          }
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const shareUrl = `${window.location.origin}#contact&code=${referralCode}`;
                          navigator.clipboard.writeText(shareUrl);
                          showSuccess('Share link copied!');
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        title="Click to copy share link"
                      >
                        <ExternalLink className="w-3 h-3 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400" />
                      </button>
                    </div>
                  )}
                  
                  {referralCode && (
                    <div 
                      onClick={() => setIsReferralsModalOpen(true)}
                      className="flex items-center gap-1 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded px-1 py-0.5 transition-colors"
                      title="Click to view referrals"
                    >
                      <Users className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        {referralCount} referral{referralCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </div>
             )}
          </div>
        </div>
      </div>

      <div className="py-1">
        {!isEditing && !isLoadingReferralCode && (
          <button
            onClick={handleEditClick}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Edit className="w-4 h-4 mr-3" />
            Edit Name
          </button>
        )}
        {!referralCode && !isLoadingReferralCode && (
          <button
            onClick={handleGenerateClick}
            disabled={isGeneratingCode}
            className="w-full flex items-center px-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors disabled:opacity-50"
          >
            <Gift className="w-4 h-4 mr-3" />
            {isGeneratingCode ? 'Generating...' : 'Generate Referral Code'}
          </button>
        )}
        <button
          onClick={() => {
            signOut();
            onClose();
          }}
          className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </button>
      </div>

      <WelcomeModalReferrals isOpen={isReferralsModalOpen} onClose={() => setIsReferralsModalOpen(false)} />
    </div>
  );
}

export default function Header() {
  const { data: session, update: updateSession } = useSession();
  const { isAdmin } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showGenerateWarningModal, setShowGenerateWarningModal] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { showSuccess, showInfo, showError } = useToastContext();

  useEffect(() => {
    const handleSessionUpdate = () => {
      updateSession();
    };

    window.addEventListener('session-update', handleSessionUpdate);
    return () => {
      window.removeEventListener('session-update', handleSessionUpdate);
    };
  }, [updateSession]);

  if (pathname.startsWith("/docs")) return null;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // const formatWalletAddress = (address: string) => {
  //   if (!address) return "";
  //   return `${address.slice(0, 6)}...${address.slice(-4)}`;
  // };

  // const formatEmail = (email: string) => {
  //   if (!email) return "";
  //   const [username, domain] = email.split("@");
  //   if (!domain) return email;
  //   return `${username.slice(0, 3)}...@${domain}`;
  // };

  const isActiveNav = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/docs") return pathname.startsWith("/docs");
    
    if (href === "/blog") return pathname.startsWith("/blog");
    if (href === "/service") return pathname.startsWith("/service");
    if (href === "/lms") return pathname.startsWith("/lms");
    if (href === "/login") return pathname === "/login";
    return false;
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 z-50 w-full border-b border-gray-200 dark:border-white/20 bg-white/80 dark:bg-black/20 backdrop-blur-sm"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <motion.section
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex items-center"
          >
            <Link href={routers.home} className="flex items-center gap-3">
              <div className="hidden sm:block">
                <Logo layout="inline" size="md" />
              </div>
              <div className="sm:hidden">
                <Logo compact className="h-10 w-auto" />
              </div>
            </Link>
          </motion.section>

          <section className="hidden md:flex items-center space-x-8">
            {navbars.map((navbar: NavbarType) => {
              const isActive = isActiveNav(navbar.href);
              return navbar.title === "Login" && session ? null : (
                <Link
                  target={navbar.target}
                  href={navbar.href}
                  key={navbar.id}
                  className={`font-medium transition-colors duration-200 relative ${
                    isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {navbar.title}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute -bottom-2 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </Link>
              );
            })}

            {!session && (
              <Link
                href={routers.login}
                className={`font-medium transition-colors duration-200 relative ${
                  isActiveNav(routers.login) ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Login
                {isActiveNav(routers.login) && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute -bottom-2 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </Link>
            )}

            {session && isAdmin && (
              <Link
                href="/admin/posts"
                className="inline-flex items-center gap-2 rounded-sm border border-gray-300 dark:border-white/30 bg-gray-100 dark:bg-gray-800/50 px-4 py-2 text-sm font-medium text-gray-700 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-white/50 hover:bg-gray-200 dark:hover:bg-gray-700/50"
              >
                <span>Admin Panel</span>
              </Link>
            )}

            {session && <NotificationBell />}

                         {session && (
               <div className="relative" ref={dropdownRef}>
                 <button
                   onClick={toggleDropdown}
                   className="flex items-center hover:opacity-80 transition-opacity cursor-pointer"
                   title="User menu"
                 >
                                       <UserAvatar session={session} />
                 </button>

                 <AnimatePresence>
                   {isDropdownOpen && (
                     <motion.div
                       initial={{ opacity: 0, y: -10, scale: 0.95 }}
                       animate={{ opacity: 1, y: 0, scale: 1 }}
                       exit={{ opacity: 0, y: -10, scale: 0.95 }}
                       transition={{ duration: 0.15 }}
                     >
                       <UserDropdown session={session} onClose={closeDropdown} onShowModal={() => setShowGenerateWarningModal(true)} />
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>
             )}
          </section>


          <section className="md:hidden">
            <button
              onClick={toggleMenu}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/10 border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 transition-all duration-200"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </section>
        </div>

                 {isMenuOpen && (
           <motion.div
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             transition={{ duration: 0.2 }}
                           className="md:hidden border-t border-gray-200 dark:border-white/10 bg-white/95 dark:bg-black/95 backdrop-blur-sm max-h-[calc(100vh-5rem)] overflow-y-auto transparent-scrollbar"
           >
             <div className="px-6 py-4 space-y-4">
              <div className="space-y-3">
                {navbars.map((navbar: NavbarType) => {
                  const isActive = isActiveNav(navbar.href);
                  return navbar.title === "Login" && session ? null : (
                    <Link
                      href={navbar.href}
                      key={navbar.id}
                      onClick={closeMenu}
                      className={`block font-medium transition-colors duration-200 py-2 ${
                        isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      {navbar.title}
                    </Link>
                  );
                })}
                {!session && (
                  <Link
                    href={routers.login}
                    onClick={closeMenu}
                    className={`block font-medium transition-colors duration-200 py-2 ${
                      isActiveNav(routers.login) ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    Login
                  </Link>
                )}
              </div>

              <div className="space-y-4">
                {session && isAdmin && (
                  <div className="flex items-center gap-4 mb-4">
                    <Link
                      href="/admin/posts"
                      onClick={closeMenu}
                      className="inline-flex items-center gap-2 rounded-sm border border-gray-300 dark:border-white/30 bg-gray-100 dark:bg-gray-800/50 px-4 py-2 text-sm font-medium text-gray-700 dark:text-white transition-all duration-200 hover:border-gray-400 dark:hover:border-white/50 hover:bg-gray-200 dark:hover:bg-gray-700/50"
                    >
                      <span>Admin Panel</span>
                    </Link>
                  </div>
                )}

                {session && <NotificationBell />}

                                                  {session && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                      <MobileUserInfo session={session} onClose={closeMenu} onShowModal={() => setShowGenerateWarningModal(true)} />
                    </div>
                  )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Generate Code Warning Modal */}
      <WelcomeModalReferrals 
        isOpen={showGenerateWarningModal} 
        onClose={() => setShowGenerateWarningModal(false)}
        isGenerateWarning={true}
      />
    </motion.div>
  );
}
