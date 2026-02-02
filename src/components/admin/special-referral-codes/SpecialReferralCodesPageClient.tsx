"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminHeader } from '~/components/admin/common/AdminHeader';
import { AdminFilters } from '~/components/admin/common/AdminFilters';
import { AdminStats } from '~/components/admin/common/AdminStats';
import { Pagination } from '~/components/ui/pagination';
import Modal from '~/components/admin/common/Modal';
import { useToastContext } from '~/components/toast-provider';
import AdminTableSkeleton from '~/components/admin/common/AdminTableSkeleton';
import NotFoundInline from '~/components/ui/not-found-inline';
import { SpecialReferralCodesTable } from './SpecialReferralCodesTable';
import { CreateSpecialCodeForm, EditSpecialCodeForm, ViewSpecialCodeDetails } from './SpecialReferralCodeForms';

interface SpecialReferralCode {
  id: string;
  code: string;
  name?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
  referralSubmissions: Array<{
    id: string;
    name: string;
    email: string;
    createdAt: string;
  }>;
}

interface SpecialReferralCodesPageClientProps {
  initialCodes?: SpecialReferralCode[];
}

export function SpecialReferralCodesPageClient({ initialCodes = [] }: SpecialReferralCodesPageClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCode, setSelectedCode] = useState<SpecialReferralCode | null>(null);
  const { showSuccess, showError } = useToastContext();
  
  const ITEMS_PER_PAGE = 10;

  const {
    data: queryData,
    isLoading: loading,
    refetch: fetchCodes,
  } = useQuery({
    queryKey: ['admin-special-referral-codes', currentPage, searchTerm, filterType],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(filterType !== 'all' && { isActive: filterType })
      });

      const res = await fetch(`/api/admin/special-referral-codes?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch special referral codes');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const {
    data: statsData,
    isLoading: statsLoading,
  } = useQuery({
    queryKey: ['admin-special-referral-codes-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/special-referral-codes/stats', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const codes = queryData?.data?.codes || [];
  const totalPages = queryData?.data?.pagination?.totalPages || 1;
  const stats = statsData?.data || {};

  const displayStats = [
    { label: 'Total Codes', value: stats.totalCodes || 0, color: 'default' as const },
    { label: 'Active Codes', value: stats.activeCodes || 0, color: 'green' as const },
    { label: 'Inactive Codes', value: stats.inactiveCodes || 0, color: 'red' as const },
    { label: 'Total Submissions', value: stats.totalSubmissions || 0, color: 'blue' as const },
    { label: 'Codes with Submissions', value: stats.codesWithSubmissions || 0, color: 'blue' as const },
    { label: 'Expired Codes', value: stats.expiredCodes || 0, color: 'red' as const },
  ];

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchCodes();
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedCode(null);
    fetchCodes();
  };

  const handleEdit = (code: SpecialReferralCode) => {
    setSelectedCode(code);
    setShowEditModal(true);
  };

  const handleView = (code: SpecialReferralCode) => {
    setSelectedCode(code);
    setShowViewModal(true);
  };

  const handleDelete = async (codeId: string) => {
    try {
      const response = await fetch(`/api/admin/special-referral-codes/${codeId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        if (data.data?.warning) {
          showSuccess(data.data.message);
          showError(`WARNING: ${data.data.warning}`);
        } else {
          showSuccess(data.data?.message || 'Special referral code deleted successfully');
        }
        fetchCodes();
      } else {
        showError(data.error || 'Failed to delete code');
      }
    } catch (error) {
      showError('Failed to delete code');
    }
  };


  const copyToClipboard = (code: string) => {
    const baseUrl = window.location.origin;
    const referralLink = `${baseUrl}#contact&code=${code}`;
    navigator.clipboard.writeText(referralLink);
    showSuccess('Referral link copied to clipboard');
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/admin/special-referral-codes/export', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `special-referral-codes-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showSuccess('Export successful', 'Special referral codes data has been exported successfully');
    } catch (error) {
      showError('Export failed', 'Failed to export special referral codes data');
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Special Referral Codes"
        description="Manage special referral codes"
        buttonText="Create Code"
        onAddClick={() => setShowCreateModal(true)}
        exportButtonText="Export Excel"
        onExportClick={handleExport}
      />

      <AdminStats stats={displayStats} />
      
      <AdminFilters
        searchTerm={searchTerm}
        filterType={filterType}
        searchPlaceholder="Search codes..."
        filterOptions={filterOptions}
        onSearchChange={setSearchTerm}
        onFilterChange={(value) => setFilterType(value as 'all' | 'active' | 'inactive')}
      />

      {loading ? (
        <AdminTableSkeleton columns={6} />
      ) : codes.length === 0 ? (
        <NotFoundInline 
          onClearFilters={() => {
            setSearchTerm('');
            setFilterType('all');
          }}
        />
      ) : (
        <div className="bg-white rounded-lg shadow">
          <SpecialReferralCodesTable
            codes={codes}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onCopyCode={copyToClipboard}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={queryData?.data?.pagination?.total || 0}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Special Referral Code"
      >
        <CreateSpecialCodeForm onSuccess={handleCreateSuccess} />
      </Modal>

      {/* Edit Modal */}
      {selectedCode && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCode(null);
          }}
          title="Edit Special Referral Code"
        >
          <EditSpecialCodeForm code={selectedCode} onSuccess={handleEditSuccess} />
        </Modal>
      )}

      {/* View Modal */}
      {selectedCode && (
        <Modal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedCode(null);
          }}
          title="Special Referral Code Details"
          maxWidth="max-w-4xl"
        >
          <ViewSpecialCodeDetails code={selectedCode} />
        </Modal>
      )}
    </div>
  );
}
