import { useState } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onEnable: (code: string) => Promise<void>;
};

export default function TOTPTurnOffModal({ isOpen, onClose, onEnable }: Props) {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const submit = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      // Call the stubbed handler passed from parent. Actual API call will be implemented later.
      await onEnable(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enable TOTP');
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-60 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-xl w-full z-60 p-6">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Disable TOTP (Authenticator App)</h3>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">✕</button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-1 gap-4">
          <div className="flex flex-col p-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Authenticator Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter 6-digit code"
              className="px-3 py-2 border dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700"
            />

            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              In order to ensure its really you disabling TOTP, please enter the 6-digit code from your authenticator app.
            </div>

            {error && <div className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</div>}

            <div className="mt-6 flex items-center space-x-3">
              <button
                onClick={submit}
                disabled={isSubmitting}
                className="bg-red-600 dark:bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 dark:hover:bg-red-600 transition-all"
              >
                {isSubmitting ? 'Disabling...' : 'Disable TOTP'}
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>,
    // render at document body so modal isn't trapped by parent stacking contexts
    document.body,
  );
}
