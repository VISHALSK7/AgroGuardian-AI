import { useAppStore } from '../store/useAppStore';
import { getTranslation } from '../utils/translations';

// Hook for i18n
export const useTranslation = () => {
  const language = useAppStore((s) => s.language);
  const t = (key) => getTranslation(language, key);
  return { t, language };
};
