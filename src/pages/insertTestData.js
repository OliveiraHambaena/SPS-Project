import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://podvdwqasntsvxzshgmb.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get('courseId');

if (!courseId) {
  console.error('No courseId provided in URL');
  document.getElementById('result').textContent = 'Error: No courseId provided in URL';
} else {
  // Insert test data function
  async function insertTestData() {
    try {
      // First, get some users to enroll
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id')
        .limit(5);
      
      if (usersError) throw usersError;
      
      if (!users || users.length === 0) {
        throw new Error('No users found to enroll');
      }
      
      // Create enrollments for each user
      const enrollments = users.map((user, index) => ({
        course_id: courseId,
        user_id: user.id,
        progress_percentage: Math.floor(Math.random() * 100), // Random progress
        last_accessed_at: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000).toISOString(), // Random recent date
      }));
      
      // Insert the enrollments
      const { data, error } = await supabase
        .from('course_enrollments')
        .upsert(enrollments, { onConflict: ['course_id', 'user_id'] })
        .select();
      
      if (error) throw error;
      
      console.log('Successfully inserted test data:', data);
      document.getElementById('result').textContent = `Success! Added ${data.length} test enrollments.`;
      
      // Refresh the page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error inserting test data:', error);
      document.getElementById('result').textContent = `Error: ${error.message || error}`;
    }
  }
  
  // Add a button to the page
  const button = document.createElement('button');
  button.textContent = 'Add Test Enrollments';
  button.className = 'px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2';
  button.onclick = insertTestData;
  
  const result = document.createElement('div');
  result.id = 'result';
  result.className = 'mt-4 text-sm';
  
  const container = document.createElement('div');
  container.className = 'fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50';
  container.appendChild(button);
  container.appendChild(result);
  
  document.body.appendChild(container);
}
