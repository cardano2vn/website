"use client";

import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { SimpleRichEditor } from "~/components/ui/simple-rich-editor";
import { Member, Tab, MemberEditorProps } from "~/constants/members";
import { useToastContext } from "~/components/toast-provider";
import MediaInput from "~/components/ui/media-input";


export default function MemberEditor({ member, onSave, onCancel, isLoading }: MemberEditorProps) {
  const { showError } = useToastContext();
  const [formData, setFormData] = useState<Member>({
    name: member?.name || "",
    role: member?.role || "",
    description: member?.description || "",
    image: member?.image || "",
    email: member?.email || "",
    color: member?.color || "blue",
    skills: member?.skills || [],
    publishStatus: member?.publishStatus || "DRAFT",
    order: member?.order || 0,
    tabId: member?.tabId || ""
  });

  const [skillInput, setSkillInput] = useState("");

  // Fetch tabs for dropdown
  const { data: tabsData } = useQuery({
    queryKey: ['admin-tabs'],
    queryFn: async () => {
      const res = await fetch('/api/admin/tabs');
      if (!res.ok) throw new Error('Failed to fetch tabs');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const tabs: Tab[] = tabsData?.data || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form data before submit:', formData);
    
    if (!formData.name.trim()) {
      showError('Name is required');
      return;
    }
    
    if (!formData.role.trim()) {
      showError('Role is required');
      return;
    }
    
    if (!formData.description.trim()) {
      showError('Description is required');
      return;
    }
    
    console.log('Submitting member data:', formData);
    onSave(formData);
  };

  const handleMediaAdd = (media: { type: string; url: string; id: string }) => {
    setFormData({ ...formData, image: media.url });
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills?.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...(formData.skills || []), skillInput.trim()]
      });
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills?.filter(skill => skill !== skillToRemove) || []
    });
  };

  const colorOptions = [
    { value: "blue", label: "Blue" },
    { value: "green", label: "Green" },
    { value: "pink", label: "Pink" },
    { value: "orange", label: "Orange" },
    { value: "purple", label: "Purple" },
    { value: "cyan", label: "Cyan" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Member name"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
          <input
            id="role"
            type="text"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            placeholder="Member role"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <SimpleRichEditor
          content={formData.description}
          onChange={(content) => setFormData({ ...formData, description: content })}
          placeholder="Enter member description with rich formatting..."
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Profile Image</label>
          <MediaInput 
            onMediaAdd={handleMediaAdd}
            mediaType="image"
            showVideoLibrary={false}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="member@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="color" className="block text-sm font-medium text-gray-700">Color</label>
          <select
            id="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {colorOptions.map((color) => (
              <option key={color.value} value={color.value}>
                {color.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="order" className="block text-sm font-medium text-gray-700">Order</label>
          <input
            id="order"
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            placeholder="0"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="tab" className="block text-sm font-medium text-gray-700">Tab</label>
          <Select
            value={formData.tabId || "no-tab"}
            onValueChange={(value) => setFormData({ ...formData, tabId: value === "no-tab" ? undefined : value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a tab (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-tab">No Tab</SelectItem>
              {tabs.map((tab) => (
                <SelectItem key={tab.id} value={tab.id}>
                  {tab.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="publishStatus" className="block text-sm font-medium text-gray-700">Publish Status</label>
        <select
          id="publishStatus"
          value={formData.publishStatus}
          onChange={(e) => setFormData({ ...formData, publishStatus: e.target.value as 'DRAFT' | 'PUBLISHED' })}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          title="Select publish status"
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Skills</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            placeholder="Add a skill"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSkill();
              }
            }}
          />
          <button
            type="button"
            onClick={addSkill}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add
          </button>
        </div>
        {formData.skills && formData.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isLoading ? 'Saving...' : (member ? 'Update Member' : 'Create Member')}
        </button>
      </div>
    </form>
  );
} 