'use client'

import { useLanguage } from '@/context/LanguageContext'

export default function DashboardHeader() {
  const { t } = useLanguage()

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
        {t('summary_title')}
      </h2>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
        {t('summary_subtitle')}
      </p>
    </div>
  )
}
