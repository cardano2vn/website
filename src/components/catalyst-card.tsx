"use client";


import Link from "next/link";
import { ProjectCardProps } from '~/constants/catalyst';
import { TipTapPreview } from "~/components/ui/tiptap-preview";

export default function ProjectCard({ project, onOpenModal }: ProjectCardProps & { onOpenModal: (project: any) => void }) {

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <>
      <div
        className="w-full rounded-sm border border-gray-200 dark:border-white/20 bg-white dark:bg-gray-800/50 backdrop-blur-sm cursor-pointer"
        onClick={() => onOpenModal(project)}
      >
        <div className="flex flex-col sm:flex-row w-full">
          <div className="flex-grow bg-gray-50 dark:bg-gray-900/60">
            <div className="p-4 sm:p-5">
              <div className="mb-3">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-white break-words">
                  {project.fund && `${project.fund}: `}{project.title}
                </h3>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 sm:line-clamp-1">
                <TipTapPreview content={project.description} />
              </div>
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full min-w-[70px] justify-center ${getStatusColor(project.status)}`}>
                    {project.status.replace('_', ' ')}
                  </span>
                  {project.href && (
                    <Link
                      href={project.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 transition-colors duration-200 hover:text-blue-700 dark:hover:text-blue-300 hover:underline text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Proposal
                    </Link>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                  Click to view details
                </div>
              </div>
            </div>
          </div>
          <div className="flex w-full sm:w-32 flex-row sm:flex-col justify-between sm:justify-center bg-green-100 dark:bg-green-900/30 rounded-b-lg sm:rounded-b-none sm:rounded-r-lg p-3 sm:p-4">
            <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-0">
              <div className="text-lg sm:text-xl font-bold text-green-700 dark:text-green-300">{project.year}</div>
              <div className="text-lg sm:text-xl font-bold text-green-700 dark:text-green-300">{project.quarterly}</div>
            </div>
            <div className="text-xs font-medium text-green-700 dark:text-green-300 self-end sm:self-auto sm:mt-6">{project.fund || 'No Fund'}</div>
          </div>
        </div>
      </div>
    </>
  );
} 