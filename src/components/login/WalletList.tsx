import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useCardanoWallet } from "~/hooks/useCardanoWallet";
import { useToastContext } from "~/components/toast-provider";
import { WalletListProps } from '~/constants/login';

export default function WalletList({ wallets }: WalletListProps) {
  const { connect, disconnect, isConnecting, error, walletUser, isAuthenticated, isWalletInstalled, hasLoggedIn } = useCardanoWallet();
  const { showError, showSuccess, showInfo } = useToastContext();
  const lastSuccessRef = useRef<string>("");
  const lastErrorRef = useRef<string>("");
  const [connectingWalletId, setConnectingWalletId] = useState<string | null>(null);

  useEffect(() => {
    if (error && error !== lastErrorRef.current) {
      lastErrorRef.current = error;
      showError("Connection Error", error);
    }
  }, [error, showError]);

  const handleWalletClick = async (walletId: string) => {
    if (walletId === "eternal" || walletId === "lace" || walletId === "yoroi" || walletId === "nufi" || walletId === "gero" || walletId === "1am") {
      if (isAuthenticated) {
        await disconnect();
        showSuccess("Logout Successful", "Your Cardano wallet has been disconnected successfully.");
      } else {
        setConnectingWalletId(walletId);
        showInfo("Connecting...", "Please wait while we connect to your Cardano wallet.");
        await connect(walletId);
        setConnectingWalletId(null);
      }
    } else if (walletId === "metamask") {
      showInfo("MetaMask (Beta)", "MetaMask integration is currently in beta testing. Please use Cardano wallets for full functionality.");
    } else if (walletId === "nami") {
      showInfo("Nami Wallet Upgraded", "Nami has been upgraded to Lace! Please use Lace wallet with Nami mode enabled.");
    } else if (walletId === "priority") {
      showInfo("Priority Wallet", "Priority Wallet is currently not supported. Please use Eternl or Lace wallet instead.");
    } else if (walletId === "typhon") {
      showInfo("Typhon Wallet (Beta)", "Typhon Wallet is currently in beta testing. Please use Eternl or Lace wallet for full functionality.");
    } else if (walletId === "google") {
      showInfo("Connecting...", "Please wait while we connect to your Google account.");
      await signIn("google", { callbackUrl: "/" });
    } else if (walletId === "github") {
      showInfo("Connecting...", "Please wait while we connect to your GitHub account.");
      await signIn("github", { callbackUrl: "/" });
    } else {
      console.log(`Connecting to ${walletId}...`);
    }
  };



  useEffect(() => {
    if (hasLoggedIn && walletUser) {
      const successKey = `connected-${walletUser.address}`;
      if (successKey !== lastSuccessRef.current) {
        lastSuccessRef.current = successKey;
        const shortAddress = `${walletUser.address.slice(0, 6)}...${walletUser.address.slice(-4)}`;
        showSuccess(
          "Login Successful!",
          `Welcome to Cardano2VN! Your wallet ${shortAddress} has been connected successfully.`
        );
      }
    }
  }, [hasLoggedIn, walletUser, showSuccess]);



  const isActiveWallet = (walletId: string) => {
    const cardanoIdToInjectedKey: Record<string, string> = {
      eternal: 'eternl',
      lace: 'lace',
      yoroi: 'yoroi',
      nami: 'nami',
      nufi: 'nufi',
      '1am': '1am',
      gero: 'gerowallet',
      typhon: 'typhoncip30',
      priority: 'priority',
    };
    if (walletId in cardanoIdToInjectedKey) {
      const injected: any = (typeof window !== 'undefined' && (window as any).cardano) || null;
      if (!injected) return false;
      const injectedKey = cardanoIdToInjectedKey[walletId];
      return Object.keys(injected).some((k) => k.toLowerCase() === injectedKey.toLowerCase());
    }
    return ["google", "github"].includes(walletId);
    // return ["google", "github"].includes(walletId);
  };

  const isCardanoWalletId = (walletId: string) => {
    return ["eternal", "lace", "yoroi", "nami", "nufi", "1am", "gero", "typhon", "priority"].includes(walletId);
  };

  return (
    <div className="flex-1">
      <div className="space-y-3 h-[280px] overflow-y-auto pr-2 transparent-scrollbar">
        {wallets.map((wallet) => {
          const isActive = isActiveWallet(wallet.id);
          
          // const isBeta = wallet.id === "metamask";
          // const disabled = ((((wallet.id === "eternal" || wallet.id === "lace" || wallet.id === "yoroi" || wallet.id === "metamask") && connectingWalletId === wallet.id)) || !isActive) || isBeta;
          return (
            <button
              key={wallet.id}
              onClick={() => handleWalletClick(wallet.id)}
              disabled={(((wallet.id === "eternal" || wallet.id === "lace" || wallet.id === "yoroi") && connectingWalletId === wallet.id)) || !isActive}
              // disabled={disabled}
              className={`w-full p-3 rounded-lg border transition-all duration-200 flex items-center gap-3 ${
                isActive 
                // isActive && !isBeta
                  ? "border-gray-200 hover:bg-gray-100 hover:border-gray-300 hover:shadow-sm bg-white dark:border-white/10 dark:bg-gray-900 dark:hover:bg-gray-800 dark:hover:border-white/20" 
                  : "border-gray-100 bg-gray-50 cursor-not-allowed opacity-60 dark:border-white/5 dark:bg-gray-900/40"
                             } ${
                 (wallet.id === "eternal" || wallet.id === "lace" || wallet.id === "yoroi") && connectingWalletId === wallet.id ? "opacity-50 cursor-not-allowed" : ""
               }`}
            >
              <span className={`text-sm font-medium flex-1 ${
                isActive ? "text-gray-700 dark:text-gray-200" : "text-gray-500 dark:text-gray-400"
                // isActive && !isBeta ? "text-gray-700 dark:text-gray-200" : "text-gray-500 dark:text-gray-400"

              }`}>
                {wallet.name}
              </span>
              
              {!isActive && (
              //  {(!isActive || isBeta) && (
                <span className="text-xs bg-gray-400 text-white px-2 py-1 rounded-full dark:bg-gray-600">
                  {isCardanoWalletId(wallet.id) ? "Not installed" : "BETA"}
                  {/* {isBeta ? "BETA" : isCardanoWalletId(wallet.id) ? "Not installed" : "BETA"} */}

                </span>
              )}
              
                             {wallet.id === "eternal" || wallet.id === "nami" || wallet.id === "typhon" || wallet.id === "lace" || wallet.id === "yoroi" || wallet.id === "gero" || wallet.id === "nufi" || wallet.id === "1am" || wallet.id === "priority" ? (
                connectingWalletId === wallet.id ? (
                  <div className="w-8 h-8 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                                     <Image
                     src={`/images/wallets/${wallet.id === "gero" ? "Gero" : wallet.id === "priority" ? "Priority" : wallet.id}.png`}
                     alt={`${wallet.name}`}
                     width={32}
                     height={32}
                     className="w-8 h-8"
                     loading="lazy"
                   />
                )
              ) : wallet.id === "google" ? (
                <Image
                  src="/images/wallets/google.png"
                  alt="Google"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                  loading="lazy"
                />
              ) : wallet.id === "github" ? (
                <Image
                  src="/images/wallets/github.png"
                  alt="GitHub"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full"
                  loading="lazy"
                />
              ) : wallet.id === "facebook" ? (
                <Image
                  src="/images/wallets/facebook.png"
                  alt="Facebook"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                  loading="lazy"
                />
              ) : wallet.id === "phantom" ? (
                <Image
                  src="/images/wallets/phantom.png"
                  alt="Phantom"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-none"
                  loading="lazy"
                />
              ) : wallet.id === "metamask" ? (
                <Image
                  src="/images/wallets/metamask.png"
                  alt="MetaMask"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                  loading="lazy"
                />
              ) : (
                <div className={`w-8 h-8 rounded-full ${wallet.color} flex items-center justify-center text-white text-sm font-bold`}>
                  {wallet.logo}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
} 