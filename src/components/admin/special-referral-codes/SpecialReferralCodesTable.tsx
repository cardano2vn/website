"use client";

import { Edit, Trash2, Eye } from "lucide-react";
import { useState } from 'react';
import Modal from '../common/Modal';
import { formatDateTime } from '~/constants/users';
import { useQuery } from '@tanstack/react-query';

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

interface SpecialReferralCodesTableProps {
  codes: SpecialReferralCode[];
  onEdit: (code: SpecialReferralCode) => void;
  onDelete: (codeId: string) => void;
  onView: (code: SpecialReferralCode) => void;
  onCopyCode: (code: string) => void;
}

function SpecialReferralCountCell({ codeId }: { codeId: string }) {
  const { data: referralData, isLoading } = useQuery({
    queryKey: ['special-referral-count', codeId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/special-referral-codes/${codeId}/submissions?page=1&limit=1`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch referral count');
      return res.json();
    },
    refetchInterval: 30000,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const referralCount = referralData?.data?.count || 0;

  return (
    <div className="flex items-center gap-2">
      <span className="text-blue-600 font-medium">
        {isLoading ? '...' : referralCount}
      </span>
      <span className="text-gray-500 text-sm">
        user{referralCount !== 1 ? 's' : ''}
      </span>
    </div>
  );
}

export function SpecialReferralCodesTable({ 
  codes, 
  onEdit, 
  onDelete, 
  onView, 
  onCopyCode 
}: SpecialReferralCodesTableProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCodeToDelete, setSelectedCodeToDelete] = useState<SpecialReferralCode | null>(null);

  const handleDeleteClick = (code: SpecialReferralCode) => {
    setSelectedCodeToDelete(code);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedCodeToDelete) {
      onDelete(selectedCodeToDelete.id);
      setIsDeleteModalOpen(false);
      setSelectedCodeToDelete(null);
    }
  };

  const getStatusBadge = (code: SpecialReferralCode) => {
    if (!code.isActive) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Inactive</span>;
    }
    
    if (code.expiresAt && new Date(code.expiresAt) < new Date()) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Expired</span>;
    }
    
    return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name/Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {codes.map((code) => (
                <tr key={code.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code 
                      className="bg-gray-100 px-3 py-2 rounded text-sm font-mono cursor-pointer hover:bg-gray-200 transition-colors"
                      title="Click to copy referral link"
                      onClick={() => onCopyCode(code.code)}
                    >
                      {code.code}
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="space-y-1">
                      {code.name && (
                        <div className="font-medium text-gray-900">{code.name}</div>
                      )}
                      {code.email && (
                        <div className="text-gray-600">{code.email}</div>
                      )}
                      {!code.name && !code.email && (
                        <div className="text-gray-400 italic">No name/email</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(code)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <SpecialReferralCountCell codeId={code.id} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDateTime(code.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {code.expiresAt ? formatDateTime(code.expiresAt) : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => onView(code)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(code)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(code)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Special Referral Code"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Code</h3>
              <p className="text-sm text-gray-600">This action cannot be undone</p>
            </div>
          </div>
          
          {selectedCodeToDelete && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-medium text-gray-900">Code: {selectedCodeToDelete.code}</p>
              <p className="text-sm text-gray-500">Created: {formatDateTime(selectedCodeToDelete.createdAt)}</p>
              {selectedCodeToDelete.referralSubmissions.length > 0 && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-800 font-medium">
                    ⚠️ WARNING: This code has {selectedCodeToDelete.referralSubmissions.length} submission(s)
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    Deleting this code will also delete all related submissions permanently.
                  </p>
                </div>
              )}
            </div>
          )}
          
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
              Delete Code
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
