'use client'

interface TasksTabsProps {
  activeTab: 'projects' | 'backlog' | 'tasks'
  onTabChange: (tab: 'projects' | 'backlog' | 'tasks') => void
}

export function TasksTabs({ activeTab, onTabChange }: TasksTabsProps) {
  const tabs = [
    { id: 'projects' as const, label: 'Projects' },
    { id: 'backlog' as const, label: 'Backlog' },
    { id: 'tasks' as const, label: 'Tasks' },
  ]

  return (
    <div className="border-b border-neutral-200 dark:border-neutral-200 mb-8 overflow-x-auto">
      <nav className="flex gap-1 -mb-px min-w-max">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-5 py-3 text-sm font-medium transition-all duration-150 border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-primary-500 dark:border-primary-500 text-primary-600 dark:text-primary-500'
                : 'border-transparent text-neutral-500 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
