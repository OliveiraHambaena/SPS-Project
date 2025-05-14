import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  LogOut,
  Bell,
  Search,
  BookOpen,
  Menu,
  X,
  User,
  Send,
  MessageSquare,
  Clock,
  Award,
  ChevronRight,
  PlayCircle,
  Bot,
  Sparkles,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { deepseekAI, type DeepSeekMessage } from "../lib/deepseekAI";

interface UserData {
  id: string;
  name?: string;
  role: "student" | "teacher" | "parent";
  identifier_code: string;
  subject?: string;
  grade?: string;
  created_at?: string;
  updated_at?: string;
  avatar_url?: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  image_url: string;
  instructor: string;
  progress?: number;
  total_modules: number;
  completed_modules?: number;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface AIAssistantState {
  isProcessing: boolean;
  conversationHistory: DeepSeekMessage[];
}

interface DashboardProps {
  children?: React.ReactNode;
}

export default function Dashboard({ children }: DashboardProps) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      text: "Hello! I'm your DeepSeek AI learning assistant. How can I help you navigate and understand the SPS PRO system today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [messageInput, setMessageInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [aiState, setAiState] = useState<AIAssistantState>({
    isProcessing: false,
    conversationHistory: [],
  });

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/login", { replace: true });
      }
    });

    void fetchUserData();
    void fetchCourses();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom of chat whenever messages change
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const fetchUserData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("No authenticated user");
      }

      // Fetch user data from the users_view
      const { data, error } = await supabase
        .from("users_view")
        .select("id, name, role, identifier_code, subject, grade")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      // Add avatar_url if needed (not in the view)
      const userData = {
        ...data,
        avatar_url: undefined // You can fetch this separately if needed
      };

      setUserData(userData as UserData);
    } catch (err) {
      console.error("Error fetching user data:", err);
      // Instead of logging out, try to create a default user record if it doesn't exist
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          // Create a default user record in the users table
          const { data: newUserData, error: insertError } = await supabase
            .from("users")
            .insert({
              id: user.id,
              name: user.email?.split("@")[0] || "New User",
              role: "student",
              identifier_code: user.id.substring(0, 8).toUpperCase()
            })
            .select()
            .single();

          if (!insertError && newUserData) {
            setUserData(newUserData as UserData);
          } else {
            // Still set minimal user data to prevent logout
            setUserData({
              id: user.id,
              role: "student",
              identifier_code: user.id.substring(0, 8).toUpperCase(),
            } as UserData);
          }
        }
      } catch (createErr) {
        console.error("Error creating user data:", createErr);
        // Don't logout - just continue with minimal user data
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    // This would normally fetch from an actual database
    // Mock course data for demonstration
    const mockCourses: Course[] = [
      {
        id: "1",
        title: "Grade 12 - Advanced Physics",
        description: "Learn mechanics, thermodynamics, and electromagnetism for grade 12 students",
         image_url: "https://img.freepik.com/free-vector/background-about-physics_1284-698.jpg?uid=R188609472&ga=GA1.1.1016799536.1745184895&semt=ais_hybrid&w=740",

        instructor: "Jane Smith",
        progress: 85,
        total_modules: 12,
        completed_modules: 10,
      },
      {
        id: "2",
        title: "Grade 11 - Chemistry Fundamentals",
        description: "Master organic chemistry, chemical reactions and lab techniques for grade 11",
        image_url: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2",
        instructor: "John Doe",
        progress: 45,
        total_modules: 8,
        completed_modules: 3,
      },
      {
        id: "3",
        title: "Grade 10 - Introduction to Biology",
        description: "Explore cells, genetics, and ecosystems for grade 10 students",
        image_url: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e",
        instructor: "Sara Johnson",
        progress: 20,
        total_modules: 10,
        completed_modules: 2,
      },
      {
        id: "4",
        title: "Grade 12 - Advanced Mathematics",
        description: "Study calculus, statistics, and advanced algebra for grade 12 students",
        image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
        instructor: "Michael Chen",
        progress: 0,
        total_modules: 15,
        completed_modules: 0,
      },
    ];

    setCourses(mockCourses);
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUserData(null);
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Error logging out:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim() || aiState.isProcessing) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: messageInput,
      sender: "user",
      timestamp: new Date(),
    };

    // Update DeepSeek conversation history
    const updatedHistory = [
      ...aiState.conversationHistory,
      { role: 'user', content: messageInput }
    ];

    // Update state
    setChatMessages((prev) => [...prev, userMessage]);
    setMessageInput("");
    setAiState(prev => ({
      ...prev,
      isProcessing: true,
      conversationHistory: updatedHistory
    }));

    try {
      // Set dashboard context for more relevant responses
      const dashboardContext = "SPS PRO Learning Dashboard - Navigate courses, track progress, and access learning resources";
      deepseekAI.setCourseContext("SPS PRO Platform Navigation", dashboardContext);
      
      // Get response from DeepSeek AI
      const aiResponse = await deepseekAI.getResponse(messageInput, aiState.conversationHistory);
      
      // Add bot response to chat
      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        text: aiResponse,
        sender: "bot",
        timestamp: new Date(),
      };

      // Update conversation history with assistant's response
      const newHistory = [
        ...updatedHistory,
        { role: 'assistant', content: aiResponse }
      ];

      setChatMessages((prev) => [...prev, botMessage]);
      setAiState(prev => ({
        ...prev,
        isProcessing: false,
        conversationHistory: newHistory
      }));
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        text: "I'm sorry, I encountered an issue processing your request. Please try again later.",
        sender: "bot",
        timestamp: new Date(),
      };
      
      setChatMessages((prev) => [...prev, errorMessage]);
      setAiState(prev => ({
        ...prev,
        isProcessing: false
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
          <span className="text-sm text-emerald-900">Loading...</span>
        </div>
      </div>
    );
  }

  const displayName =
    userData?.name ||
    (userData?.role
      ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1)
      : "User");

  const Sidebar = ({ isMobile = false }) => (
    <div
      className={`${
        isMobile ? "block lg:hidden" : "hidden lg:block"
      } bg-white shadow-lg h-full transition-all duration-300 ease-in-out`}
    >
      <div className="flex flex-col h-full">
        {/* Logo and App Name */}
        <div className="flex items-center justify-center h-20 border-b bg-gradient-to-r from-emerald-600 to-teal-500 text-white">
          <BookOpen className="w-8 h-8" />
          <span className="ml-2 text-xl font-bold">ELearn Pro</span>
          {isMobile && (
            <button
              onClick={toggleMobileMenu}
              className="absolute right-4 p-2 rounded-lg hover:bg-white/20"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="mb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Main Menu
          </div>
          <div className="space-y-1">
            <Link
              to="/dashboard"
              className="group flex items-center px-4 py-2.5 text-gray-700 rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-100 border-l-4 border-emerald-500 transition-all duration-300 ease-in-out transform hover:scale-[1.02]"
            >
              <div className="flex-shrink-0 mr-3 p-1 rounded-md bg-white shadow-sm transition-all duration-300 ease-in-out">
                <LayoutDashboard className="w-5 h-5 text-emerald-600 animate-pulse" />
              </div>
              <span className="font-medium">Dashboard</span>
              <ChevronRight className="w-4 h-4 ml-auto text-emerald-400" />
            </Link>
            
            <Link
              to="/courses"
              className="group flex items-center px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-300 ease-in-out transform hover:translate-x-1 hover:scale-[1.01]"
            >
              <div className="flex-shrink-0 mr-3 p-1 rounded-md transition-all duration-300 ease-in-out group-hover:bg-white group-hover:shadow-sm">
                <BookOpen className="w-5 h-5 text-gray-500 group-hover:text-emerald-600" />
              </div>
              <span>My Courses</span>
            </Link>
            
            {userData?.role === "teacher" && (
              <a
                href="#"
                className="group flex items-center px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-300 ease-in-out transform hover:translate-x-1 hover:scale-[1.01]"
              >
                <div className="flex-shrink-0 mr-3 p-1 rounded-md transition-all duration-300 ease-in-out group-hover:bg-white group-hover:shadow-sm">
                  <Users className="w-5 h-5 text-gray-500 group-hover:text-emerald-600" />
                </div>
                <span>Students</span>
              </a>
            )}
            
            <Link
              to="/schedule"
              className="group flex items-center px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-300 ease-in-out transform hover:translate-x-1 hover:scale-[1.01]"
            >
              <div className="flex-shrink-0 mr-3 p-1 rounded-md transition-all duration-300 ease-in-out group-hover:bg-white group-hover:shadow-sm">
                <Calendar className="w-5 h-5 text-gray-500 group-hover:text-emerald-600" />
              </div>
              <span>Schedule</span>
            </Link>
            
            <Link
              to="/certificates"
              className="group flex items-center px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-300 ease-in-out transform hover:translate-x-1 hover:scale-[1.01]"
            >
              <div className="flex-shrink-0 mr-3 p-1 rounded-md transition-all duration-300 ease-in-out group-hover:bg-white group-hover:shadow-sm">
                <Award className="w-5 h-5 text-gray-500 group-hover:text-emerald-600" />
              </div>
              <span>Certificates</span>
            </Link>
          </div>
          

          <div className="space-y-1">

            

          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-2.5 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all duration-300 ease-in-out shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-95"
          >
            <LogOut className="w-5 h-5 mr-2" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="fixed inset-y-0 left-0 w-72 hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <div className="fixed inset-0 z-50 pointer-events-none lg:hidden">
        <div
          className={`absolute inset-0 bg-gray-600 backdrop-blur-sm transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-50 pointer-events-auto' : 'opacity-0'}`}
          onClick={toggleMobileMenu}
        ></div>
        <div className={`absolute inset-y-0 left-0 w-72 transition-all duration-300 ease-in-out transform ${isMobileMenuOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full'} shadow-xl`}>
          <Sidebar isMobile={true} />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-72">
        {/* Header - Sticky Navbar */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg text-gray-600 lg:hidden hover:bg-gray-100 transition-transform duration-300 ease-in-out hover:rotate-3 active:scale-95"
              >
                <Menu className="w-6 h-6" />
              </button>

            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-500 transition-colors duration-200">
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 block w-2 h-2 bg-red-400 rounded-full"></span>
              </button>
              <div className="flex items-center">
                <div className="flex flex-col mr-2" data-component-name="Dashboard">
                  <span className="text-sm font-medium text-gray-900" data-component-name="Dashboard">
                    {userData?.name || "User"}
                  </span>
                  <span className="text-xs text-emerald-600 capitalize" data-component-name="Dashboard">
                    {userData?.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : "Student"}
                  </span>
                </div>
                <Link
                  to="/profile"
                  className="block relative w-8 h-8 rounded-full overflow-hidden bg-gray-100 ring-2 ring-white hover:ring-emerald-600 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
                  aria-label="Go to profile settings"
                >
                  {userData?.avatar_url ? (
                    <img
                      src={userData.avatar_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children ? children : (
            <>
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl p-6 mb-8 text-white shadow-lg">
                <h1 className="text-2xl font-bold mb-2">
                  Welcome back, {userData?.name || "User"}!
                </h1>
                <p className="opacity-90 mb-2">
                  You are logged in as{" "}
                  <span className="font-semibold capitalize">
                    {userData?.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : "Student"}
                  </span>
                </p>
                <div className="flex items-center mt-3">
                  <Clock className="w-5 h-5 mr-2" />
                  <p className="opacity-80 text-sm">
                    Last login: Today at{" "}
                    {new Date().toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {/* Progress Overview */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    My Learning Progress
                  </h2>
                  <Link
                    to="/courses"
                    className="text-emerald-600 text-sm font-medium hover:underline flex items-center"
                  >
                    View all courses <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col"
                    >
                      <img
                        src={`${course.image_url}?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=600&h=400&q=80`}
                        alt={course.title}
                        className="h-36 w-full object-cover"
                      />
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-semibold text-gray-900 line-clamp-1">
                          {course.title}
                        </h3>
                        <p className="text-gray-500 text-sm mt-1 mb-3 line-clamp-2">
                          {course.description}
                        </p>
                        <div className="mt-auto">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">
                              {course.completed_modules} of {course.total_modules} modules
                            </span>
                            <span className="font-medium text-emerald-600">
                              {course.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-emerald-500 h-2 rounded-full"
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            Instructor: {course.instructor}
                          </span>
                          <Link 
                            to={`/study/${course.id}`} 
                            className="flex items-center text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                          >
                            <PlayCircle className="w-4 h-4 mr-1" /> Continue
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended & Featured Courses */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Recommended For You
                </h2>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <img
                      src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=300&q=80"
                      alt="Advanced Python Programming"
                      className="h-48 w-full md:w-64 object-cover rounded-lg"
                    />
                    <div className="flex flex-col flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">
                        Advanced Python Programming
                      </h3>
                      <p className="text-gray-500 my-2">
                        Take your Python skills to the next level with advanced concepts
                        such as decorators, generators, and concurrency.
                      </p>
                      <div className="flex items-center mt-1 mb-4">
                        <img
                          src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                          alt="Alex Morgan"
                          className="w-6 h-6 rounded-full mr-2"
                        />
                        <span className="text-sm text-gray-600">Alex Morgan</span>
                      </div>
                      <div className="mt-auto flex items-center">
                        <button className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200">
                          Enroll Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Chatbot */}
      <div
        className={`fixed bottom-4 right-4 flex flex-col max-w-xs w-full sm:max-w-sm transform transition-transform duration-300 z-40 ${
          isChatOpen ? "translate-y-0" : "translate-y-[calc(100%-60px)]"
        }`}
      >
        <div
          onClick={toggleChat}
          className="bg-emerald-600 text-white p-4 rounded-t-xl flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center">
            <Bot className="w-5 h-5 mr-2" />
            <h3 className="font-medium">DeepSeek AI Assistant</h3>
          </div>
          <div
            className={`transform transition-transform duration-300 ${
              isChatOpen ? "rotate-180" : ""
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-b-xl shadow-lg overflow-hidden flex flex-col h-96">
          <div className="flex-1 p-4 overflow-y-auto">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`mb-3 flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-xl ${
                    message.sender === "user"
                      ? "bg-emerald-600 text-white rounded-tr-none"
                      : "bg-gray-100 text-gray-800 rounded-tl-none"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1 text-right">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="border-t p-3 flex">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Ask DeepSeek AI about the system..."
              className="flex-1 border rounded-l-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              disabled={aiState.isProcessing}
            />
            <button
              type="submit"
              disabled={aiState.isProcessing || !messageInput.trim()}
              className={`${aiState.isProcessing ? 'bg-gray-400' : 'bg-emerald-600 hover:bg-emerald-700'} text-white p-2 rounded-r-lg transition-colors duration-200`}
            >
              {aiState.isProcessing ? (
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
