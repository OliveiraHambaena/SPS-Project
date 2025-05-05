import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  FileText, 
  Play, 
  ChevronRight, 
  ChevronLeft,
  List,
  MessageSquare,
  HelpCircle,
  Send,
  Bot,
  X,
  User,
  Sparkles,
  Youtube,
  ExternalLink,
  Lightbulb,
  RefreshCw,
  Globe,
  AlertTriangle,
  Gamepad2,
  Code,
  Calculator,
  Atom,
  Beaker, // Replacing Flask with Beaker
  // Languages removed as it's not used
  Brain,
  Trophy,
  Zap
} from 'lucide-react';
// Import required libraries
import { deepseekAI, type DeepSeekMessage } from '../lib/deepseekAI';
import { youtubeAPI, type YouTubeVideo } from '../lib/youtubeAPI';

interface Module {
  id: string;
  title: string;
  description: string;
  duration: number;
  type: 'video' | 'reading' | 'quiz';
  completed: boolean;
  videoUrl?: string;
  content?: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  totalModules: number;
  completedModules: number;
  progress: number;
  modules: Module[];
}

interface AIChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface GeneratedContent {
  title: string;
  content: string;
  keyPoints: string[];
  examples: string[];
  exercises: string[];
  relatedTopics: string[];
  codeSnippets: string[];
  detailedExplanation: string;
  historicalContext?: string;
  codeExplanations?: string[];
  multipleApproaches?: string[];
  realWorldApplications: string[];
  commonMisconceptions?: string[];
  furtherReading: string[];
}

export default function Study() {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notes, setNotes] = useState('');
  
  // AI Assistant state
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<AIChatMessage[]>([{
    id: '1',
    content: "Hello! I'm Elearn PRO, your AI learning assistant. How can I help you understand this course material better?",
    sender: 'ai',
    timestamp: new Date()
  }]);
  const [aiMessageInput, setAiMessageInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const aiChatEndRef = useRef<HTMLDivElement>(null);
  
  // AI Content Generation state
  const [showContentGenerator, setShowContentGenerator] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [contentGenerationLoading, setContentGenerationLoading] = useState(false);
  
  // YouTube videos state
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  // State for study games
  const [showGames, setShowGames] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  
  // Available games
  const games = [
    { id: 'coding', name: 'Coding Challenge', icon: 'Code', description: 'Solve coding puzzles and challenges to improve your programming skills', color: 'blue' },
    { id: 'math', name: 'Math Quest', icon: 'Calculator', description: 'Practice mathematical concepts through interactive puzzles', color: 'purple' },
    { id: 'physics', name: 'Physics Playground', icon: 'Atom', description: 'Explore physics concepts through interactive simulations', color: 'orange' },
    { id: 'chemistry', name: 'Chemistry Lab', icon: 'Flask', description: 'Conduct virtual chemistry experiments and learn chemical reactions', color: 'green' },
    { id: 'language', name: 'Language Master', icon: 'Languages', description: 'Improve your language skills through interactive exercises', color: 'pink' },
    { id: 'memory', name: 'Memory Match', icon: 'Brain', description: 'Train your memory with this fun matching game', color: 'yellow' },
  ];

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  // Scroll to bottom of AI chat when messages change
  useEffect(() => {
    aiChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  // Handle sending a message to the AI assistant
  const handleSendAiMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!aiMessageInput.trim() || aiLoading) return;
    
    try {
      // Add user message to chat
      const userMessage: AIChatMessage = {
        id: Date.now().toString(),
        content: aiMessageInput,
        sender: 'user',
        timestamp: new Date()
      };
      
      setAiMessages(prev => [...prev, userMessage]);
      setAiMessageInput('');
      setAiLoading(true);
      
      // Convert chat history to DeepSeek format
      const conversationHistory: DeepSeekMessage[] = aiMessages
        .slice(-6) // Only use the last 6 messages to keep context manageable
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));
      
      // Set course context for more relevant responses
      if (course) {
        deepseekAI.setCourseContext(course.title, course.description);
      }
      
      // Get AI response
      const aiResponse = await deepseekAI.getResponse(aiMessageInput, conversationHistory);
      
      // Add AI response to chat
      const aiResponseMessage: AIChatMessage = {
        id: Date.now().toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setAiMessages(prev => [...prev, aiResponseMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message
      const errorMessage: AIChatMessage = {
        id: Date.now().toString(),
        content: 'I apologize, but I encountered an issue while processing your request. Please try again later.',
        sender: 'ai',
        timestamp: new Date()
      };
      
      setAiMessages(prev => [...prev, errorMessage]);
    } finally {
      setAiLoading(false);
    }
  };
  
  // Toggle the AI chat panel
  const toggleAiChat = () => {
    setAiChatOpen(!aiChatOpen);
  };
  
  // Toggle content generator
  const toggleContentGenerator = () => {
    setShowContentGenerator(!showContentGenerator);
    // Close the content generator if it's open and we're toggling
    if (showContentGenerator) {
      setGeneratedContent(null);
      setYoutubeVideos([]);
      setSelectedVideo(null);
    }
    if (aiChatOpen) setAiChatOpen(false);
    if (showGames) setShowGames(false);
    if (selectedGame) setSelectedGame(null);
  };
  
  // Toggle games panel
  const toggleGames = () => {
    setShowGames(!showGames);
    if (aiChatOpen) setAiChatOpen(false);
    if (showContentGenerator) setShowContentGenerator(false);
    if (selectedGame) setSelectedGame(null);
  };
  
  // Select a game to play
  const selectGame = (gameId: string) => {
    setSelectedGame(gameId);
    setShowGames(false);
  };
  
  // Get icon component for game
  const getGameIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code': return <Code className="w-6 h-6" />;
      case 'Calculator': return <Calculator className="w-6 h-6" />;
      case 'Atom': return <Atom className="w-6 h-6" />;
      case 'Flask': return <Beaker className="w-6 h-6" />;
      case 'Languages': return <Globe className="w-6 h-6" />;
      case 'Brain': return <Brain className="w-6 h-6" />;
      default: return <Gamepad2 className="w-6 h-6" />;
    }
  };
  
  // Get color class for game
  const getGameColorClass = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'purple': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'orange': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'green': return 'bg-green-100 text-green-700 border-green-200';
      case 'pink': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'yellow': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };
  
  // Generate AI content for the current module
  const generateModuleContent = async () => {
    if (!course || contentGenerationLoading) return;
    
    try {
      setContentGenerationLoading(true);
      setGeneratedContent(null);
      setYoutubeVideos([]);
      setSelectedVideo(null);
      
      const currentModule = course.modules[currentModuleIndex];
      
      // Prepare the prompt for content generation
      const prompt = `Generate extremely comprehensive and detailed study content for the following topic: ${currentModule.title} from the course ${course.title}. 
      The course is about ${course.description}. 
      Please structure your response as educational content with the following sections:
      1. A brief introduction to the topic
      2. Key concepts and principles
      3. EXTREMELY DETAILED explanation of the topic - this should be the most comprehensive part
      4. Historical context and evolution of the concepts (if applicable)
      5. Code snippets and implementation examples (if applicable)
      6. Line-by-line explanation of code examples (if applicable)
      7. Multiple approaches or perspectives to understanding the concepts
      8. Practical examples with thorough explanations
      9. Real-world applications with detailed case studies
      10. Common misconceptions and how to avoid them
      11. Practice exercises with step-by-step solutions
      12. Related topics for further study
      13. Recommended further reading
      
      Format your response in a way that's easy to understand and engaging for students. The "Detailed Explanation" section should be especially comprehensive, breaking down complex concepts into smaller, more digestible parts with multiple examples and clarifications.
      
      For the detailed explanation:
      - Explain not just what something is, but why it exists, how it developed, and its significance
      - Provide multiple perspectives and approaches to understanding each concept
      - Include analogies that help illustrate complex ideas
      - Explain underlying principles and mechanisms thoroughly
      - Connect concepts to broader contexts and applications
      
      If the topic is programming-related, include actual code snippets that demonstrate the concepts with line-by-line explanations of how the code works. If it's more theoretical, include detailed diagrams, analogies, and real-world examples to illustrate the ideas.`;
      
      // Set course context for more relevant responses
      deepseekAI.setCourseContext(course.title, course.description);
      
      // Get AI response
      const aiResponse = await deepseekAI.getResponse(prompt, []);
      
      // Parse the response into structured content
      // This is a simple parsing logic - in a real app, you might want more robust parsing
      const sections = aiResponse.split('\n\n');
      
      const generatedContentData: GeneratedContent = {
        title: currentModule.title,
        content: sections[0] || 'Introduction to the topic',
        detailedExplanation: extractSection(aiResponse, 'EXTREMELY DETAILED explanation') || extractSection(aiResponse, 'Detailed explanation') || 'Detailed explanation of the topic',
        historicalContext: extractSection(aiResponse, 'Historical context'),
        keyPoints: extractListItems(aiResponse, 'Key concepts'),
        codeSnippets: extractCodeSnippets(aiResponse),
        codeExplanations: extractListItems(aiResponse, 'Line-by-line explanation'),
        multipleApproaches: extractListItems(aiResponse, 'Multiple approaches'),
        examples: extractListItems(aiResponse, 'Practical examples'),
        realWorldApplications: extractListItems(aiResponse, 'Real-world applications'),
        commonMisconceptions: extractListItems(aiResponse, 'Common misconceptions'),
        exercises: extractListItems(aiResponse, 'Practice exercises'),
        relatedTopics: extractListItems(aiResponse, 'Related topics'),
        furtherReading: extractListItems(aiResponse, 'Recommended further reading')
      };
      
      setGeneratedContent(generatedContentData);
      
      // Fetch related YouTube videos
      fetchRelatedVideos(currentModule.title);
      
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setContentGenerationLoading(false);
    }
  };
  
  // Extract a section from the AI response
  const extractSection = (text: string, sectionTitle: string): string => {
    try {
      // Find the section
      const sectionRegex = new RegExp(`${sectionTitle}[:\s]*(.*?)(?=\n\n\w|$)`, 's');
      const sectionMatch = text.match(sectionRegex);
      
      if (!sectionMatch || !sectionMatch[1]) return '';
      
      return sectionMatch[1].trim();
    } catch (error) {
      console.error(`Error extracting section ${sectionTitle}:`, error);
      return '';
    }
  };
  
  // Extract code snippets from the AI response
  const extractCodeSnippets = (text: string): string[] => {
    try {
      const codeBlocks: string[] = [];
      
      // Match markdown code blocks with triple backticks
      const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/g;
      let match;
      
      while ((match = codeBlockRegex.exec(text)) !== null) {
        if (match[1].trim()) {
          codeBlocks.push(match[1].trim());
        }
      }
      
      // If no code blocks found, try to extract from 'Code snippets' section
      if (codeBlocks.length === 0) {
        const snippetsFromSection = extractListItems(text, 'Code snippets');
        return snippetsFromSection;
      }
      
      return codeBlocks;
    } catch (error) {
      console.error('Error extracting code snippets:', error);
      return [];
    }
  };
  
  // Helper function to extract list items from the AI response
  const extractListItems = (text: string, sectionTitle: string): string[] => {
    try {
      // Find the section
      const sectionRegex = new RegExp(`${sectionTitle}[:\s]*(.*?)(?=\n\n|$)`, 's');
      const sectionMatch = text.match(sectionRegex);
      
      if (!sectionMatch || !sectionMatch[1]) return [];
      
      // Extract list items (numbered or bullet points)
      const listItemRegex = /(?:\d+\.|-|\*|•)\s*([^\n]+)/g;
      const sectionText = sectionMatch[1];
      
      const items: string[] = [];
      let match;
      
      while ((match = listItemRegex.exec(sectionText)) !== null) {
        if (match[1].trim()) {
          items.push(match[1].trim());
        }
      }
      
      // If no list items found, try to split by newlines
      if (items.length === 0) {
        return sectionText
          .split('\n')
          .map(item => item.trim())
          .filter(item => item.length > 0);
      }
      
      return items;
    } catch (error) {
      console.error('Error extracting list items:', error);
      return [];
    }
  };
  
  // Fetch YouTube videos related to the current module
  const fetchRelatedVideos = async (topic: string) => {
    try {
      setLoadingVideos(true);
      
      // Add more specific keywords to get better educational content
      const searchQuery = `${topic} tutorial programming react`;
      
      // Fetch videos from YouTube API
      const videos = await youtubeAPI.searchVideos(searchQuery, 3);
      
      setYoutubeVideos(videos);
      
      // Select the first video by default if available
      if (videos.length > 0) {
        setSelectedVideo(videos[0].id);
      }
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
    } finally {
      setLoadingVideos(false);
    }
  };

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      
      // This would normally fetch from an actual database
      // Mock course data for demonstration
      const mockCourse: Course = {
        id: courseId || '1',
        title: 'Advanced React Patterns',
        description: 'Master complex React concepts and patterns for building scalable applications',
        instructor: 'John Doe',
        totalModules: 8,
        completedModules: 3,
        progress: 37.5,
        modules: [
          {
            id: 'm1',
            title: 'Introduction to Advanced React Patterns',
            description: 'Overview of the course and what you will learn',
            duration: 10,
            type: 'video',
            completed: true,
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
          },
          {
            id: 'm2',
            title: 'Compound Components Pattern',
            description: 'Learn how to create flexible and composable components',
            duration: 25,
            type: 'video',
            completed: true,
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
          },
          {
            id: 'm3',
            title: 'Render Props Pattern',
            description: 'Share code between components using a prop whose value is a function',
            duration: 20,
            type: 'video',
            completed: true,
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
          },
          {
            id: 'm4',
            title: 'Custom Hooks Pattern',
            description: 'Extract component logic into reusable functions',
            duration: 30,
            type: 'video',
            completed: false,
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
          },
          {
            id: 'm5',
            title: 'State Reducer Pattern',
            description: 'Control how state is managed in reusable components',
            duration: 25,
            type: 'reading',
            completed: false,
            content: `
              <h2>State Reducer Pattern</h2>
              <p>The state reducer pattern allows you to give control over state management to the users of your custom hook or component.</p>
              <p>This is particularly useful when you want to provide a default behavior but also allow users to customize how state changes in response to actions.</p>
              <h3>Key Concepts</h3>
              <ul>
                <li>Expose a reducer to users</li>
                <li>Allow overriding default behavior</li>
                <li>Maintain control over internal state</li>
              </ul>
              <h3>Example Implementation</h3>
              <pre>
function useToggle({reducer = defaultReducer} = {}) {
  const [{on}, dispatch] = React.useReducer(reducer, {on: false})
  
  const toggle = () => dispatch({type: 'TOGGLE'})
  const reset = () => dispatch({type: 'RESET'})
  
  return {on, toggle, reset}
}

function defaultReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE':
      return {on: !state.on}
    case 'RESET':
      return {on: false}
    default:
      throw new Error(\`Unsupported action type: \${action.type}\`)
  }
}
              </pre>
            `
          },
          {
            id: 'm6',
            title: 'Props Collection Pattern',
            description: 'Provide a collection of props to be spread onto elements',
            duration: 15,
            type: 'reading',
            completed: false,
            content: `
              <h2>Props Collection Pattern</h2>
              <p>The props collection pattern involves providing a collection of props that can be spread onto elements.</p>
              <p>This makes your custom hooks or components more convenient to use by providing pre-configured props.</p>
              <h3>Key Benefits</h3>
              <ul>
                <li>Simplifies component API</li>
                <li>Ensures consistent behavior</li>
                <li>Reduces boilerplate code</li>
              </ul>
            `
          },
          {
            id: 'm7',
            title: 'Module Quiz',
            description: 'Test your knowledge of React patterns',
            duration: 15,
            type: 'quiz',
            completed: false
          },
          {
            id: 'm8',
            title: 'Final Project',
            description: 'Apply what you learned in a real-world project',
            duration: 60,
            type: 'reading',
            completed: false
          }
        ]
      };
      
      setCourse(mockCourse);
      
      // Find the first incomplete module
      const firstIncompleteIndex = mockCourse.modules.findIndex(module => !module.completed);
      setCurrentModuleIndex(firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0);
      
    } catch (err) {
      console.error('Error fetching course data:', err);
    } finally {
      setLoading(false);
    }
  };

  const markModuleComplete = async () => {
    if (!course) return;
    
    try {
      // Create a copy of the course
      const updatedCourse = { ...course };
      
      // Mark the current module as completed
      updatedCourse.modules[currentModuleIndex].completed = true;
      
      // Update completed modules count and progress
      updatedCourse.completedModules = updatedCourse.modules.filter(m => m.completed).length;
      updatedCourse.progress = (updatedCourse.completedModules / updatedCourse.totalModules) * 100;
      
      // Update the course state
      setCourse(updatedCourse);
      
      // In a real app, you would also update this in the database
      // await supabase.from('user_progress').upsert({
      //   user_id: user.id,
      //   course_id: courseId,
      //   module_id: updatedCourse.modules[currentModuleIndex].id,
      //   completed: true
      // });
      
      // Move to the next module if available
      if (currentModuleIndex < course.modules.length - 1) {
        setCurrentModuleIndex(currentModuleIndex + 1);
      }
      
    } catch (err) {
      console.error('Error marking module as complete:', err);
    }
  };

  const goToNextModule = () => {
    if (!course) return;
    if (currentModuleIndex < course.modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
    }
  };

  const goToPreviousModule = () => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1);
    }
  };

  const selectModule = (index: number) => {
    setCurrentModuleIndex(index);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const saveNotes = () => {
    // In a real app, you would save this to the database
    console.log('Saving notes:', notes);
    // Show a success message
    alert('Notes saved successfully!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
          <span className="text-sm text-emerald-900">Loading course...</span>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <HelpCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find the course you're looking for. It may have been removed or you may not have access.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const currentModule = course.modules[currentModuleIndex];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm z-10">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/dashboard" className="mr-4">
                <ArrowLeft className="w-5 h-5 text-gray-500 hover:text-gray-700" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">
                  {course.title}
                </h1>
                <div className="flex items-center text-sm text-gray-500">
                  <BookOpen className="w-4 h-4 mr-1" />
                  <span>Module {currentModuleIndex + 1} of {course.modules.length}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                <div className="flex items-center">
                  <div className="text-xs text-gray-500 mr-2">Progress</div>
                  <div className="w-48 bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-emerald-600 h-2.5 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <div className="ml-2 text-xs font-medium text-gray-500">{Math.round(course.progress)}%</div>
                </div>
              </div>
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                aria-label="Toggle sidebar"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`bg-white w-80 border-r border-gray-200 flex-shrink-0 overflow-y-auto transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 pt-16 pb-4 sm:translate-x-0 sm:static sm:inset-auto sm:pt-0 z-10`}
        >
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Course Content</h2>
            <p className="mt-1 text-sm text-gray-500">
              {course.completedModules} of {course.totalModules} modules completed
            </p>
          </div>
          <div className="border-t border-gray-200 py-2">
            {/* AI Content Generator Button */}
            <div className="px-2 mb-3">
              <button
                onClick={toggleContentGenerator}
                className={`w-full flex items-center justify-center px-4 py-2 rounded-lg ${showContentGenerator ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'} hover:bg-emerald-600 hover:text-white transition-colors duration-200`}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                <span className="font-medium">Elearn PRO AI</span>
              </button>
            </div>
            
            {/* Study Games Button */}
            <div className="px-2 mb-4">
              <button
                onClick={toggleGames}
                className={`w-full flex items-center justify-center px-4 py-2 rounded-lg ${showGames ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700'} hover:bg-indigo-600 hover:text-white transition-colors duration-200`}
                aria-expanded={showGames}
                aria-controls="games-panel"
              >
                <Gamepad2 className="w-4 h-4 mr-2" />
                <span className="font-medium">Study Games</span>
              </button>
            </div>
            
            <nav className="flex-1 px-2 space-y-1">
              {course.modules.map((module, index) => (
                <button
                  key={module.id}
                  onClick={() => selectModule(index)}
                  className={`w-full text-left px-3 py-2 rounded-md flex items-center ${
                    currentModuleIndex === index
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                    module.completed
                      ? 'bg-emerald-100 text-emerald-600'
                      : currentModuleIndex === index
                      ? 'bg-emerald-200 text-emerald-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {module.completed ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-medium">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      module.completed ? 'text-emerald-600' : ''
                    }`}>
                      {module.title}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 mt-0.5">
                      {module.type === 'video' && <Play className="w-3 h-3 mr-1" />}
                      {module.type === 'reading' && <FileText className="w-3 h-3 mr-1" />}
                      {module.type === 'quiz' && <HelpCircle className="w-3 h-3 mr-1" />}
                      <span>{module.duration} min</span>
                    </div>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Module title and navigation */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{currentModule.title}</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={goToPreviousModule}
                    disabled={currentModuleIndex === 0}
                    className={`p-1 rounded-md ${
                      currentModuleIndex === 0
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                    aria-label="Previous module"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-500">
                    {currentModuleIndex + 1} / {course.modules.length}
                  </span>
                  <button
                    onClick={goToNextModule}
                    disabled={currentModuleIndex === course.modules.length - 1}
                    className={`p-1 rounded-md ${
                      currentModuleIndex === course.modules.length - 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                    aria-label="Next module"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                <span>{currentModule.duration} minutes</span>
                <span className="mx-2">•</span>
                <span className="capitalize">{currentModule.type}</span>
              </div>
              <p className="mt-2 text-gray-600">{currentModule.description}</p>
            </div>

            {/* Content for the module will be displayed here */}
            <div className="p-4">
              {/* Show games selection if enabled */}
              {showGames && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6" id="games-panel">
                  {/* Games header */}
                  <div className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between">
                    <h3 className="text-lg font-medium">Educational Games</h3>
                    <button 
                      onClick={toggleGames}
                      className="text-white hover:text-indigo-100 focus:outline-none focus:ring-2 focus:ring-white"
                      aria-label="Close games panel"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Games grid */}
                  <div className="p-4">
                    <p className="text-gray-600 mb-4">Select a game to enhance your learning experience:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {games.map((game) => (
                        <button
                          key={game.id}
                          onClick={() => selectGame(game.id)}
                          className={`flex flex-col items-center p-4 rounded-lg border-2 hover:shadow-md transition-all duration-200 ${getGameColorClass(game.color)}`}
                          aria-label={`Play ${game.name}`}
                        >
                          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3 bg-white">
                            {getGameIcon(game.icon)}
                          </div>
                          <h4 className="font-bold text-center mb-2">{game.name}</h4>
                          <p className="text-sm text-center">{game.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Show selected game if any */}
              {selectedGame && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                  {/* Game header */}
                  <div className={`px-4 py-3 flex items-center justify-between text-white ${selectedGame === 'coding' ? 'bg-blue-600' : 
                                selectedGame === 'math' ? 'bg-purple-600' : 
                                selectedGame === 'physics' ? 'bg-orange-600' : 
                                selectedGame === 'chemistry' ? 'bg-green-600' : 
                                selectedGame === 'language' ? 'bg-pink-600' : 
                                selectedGame === 'memory' ? 'bg-yellow-600' : 'bg-gray-600'}`}>
                    <h3 className="text-lg font-medium flex items-center">
                      {getGameIcon(games.find(g => g.id === selectedGame)?.icon || '')}
                      <span className="ml-2">{games.find(g => g.id === selectedGame)?.name || 'Game'}</span>
                    </h3>
                    <button 
                      onClick={() => setSelectedGame(null)}
                      className="text-white hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-white"
                      aria-label="Close game"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Game content */}
                  <div className="p-4">
                    {selectedGame === 'coding' && (
                      <div className="coding-game">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-bold">Coding Challenge</h4>
                          <div className="flex items-center">
                            <span className="text-blue-600 font-bold mr-2">Score: 0</span>
                            <Trophy className="w-5 h-5 text-yellow-500" />
                          </div>
                        </div>
                        <div className="bg-gray-100 p-4 rounded-lg mb-4">
                          <p className="font-medium mb-2">Challenge:</p>
                          <p className="mb-4">Write a function that returns the sum of two numbers.</p>
                          <div className="bg-gray-800 text-white p-4 rounded-lg font-mono text-sm">
                            <pre>{`function addNumbers(a, b) {
  // Your code here
  
}`}</pre>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            <Zap className="w-4 h-4 mr-1 inline-block" /> Submit Solution
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {selectedGame === 'math' && (
                      <div className="math-game">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-bold">Math Quest</h4>
                          <div className="flex items-center">
                            <span className="text-purple-600 font-bold mr-2">Score: 0</span>
                            <Trophy className="w-5 h-5 text-yellow-500" />
                          </div>
                        </div>
                        <div className="bg-purple-50 p-6 rounded-lg mb-4 text-center">
                          <p className="text-xl mb-6">Solve the equation:</p>
                          <p className="text-3xl font-bold mb-6">12x + 7 = 31</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                            <button className="bg-white border-2 border-purple-200 rounded-lg p-3 text-lg hover:bg-purple-100 transition-colors">x = 2</button>
                            <button className="bg-white border-2 border-purple-200 rounded-lg p-3 text-lg hover:bg-purple-100 transition-colors">x = 3</button>
                            <button className="bg-white border-2 border-purple-200 rounded-lg p-3 text-lg hover:bg-purple-100 transition-colors">x = 4</button>
                            <button className="bg-white border-2 border-purple-200 rounded-lg p-3 text-lg hover:bg-purple-100 transition-colors">x = 5</button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedGame === 'physics' && (
                      <div className="physics-game">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-bold">Physics Playground</h4>
                          <div className="flex items-center">
                            <span className="text-orange-600 font-bold mr-2">Level: 1</span>
                            <Atom className="w-5 h-5 text-orange-500" />
                          </div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg mb-4">
                          <p className="mb-4">Adjust the angle and force to hit the target:</p>
                          <div className="h-64 bg-gradient-to-b from-blue-100 to-blue-300 rounded-lg relative mb-4">
                            <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-green-600 to-green-400 rounded-b-lg"></div>
                            <div className="absolute bottom-16 left-10 w-6 h-6 rounded-full bg-red-500"></div>
                            <div className="absolute bottom-16 right-10 w-8 h-8 rounded-full bg-yellow-400 border-4 border-yellow-600 flex items-center justify-center text-xs font-bold">10</div>
                          </div>
                          <div className="flex justify-between">
                            <div>
                              <label className="block text-sm font-medium mb-1">Angle: 45°</label>
                              <input type="range" className="w-full" min="0" max="90" value="45" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Force: 50%</label>
                              <input type="range" className="w-full" min="0" max="100" value="50" />
                            </div>
                            <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                              Launch
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedGame === 'chemistry' && (
                      <div className="chemistry-game">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-bold">Chemistry Lab</h4>
                          <div className="flex items-center">
                            <span className="text-green-600 font-bold mr-2">Experiments: 0/5</span>
                            <Beaker className="w-5 h-5 text-green-500" />
                          </div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg mb-4">
                          <p className="mb-4">Combine elements to create compounds:</p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            <button className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full border border-blue-300 hover:bg-blue-200 transition-colors">H</button>
                            <button className="bg-red-100 text-red-800 px-3 py-1 rounded-full border border-red-300 hover:bg-red-200 transition-colors">O</button>
                            <button className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full border border-yellow-300 hover:bg-yellow-200 transition-colors">Na</button>
                            <button className="bg-green-100 text-green-800 px-3 py-1 rounded-full border border-green-300 hover:bg-green-200 transition-colors">Cl</button>
                            <button className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full border border-purple-300 hover:bg-purple-200 transition-colors">C</button>
                            <button className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full border border-pink-300 hover:bg-pink-200 transition-colors">N</button>
                          </div>
                          <div className="bg-white p-4 rounded-lg border-2 border-dashed border-green-300 h-24 flex items-center justify-center mb-4">
                            <p className="text-gray-400">Drag elements here to combine</p>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-600">Target: Create H₂O (Water)</p>
                            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                              Check Compound
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedGame === 'language' && (
                      <div className="language-game">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-bold">Language Master</h4>
                          <div className="flex items-center">
                            <span className="text-pink-600 font-bold mr-2">Words: 0/10</span>
                            <Globe className="w-5 h-5 text-pink-500" />
                          </div>
                        </div>
                        <div className="bg-pink-50 p-4 rounded-lg mb-4">
                          <p className="mb-4">Match the word with its correct meaning:</p>
                          <div className="bg-white p-4 rounded-lg mb-4">
                            <p className="text-xl font-bold text-center mb-4">Ubiquitous</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <button className="bg-white border-2 border-pink-200 rounded-lg p-3 text-left hover:bg-pink-100 transition-colors">Existing everywhere at the same time</button>
                              <button className="bg-white border-2 border-pink-200 rounded-lg p-3 text-left hover:bg-pink-100 transition-colors">Extremely rare or unusual</button>
                              <button className="bg-white border-2 border-pink-200 rounded-lg p-3 text-left hover:bg-pink-100 transition-colors">Having a strong, unpleasant smell</button>
                              <button className="bg-white border-2 border-pink-200 rounded-lg p-3 text-left hover:bg-pink-100 transition-colors">Showing great attention to detail</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedGame === 'memory' && (
                      <div className="memory-game">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-bold">Memory Match</h4>
                          <div className="flex items-center">
                            <span className="text-yellow-600 font-bold mr-2">Pairs: 0/8</span>
                            <Brain className="w-5 h-5 text-yellow-500" />
                          </div>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                          <p className="mb-4">Find matching pairs by flipping cards:</p>
                          <div className="grid grid-cols-4 gap-3 mb-4">
                            {Array(16).fill(0).map((_, index) => (
                              <button key={index} className="aspect-square bg-yellow-300 rounded-lg hover:bg-yellow-400 transition-colors flex items-center justify-center">
                                <span className="text-yellow-300">?</span>
                              </button>
                            ))}
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-600">Time: 00:30</p>
                            <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
                              Restart Game
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Show content generator if enabled */}
              {showContentGenerator && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Content generator header */}
                  <div className="bg-emerald-600 text-white px-4 py-3 flex items-center justify-between">
                    <h3 className="text-lg font-medium">Elearn PRO AI Content Generator</h3>
                    <button 
                      onClick={toggleContentGenerator}
                      className="text-white hover:text-emerald-100 focus:outline-none focus:ring-2 focus:ring-white"
                      aria-label="Close content generator"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                
                <div className="p-6">
                  {!generatedContent && !contentGenerationLoading ? (
                    <div className="text-center py-8">
                      <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                        <Lightbulb className="w-8 h-8 text-emerald-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Generate Learning Content</h3>
                      <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Let Elearn PRO AI generate enhanced study materials and suggest relevant YouTube videos for this module.
                      </p>
                      <button
                        onClick={generateModuleContent}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Content
                      </button>
                    </div>
                  ) : contentGenerationLoading ? (
                    <div className="text-center py-12">
                      <div className="mx-auto w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
                      <p className="text-gray-600">Generating content and finding relevant videos...</p>
                    </div>
                  ) : generatedContent && (
                    <div>
                      <div className="prose max-w-none mb-8">
                        <h3 className="text-xl font-bold text-emerald-700 mb-4">{generatedContent.title}</h3>
                        <div className="mb-6">
                          <p>{generatedContent.content}</p>
                        </div>
                        
                        {generatedContent.keyPoints.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-lg font-semibold mb-2">Key Concepts</h4>
                            <ul className="space-y-1">
                              {generatedContent.keyPoints.map((point, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 mr-2 flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold">{index + 1}</span>
                                  </span>
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {generatedContent.detailedExplanation && (
                          <div className="mb-8">
                            <h4 className="text-lg font-semibold mb-3 text-emerald-700 flex items-center">
                              <Lightbulb className="w-5 h-5 mr-2" />
                              Detailed Explanation
                            </h4>
                            <div className="bg-gradient-to-r from-emerald-50 to-white p-5 rounded-lg border-l-4 border-emerald-500 shadow-sm">
                              <div className="prose prose-emerald max-w-none">
                                <p className="whitespace-pre-line text-gray-800 leading-relaxed">{generatedContent.detailedExplanation}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {generatedContent.historicalContext && (
                          <div className="mb-6">
                            <h4 className="text-lg font-semibold mb-3 text-indigo-700 flex items-center">
                              <Clock className="w-5 h-5 mr-2" />
                              Historical Context & Evolution
                            </h4>
                            <div className="bg-gradient-to-r from-indigo-50 to-white p-5 rounded-lg border-l-4 border-indigo-500 shadow-sm">
                              <div className="prose prose-indigo max-w-none">
                                <p className="whitespace-pre-line text-gray-800 leading-relaxed">{generatedContent.historicalContext}</p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {generatedContent.codeSnippets && generatedContent.codeSnippets.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
                              <FileText className="w-5 h-5 mr-2" />
                              Code Examples
                            </h4>
                            <div className="space-y-4">
                              {generatedContent.codeSnippets.map((snippet, index) => (
                                <div key={index} className="rounded-lg overflow-hidden shadow-sm">
                                  <div className="bg-gray-800 text-white p-4 overflow-x-auto">
                                    <pre className="text-sm">
                                      <code>{snippet}</code>
                                    </pre>
                                  </div>
                                  {generatedContent.codeExplanations && generatedContent.codeExplanations[index] && (
                                    <div className="bg-gray-100 p-4 border-t border-gray-700">
                                      <p className="text-sm text-gray-800">
                                        <strong>Explanation:</strong> {generatedContent.codeExplanations[index]}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {generatedContent.examples.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-lg font-semibold mb-2">Examples</h4>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                              {generatedContent.examples.map((example, index) => (
                                <div key={index} className={index > 0 ? 'mt-4 pt-4 border-t border-gray-200' : ''}>
                                  <p><strong>Example {index + 1}:</strong> {example}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {generatedContent.multipleApproaches && generatedContent.multipleApproaches.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-lg font-semibold mb-3 text-blue-700 flex items-center">
                              <RefreshCw className="w-5 h-5 mr-2" />
                              Multiple Approaches & Perspectives
                            </h4>
                            <div className="bg-gradient-to-r from-blue-50 to-white p-5 rounded-lg border-l-4 border-blue-500 shadow-sm">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {generatedContent.multipleApproaches.map((approach, index) => (
                                  <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                                    <h5 className="font-medium text-blue-800 mb-2 flex items-center">
                                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 mr-2">
                                        <span className="text-xs font-bold">{index + 1}</span>
                                      </span>
                                      Approach {index + 1}
                                    </h5>
                                    <p className="text-gray-700">{approach}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {generatedContent.realWorldApplications && generatedContent.realWorldApplications.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-lg font-semibold mb-3 text-purple-700 flex items-center">
                              <Globe className="w-5 h-5 mr-2" />
                              Real-World Applications
                            </h4>
                            <div className="bg-gradient-to-r from-purple-50 to-white p-5 rounded-lg border-l-4 border-purple-500 shadow-sm">
                              <ul className="space-y-3">
                                {generatedContent.realWorldApplications.map((application, index) => (
                                  <li key={index} className="flex items-start">
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-100 text-purple-600 mr-2 flex-shrink-0 mt-0.5">
                                      <span className="text-xs font-bold">{index + 1}</span>
                                    </span>
                                    <span className="text-gray-800">{application}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                        
                        {generatedContent.commonMisconceptions && generatedContent.commonMisconceptions.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-lg font-semibold mb-3 text-red-700 flex items-center">
                              <AlertTriangle className="w-5 h-5 mr-2" />
                              Common Misconceptions
                            </h4>
                            <div className="bg-gradient-to-r from-red-50 to-white p-5 rounded-lg border-l-4 border-red-500 shadow-sm">
                              <ul className="space-y-3">
                                {generatedContent.commonMisconceptions.map((misconception, index) => (
                                  <li key={index} className="flex items-start">
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-600 mr-2 flex-shrink-0 mt-0.5">
                                      <X className="w-3 h-3" />
                                    </span>
                                    <span className="text-gray-800">{misconception}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                        
                        {generatedContent.exercises.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-lg font-semibold mb-3 text-blue-700 flex items-center">
                              <FileText className="w-5 h-5 mr-2" />
                              Practice Exercises
                            </h4>
                            <div className="space-y-4">
                              {generatedContent.exercises.map((exercise, index) => {
                                // Check if the exercise contains a solution (indicated by "Solution:" or similar text)
                                const hasSolution = exercise.includes('Solution:') || exercise.includes('Answer:') || exercise.includes('Step-by-step:');
                                let exerciseText = exercise;
                                let solutionText = '';
                                
                                if (hasSolution) {
                                  // Split the exercise and solution
                                  const solutionMatch = exercise.match(/(Solution:|Answer:|Step-by-step:)(.*)/s);
                                  if (solutionMatch) {
                                    exerciseText = exercise.substring(0, exercise.indexOf(solutionMatch[1])).trim();
                                    solutionText = solutionMatch[0].trim();
                                  }
                                }
                                
                                return (
                                  <div key={index} className="rounded-lg overflow-hidden shadow-sm border border-blue-200">
                                    <div className="bg-blue-50 p-4">
                                      <p className="font-medium text-blue-800 mb-2 flex items-center">
                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 mr-2">
                                          <span className="text-xs font-bold">{index + 1}</span>
                                        </span>
                                        Exercise {index + 1}
                                      </p>
                                      <p className="text-gray-800">{exerciseText}</p>
                                    </div>
                                    
                                    {solutionText && (
                                      <div className="bg-white p-4 border-t border-blue-200">
                                        <p className="font-medium text-blue-800 mb-2">Solution:</p>
                                        <p className="text-gray-700 whitespace-pre-line">{solutionText.replace(/Solution:|Answer:|Step-by-step:/, '')}</p>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        
                        {generatedContent.relatedTopics.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-lg font-semibold mb-3 text-gray-700 flex items-center">
                              <List className="w-5 h-5 mr-2" />
                              Related Topics
                            </h4>
                            <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg border-l-4 border-gray-400 shadow-sm">
                              <div className="flex flex-wrap gap-2">
                                {generatedContent.relatedTopics.map((topic, index) => (
                                  <span key={index} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors duration-200">
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {generatedContent.furtherReading && generatedContent.furtherReading.length > 0 && (
                          <div>
                            <h4 className="text-lg font-semibold mb-3 text-amber-700 flex items-center">
                              <BookOpen className="w-5 h-5 mr-2" />
                              Further Reading
                            </h4>
                            <div className="bg-gradient-to-r from-amber-50 to-white p-5 rounded-lg border-l-4 border-amber-500 shadow-sm">
                              <ul className="space-y-3">
                                {generatedContent.furtherReading.map((resource, index) => {
                                  // Check if the resource contains a URL
                                  const urlMatch = resource.match(/(https?:\/\/[^\s]+)/);
                                  const hasUrl = urlMatch !== null;
                                  
                                  return (
                                    <li key={index} className="flex items-start">
                                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-600 mr-2 flex-shrink-0 mt-0.5">
                                        <span className="text-xs font-bold">{index + 1}</span>
                                      </span>
                                      {hasUrl ? (
                                        <div>
                                          <p className="text-gray-800">
                                            {resource.substring(0, urlMatch.index).trim()}
                                          </p>
                                          <a 
                                            href={urlMatch[1]} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 flex items-center mt-1"
                                          >
                                            {urlMatch[1]}
                                            <ExternalLink className="w-3 h-3 ml-1" />
                                          </a>
                                        </div>
                                      ) : (
                                        <span className="text-gray-800">{resource}</span>
                                      )}
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* YouTube Videos Section */}
                      <div className="mt-8 border-t border-gray-200 pt-6">
                        <h4 className="text-lg font-semibold mb-4 flex items-center">
                          <Youtube className="w-5 h-5 text-red-600 mr-2" />
                          Recommended Videos
                        </h4>
                        
                        {loadingVideos ? (
                          <div className="text-center py-6">
                            <div className="mx-auto w-8 h-8 border-2 border-red-200 border-t-red-600 rounded-full animate-spin mb-2"></div>
                            <p className="text-gray-500 text-sm">Loading videos...</p>
                          </div>
                        ) : youtubeVideos.length === 0 ? (
                          <p className="text-gray-500">No relevant videos found. Try refreshing or changing your search terms.</p>
                        ) : (
                          <div>
                            {/* Video Player */}
                            {selectedVideo && (
                              <div className="mb-4">
                                <div className="aspect-w-16 aspect-h-9 mb-2">
                                  <iframe
                                    src={youtubeAPI.getEmbedUrl(selectedVideo)}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full rounded-lg"
                                  ></iframe>
                                </div>
                              </div>
                            )}
                            
                            {/* Video List */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              {youtubeVideos.map((video) => (
                                <div 
                                  key={video.id}
                                  className={`border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${selectedVideo === video.id ? 'ring-2 ring-emerald-500' : ''}`}
                                  onClick={() => setSelectedVideo(video.id)}
                                >
                                  <div className="relative">
                                    <img 
                                      src={video.thumbnailUrl} 
                                      alt={video.title}
                                      className="w-full h-32 object-cover" 
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity">
                                      <Play className="w-10 h-10 text-white" />
                                    </div>
                                  </div>
                                  <div className="p-3">
                                    <h5 className="font-medium text-sm line-clamp-2 mb-1">{video.title}</h5>
                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                      <span>{video.channelTitle}</span>
                                      <a 
                                        href={youtubeAPI.getWatchUrl(video.id)} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-blue-600 hover:text-blue-800 flex items-center"
                                      >
                                        <ExternalLink className="w-3 h-3 mr-1" /> Watch
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Refresh Button */}
                            <div className="mt-4 text-center">
                              <button
                                onClick={() => fetchRelatedVideos(currentModule.title)}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                              >
                                <RefreshCw className="w-4 h-4 mr-1" />
                                Refresh Videos
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Module content */}
            {!showContentGenerator && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                {currentModule.type === 'video' && (
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe
                      src={currentModule.videoUrl}
                      title={currentModule.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                )}
                
                {currentModule.type === 'reading' && (
                  <div className="p-6">
                    {currentModule.content ? (
                      <div dangerouslySetInnerHTML={{ __html: currentModule.content }} className="prose max-w-none" />
                    ) : (
                      <p className="text-gray-600">Content for this module is not available yet.</p>
                    )}
                  </div>
                )}
                
                {currentModule.type === 'quiz' && (
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Module Quiz</h3>
                    <p className="text-gray-600 mb-6">
                      Test your knowledge of the concepts covered in this module.
                    </p>
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-md p-4">
                        <p className="font-medium text-gray-900 mb-2">
                          1. Which pattern allows you to share code between components using a prop whose value is a function?
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input
                              id="q1-a"
                              name="q1"
                              type="radio"
                              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                            />
                            <label htmlFor="q1-a" className="ml-3 text-gray-700">
                              Compound Components
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              id="q1-b"
                              name="q1"
                              type="radio"
                              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                            />
                            <label htmlFor="q1-b" className="ml-3 text-gray-700">
                              Render Props
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              id="q1-c"
                              name="q1"
                              type="radio"
                              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                            />
                            <label htmlFor="q1-c" className="ml-3 text-gray-700">
                              Custom Hooks
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              id="q1-d"
                              name="q1"
                              type="radio"
                              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                            />
                            <label htmlFor="q1-d" className="ml-3 text-gray-700">
                              State Reducer
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border border-gray-200 rounded-md p-4">
                        <p className="font-medium text-gray-900 mb-2">
                          2. Which pattern is most useful when you want to allow users to customize how state changes in response to actions?
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input
                              id="q2-a"
                              name="q2"
                              type="radio"
                              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                            />
                            <label htmlFor="q2-a" className="ml-3 text-gray-700">
                              Props Collection
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              id="q2-b"
                              name="q2"
                              type="radio"
                              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                            />
                            <label htmlFor="q2-b" className="ml-3 text-gray-700">
                              State Reducer
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              id="q2-c"
                              name="q2"
                              type="radio"
                              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                            />
                            <label htmlFor="q2-c" className="ml-3 text-gray-700">
                              Compound Components
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              id="q2-d"
                              name="q2"
                              type="radio"
                              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                            />
                            <label htmlFor="q2-d" className="ml-3 text-gray-700">
                              Custom Hooks
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notes section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-emerald-600" />
                  My Notes
                </h3>
                <textarea
                  rows={4}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  placeholder="Take notes for this module..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={saveNotes}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-between">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </button>
              
              <div className="flex space-x-3">
                {!currentModule.completed && (
                  <button
                    onClick={markModuleComplete}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Complete
                  </button>
                )}
                
                {currentModuleIndex < course.modules.length - 1 && (
                  <button
                    onClick={goToNextModule}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    Next Module
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    {/* AI Assistant */}
    <div
      className={`fixed bottom-4 right-4 flex flex-col max-w-xs w-full sm:max-w-sm transform transition-transform duration-300 z-40 ${
        aiChatOpen ? 'translate-y-0' : 'translate-y-[calc(100%-60px)]'
      }`}
      >
        <div
          onClick={toggleAiChat}
          className="bg-emerald-600 text-white p-4 rounded-t-xl flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center">
            <Bot className="w-5 h-5 mr-2" />
            <h3 className="font-medium">AI Learning Assistant</h3>
          </div>
          <div
            className={`transform transition-transform duration-300 ${
              aiChatOpen ? 'rotate-180' : ''
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-b-xl shadow-lg overflow-hidden flex flex-col h-96">
          <div className="flex-1 p-4 overflow-y-auto">
            {aiMessages.map((message) => (
              <div
                key={message.id}
                className={`mb-3 flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-xl ${
                    message.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-gray-100 text-gray-800 rounded-tl-none'
                  }`}
                >
                  <div className="flex items-center mb-1">
                    {message.sender === 'ai' && (
                      <Bot className="w-4 h-4 mr-1 text-emerald-600" />
                    )}
                    {message.sender === 'user' && (
                      <User className="w-4 h-4 mr-1 text-white" />
                    )}
                    <span className="text-xs font-semibold">
                      {message.sender === 'ai' ? 'AI Assistant' : 'You'}
                    </span>
                  </div>
                  <div className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br>') }} />
                  <p className="text-xs opacity-70 mt-1 text-right">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={aiChatEndRef} />
          </div>

          <form onSubmit={handleSendAiMessage} className="border-t p-3 flex">
            <input
              type="text"
              value={aiMessageInput}
              onChange={(e) => setAiMessageInput(e.target.value)}
              placeholder="Ask about this course..."
              className="flex-1 border rounded-l-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              disabled={aiLoading}
            />
            <button
              type="submit"
              className={`p-2 rounded-r-lg ${aiLoading ? 'bg-gray-400' : 'bg-emerald-600 hover:bg-emerald-700'} text-white transition-colors duration-200`}
              disabled={aiLoading}
            >
              {aiLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
