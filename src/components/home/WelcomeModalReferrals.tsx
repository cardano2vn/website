"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Users, Mail, Phone, Wallet, BookOpen, Calendar, MessageSquare, User, ExternalLink, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useToastContext } from '~/components/toast-provider';
import { createPortal } from 'react-dom';
import { ReferralDetail } from '~/constants/users';

interface WelcomeModalReferralsProps {
  isOpen: boolean;
  onClose: () => void;
  isGenerateWarning?: boolean;
}

export default function WelcomeModalReferrals({ isOpen, onClose, isGenerateWarning = false }: WelcomeModalReferralsProps) {
  const { data: session } = useSession();
  const { showSuccess } = useToastContext();
  const [referrals, setReferrals] = useState<ReferralDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (session?.user && isOpen) {
      fetchReferrals();
    }
  }, [session, isOpen]);

  const fetchReferrals = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/user/referrals');
      const data = await response.json();
      
      if (data.success) {
        setReferrals(data.data.referrals || []);
        setUserInfo(data.data.user);
      } else {
        setError(data.message || 'Failed to fetch referrals');
      }
    } catch (err) {
      setError('Failed to fetch referrals');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccess(`${label} copied!`);
    } catch (error) {
      showSuccess('Failed to copy');
    }
  };

  const filteredReferrals = referrals.filter(referral => 
    referral.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    referral.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    referral.referralCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    referral.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredReferrals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReferrals = filteredReferrals.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const SkeletonLoader = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
      </div>
      
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
      
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24 animate-pulse"></div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-16 animate-pulse"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-32 animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-20 animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-16 animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-16 animate-pulse mb-1"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-12 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (!mounted) return null;

  // Generate Warning Modal
  if (isGenerateWarning) {
    return createPortal(
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 1, opacity: 1, y: 0 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ duration: 0, ease: "easeOut" }}
              className="relative w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">⚠️ Warning</h4>
                  <button
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute"
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      width: '3.2em',
                      height: '3.2em',
                      border: 'none',
                      background: 'rgba(180, 83, 107, 0.11)',
                      borderRadius: '6px',
                      transition: 'background 0.3s',
                      zIndex: 10,
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '1.8em',
                        height: '1.5px',
                        backgroundColor: 'rgb(255, 255, 255)',
                        transform: 'translate(-50%, -50%) rotate(45deg)',
                      }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '1.8em',
                        height: '1.5px',
                        backgroundColor: '#fff',
                        transform: 'translate(-50%, -50%) rotate(-45deg)',
                      }}
                    />
                  </button>
                </div>
                
                <div className="mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    If you generate your own referral code, you will <strong>NOT be able to use someone else's referral code</strong> in the contact form.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Are you sure you want to generate your own referral code?
                  </p>
                </div>
                
                <div className="flex justify-center">
                  <button
                    onClick={async () => {
                      setIsGenerating(true);
                      try {
                        const response = await fetch('/api/user/referral-code', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ action: 'generate' }),
                        });

                        const data = await response.json();

                        if (data.success) {
                          showSuccess('Generate referral code successfully!');
                          window.dispatchEvent(new CustomEvent('session-update'));
                          onClose();
                        } else {
                          showSuccess(data.message || 'Unable to generate referral code');
                        }
                      } catch (error) {
                        showSuccess('Failed to generate referral code');
                      } finally {
                        setIsGenerating(false);
                      }
                    }}
                    disabled={isGenerating}
                    className={`px-6 py-2 text-sm font-medium text-white border border-transparent rounded-lg transition-colors ${
                      isGenerating 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isGenerating ? 'Generating...' : 'Generate Code'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    );
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 1, opacity: 1, y: 0 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ duration: 0, ease: "easeOut" }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto transparent-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-gray-800 backdrop-blur-xl border border-gray-200 dark:border-gray-600 rounded-[40px] shadow-2xl">
              <div className="p-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="space-y-6"
                >
                 
                  

                  {/* Content */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="text-gray-600 dark:text-gray-300 leading-relaxed text-base"
                  >
                    {loading ? (
                      <SkeletonLoader />
                    ) : error ? (
                      <div className="text-center py-12">
                        <div className="text-red-600 dark:text-red-400 mb-4 text-lg">Error</div>
                        <p className="text-gray-600 dark:text-gray-400">{error}</p>
                        <button
                          onClick={fetchReferrals}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Try Again
                        </button>
                      </div>
                    ) : referrals.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No referrals yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          Share your referral code with friends to start earning referrals!
                        </p>
                        {userInfo?.referralCode && (
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-w-md mx-auto">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your referral code:</p>
                            <code className="text-lg font-mono bg-white dark:bg-gray-800 px-3 py-2 rounded border">
                              {userInfo.referralCode}
                            </code>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Recent Referrals
                          </h3>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {filteredReferrals.length} of {referrals.length} total
                          </span>
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search by name, email, code, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div className="space-y-2 max-h-80 overflow-y-auto">
                          {paginatedReferrals.map((referral, index) => (
                            <motion.div
                              key={referral.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <User className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium text-gray-900 dark:text-white">{referral.name}</span>
                                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                      {referral.referralCode}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      <span>{referral.email}</span>
                                    </div>
                                    {referral.phone && (
                                      <div className="flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        <span>{referral.phone}</span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      <span>{new Date(referral.createdAt).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                                  <div 
                                    className="cursor-pointer hover:underline hover:text-gray-700 dark:hover:text-gray-300"
                                    title="Click to copy full ID"
                                    onClick={() => copyToClipboard(referral.user.id, 'User ID')}
                                  >
                                    ID: {referral.user.id.slice(0, 8)}...
                                  </div>
                                  <div>{referral.user.provider || 'Unknown'}</div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Showing {startIndex + 1} to {Math.min(endIndex, filteredReferrals.length)} of {filteredReferrals.length} results
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                title="Previous page"
                                aria-label="Previous page"
                                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </button>
                              <span className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                                {currentPage} of {totalPages}
                              </span>
                              <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                title="Next page"
                                aria-label="Next page"
                                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
          
          <motion.button
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0 }}
            onClick={onClose}
            className="absolute button"
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '4em',
              height: '4em',
              border: 'none',
              background: 'rgba(180, 83, 107, 0.11)',
              borderRadius: '5px',
              transition: 'background 0.5s',
              zIndex: 50
            }}
          >
            <span 
              className="X"
              style={{
                content: "",
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '2em',
                height: '1.5px',
                backgroundColor: 'rgb(255, 255, 255)',
                transform: 'translateX(-50%) rotate(45deg)'
              }}
            ></span>
            <span 
              className="Y"
              style={{
                content: "",
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '2em',
                height: '1.5px',
                backgroundColor: '#fff',
                transform: 'translateX(-50%) rotate(-45deg)'
              }}
            ></span>
            <div 
              className="close"
              style={{
                position: 'absolute',
                display: 'flex',
                padding: '0.8rem 1.5rem',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'translateX(-50%)',
                top: '-70%',
                left: '50%',
                width: '3em',
                height: '1.7em',
                fontSize: '12px',
                backgroundColor: 'rgb(19, 22, 24)',
                color: 'rgb(187, 229, 236)',
                border: 'none',
                borderRadius: '3px',
                pointerEvents: 'none',
                opacity: '0'
              }}
            >
              Close
            </div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
