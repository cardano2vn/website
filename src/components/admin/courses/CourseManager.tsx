"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import CourseForm from './CourseForm';
import CourseTableSection from './CourseTableSection';

export default function CourseManager() {
  const { data: courses, isLoading, error } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: async () => {
      const response = await fetch('/api/admin/courses', { credentials: 'include' });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        }
        throw new Error('Failed to fetch courses');
      }
      const data = await response.json();
      return data?.data || [];
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="overflow-hidden">
            <div className="min-w-full">
              <div className="bg-gray-50 dark:bg-gray-800">
                <div className="px-6 py-3 grid grid-cols-4 gap-4">
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 grid grid-cols-4 gap-4">
                    <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="flex justify-end space-x-2">
                      <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CourseForm courses={courses} />
      <CourseTableSection courses={courses} />
    </div>
  );
} 