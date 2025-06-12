import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, RefreshCw, AlertCircle } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt: React.FC = () => {
  const { theme } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showManualInstall, setShowManualInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [showDevWarning, setShowDevWarning] = useState(false);

  useEffect(() => {
    // Check if running in development environment
    const isDevelopment = window.location.hostname.includes('stackblitz') || 
                         window.location.hostname === 'localhost' ||
                         window.location.hostname === '127.0.0.1';

    if (isDevelopment) {
      setShowDevWarning(true);
      return;
    }

    // Check if app is already installed
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as any).standalone === true) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    const installed = checkInstalled();

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!installed) {
        setShowInstallPrompt(true);
      }
    };

    const handleAppInstalled = () => {
      console.log('App installed');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setShowManualInstall(false);
      setDeferredPrompt(null);
    };

    // Listen for service worker updates
    const handleServiceWorkerUpdate = () => {
      setShowUpdatePrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleServiceWorkerUpdate);
    }

    // Show manual install option after a delay if no automatic prompt
    const timer = setTimeout(() => {
      if (!deferredPrompt && !installed && !isDevelopment) {
        console.log('Showing manual install prompt');
        setShowManualInstall(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleServiceWorkerUpdate);
      }
      clearTimeout(timer);
    };
  }, [deferredPrompt, isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    console.log('Triggering install prompt');
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('Install prompt outcome:', outcome);
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setShowManualInstall(false);
    setDeferredPrompt(null);
  };

  const handleUpdateApp = () => {
    window.location.reload();
  };

  const getInstallInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      return {
        device: 'iOS',
        steps: [
          'Tap the Share button (□↗) at the bottom of Safari',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" to install the app'
        ]
      };
    } else if (userAgent.includes('android')) {
      return {
        device: 'Android',
        steps: [
          'Tap the menu (⋮) in your browser',
          'Select "Add to Home screen" or "Install app"',
          'Tap "Add" or "Install" to confirm'
        ]
      };
    } else {
      return {
        device: 'Desktop',
        steps: [
          'Look for an install icon (⊕) in your browser\'s address bar',
          'Click the install button when it appears',
          'Follow the prompts to install the app'
        ]
      };
    }
  };

  // Show development warning
  if (showDevWarning) {
    return (
      <div 
        className="fixed bottom-4 left-4 right-4 p-4 rounded-2xl shadow-2xl border backdrop-blur-sm z-50 max-w-md mx-auto animate-fadeIn"
        style={{
          backgroundColor: theme.colors.surface + '95',
          borderColor: theme.colors.warning
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: theme.colors.warning + '20' }}
            >
              <AlertCircle 
                className="w-5 h-5"
                style={{ color: theme.colors.warning }}
              />
            </div>
            <div>
              <h3 
                className="font-bold text-sm"
                style={{ color: theme.colors.text }}
              >
                Development Mode
              </h3>
              <p 
                className="text-xs"
                style={{ color: theme.colors.textSecondary }}
              >
                PWA features limited in this environment
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDevWarning(false)}
            className="p-1 rounded-lg hover:bg-opacity-20 transition-colors"
            style={{ 
              backgroundColor: theme.colors.textSecondary + '20',
              color: theme.colors.textSecondary 
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="mb-3">
          <p 
            className="text-xs mb-2"
            style={{ color: theme.colors.text }}
          >
            To test full PWA functionality:
          </p>
          <ol className="text-xs space-y-1">
            <li 
              className="flex items-start gap-2"
              style={{ color: theme.colors.textSecondary }}
            >
              <span 
                className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                style={{ 
                  backgroundColor: theme.colors.warning + '20',
                  color: theme.colors.warning 
                }}
              >
                1
              </span>
              Deploy to Netlify, Vercel, or GitHub Pages
            </li>
            <li 
              className="flex items-start gap-2"
              style={{ color: theme.colors.textSecondary }}
            >
              <span 
                className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                style={{ 
                  backgroundColor: theme.colors.warning + '20',
                  color: theme.colors.warning 
                }}
              >
                2
              </span>
              Access via HTTPS for full PWA features
            </li>
          </ol>
        </div>
        
        <button
          onClick={() => setShowDevWarning(false)}
          className="w-full py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
          style={{
            backgroundColor: theme.colors.warning,
            color: '#FFFFFF'
          }}
        >
          Got it!
        </button>
      </div>
    );
  }

  // Show update prompt
  if (showUpdatePrompt) {
    return (
      <div 
        className="fixed bottom-4 left-4 right-4 p-4 rounded-2xl shadow-2xl border backdrop-blur-sm z-50 max-w-sm mx-auto animate-fadeIn"
        style={{
          backgroundColor: theme.colors.surface + '95',
          borderColor: theme.colors.border
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: theme.colors.success + '20' }}
            >
              <RefreshCw 
                className="w-5 h-5"
                style={{ color: theme.colors.success }}
              />
            </div>
            <div>
              <h3 
                className="font-bold text-sm"
                style={{ color: theme.colors.text }}
              >
                Update Available
              </h3>
              <p 
                className="text-xs"
                style={{ color: theme.colors.textSecondary }}
              >
                Refresh to get the latest version
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowUpdatePrompt(false)}
            className="p-1 rounded-lg hover:bg-opacity-20 transition-colors"
            style={{ 
              backgroundColor: theme.colors.textSecondary + '20',
              color: theme.colors.textSecondary 
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowUpdatePrompt(false)}
            className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              backgroundColor: theme.colors.textSecondary + '20',
              color: theme.colors.textSecondary
            }}
          >
            Later
          </button>
          <button
            onClick={handleUpdateApp}
            className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
            style={{
              backgroundColor: theme.colors.success,
              color: '#FFFFFF'
            }}
          >
            Update Now
          </button>
        </div>
      </div>
    );
  }

  // Don't show anything if already installed
  if (isInstalled) {
    return null;
  }

  // Show automatic install prompt
  if (showInstallPrompt && deferredPrompt) {
    return (
      <div 
        className="fixed bottom-4 left-4 right-4 p-4 rounded-2xl shadow-2xl border backdrop-blur-sm z-50 max-w-sm mx-auto animate-fadeIn"
        style={{
          backgroundColor: theme.colors.surface + '95',
          borderColor: theme.colors.border
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: theme.colors.primary + '20' }}
            >
              <Download 
                className="w-5 h-5"
                style={{ color: theme.colors.primary }}
              />
            </div>
            <div>
              <h3 
                className="font-bold text-sm"
                style={{ color: theme.colors.text }}
              >
                Install App
              </h3>
              <p 
                className="text-xs"
                style={{ color: theme.colors.textSecondary }}
              >
                Add to home screen for quick access
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg hover:bg-opacity-20 transition-colors"
            style={{ 
              backgroundColor: theme.colors.textSecondary + '20',
              color: theme.colors.textSecondary 
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleDismiss}
            className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              backgroundColor: theme.colors.textSecondary + '20',
              color: theme.colors.textSecondary
            }}
          >
            Not now
          </button>
          <button
            onClick={handleInstallClick}
            className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
            style={{
              backgroundColor: theme.colors.primary,
              color: '#FFFFFF'
            }}
          >
            Install
          </button>
        </div>
      </div>
    );
  }

  // Show manual install instructions
  if (showManualInstall) {
    const instructions = getInstallInstructions();
    
    return (
      <div 
        className="fixed bottom-4 left-4 right-4 p-4 rounded-2xl shadow-2xl border backdrop-blur-sm z-50 max-w-sm mx-auto animate-fadeIn"
        style={{
          backgroundColor: theme.colors.surface + '95',
          borderColor: theme.colors.border
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: theme.colors.secondary + '20' }}
            >
              <Smartphone 
                className="w-5 h-5"
                style={{ color: theme.colors.secondary }}
              />
            </div>
            <div>
              <h3 
                className="font-bold text-sm"
                style={{ color: theme.colors.text }}
              >
                Install on {instructions.device}
              </h3>
              <p 
                className="text-xs"
                style={{ color: theme.colors.textSecondary }}
              >
                Get the full app experience
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg hover:bg-opacity-20 transition-colors"
            style={{ 
              backgroundColor: theme.colors.textSecondary + '20',
              color: theme.colors.textSecondary 
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="mb-3">
          <p 
            className="text-xs font-medium mb-2"
            style={{ color: theme.colors.text }}
          >
            To install this app:
          </p>
          <ol className="text-xs space-y-1">
            {instructions.steps.map((step, index) => (
              <li 
                key={index}
                className="flex items-start gap-2"
                style={{ color: theme.colors.textSecondary }}
              >
                <span 
                  className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                  style={{ 
                    backgroundColor: theme.colors.primary + '20',
                    color: theme.colors.primary 
                  }}
                >
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleDismiss}
            className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              backgroundColor: theme.colors.textSecondary + '20',
              color: theme.colors.textSecondary
            }}
          >
            Maybe later
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
            style={{
              backgroundColor: theme.colors.secondary,
              color: '#FFFFFF'
            }}
          >
            Got it!
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default InstallPrompt;