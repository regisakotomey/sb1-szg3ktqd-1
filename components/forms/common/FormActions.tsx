'use client';

interface FormActionsProps {
  onCancel: () => void;
  isSubmitting: boolean;
  submitLabel: string;
}

export default function FormActions({
  onCancel,
  isSubmitting,
  submitLabel
}: FormActionsProps) {
  return (
    <div className="sticky bottom-0 bg-white pt-4 mt-8 border-t border-gray-200 flex gap-4">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 p-2.5 sm:p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm"
      >
        Annuler
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex-1 p-2.5 sm:p-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:bg-gray-300 text-xs sm:text-sm"
      >
        {isSubmitting ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
        ) : (
          submitLabel
        )}
      </button>
    </div>
  );
}