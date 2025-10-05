import Modal from "~/components/admin/common/Modal";
import { Technology, TechnologyDetailsModalProps } from "~/constants/project";
import { TipTapPreview } from "~/components/ui/tiptap-preview";

export default function TechnologyDetailsModal({ technology, isOpen, onClose }: TechnologyDetailsModalProps) {
  if (!technology) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Technology Details"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          {technology.image ? (
            <img 
              src={technology.image} 
              alt={technology.title}
              className="h-20 w-20 rounded-lg object-cover border border-gray-200"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          {!technology.image && (
            <div className="h-20 w-20 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
              <span className="text-gray-400 text-xs">No image</span>
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-gray-900">{technology.title}</h3>
            <p className="text-sm text-gray-600">{technology.name}</p>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <div className="text-sm text-gray-900 leading-relaxed">
            <TipTapPreview content={technology.description} />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
          <a 
            href={technology.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-900 break-all"
          >
            {technology.href}
          </a>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Feature Cards</label>
          {technology.featureCardIds && technology.featureCardIds.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {technology.featureCardIds.map((cardId, index) => (
                <span key={cardId} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Feature Card {index + 1}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No feature cards assigned</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
            <p className="text-sm text-gray-900">
              {technology.createdAt ? new Date(technology.createdAt).toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }) : '-'}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Updated At</label>
            <p className="text-sm text-gray-900">
              {technology.updatedAt ? new Date(technology.updatedAt).toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }) : '-'}
            </p>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <a
            href={technology.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            View Technology
          </a>
        </div>
      </div>
    </Modal>
  );
} 