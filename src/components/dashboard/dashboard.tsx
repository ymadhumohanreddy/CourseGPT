import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  PlusCircleIcon, 
  BookOpenIcon, 
  ListIcon, 
  BarChart3Icon, 
  RefreshCwIcon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SlidersIcon,
  XIcon,
  CheckIcon
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { format, parseISO } from "date-fns";
import { BarChart, ResponsiveContainer, XAxis, YAxis, Bar, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FilterIcon, SortAscIcon, SortDescIcon } from "../ui/icons";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

type Course = Database['public']['Tables']['courses']['Row'] & {
  completion_rate?: number;
  category?: string;
};

const CHART_COLORS = ['#0ea5e9', '#f59e0b', '#10b981', '#6366f1', '#ec4899'];
const COMPLETION_COLORS = ['#10b981', '#e2e8f0'];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeCourses, setActiveCourses] = useState<number>(0);
  const [totalLessons, setTotalLessons] = useState<number>(0);
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'updated_at' | 'title' | 'lessons'>('updated_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const coursesPerPage = 6;
  
  const [completionChartData, setCompletionChartData] = useState<Array<{name: string, value: number}>>([]);
  const [categoryChartData, setCategoryChartData] = useState<Array<{name: string, value: number}>>([]);
  const [progressChartData, setProgressChartData] = useState<Array<{name: string, value: number}>[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, currentPage, sortField, sortDirection, filterStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) fetchDashboardData();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('courses')
        .select('*', { count: 'exact' });
      
      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }
      
      query = query.order(sortField === 'lessons' ? 'updated_at' : sortField, { ascending: sortDirection === 'asc' });
      
      const from = (currentPage - 1) * coursesPerPage;
      const to = from + coursesPerPage - 1;
      
      const { data: coursesData, error: coursesError, count } = await query
        .range(from, to);
      
      if (coursesError) throw coursesError;
      
      const enhancedCourses: Course[] = (coursesData || []).map(course => {
        const mockCompletionRate = Math.floor(Math.random() * 100);
        const mockCategory = ['Development', 'Design', 'Business', 'Marketing', 'Science'][Math.floor(Math.random() * 5)];
        
        return {
          ...course,
          completion_rate: mockCompletionRate,
          category: mockCategory,
        };
      });
      
      let filteredCourses = enhancedCourses;
      if (filterStatus === 'active') {
        filteredCourses = enhancedCourses.filter(course => (course.completion_rate || 0) < 100);
      } else if (filterStatus === 'completed') {
        filteredCourses = enhancedCourses.filter(course => (course.completion_rate || 0) === 100);
      }
      
      if (count !== null) {
        const effectiveCount = filterStatus === 'all' ? count : filteredCourses.length;
        setTotalPages(Math.max(1, Math.ceil(effectiveCount / coursesPerPage)));
      }
      
      setRecentCourses(filteredCourses);
      setActiveCourses(count || 0);
      
      const { count: lessonsCount, error: countError } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;
      
      setTotalLessons(lessonsCount || 0);
      
      generateChartData(filteredCourses);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Failed to load dashboard data",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const generateChartData = (courses: Course[]) => {
    const completionData = [
      { name: 'Completed', value: 0 },
      { name: 'Remaining', value: 100 },
    ];
    
    if (courses.length > 0) {
      const avgCompletion = courses.reduce((acc, course) => acc + (course.completion_rate || 0), 0) / courses.length;
      completionData[0].value = Math.round(avgCompletion);
      completionData[1].value = 100 - completionData[0].value;
    }
    
    setCompletionChartData(completionData);
    
    const categories: Record<string, number> = {};
    courses.forEach(course => {
      const category = course.category || 'Uncategorized';
      categories[category] = (categories[category] || 0) + 1;
    });
    
    const categoryData = Object.entries(categories).map(([name, value]) => ({ name, value }));
    setCategoryChartData(categoryData);
    
    const months: Record<string, number> = {};
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(today.getMonth() - i);
      const monthKey = format(date, 'MMM');
      months[monthKey] = 0;
    }
    
    courses.forEach(course => {
      if (course.updated_at) {
        const updatedDate = parseISO(course.updated_at);
        const monthKey = format(updatedDate, 'MMM');
        if (months[monthKey] !== undefined) {
          months[monthKey]++;
        }
      }
    });
    
    const progressData = Object.entries(months).map(([name, value]) => ({ name, value }));
    setProgressChartData([progressData]);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
    
    toast({
      title: "Dashboard Refreshed",
      description: "The latest data has been loaded"
    });
  };
  
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };
  
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  const avgLessonsPerCourse = activeCourses > 0 ? Math.round((totalLessons / activeCourses) * 10) / 10 : 0;
  const completionRate = activeCourses > 0 ? 
    Math.min(Math.round((avgLessonsPerCourse / 8) * 100), 100) : 0;
  
  const sortOptions = [
    { value: 'updated_at', label: 'Last Updated' },
    { value: 'title', label: 'Title' },
    { value: 'lessons', label: 'Number of Lessons' }
  ];
  
  const filterOptions = [
    { value: 'all', label: 'All Courses' },
    { value: 'active', label: 'In Progress' },
    { value: 'completed', label: 'Completed' }
  ];
  
  const CardSkeleton = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-24 w-full" />
      </CardContent>
    </Card>
  );
  
  const StatSkeleton = () => (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-28" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-4 w-24 mt-1" />
      </CardContent>
    </Card>
  );
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's an overview of your course creation
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh} 
          disabled={refreshing || isLoading}
          className="gap-2"
        >
          <RefreshCwIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Courses
                </CardTitle>
                <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activeCourses}
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
                  {totalLessons}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeCourses > 0 ? `Avg. ${avgLessonsPerCourse} per course` : 'Across all your courses'}
                </p>
              </CardContent>
            </Card>
            
          </>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="flex-1 min-w-0">
          <div className="bg-card rounded-lg border shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Course Progress</h3>
              {isLoading ? (
                <Skeleton className="h-72 w-full" />
              ) : progressChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={progressChartData[0]} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0ea5e9" name="Courses" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-64">
                  <BookOpenIcon className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No course data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
      </div>
      
      <Tabs defaultValue="recent">
        <TabsList>
          <TabsTrigger value="recent">Recent Courses</TabsTrigger>
          <TabsTrigger value="insights">Course Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent" className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center justify-between mt-4">
            <div className="flex gap-2 items-center">
              <div className="relative w-full max-w-sm">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full rounded-l-none"
                    onClick={() => setSearchQuery('')}
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <FilterIcon className="h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {filterOptions.map(option => (
                    <DropdownMenuItem
                      key={option.value}
                      className="flex items-center gap-2"
                      onClick={() => setFilterStatus(option.value as any)}
                    >
                      {filterStatus === option.value && <CheckIcon className="h-4 w-4" />}
                      <span className={filterStatus === option.value ? "font-medium" : ""}>
                        {option.label}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    {sortDirection === 'asc' ? (
                      <SortAscIcon className="h-4 w-4" />
                    ) : (
                      <SortDescIcon className="h-4 w-4" />
                    )}
                    Sort: {sortOptions.find(o => o.value === sortField)?.label}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {sortOptions.map(option => (
                    <DropdownMenuItem
                      key={option.value}
                      className="flex items-center gap-2"
                      onClick={() => setSortField(option.value as any)}
                    >
                      {sortField === option.value && <CheckIcon className="h-4 w-4" />}
                      <span className={sortField === option.value ? "font-medium" : ""}>
                        {option.label}
                      </span>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem 
                    className="flex items-center gap-2 mt-2 border-t pt-2"
                    onClick={toggleSortDirection}
                  >
                    {sortDirection === 'asc' ? (
                      <>
                        <SortAscIcon className="h-4 w-4" />
                        <span>Ascending</span>
                      </>
                    ) : (
                      <>
                        <SortDescIcon className="h-4 w-4" />
                        <span>Descending</span>
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <Button onClick={() => navigate('/modules')} size="sm" className="gap-2">
              <PlusCircleIcon className="h-4 w-4" />
              New Course
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              Array(3).fill(null).map((_, i) => (
                <CardSkeleton key={i} />
              ))
            ) : recentCourses.length > 0 ? (
              recentCourses.map((course) => (
                <Card key={course.id} className="cursor-pointer card-hover transition-all hover:shadow-md" onClick={() => navigate('/modules')}>
                  <CardHeader>
                    <CardTitle>{course.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <RefreshCwIcon className="h-3 w-3" />
                      Last updated: {formatDate(course.updated_at)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {course.description || "No description available"}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Completion</span>
                        <span className="font-medium">{course.completion_rate || 0}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all" 
                          style={{ width: `${course.completion_rate || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="col-span-full">
                <CardHeader className="text-center">
                  <BookOpenIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <CardTitle>No courses found</CardTitle>
                  <CardDescription>
                    {searchQuery 
                      ? "Try a different search term or clear the filters" 
                      : "Create your first course to get started with your teaching journey"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  {searchQuery ? (
                    <Button variant="outline" onClick={() => {
                      setSearchQuery('');
                      setFilterStatus('all');
                    }}>
                      Clear Filters
                    </Button>
                  ) : (
                    <Button onClick={() => navigate('/modules')}>
                      <PlusCircleIcon className="h-4 w-4 mr-2" />
                      Create Your First Course
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <div className="text-sm">
                Page {currentPage} of {totalPages}
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
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
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : activeCourses > 0 ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Course Completion Rate</p>
                      <p className="text-sm font-medium">{completionRate}%</p>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all" 
                        style={{ width: `${completionRate}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Based on target of 8 lessons per course
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
                      Last updated: {recentCourses[0] ? formatDate(recentCourses[0].updated_at) : 'N/A'}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Course Quality Score</p>
                      <p className="text-sm font-medium">
                        {Math.min(Math.round(avgLessonsPerCourse * 12), 100)}/100
                      </p>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${Math.min(Math.round(avgLessonsPerCourse * 12), 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Based on content richness and structure
                    </p>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg mt-6">
                    <h4 className="font-semibold mb-2">Recommendations</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <div className="h-5 w-5 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center mt-0.5">
                          <CheckIcon className="h-3 w-3" />
                        </div>
                        <span>Add more lessons to courses with less than 5 lessons</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-5 w-5 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center mt-0.5">
                          <CheckIcon className="h-3 w-3" />
                        </div>
                        <span>Update courses that haven't been modified in the last 30 days</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-5 w-5 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center mt-0.5">
                          <CheckIcon className="h-3 w-3" />
                        </div>
                        <span>Add descriptions to courses missing them for better discoverability</span>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpenIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Create your first course to view insights
                  </p>
                  <Button onClick={() => navigate('/modules')}>
                    <PlusCircleIcon className="h-4 w-4 mr-2" />
                    Get Started
                  </Button>
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
