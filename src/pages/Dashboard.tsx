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
} from "lucide-react";
import { supabase } from "../lib/supabase";

interface UserData {
  id: string;
  role: "student" | "teacher" | "parent";
  identifier_code: string;
  name?: string;
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

export default function Dashboard() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      text: "Hello! I'm your learning assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [messageInput, setMessageInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

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

      // Fetch user data from the users_view instead of users table
      const { data, error } = await supabase
        .from("users_view")
        .select("id, role, identifier_code, name")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setUserData(data as UserData);
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
              role: "student",
              identifier_code: user.id.substring(0, 8).toUpperCase(),
              name: user.email?.split("@")[0] || "New User",
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
    try {
      // Fetch courses from the database
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("user_id", userData?.id); // Assuming courses are tied to a user ID

      if (error) throw error;

      if (data && data.length > 0) {
        setCourses(data);
      } else {
        setCourses([]); // No courses for first-time login
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: messageInput,
      sender: "user",
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setMessageInput("");

    // Simulate bot response
    setTimeout(() => {
      let botResponse = "";

      const lowercaseInput = messageInput.toLowerCase();

      if (lowercaseInput.includes("course") && lowercaseInput.includes("enroll")) {
        botResponse =
          "To enroll in a course, simply click on the course card and then press the 'Enroll Now' button on the course details page!";
      } else if (lowercaseInput.includes("progress")) {
        botResponse =
          "Your course progress can be found on each course card. The green progress bar shows how far you've come!";
      } else if (
        lowercaseInput.includes("assignment") ||
        lowercaseInput.includes("homework")
      ) {
        botResponse =
          "You can find all your assignments in the 'Assignments' section of each course. Click on a course and scroll down to see them.";
      } else if (
        lowercaseInput.includes("profile") ||
        lowercaseInput.includes("account")
      ) {
        botResponse =
          "You can access your profile by clicking on your profile picture in the top right corner!";
      } else if (
        lowercaseInput.includes("help") ||
        lowercaseInput.includes("support")
      ) {
        botResponse =
          "For additional support, please visit our Help Center or contact support@elearningsystem.com";
      } else {
        botResponse =
          "I'm here to help with your e-learning journey! You can ask me about courses, assignments, your progress, or how to use different features of the platform.";
      }

      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        text: botResponse,
        sender: "bot",
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, botMessage]);
    }, 1000);
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

        {/* User Profile Card */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <Link
              to="/profile"
              className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 ring-2 ring-emerald-500 flex-shrink-0 hover:ring-emerald-600 transition-all duration-200"
            >
              {userData?.avatar_url ? (
                <img
                  src={userData.avatar_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-emerald-50">
                  <User className="w-6 h-6 text-emerald-500" />
                </div>
              )}
            </Link>
            <div className="flex-1 min-w-0">
              <Link to="/profile" className="block hover:text-emerald-600 transition-colors">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {userData?.name || "User"}
                </h3>
              </Link>
              <div className="flex items-center mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 capitalize">
                  {userData?.role || "Student"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 truncate">
                ID: {userData?.identifier_code}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="mb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Main Menu
          </div>
          <div className="space-y-1">
            <a
              href="#"
              className="group flex items-center px-4 py-2.5 text-gray-700 rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-100 border-l-4 border-emerald-500 transition-all duration-300 ease-in-out transform hover:scale-[1.02]"
            >
              <div className="flex-shrink-0 mr-3 p-1 rounded-md bg-white shadow-sm transition-all duration-300 ease-in-out">
                <LayoutDashboard className="w-5 h-5 text-emerald-600 animate-pulse" />
              </div>
              <span className="font-medium">Dashboard</span>
              <ChevronRight className="w-4 h-4 ml-auto text-emerald-400" />
            </a>
            
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
            
            <a
              href="#"
              className="group flex items-center px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-300 ease-in-out transform hover:translate-x-1 hover:scale-[1.01]"
            >
              <div className="flex-shrink-0 mr-3 p-1 rounded-md transition-all duration-300 ease-in-out group-hover:bg-white group-hover:shadow-sm">
                <Calendar className="w-5 h-5 text-gray-500 group-hover:text-emerald-600" />
              </div>
              <span>Schedule</span>
            </a>
            
            <a
              href="#"
              className="group flex items-center px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-300 ease-in-out transform hover:translate-x-1 hover:scale-[1.01]"
            >
              <div className="flex-shrink-0 mr-3 p-1 rounded-md transition-all duration-300 ease-in-out group-hover:bg-white group-hover:shadow-sm">
                <Award className="w-5 h-5 text-gray-500 group-hover:text-emerald-600" />
              </div>
              <span>Certificates</span>
            </a>
          </div>
          
          <div className="mt-8 mb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Settings
          </div>
          <div className="space-y-1">
            <Link
              to="/profile"
              className="group flex items-center px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-300 ease-in-out transform hover:translate-x-1 hover:scale-[1.01]"
            >
              <div className="flex-shrink-0 mr-3 p-1 rounded-md transition-all duration-300 ease-in-out group-hover:bg-white group-hover:shadow-sm">
                <User className="w-5 h-5 text-gray-500 group-hover:text-emerald-600" />
              </div>
              <span>My Profile</span>
            </Link>
            
            <a
              href="#"
              className="group flex items-center px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-300 ease-in-out transform hover:translate-x-1 hover:scale-[1.01]"
            >
              <div className="flex-shrink-0 mr-3 p-1 rounded-md transition-all duration-300 ease-in-out group-hover:bg-white group-hover:shadow-sm">
                <Settings className="w-5 h-5 text-gray-500 group-hover:text-emerald-600" />
              </div>
              <span>Settings</span>
            </a>
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
              <div className="relative ml-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-shadow duration-200 hover:shadow-sm"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-500 transition-colors duration-200">
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 block w-2 h-2 bg-red-400 rounded-full"></span>
              </button>
              <div className="flex items-center">
                <div className="flex flex-col mr-2">
                  <span className="text-sm font-medium text-gray-900">
                    {userData?.name || "User"}
                  </span>
                  <span className="text-xs text-emerald-600 capitalize">
                    {userData?.role || "Student"}
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
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl p-6 mb-8 text-white shadow-lg">
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {userData?.name || "User"}!
            </h1>
            <p className="opacity-90 mb-2">
              You are logged in as{" "}
              <span className="font-semibold capitalize">
                {userData?.role || "Student"}
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

          {/* Conditionally Render Courses */}
          {courses.length === 0 ? (
            <div className="text-center text-gray-500">
              <p>You have no courses yet. Start by enrolling in a course!</p>
            </div>
          ) : (
            <div>
              {/* Render courses here */}
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                My Learning Progress
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {courses.map((course) => (
                  <div key={course.id} className="bg-white rounded-xl shadow-sm">
                    {/* Course card content */}
                  </div>
                ))}
              </div>
            </div>
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
            <MessageSquare className="w-5 h-5 mr-2" />
            <h3 className="font-medium">Learning Assistant</h3>
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
              placeholder="Type your question here..."
              className="flex-1 border rounded-l-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
            <button
              type="submit"
              className="bg-emerald-600 text-white p-2 rounded-r-lg hover:bg-emerald-700 transition-colors duration-200"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}