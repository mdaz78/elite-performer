'use client'

interface HabitTabsProps {
  activeTab: 'today' | 'habits' | 'progress'
  onTabChange: (tab: 'today' | 'habits' | 'progress') => void
}

export function HabitTabs({ activeTab, onTabChange }: HabitTabsProps) {
  const tabs = [
    { id: 'today' as const, label: 'Today' },
    { id: 'habits' as const, label: 'Habits' },
    { id: 'progress' as const, label: 'Progress' },
  ]

  return (
    <div className="border-b border-border dark:border-border-dark mb-6 overflow-x-auto">
      <nav className="flex gap-1 -mb-px min-w-max">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-3 text-sm font-medium transition-colors duration-200 border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-accent-blue dark:border-accent-blue-dark text-accent-blue dark:text-accent-blue-dark'
                : 'border-transparent text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark hover:border-border dark:hover:border-border-dark'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
