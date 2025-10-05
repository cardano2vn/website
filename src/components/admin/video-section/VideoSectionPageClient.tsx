"use client";

import * as React from "react";
import { useToastContext } from "~/components/toast-provider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminHeader } from "../common/AdminHeader";
import { AdminFilters } from "../common/AdminFilters";
import { VideoSectionTable } from "./VideoSectionTable";
import { VideoSectionPagination } from "./VideoSectionPagination";
import { VideoSectionStats } from "./VideoSectionStats";
import { VideoSectionEditor } from "./VideoSectionEditor";
import AdminTableSkeleton from "../common/AdminTableSkeleton";
import NotFoundInline from "~/components/ui/not-found-inline";
import { VideoItem } from "~/constants/video-section";
import { useNotifications } from "~/hooks/useNotifications";

const ITEMS_PER_PAGE = 10;

async function fetchVideos(): Promise<VideoItem[]> {
  const res = await fetch("/api/admin/video-section");
  if (!res.ok) {
    throw new Error("Failed to fetch videos");
  }
  const data = await res.json();
  return data?.data || [];
}

export function VideoSectionPageClient() {
  const { showSuccess, showError } = useToastContext();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterType, setFilterType] = React.useState("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newVideoUrl, setNewVideoUrl] = React.useState("");
  const [newVideoTitle, setNewVideoTitle] = React.useState("");
  const [newChannelName, setNewChannelName] = React.useState("");
  const [isValidUrl, setIsValidUrl] = React.useState<boolean | null>(null);
  const [isAdding, setIsAdding] = React.useState(false);
  // Save-less flow: no modifiedVideos tracking needed
  const [newThumbnailUrl, setNewThumbnailUrl] = React.useState("");

  const queryClient = useQueryClient();
  
  useNotifications();

  const { data: videos = [], isLoading, error, refetch } = useQuery({
    queryKey: ["admin-videos"],
    queryFn: fetchVideos,
    staleTime: 2 * 60 * 1000, 
    gcTime: 5 * 60 * 1000, 
  });

  async function handleAddVideo() {
    if (!newVideoUrl.trim() || !newVideoTitle.trim() || !newChannelName.trim()) {
      showError("Please fill in all fields");
      return;
    }

    setIsAdding(true);
    try {
      const res = await fetch("/api/admin/video-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl: newVideoUrl,
          title: newVideoTitle,
          channelName: newChannelName,
          thumbnailUrl: newThumbnailUrl,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add video");
      }

      showSuccess("Video added successfully!");
      handleCloseModal();
      refetch();
      queryClient.invalidateQueries({ queryKey: ["video-section"] });
      queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
    } catch (err) {
      showError((err as Error).message || "Error adding video.");
      setIsValidUrl(false);
    } finally {
      setIsAdding(false);
    }
  }

  async function handleDeleteVideo(videoId: string) {
    try {
      const res = await fetch(`/api/admin/video-section/${videoId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete video");
      showSuccess("Video deleted successfully!");
      refetch();
      queryClient.invalidateQueries({ queryKey: ["video-section"] });
      queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
    } catch (err) {
      showError((err as Error).message || "Error deleting video.");
    }
  }


  const handleCheckboxChange = async (videoId: string, field: "isFeatured", value: boolean) => {
    try {
      if (field === "isFeatured" && value === true && Array.isArray(videos)) {
        const updates: Promise<Response>[] = [];
        videos.forEach(v => {
          if (v.id === videoId) return;
          if (v.isFeatured) {
            updates.push(fetch(`/api/admin/video-section/${v.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ isFeatured: false }),
            }));
          }
        });
        if (updates.length > 0) await Promise.all(updates);
      }

      const res = await fetch(`/api/admin/video-section/${videoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) throw new Error("Failed to update video");
      showSuccess("Updated", field === "isFeatured" ? (value ? "Set as featured" : "Unset featured") : "Updated");
      refetch();
      queryClient.invalidateQueries({ queryKey: ["video-section"] });
      queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
    } catch (err) {
      showError((err as Error).message || "Error updating video");
    }
  };

  const handleVideoUrlChange = (url: string) => {
    setNewVideoUrl(url);
    const match = url.match(/(?:v=|\/embed\/|youtu.be\/)([\w-]{11})/);
    setIsValidUrl(match ? true : url ? false : null);
    if (match) {
      setNewThumbnailUrl(`https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`);
    } else {
      setNewThumbnailUrl("/images/common/loading.png");
    }
  };

  const handleVideoTitleChange = (title: string) => {
    setNewVideoTitle(title);
  };

  const handleChannelNameChange = (channel: string) => {
    setNewChannelName(channel);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setNewVideoUrl("");
    setNewVideoTitle("");
    setNewChannelName("");
    setIsValidUrl(null);
  };

  const filteredVideos = Array.isArray(videos) ? videos.filter(video => {
    const matchesSearch = (video.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (video.channelName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    switch (filterType) {
      case 'featured':
        matchesFilter = video.isFeatured;
        break;
      default:
        matchesFilter = true;
    }
    
    return matchesSearch && matchesFilter;
  }) : [];

  const totalPages = Math.ceil(filteredVideos.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedVideos = filteredVideos.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (error) {
    return (
      <div className="space-y-6">
        <AdminHeader
          title="Video Section Management"
          description="Manage YouTube videos for the video section"
          buttonText="Add New Video"
          onAddClick={() => setShowAddModal(true)}
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Error loading videos. Please try again later.</div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminHeader
          title="Video Section Management"
          description="Manage YouTube videos for the video section"
          buttonText="Add New Video"
          onAddClick={() => setShowAddModal(true)}
        />
        
        <VideoSectionStats videos={videos} />
        
        <AdminFilters
          searchTerm={searchTerm}
          filterType={filterType}
          searchPlaceholder="Search videos by title or channel..."
          filterOptions={[
            { value: 'all', label: 'All Videos' },
            { value: 'featured', label: 'Featured' },
          ]}
          onSearchChange={setSearchTerm}
          onFilterChange={setFilterType}
        />

        <AdminTableSkeleton columns={5} rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Video Section Management"
        description="Manage YouTube videos for the video section"
        buttonText="Add New Video"
        onAddClick={() => setShowAddModal(true)}
      />
      
      <VideoSectionStats videos={videos} />
      
      <AdminFilters
        searchTerm={searchTerm}
        filterType={filterType}
        searchPlaceholder="Search videos by title or channel..."
        filterOptions={[
          { value: 'all', label: 'All Videos' },
          { value: 'featured', label: 'Featured' },
        ]}
        onSearchChange={setSearchTerm}
        onFilterChange={setFilterType}
      />

      <div className="space-y-4">

        {isLoading ? (
          <AdminTableSkeleton columns={5} rows={5} />
        ) : filteredVideos.length === 0 ? (
          <NotFoundInline 
            onClearFilters={() => {
              setSearchTerm('');
              setFilterType('all');
            }}
          />
        ) : (
          <div className="bg-white rounded-lg shadow">
            <VideoSectionTable
              videos={paginatedVideos}
              modifiedVideos={{}}
              onCheckboxChange={handleCheckboxChange}
              onDeleteVideo={handleDeleteVideo}
              onViewDetails={(video) => {
                window.open(`https://www.youtube.com/watch?v=${video.videoId}`, '_blank');
              }}
            />
            
            <VideoSectionPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredVideos.length}
              itemsPerPage={ITEMS_PER_PAGE}
              startIndex={startIndex}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <VideoSectionEditor
        isOpen={showAddModal}
        onClose={handleCloseModal}
        videoUrl={newVideoUrl}
        videoTitle={newVideoTitle}
        channelName={newChannelName}
        isValidUrl={isValidUrl}
        isAdding={isAdding}
        onVideoUrlChange={handleVideoUrlChange}
        onVideoTitleChange={handleVideoTitleChange}
        onChannelNameChange={handleChannelNameChange}
        onAddVideo={handleAddVideo}
        thumbnailUrl={newThumbnailUrl}
      />
    </div>
  );
} 