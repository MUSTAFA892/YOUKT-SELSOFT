"use client";

import { useState, useEffect } from "react";
import { Search, BookOpen, Star, Eye, Clock, Zap, Heart } from "lucide-react";

interface Question {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  topic: string;
  tags: string[];
  timeEstimate: number;
  successRate: number;
  votes?: number;
  views?: number;
  language: string[];
}

interface QuestionLibraryProps {
  userId?: string;
  onSelectQuestion?: (question: Question) => void;
}

const difficultyColors = {
  easy: 'bg-emerald-600 text-emerald-900',
  medium: 'bg-yellow-600 text-yellow-900',
  hard: 'bg-orange-600 text-orange-900',
  expert: 'bg-purple-600 text-purple-900'
};

export default function QuestionLibraryBrowser({ userId, onSelectQuestion }: QuestionLibraryProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficulty, setDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard' | 'expert'>('all');
  const [sortBy, setSortBy] = useState<'trending' | 'top-rated' | 'by-difficulty'>('top-rated');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchQuestions();
  }, [sortBy]);

  useEffect(() => {
    applyFilters();
  }, [questions, searchQuery, difficulty]);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const endpoint = sortBy === 'trending'
        ? `${process.env.NEXT_PUBLIC_API_URL}/advanced-features/questions/trending`
        : `${process.env.NEXT_PUBLIC_API_URL}/advanced-features/questions/top-rated`;

      const response = await fetch(endpoint);
      const result = await response.json();
      setQuestions(result.data || []);
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = questions;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(q =>
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Difficulty filter
    if (difficulty !== 'all') {
      filtered = filtered.filter(q => q.difficulty === difficulty);
    }

    setFilteredQuestions(filtered);
  };

  const toggleFavorite = async (questionId: string) => {
    if (!userId) return;
    
    const isFav = favorites.has(questionId);
    const endpoint = isFav ? 'remove-favorite' : 'add-favorite';

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/advanced-features/questions/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, questionId })
      });

      const newFavs = new Set(favorites);
      if (isFav) newFavs.delete(questionId);
      else newFavs.add(questionId);
      setFavorites(newFavs);
    } catch (error) {
      console.error('Failed to update favorite:', error);
    }
  };

  return (
    <div className="bg-neutral-950 text-neutral-200 p-6 rounded-lg space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-bold">Question Library</h2>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-neutral-500" />
        <input
          type="text"
          placeholder="Search questions, topics, or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Difficulty Filter */}
        <div className="flex gap-2">
          {(['all', 'easy', 'medium', 'hard', 'expert'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                difficulty === d
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>

        {/* Sort By */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-1 rounded text-xs bg-neutral-800 text-neutral-300 border border-neutral-700 focus:outline-none"
        >
          <option value="top-rated">Top Rated</option>
          <option value="trending">Trending</option>
          <option value="by-difficulty">By Difficulty</option>
        </select>
      </div>

      {/* Questions List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-8 text-neutral-500">Loading questions...</div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">No questions found. Try different filters.</div>
        ) : (
          filteredQuestions.map((question) => (
            <div
              key={question.id}
              className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 hover:border-neutral-700 transition-colors space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-white">{question.title}</h3>
                  <p className="text-xs text-neutral-400 line-clamp-1">{question.description}</p>
                </div>
                <button
                  onClick={() => toggleFavorite(question.id)}
                  className="flex-shrink-0"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      favorites.has(question.id)
                        ? 'fill-rose-500 text-rose-500'
                        : 'text-neutral-500 hover:text-rose-400'
                    }`}
                  />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                {/* Difficulty Badge */}
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${difficultyColors[question.difficulty]}`}>
                  {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                </span>

                {/* Topic */}
                <span className="text-xs bg-neutral-800 px-2 py-0.5 rounded text-neutral-300">
                  {question.topic}
                </span>

                {/* Stats */}
                <div className="flex items-center gap-3 ml-auto text-xs text-neutral-400">
                  {question.timeEstimate && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {question.timeEstimate}m
                    </div>
                  )}
                  {question.successRate && (
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {Math.round(question.successRate * 100)}%
                    </div>
                  )}
                  {question.votes && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {question.votes}
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              {question.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {question.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-xs bg-neutral-800/50 px-1.5 py-0.5 rounded text-neutral-400">
                      #{tag}
                    </span>
                  ))}
                  {question.tags.length > 3 && (
                    <span className="text-xs text-neutral-500">+{question.tags.length - 3} more</span>
                  )}
                </div>
              )}

              <button
                onClick={() => onSelectQuestion?.(question)}
                className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-white text-xs font-medium transition-colors"
              >
                Use This Question
              </button>
            </div>
          ))
        )}
      </div>

      {/* Results Counter */}
      <div className="text-xs text-neutral-500 text-center">
        Showing {filteredQuestions.length} of {questions.length} questions
      </div>
    </div>
  );
}
