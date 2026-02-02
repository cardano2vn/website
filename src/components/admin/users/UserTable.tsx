import { Edit, Trash2, Shield, User as UserIcon, Ban, Unlock, Copy, Check, Gift, Eye, Users, Mail, Phone, Wallet, BookOpen, ExternalLink, Calendar, MessageSquare } from 'lucide-react';
import { User, UserTableProps, shortenAddress, formatDateTime, ReferralDetail } from '~/constants/users';
import { WalletAvatar } from '~/components/WalletAvatar';
import { useToastContext } from "../../toast-provider";
import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useQuery } from '@tanstack/react-query';

function ReferralCountCell({ userId, onViewReferrals }: { userId: string; onViewReferrals: () => void }) {
  const { data: referralData, isLoading } = useQuery({
    queryKey: ['user-referrals', userId],
    queryFn: async () => {
      const res = await fetch(`/api/user/${userId}/referrals`);
      if (!res.ok) throw new Error('Failed to fetch referral count');
      return res.json();
    },
    refetchInterval: 30000,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const referralCount = referralData?.data?.referralCount || 0;

  return (
    <div className="flex items-center gap-2">
      <span className="text-blue-600 font-medium">
        {isLoading ? '...' : referralCount}
      </span>
      <span className="text-gray-500 text-sm">
        referral{referralCount !== 1 ? 's' : ''}
      </span>
      <button
        onClick={onViewReferrals}
        className="ml-2 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
        title="View referral details"
      >
        <Eye className="h-4 w-4" />
      </button>
    </div>
  );
}

function UserAvatar({ user }: { user: User }) {
  const [imageError, setImageError] = useState(false);
  const isOnline = (user as any)?.isOnline === true; 

  let avatarEl: React.ReactNode;
  if (user.avatar && !imageError) {
    avatarEl = (
      <img
        src={user.avatar}
        alt={user.name || 'User avatar'}
        className="h-10 w-10 rounded-full object-cover"
        onError={() => setImageError(true)}
      />
    );
  } else if (user.address) {
    avatarEl = <WalletAvatar address={user.address} size={40} />;
  } else {
    avatarEl = (
      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
        <span className="text-gray-600 text-sm font-medium">
          {user.name?.charAt(0) || 'U'}
        </span>
      </div>
    );
  }

  return (
    <div className="relative h-10 w-10">
      {avatarEl}
      {typeof (user as any)?.isOnline !== 'undefined' && (
        <>
          {isOnline && (
            <span
              className="pointer-events-none absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full animate-ping bg-green-500 opacity-60"
              aria-hidden
            />
          )}
          <span
            className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-gray-900 ${
              isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`}
            title={isOnline ? 'Online' : 'Offline'}
          />
        </>
      )}
    </div>
  );
}

function BanCountdown({ bannedUntil }: { bannedUntil: string }) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const banEnd = new Date(bannedUntil).getTime();
      const difference = banEnd - now;

      if (difference <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [bannedUntil]);

  return (
    <div className="text-red-600 font-medium">
      {timeLeft}
    </div>
  );
}

export function UserTable({
  users,
  onEdit,
  onDelete,
  onRoleChange,
  onBanUser,
  onUnbanUser,
  currentUserAddress,
  currentUserRole,
}: UserTableProps) {
  const { showSuccess } = useToastContext();
  const [selectedUserForReferrals, setSelectedUserForReferrals] = useState<User | null>(null);
  const [isReferralsModalOpen, setIsReferralsModalOpen] = useState(false);
  const [referralsData, setReferralsData] = useState<{ referrals: ReferralDetail[], totalReferrals: number } | null>(null);
  const [referralsLoading, setReferralsLoading] = useState(false);
  const [referralsSearchTerm, setReferralsSearchTerm] = useState('');
  const [referralsCurrentPage, setReferralsCurrentPage] = useState(1);
  const [referralsPerPage] = useState(10);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUserToDelete, setSelectedUserToDelete] = useState<User | null>(null);
  const [onlineMap, setOnlineMap] = useState<Map<string, number>>(new Map());
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    let stopped = false;
    const poll = async () => {
      try {
        const res = await fetch('/api/admin/online-users', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          const payload = data?.data || data;
          const entries: Array<{ userId: string; lastSeen: string | number }> = Array.isArray(payload?.authenticated)
            ? payload.authenticated
            : [];
          if (!stopped) {
            const map = new Map<string, number>();
            entries.forEach((u: any) => {
              const ts = typeof u.lastSeen === 'string' ? Date.parse(u.lastSeen) : Number(u.lastSeen) || Date.now();
              if (u.userId) map.set(u.userId, ts);
            });
            setOnlineMap(map);
          }
        }
      } catch {}
      if (!stopped) setTimeout(poll, 10000);
    };
    poll();
    return () => { stopped = true; };
  }, []);

  const handleDeleteClick = (user: User) => {
    setSelectedUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedUserToDelete) {
      onDelete(selectedUserToDelete.id);
      setIsDeleteModalOpen(false);
      setSelectedUserToDelete(null);
    }
  };



  const copyReferralCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      showSuccess('Referral code copied!');
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      showSuccess('Failed to copy');
    }
  };

  const handleViewReferrals = async (user: User) => {
    setSelectedUserForReferrals(user);
    setIsReferralsModalOpen(true);
    setReferralsLoading(true);
    setReferralsData(null);
    
    try {
      const response = await fetch(`/api/admin/users/${user.id}/referrals`);
      const data = await response.json();
      
      if (data.success) {
        setReferralsData(data.data);
      } else {
        showSuccess('Failed to fetch referrals: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      showSuccess('Failed to fetch referrals');
    } finally {
      setReferralsLoading(false);
    }
  };

  const handleCloseReferralsModal = () => {
    setIsReferralsModalOpen(false);
    setSelectedUserForReferrals(null);
    setReferralsData(null);
    setReferralsSearchTerm('');
    setReferralsCurrentPage(1);
  };

  const filteredReferrals = referralsData?.referrals?.filter((referral: ReferralDetail) => 
    referral.referralCode?.toLowerCase().includes(referralsSearchTerm.toLowerCase()) ||
    referral.name?.toLowerCase().includes(referralsSearchTerm.toLowerCase()) ||
    referral.email?.toLowerCase().includes(referralsSearchTerm.toLowerCase())
  ) || [];

  const totalPages = Math.ceil(filteredReferrals.length / referralsPerPage);
  const paginatedReferrals = filteredReferrals.slice(
    (referralsCurrentPage - 1) * referralsPerPage,
    referralsCurrentPage * referralsPerPage
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[700px] md:min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Provider
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Referrals
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ban Duration
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {[...users]
            .sort((a, b) => {
              const aTs = onlineMap.get(a.id) || (a.address ? onlineMap.get(a.address) : 0) || (a.email ? onlineMap.get(a.email as any) : 0) || 0;
              const bTs = onlineMap.get(b.id) || (b.address ? onlineMap.get(b.address) : 0) || (b.email ? onlineMap.get(b.email as any) : 0) || 0;
              if (aTs !== bTs) return bTs - aTs;
              return (b.updatedAt ? new Date(b.updatedAt).getTime() : 0) - (a.updatedAt ? new Date(a.updatedAt).getTime() : 0);
            })
            .map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <UserAvatar
                      user={{
                        ...user,
                        isOnline:
                          onlineMap.has(user.id) ||
                          (user.address ? onlineMap.has(user.address) : false) ||
                          (user.email ? onlineMap.has(user.email as any) : false),
                      } as any}
                    />
                  </div>
                  <div className="ml-4">
                    <div 
                      className="text-sm font-medium text-gray-900 cursor-pointer hover:underline"
                      title="Click to copy name"
                      onClick={() => {navigator.clipboard.writeText(user.name || ''); showSuccess('Name copied!');}}
                    >
                      {user.name && user.name.length > 20 ? `${user.name.slice(0, 17)}...` : user.name}
                    </div>
                    <div 
                      className="text-sm text-gray-500 font-mono cursor-pointer hover:underline"
                      title="Click to copy ID"
                      onClick={() => {navigator.clipboard.writeText(user.id); showSuccess('ID copied!');}}
                    >
                      ID: {user.id.length > 20 ? `${user.id.slice(0, 8)}...${user.id.slice(-8)}` : user.id}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  {user.provider === 'google' || user.provider === 'github' ? (
                    <span
                      className="text-sm text-gray-900 cursor-pointer hover:underline"
                      title="Click to copy email"
                      onClick={() => {navigator.clipboard.writeText(user.email || ''); showSuccess('Copied!');}}
                    >
                      {user.email && user.email.length > 25 ? `${user.email.slice(0, 22)}...` : user.email}
                    </span>
                  ) : (
                    <span
                      className="text-sm text-gray-900 font-mono cursor-pointer hover:underline"
                      title="Click to copy address"
                      onClick={() => {navigator.clipboard.writeText(user.address); showSuccess('Copied!');}}
                    >
                      {shortenAddress(user.address, 6)}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {user.role === 'ADMIN' ? (
                    <Shield className="h-4 w-4 text-blue-600 mr-2" />
                  ) : (
                    <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                  )}
                  <select
                    value={user.role}
                    onChange={(e) => onRoleChange(user.id, e.target.value as 'USER' | 'ADMIN')}
                    className="text-sm border-0 bg-transparent focus:ring-0 focus:outline-none"
                    title={`Change role for ${user.name}`}
                    disabled={false}
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <ReferralCountCell userId={user.id} onViewReferrals={() => handleViewReferrals(user)} />
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.isBanned && user.bannedUntil ? (
                  <BanCountdown bannedUntil={user.bannedUntil} />
                ) : (
                  <span className="text-green-600">Not banned</span>
                )}
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => onEdit(user)}
                    className="text-blue-600 hover:text-blue-900"
                    title={`Edit ${user.name}`}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(user)}
                    className="text-red-600 hover:text-red-900"
                    title={`Delete ${user.name}`}
                    disabled={user.role === 'ADMIN' || !!(currentUserAddress && user.address === currentUserAddress)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete User"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
              <p className="text-sm text-gray-600">Are you sure you want to delete this user?</p>
            </div>
          </div>
          
          {selectedUserToDelete && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-500">User to delete:</p>
              <p className="font-medium text-gray-900">{selectedUserToDelete.name}</p>
              <p className="text-sm text-gray-500">{selectedUserToDelete.email || shortenAddress(selectedUserToDelete.address, 6)}</p>
            </div>
          )}
          
          <p className="text-sm text-red-600 font-medium">
            This action cannot be undone.
          </p>
          
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </Modal>


      <Modal
        isOpen={isReferralsModalOpen}
        onClose={handleCloseReferralsModal}
        title="Referral Details"
        maxWidth="max-w-6xl"
      >
        {selectedUserForReferrals && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Referral Details</h3>
                <p className="text-sm text-gray-600">
                  {selectedUserForReferrals.name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-purple-600" />
                {selectedUserForReferrals.referralCode ? (
                  <>
                    <code 
                      className="px-3 py-2 bg-gray-100 text-gray-800 rounded text-sm font-mono cursor-pointer hover:bg-gray-200 transition-colors"
                      title="Click to copy referral code"
                      onClick={() => copyReferralCode(selectedUserForReferrals.referralCode!)}
                    >
                      {selectedUserForReferrals.referralCode}
                    </code>
                    <button
                      onClick={() => {
                        const shareUrl = `${window.location.origin}#contact#code=${selectedUserForReferrals.referralCode}`;
                        navigator.clipboard.writeText(shareUrl);
                        showSuccess('Share link copied!');
                      }}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Click to copy share link"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-500 hover:text-blue-600" />
                    </button>
                  </>
                ) : (
                  <span className="px-3 py-2 bg-gray-100 text-gray-500 rounded text-sm">
                    No referral code
                  </span>
                )}
              </div>
            </div>
            
            {referralsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading referrals...</span>
              </div>
            ) : referralsData ? (
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">
                      Total Referrals: {referralsData.totalReferrals}
                    </span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Users who used {selectedUserForReferrals.name}'s referral code
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name, email, or referral code..."
                    value={referralsSearchTerm}
                    onChange={(e) => {
                      setReferralsSearchTerm(e.target.value);
                      setReferralsCurrentPage(1); 
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {filteredReferrals.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600">
                      {referralsSearchTerm ? 'No referrals found matching your search' : 'No referrals found'}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Referrals List */}
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {paginatedReferrals.map((referral: ReferralDetail) => (
                        <div key={referral.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:bg-gray-100 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <UserIcon className="h-4 w-4 text-gray-500" />
                                <span className="font-medium text-gray-900">{referral.name}</span>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {referral.referralCode}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
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
                            <div className="text-right text-xs text-gray-500">
                              <div 
                                className="cursor-pointer hover:underline hover:text-gray-700"
                                title="Click to copy full ID"
                                onClick={() => {
                                  navigator.clipboard.writeText(referral.user.id);
                                  showSuccess('User ID copied!');
                                }}
                              >
                                ID: {referral.user.id.slice(0, 8)}...
                              </div>
                              <div>{referral.user.provider || 'Unknown'}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                          Showing {((referralsCurrentPage - 1) * referralsPerPage) + 1} to {Math.min(referralsCurrentPage * referralsPerPage, filteredReferrals.length)} of {filteredReferrals.length} results
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setReferralsCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={referralsCurrentPage === 1}
                            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          <span className="text-sm text-gray-600">
                            Page {referralsCurrentPage} of {totalPages}
                          </span>
                          <button
                            onClick={() => setReferralsCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={referralsCurrentPage === totalPages}
                            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-red-600 mb-2">Error</div>
                <p className="text-gray-600">Failed to load referrals</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
} 