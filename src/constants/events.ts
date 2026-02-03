export interface Event {
  id: string;
  title: string;
  location: string;
  imageUrl: string;
  orderNumber: number;
}

export interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  index: number;
  onSave: (index: number, updatedEvent: Partial<Event>) => void;
}
