import { useEffect, useState } from 'react';
import { db } from '../db';
import { Card } from '../components';
import { formatDisplayDate, formatDateTime } from '../utils/date';
import type { SWETopic, SWECategory } from '../types';

export const SWEPage = () => {
  const [topics, setTopics] = useState<SWETopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const categories: SWECategory[] = [
    'Data Structures',
    'Algorithms',
    'System Design',
    'Behavioral',
  ];

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    setIsLoading(true);
    const allTopics = await db.sweCurriculum.toArray();
    setTopics(allTopics);
    setIsLoading(false);
  };

  const handlePractice = async (topicId: number) => {
    const now = new Date().toISOString();
    const topic = await db.sweCurriculum.get(topicId);
    if (!topic) return;

    await db.sweCurriculum.update(topicId, {
      lastReviewed: now,
      practiceCount: (topic.practiceCount || 0) + 1,
    });

    loadTopics();
  };

  const getTopicsByCategory = (category: SWECategory): SWETopic[] => {
    return topics.filter((t) => t.category === category).sort((a, b) => {
      // Sort by practice count (least practiced first), then alphabetically
      if (a.practiceCount !== b.practiceCount) {
        return a.practiceCount - b.practiceCount;
      }
      return a.topic.localeCompare(b.topic);
    });
  };

  const getCategoryColor = (category: SWECategory): string => {
    switch (category) {
      case 'Data Structures':
        return 'career';
      case 'Algorithms':
        return 'career';
      case 'System Design':
        return 'career';
      case 'Behavioral':
        return 'career';
      default:
        return 'career';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500">Loading topics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">SWE Preparation</h1>
        <p className="mt-2 text-gray-600">Track your interview prep progress</p>
      </div>

      <div className="space-y-8">
        {categories.map((category) => {
          const categoryTopics = getTopicsByCategory(category);
          const practicedCount = categoryTopics.filter((t) => t.practiceCount > 0).length;
          const totalCount = categoryTopics.length;
          const progress = totalCount > 0 ? (practicedCount / totalCount) * 100 : 0;

          return (
            <Card key={category} title={category}>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">
                    {practicedCount} of {totalCount} topics practiced
                  </span>
                  <span className="text-sm font-semibold text-career">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-career h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{topic.topic}</h3>
                      {topic.practiceCount > 0 && (
                        <span className="text-xs bg-career/10 text-career px-2 py-1 rounded">
                          {topic.practiceCount}x
                        </span>
                      )}
                    </div>
                    {topic.lastReviewed && (
                      <p className="text-xs text-gray-500 mb-3">
                        Last: {formatDisplayDate(topic.lastReviewed)}
                      </p>
                    )}
                    <button
                      onClick={() => handlePractice(topic.id!)}
                      className="w-full px-3 py-2 bg-career text-white text-sm rounded-md hover:bg-career-dark transition-colors"
                    >
                      Mark as Practiced
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
