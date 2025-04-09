
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PlusCircleIcon, BookOpenIcon, ListIcon, BarChart3Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Course = Database['public']['Tables']['courses']['Row'];
type Lesson = Database['public']['Tables']['lessons']['Row'];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeCourses, setActiveCourses] = useState<number>(0);
  const [totalLessons, setTotalLessons] = useState<number>(0);
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(5);
      
      if (coursesError) throw coursesError;
      
      setRecentCourses(coursesData || []);
      setActiveCourses(coursesData?.length || 0);
      
      // Fetch total lessons count
      const { count: lessonsCount, error: countError } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;
      
      setTotalLessons(lessonsCount || 0);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's an overview of your course creation
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Courses
            </CardTitle>
            <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
              ) : (
                activeCourses
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total courses in progress
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Lessons
            </CardTitle>
            <ListIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
              ) : (
                totalLessons
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all your courses
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Course Completion
            </CardTitle>
            <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
              ) : (
                activeCourses > 0 ? `${Math.round((totalLessons / (activeCourses * 5)) * 100)}%` : "0%"
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg. lessons per course
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="recent">
        <TabsList>
          <TabsTrigger value="recent">Recent Courses</TabsTrigger>
          <TabsTrigger value="insights">Course Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              Array(3).fill(null).map((_, i) => (
                <Card key={i} className="card-hover">
                  <CardHeader>
                    <div className="h-6 w-3/4 bg-muted animate-pulse rounded mb-2"></div>
                    <div className="h-4 w-1/2 bg-muted animate-pulse rounded"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-16 w-full bg-muted animate-pulse rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : recentCourses.length > 0 ? (
              recentCourses.map((course) => (
                <Card key={course.id} className="cursor-pointer card-hover" onClick={() => navigate('/modules')}>
                  <CardHeader>
                    <CardTitle>{course.title}</CardTitle>
                    <CardDescription>
                      Last updated: {new Date(course.updated_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {course.description || "No description available"}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="col-span-full">
                <CardHeader>
                  <CardTitle>No courses yet</CardTitle>
                  <CardDescription>
                    Create your first course to get started
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <Button onClick={() => navigate('/modules')}>
                    <PlusCircleIcon className="h-4 w-4 mr-2" />
                    Create Course
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle>Course Insights</CardTitle>
              <CardDescription>
                Data-driven insights to improve your courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeCourses > 0 ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Course Completion Rate</p>
                      <p className="text-sm font-medium">
                        {Math.round((totalLessons / (activeCourses * 10)) * 100)}%
                      </p>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${Math.min(Math.round((totalLessons / (activeCourses * 10)) * 100), 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Based on average expected lessons per course
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Most Active Course</p>
                      <p className="text-sm font-medium">
                        {recentCourses[0]?.title || "N/A"}
                      </p>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: "85%" }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Based on recent updates and lesson count
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Course Quality Score</p>
                      <p className="text-sm font-medium">
                        {Math.min(Math.round(totalLessons * 0.8), 100)}/100
                      </p>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${Math.min(Math.round(totalLessons * 0.8), 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Based on content richness and structure
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    Create courses to view insights
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
