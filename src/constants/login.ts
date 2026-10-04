// Login Components Interfaces
export interface Network {
  id: string;
  name: string;
  icon: string;
  isActive: boolean;
}

export interface NetworkSelectorProps {
  networks: Network[];
  selectedNetwork: string;
  onNetworkSelect: (networkId: string) => void;
}

export interface Wallet {
  id: string;
  name: string;
  logo: string;
  color: string;
}

export interface WalletListProps {
  wallets: Wallet[];
}

export const NETWORKS: Network[] = [
  { id: "c2vn", name: "C2VN", icon: "🔷", isActive: true },
  { id: "social", name: "Social", icon: "💧", isActive: false },
  { id: "phantom", name: "Phantom", icon: "∞", isActive: false },
  { id: "metamask", name: "MetaMask", icon: "🔥", isActive: true },
];

export const C2VN_WALLETS: Wallet[] = [
  { id: "eternal", name: "Eternal Wallet", logo: "E", color: "bg-green-500" },
  { id: "nami", name: "Nami Wallet", logo: "N", color: "bg-blue-500" },
  { id: "typhon", name: "Typhon Wallet", logo: "T", color: "bg-orange-500" },
  { id: "lace", name: "Lace Wallet", logo: "L", color: "bg-purple-600" },
  { id: "yoroi", name: "Yoroi Wallet", logo: "Y", color: "bg-yellow-500" },
  { id: "gero", name: "Gero Wallet", logo: "G", color: "bg-blue-600" },
  { id: "nufi", name: "NuFi Wallet", logo: "N", color: "bg-indigo-600" },
  { id: "1am", name: "1AM Wallet", logo: "1", color: "bg-black" },
  { id: "priority", name: "Priority Wallet", logo: "P", color: "bg-green-600" },
];

export const SOCIAL_WALLETS: Wallet[] = [
  { id: "facebook", name: "Facebook", logo: "F", color: "bg-blue-600" },
  { id: "google", name: "Google", logo: "G", color: "bg-red-500" },
  { id: "github", name: "GitHub", logo: "GH", color: "bg-gray-800" },
];

export const PHANTOM_WALLETS: Wallet[] = [
  { id: "phantom", name: "Phantom", logo: "P", color: "bg-purple-600" },
];

export const METAMASK_WALLETS: Wallet[] = [
  { id: "metamask", name: "MetaMask", logo: "M", color: "bg-orange-500" },
];

export const getWalletsByNetwork = (selectedNetwork: string): Wallet[] => {
  switch (selectedNetwork) {
    case "social":
      return SOCIAL_WALLETS;
    case "phantom":
      return PHANTOM_WALLETS;
    case "metamask":
      return METAMASK_WALLETS;
    default:
      return C2VN_WALLETS;
  }
}; 