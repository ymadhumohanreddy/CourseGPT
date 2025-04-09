
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  GripVerticalIcon, 
  PlusIcon, 
  Trash2Icon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  FileTextIcon,
  FolderIcon,
  SaveIcon
} from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type Course = Database['public']['Tables']['courses']['Row'];
type Module = Database['public']['Tables']['modules']['Row'] & {
  lessons: Lesson[];
  isExpanded: boolean;
};
type Lesson = Database['public']['Tables']['lessons']['Row'];

const ModuleOrganizer = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showNewCourseInput, setShowNewCourseInput] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCourse) {
      fetchModules(selectedCourse);
    } else {
      setModules([]);
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setCourses(data || []);
      
      if (data && data.length > 0 && !selectedCourse) {
        setSelectedCourse(data[0].id);
      } else if (data && data.length === 0) {
        setShowNewCourseInput(true);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createDefaultCourse = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('courses')
        .insert([
          { 
            title: newCourseTitle || 'My First Course', 
            description: 'A course created by you',
            user_id: user.id
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setCourses([...courses, data[0]]);
        setSelectedCourse(data[0].id);
        setNewCourseTitle("");
        setShowNewCourseInput(false);
        
        toast({
          title: "Course Created",
          description: `Course "${data[0].title}" has been created`,
        });
      }
    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        title: "Error",
        description: "Failed to create course: " + (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const fetchModules = async (courseId: string) => {
    try {
      setIsLoading(true);
      
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (modulesError) throw modulesError;

      if (!modulesData || modulesData.length === 0) {
        setModules([]);
        setIsLoading(false);
        return;
      }

      const moduleIds = modulesData.map(module => module.id);
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .in('module_id', moduleIds)
        .order('order_index', { ascending: true });

      if (lessonsError) throw lessonsError;

      const modulesWithLessons = modulesData.map(module => {
        const moduleLessons = lessonsData
          ? lessonsData.filter(lesson => lesson.module_id === module.id)
          : [];
          
        return {
          ...module,
          lessons: moduleLessons,
          isExpanded: true,
        };
      });

      setModules(modulesWithLessons);
    } catch (error) {
      console.error('Error fetching modules:', error);
      toast({
        title: "Error",
        description: "Failed to load modules",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    setModules(modules.map(module => 
      module.id === moduleId 
        ? { ...module, isExpanded: !module.isExpanded } 
        : module
    ));
  };

  const addModule = async () => {
    if (!selectedCourse) {
      toast({
        title: "No course selected",
        description: "Please select a course first",
        variant: "destructive",
      });
      return;
    }

    if (!newModuleTitle.trim()) {
      toast({
        title: "Module title required",
        description: "Please enter a title for the new module",
        variant: "destructive",
      });
      return;
    }

    try {
      const newOrderIndex = modules.length;
      
      const { data, error } = await supabase
        .from('modules')
        .insert([
          { 
            course_id: selectedCourse, 
            title: newModuleTitle,
            order_index: newOrderIndex
          }
        ])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        const newModule: Module = {
          ...data[0],
          lessons: [],
          isExpanded: true
        };

        setModules([...modules, newModule]);
        setNewModuleTitle("");
      
        toast({
          title: "Module Added",
          description: `Module "${newModuleTitle}" has been added`,
        });
      }
    } catch (error) {
      console.error('Error adding module:', error);
      toast({
        title: "Error",
        description: "Failed to add module: " + (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const removeModule = async (moduleId: string) => {
    try {
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', moduleId);

      if (error) throw error;

      setModules(modules.filter(module => module.id !== moduleId));
      
      toast({
        title: "Module Removed",
        description: "The module has been removed",
      });
    } catch (error) {
      console.error('Error removing module:', error);
      toast({
        title: "Error",
        description: "Failed to remove module",
        variant: "destructive",
      });
    }
  };

  const addLesson = async (moduleId: string) => {
    try {
      const module = modules.find(m => m.id === moduleId);
      if (!module) return;

      const newOrderIndex = module.lessons.length;
      
      const { data, error } = await supabase
        .from('lessons')
        .insert([
          { 
            module_id: moduleId, 
            title: "New Lesson",
            content: "Click to edit lesson content",
            order_index: newOrderIndex
          }
        ])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setModules(modules.map(module => {
          if (module.id === moduleId) {
            return {
              ...module,
              lessons: [...module.lessons, data[0]]
            };
          }
          return module;
        }));
        
        toast({
          title: "Lesson Added",
          description: "A new lesson has been added to the module",
        });
      }
    } catch (error) {
      console.error('Error adding lesson:', error);
      toast({
        title: "Error",
        description: "Failed to add lesson: " + (error as Error).message,
        variant: "destructive",
      });
    }
  };

  const removeLesson = async (moduleId: string, lessonId: string) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;

      setModules(modules.map(module => {
        if (module.id === moduleId) {
          return {
            ...module,
            lessons: module.lessons.filter(lesson => lesson.id !== lessonId)
          };
        }
        return module;
      }));
      
      toast({
        title: "Lesson Removed",
        description: "The lesson has been removed from the module",
      });
    } catch (error) {
      console.error('Error removing lesson:', error);
      toast({
        title: "Error",
        description: "Failed to remove lesson",
        variant: "destructive",
      });
    }
  };

  const updateLessonTitle = async (moduleId: string, lessonId: string, newTitle: string) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .update({ title: newTitle })
        .eq('id', lessonId);

      if (error) throw error;

      setModules(modules.map(module => {
        if (module.id === moduleId) {
          return {
            ...module,
            lessons: module.lessons.map(lesson => 
              lesson.id === lessonId 
                ? { ...lesson, title: newTitle } 
                : lesson
            )
          };
        }
        return module;
      }));
    } catch (error) {
      console.error('Error updating lesson title:', error);
      toast({
        title: "Error",
        description: "Failed to update lesson title",
        variant: "destructive",
      });
    }
  };

  const updateLessonDescription = async (moduleId: string, lessonId: string, newContent: string) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .update({ content: newContent })
        .eq('id', lessonId);

      if (error) throw error;

      setModules(modules.map(module => {
        if (module.id === moduleId) {
          return {
            ...module,
            lessons: module.lessons.map(lesson => 
              lesson.id === lessonId 
                ? { ...lesson, content: newContent } 
                : lesson
            )
          };
        }
        return module;
      }));
    } catch (error) {
      console.error('Error updating lesson content:', error);
      toast({
        title: "Error",
        description: "Failed to update lesson content",
        variant: "destructive",
      });
    }
  };

  const updateModuleTitle = async (moduleId: string, newTitle: string) => {
    try {
      const { error } = await supabase
        .from('modules')
        .update({ title: newTitle })
        .eq('id', moduleId);

      if (error) throw error;

      setModules(modules.map(module => 
        module.id === moduleId 
          ? { ...module, title: newTitle } 
          : module
      ));
    } catch (error) {
      console.error('Error updating module title:', error);
      toast({
        title: "Error",
        description: "Failed to update module title",
        variant: "destructive",
      });
    }
  };

  const handleSaveCourse = async () => {
    try {
      toast({
        title: "Course Saved",
        description: "Your course structure has been saved successfully",
      });
    } catch (error) {
      console.error('Error saving course:', error);
      toast({
        title: "Error",
        description: "Failed to save course",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Module Organizer</h1>
        <p className="text-muted-foreground mt-1">
          Organize and structure your course content
        </p>
      </div>
      
      {showNewCourseInput ? (
        <div className="mb-6 space-y-3">
          <Label>Create New Course</Label>
          <div className="flex gap-3">
            <Input
              placeholder="Enter course title"
              value={newCourseTitle}
              onChange={(e) => setNewCourseTitle(e.target.value)}
            />
            <Button onClick={createDefaultCourse}>
              Create Course
            </Button>
          </div>
        </div>
      ) : courses.length > 0 ? (
        <div className="mb-6 space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="course-select">Select Course</Label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowNewCourseInput(true)}
            >
              <PlusIcon className="h-4 w-4 mr-2" /> New Course
            </Button>
          </div>
          <select
            id="course-select"
            value={selectedCourse || ''}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="mt-1 block w-full rounded-md border-border bg-background px-3 py-2 text-sm focus:border-primary focus:ring-primary"
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      
      <Tabs defaultValue="organize">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="organize">Organize Modules</TabsTrigger>
          <TabsTrigger value="preview">Course Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="organize" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Structure</CardTitle>
              <CardDescription>
                Drag and drop modules and lessons to organize your course
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedCourse && (
                <div className="text-center p-6 border rounded-md border-dashed border-muted-foreground/50">
                  <p className="text-muted-foreground">
                    {courses.length === 0 
                      ? "Create a course to get started" 
                      : "Select a course to view its modules"}
                  </p>
                </div>
              )}
              
              {selectedCourse && (
                <div className="space-y-4">
                  {modules.map((module) => (
                    <Card key={module.id} className="border-2 border-border">
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <GripVerticalIcon className="h-5 w-5 text-muted-foreground cursor-move" />
                          <div className="flex items-center gap-2">
                            <FolderIcon className="h-5 w-5 text-primary" />
                            <Input
                              value={module.title}
                              onChange={(e) => updateModuleTitle(module.id, e.target.value)}
                              className="bg-transparent border-none h-7 p-0 focus-visible:ring-0 text-base font-medium"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addLesson(module.id)}
                          >
                            <PlusIcon className="h-4 w-4 mr-1" /> Lesson
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => toggleModule(module.id)}
                          >
                            {module.isExpanded ? (
                              <ChevronUpIcon className="h-4 w-4" />
                            ) : (
                              <ChevronDownIcon className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeModule(module.id)}
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {module.isExpanded && (
                        <div className="px-4 pb-4 space-y-2">
                          {module.lessons.length === 0 ? (
                            <div className="text-center p-4 text-sm text-muted-foreground">
                              No lessons yet. Click "Lesson" to add one.
                            </div>
                          ) : (
                            module.lessons.map((lesson) => (
                              <div
                                key={lesson.id}
                                className="ml-6 p-3 border rounded-md flex items-start justify-between bg-background"
                              >
                                <div className="flex items-start gap-3 flex-1">
                                  <GripVerticalIcon className="h-5 w-5 text-muted-foreground cursor-move mt-1" />
                                  <div className="space-y-1 flex-1">
                                    <div className="flex items-center gap-2">
                                      <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                                      <Input
                                        value={lesson.title || ''}
                                        onChange={(e) => updateLessonTitle(module.id, lesson.id, e.target.value)}
                                        className="bg-transparent border-none h-7 p-0 focus-visible:ring-0 text-sm font-medium"
                                      />
                                    </div>
                                    <Input
                                      value={lesson.content || ''}
                                      onChange={(e) => updateLessonDescription(module.id, lesson.id, e.target.value)}
                                      className="bg-transparent border-none h-7 p-0 focus-visible:ring-0 text-xs text-muted-foreground"
                                    />
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeLesson(module.id, lesson.id)}
                                  className="h-8 w-8"
                                >
                                  <Trash2Icon className="h-3 w-3" />
                                </Button>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </Card>
                  ))}
                  
                  {modules.length === 0 && (
                    <div className="text-center p-6 border rounded-md border-dashed border-muted-foreground/50">
                      <p className="text-muted-foreground">
                        This course has no modules yet. Add your first module below.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Label htmlFor="new-module" className="sr-only">
                        New Module Title
                      </Label>
                      <Input
                        id="new-module"
                        placeholder="Enter new module title"
                        value={newModuleTitle}
                        onChange={(e) => setNewModuleTitle(e.target.value)}
                      />
                    </div>
                    <Button onClick={addModule}>
                      <PlusIcon className="h-4 w-4 mr-2" /> Add Module
                    </Button>
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <Button onClick={handleSaveCourse} className="gap-2">
                      <SaveIcon className="h-4 w-4" />
                      Save Course Structure
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Preview</CardTitle>
              <CardDescription>
                Preview how your course structure will look to students
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedCourse ? (
                <div className="text-center p-6">
                  <p className="text-muted-foreground">
                    Select a course to see its preview
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {modules.map((module) => (
                    <div key={module.id} className="space-y-3">
                      <div className="flex items-center gap-3">
                        <FolderIcon className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-bold">{module.title}</h3>
                      </div>
                      
                      <div className="ml-8 space-y-2">
                        {module.lessons.map((lesson) => (
                          <div key={lesson.id} className="flex items-start gap-3">
                            <FileTextIcon className="h-4 w-4 text-muted-foreground mt-1" />
                            <div>
                              <p className="font-medium">{lesson.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {lesson.content}
                              </p>
                            </div>
                          </div>
                        ))}
                        
                        {module.lessons.length === 0 && (
                          <p className="text-sm text-muted-foreground">
                            No lessons in this module
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {modules.length === 0 && (
                    <div className="text-center p-6">
                      <p className="text-muted-foreground">
                        Your course has no modules yet. Add some to see the preview.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModuleOrganizer;
