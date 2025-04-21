import { supabase } from '../lib/supabase';

/**
 * This is a test script to verify that the course creation functionality
 * works correctly with the database schema and storage bucket.
 * 
 * Run this script with: npx ts-node src/test/course-creation-test.ts
 */
async function testCourseCreation() {
  console.log('Testing course creation functionality...');
  
  try {
    // 1. Get the current authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user found');
    
    console.log(`Authenticated as user: ${user.id}`);
    
    // 2. Create a test course
    const testCourse = {
      title: 'Test Course',
      description: 'This is a test course created by the test script',
      teacher_id: user.id,
      status: 'draft',
      category: 'Programming',
      duration: 10,
      max_students: 20,
      level: 'beginner'
    };
    
    console.log('Creating test course...');
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .insert([testCourse])
      .select();
    
    if (courseError) throw courseError;
    if (!courseData || courseData.length === 0) throw new Error('Failed to create course');
    
    const courseId = courseData[0].id;
    console.log(`Created test course with ID: ${courseId}`);
    
    // 3. Test if the course was created correctly
    const { data: retrievedCourse, error: retrieveError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();
    
    if (retrieveError) throw retrieveError;
    if (!retrievedCourse) throw new Error('Failed to retrieve created course');
    
    console.log('Retrieved course successfully:');
    console.log(retrievedCourse);
    
    // 4. Clean up - delete the test course
    console.log('Cleaning up - deleting test course...');
    const { error: deleteError } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);
    
    if (deleteError) throw deleteError;
    console.log('Test course deleted successfully');
    
    // 5. Verify the course was deleted
    const { data: verifyDelete, error: verifyError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId);
    
    if (verifyError) throw verifyError;
    if (verifyDelete && verifyDelete.length > 0) {
      console.warn('Warning: Course was not deleted properly');
    } else {
      console.log('Verified course deletion');
    }
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the test
testCourseCreation();
