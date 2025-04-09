import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { debounce } from "@/lib/utils";
import RichTextEditor from "./RichTextEditor";
import { 
  GripVerticalIcon, 
  PlusIcon, 
  Trash2Icon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  FileTextIcon,
  FolderIcon,
  SaveIcon,
  SearchIcon,
  CheckCircleIcon,
  MoveUpIcon,
  MoveDownIcon
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
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

      if (autoSaveEnabled) {
        toast({
          title: "Changes Autosaved",
          description: "Lesson title updated",
        });
      }
    } catch (error) {
      console.error('Error updating lesson title:', error);
      toast({
        title: "Error",
        description: "Failed to update lesson title",
        variant: "destructive",
      });
    }
  };

  const updateLessonContent = async (moduleId: string, lessonId: string, newContent: string) => {
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

      if (autoSaveEnabled) {
        toast({
          title: "Changes Autosaved",
          description: "Lesson content updated",
        });
      }
    } catch (error) {
      console.error('Error updating lesson content:', error);
      toast({
        title: "Error",
        description: "Failed to update lesson content",
        variant: "destructive",
      });
    }
  };

  const debouncedUpdateLessonContent = useCallback(
    debounce((moduleId: string, lessonId: string, content: string) => {
      updateLessonContent(moduleId, lessonId, content);
    }, 1000),
    [modules]
  );

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

      if (autoSaveEnabled) {
        toast({
          title: "Changes Autosaved",
          description: "Module title updated",
        });
      }
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

  const moveModuleUp = async (index: number) => {
    if (index === 0) return;
    
    try {
      const newModules = [...modules];
      const moduleToMove = newModules[index];
      const moduleAbove = newModules[index - 1];
      
      // Swap order indices
      const tempOrderIndex = moduleToMove.order_index;
      moduleToMove.order_index = moduleAbove.order_index;
      moduleAbove.order_index = tempOrderIndex;
      
      // Update in database
      const batch = [
        supabase
          .from('modules')
          .update({ order_index: moduleToMove.order_index })
          .eq('id', moduleToMove.id),
        supabase
          .from('modules')
          .update({ order_index: moduleAbove.order_index })
          .eq('id', moduleAbove.id)
      ];
      
      await Promise.all(batch);
      
      // Update state
      newModules[index] = moduleAbove;
      newModules[index - 1] = moduleToMove;
      setModules(newModules);
    } catch (error) {
      console.error('Error moving module:', error);
      toast({
        title: "Error",
        description: "Failed to move module",
        variant: "destructive",
      });
    }
  };
  
  const moveModuleDown = async (index: number) => {
    if (index === modules.length - 1) return;
    
    try {
      const newModules = [...modules];
      const moduleToMove = newModules[index];
      const moduleBelow = newModules[index + 1];
      
      // Swap order indices
      const tempOrderIndex = moduleToMove.order_index;
      moduleToMove.order_index = moduleBelow.order_index;
      moduleBelow.order_index = tempOrderIndex;
      
      // Update in database
      const batch = [
        supabase
          .from('modules')
          .update({ order_index: moduleToMove.order_index })
          .eq('id', moduleToMove.id),
        supabase
          .from('modules')
          .update({ order_index: moduleBelow.order_index })
          .eq('id', moduleBelow.id)
      ];
      
      await Promise.all(batch);
      
      // Update state
      newModules[index] = moduleBelow;
      newModules[index + 1] = moduleToMove;
      setModules(newModules);
    } catch (error) {
      console.error('Error moving module:', error);
      toast({
        title: "Error",
        description: "Failed to move module",
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = async (result: any) => {
    const { destination, source, type } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === 'module') {
      const newModules = [...modules];
      const [removed] = newModules.splice(source.index, 1);
      newModules.splice(destination.index, 0, removed);
      
      // Update order_index for all affected modules
      const updates = newModules.map((module, index) => ({
        id: module.id,
        order_index: index
      }));
      
      // Update state immediately for UI responsiveness
      setModules(newModules.map((module, index) => ({
        ...module,
        order_index: index
      })));
      
      // Then update the database
      try {
        for (const update of updates) {
          await supabase
            .from('modules')
            .update({ order_index: update.order_index })
            .eq('id', update.id);
        }
      } catch (error) {
        console.error('Error updating module order:', error);
        fetchModules(selectedCourse as string); // Refresh from server if there's an error
      }
    } else if (type.startsWith('lesson-')) {
      const moduleId = type.replace('lesson-', '');
      const moduleIndex = modules.findIndex(m => m.id === moduleId);
      
      if (moduleIndex === -1) return;
      
      const newModules = [...modules];
      const newLessons = [...newModules[moduleIndex].lessons];
      
      // Move the lesson
      const [removed] = newLessons.splice(source.index, 1);
      newLessons.splice(destination.index, 0, removed);
      
      // Update order_index for all affected lessons
      const updates = newLessons.map((lesson, index) => ({
        id: lesson.id,
        order_index: index
      }));
      
      // Update state immediately for UI responsiveness
      newModules[moduleIndex] = {
        ...newModules[moduleIndex],
        lessons: newLessons.map((lesson, index) => ({
          ...lesson,
          order_index: index
        }))
      };
      
      setModules(newModules);
      
      // Then update the database
      try {
        for (const update of updates) {
          await supabase
            .from('lessons')
            .update({ order_index: update.order_index })
            .eq('id', update.id);
        }
      } catch (error) {
        console.error('Error updating lesson order:', error);
        fetchModules(selectedCourse as string); // Refresh from server if there's an error
      }
    }
  };

  const toggleItemSelection = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    
    try {
      // Identify which are modules and which are lessons
      const moduleIds: string[] = [];
      const lessonPairs: {moduleId: string, lessonId: string}[] = [];
      
      selectedItems.forEach(item => {
        if (item.includes('|')) {
          const [moduleId, lessonId] = item.split('|');
          lessonPairs.push({ moduleId, lessonId });
        } else {
          moduleIds.push(item);
        }
      });
      
      // Delete lessons first
      if (lessonPairs.length > 0) {
        const lessonIds = lessonPairs.map(pair => pair.lessonId);
        
        const { error: lessonError } = await supabase
          .from('lessons')
          .delete()
          .in('id', lessonIds);
          
        if (lessonError) throw lessonError;
      }
      
      // Then delete modules
      if (moduleIds.length > 0) {
        const { error: moduleError } = await supabase
          .from('modules')
          .delete()
          .in('id', moduleIds);
          
        if (moduleError) throw moduleError;
      }
      
      // Refresh data
      fetchModules(selectedCourse as string);
      setSelectedItems([]);
      
      toast({
        title: "Bulk Delete Successful",
        description: `Deleted ${moduleIds.length} modules and ${lessonPairs.length} lessons`,
      });
    } catch (error) {
      console.error('Error performing bulk delete:', error);
      toast({
        title: "Error",
        description: "Failed to delete selected items",
        variant: "destructive",
      });
    }
  };

  const filteredModules = modules.filter(module => {
    // Filter modules by search query
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    
    // Check if module title matches
    if (module.title.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Check if any lesson in the module matches
    return module.lessons.some(lesson => 
      lesson.title.toLowerCase().includes(searchLower) || 
      lesson.content.toLowerCase().includes(searchLower)
    );
  });

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
                  <div className="flex flex-col sm:flex-row gap-3 justify-between">
                    <div className="relative w-full sm:w-64">
                      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search modules and lessons..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground whitespace-nowrap">Autosave</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={autoSaveEnabled}
                          onChange={() => setAutoSaveEnabled(!autoSaveEnabled)}
                        />
                        <div className="w-9 h-5 bg-muted-foreground/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    
                    {selectedItems.length > 0 && (
                      <Button 
                        variant="destructive"
                        size="sm"
                        onClick={handleBulkDelete}
                        className="whitespace-nowrap"
                      >
                        <Trash2Icon className="h-4 w-4 mr-1" />
                        Delete Selected ({selectedItems.length})
                      </Button>
                    )}
                  </div>

                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="modules" type="module">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-4"
                        >
                          {filteredModules.length === 0 ? (
                            searchQuery ? (
                              <div className="text-center p-6 border rounded-md">
                                <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg border-muted-foreground/30">
                                <FolderIcon className="h-12 w-12 text-muted-foreground/70 mb-2" />
                                <h3 className="text-lg font-medium mb-1">No Modules Yet</h3>
                                <p className="text-muted-foreground max-w-md mb-4">
                                  Start building your course by adding your first module. 
                                  Modules are containers for your lessons.
                                </p>
                                <div className="flex gap-3">
                                  <Input
                                    placeholder="Enter module title"
                                    value={newModuleTitle}
                                    onChange={(e) => setNewModuleTitle(e.target.value)}
                                    className="w-64"
                                  />
                                  <Button onClick={addModule}>
                                    <PlusIcon className="h-4 w-4 mr-2" /> Add Module
                                  </Button>
                                </div>
                              </div>
                            )
                          ) : (
                            filteredModules.map((module, index) => (
                              <Draggable key={module.id} draggableId={module.id} index={index}>
                                {(provided) => (
                                  <Card 
                                    key={module.id} 
                                    className={`border-2 ${selectedItems.includes(module.id) ? 'border-primary bg-primary/5' : 'border-border'}`}
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                  >
                                    <div className="p-4 flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div 
                                          className="cursor-pointer"
                                          onClick={() => toggleItemSelection(module.id)}
                                        >
                                          {selectedItems.includes(module.id) ? (
                                            <CheckCircleIcon className="h-5 w-5 text-primary" />
                                          ) : (
                                            <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/50" />
                                          )}
                                        </div>
                                        <div 
                                          {...provided.dragHandleProps} 
                                          className="cursor-move"
                                        >
                                          <GripVerticalIcon className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <FolderIcon className="h-5 w-5 text-primary" />
                                          <RichTextEditor 
                                            content={module.title}
                                            onChange={(newTitle) => updateModuleTitle(module.id, newTitle)}
                                            placeholder="Module title..."
                                            className="bg-transparent border-none min-h-0"
                                            minHeight="24px"
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
                                          onClick={() => moveModuleUp(index)}
                                          disabled={index === 0}
                                        >
                                          <MoveUpIcon className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          onClick={() => moveModuleDown(index)}
                                          disabled={index === modules.length - 1}
                                        >
                                          <MoveDownIcon className="h-4 w-4" />
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
                                        <Droppable droppableId={`lessons-${module.id}`} type={`lesson-${module.id}`}>
                                          {(provided) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.droppableProps}
                                              className="space-y-2"
                                            >
                                              {module.lessons.length === 0 ? (
                                                <div className="text-center p-4 text-sm text-muted-foreground">
                                                  No lessons yet. Click "Lesson" to add one.
                                                </div>
                                              ) : (
                                                module.lessons.map((lesson, lessonIndex) => (
                                                  <Draggable 
                                                    key={lesson.id} 
                                                    draggableId={lesson.id} 
                                                    index={lessonIndex}
                                                  >
                                                    {(provided) => (
                                                      <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        className={`ml-6 p-3 border rounded-md flex items-start justify-between ${
                                                          selectedItems.includes(`${module.id}|${lesson.id}`) 
                                                            ? 'bg-primary/5 border-primary' 
                                                            : 'bg-background'
                                                        }`}
                                                      >
                                                        <div className="flex items-start gap-3 flex-1">
                                                          <div 
                                                            className="cursor-pointer mt-1"
                                                            onClick={() => toggleItemSelection(`${module.id}|${lesson.id}`)}
                                                          >
                                                            {selectedItems.includes(`${module.id}|${lesson.id}`) ? (
                                                              <CheckCircleIcon className="h-4 w-4 text-primary" />
                                                            ) : (
                                                              <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/50" />
                                                            )}
                                                          </div>
                                                          <div 
                                                            {...provided.dragHandleProps}
                                                            className="cursor-move mt-1"
                                                          >
                                                            <GripVerticalIcon className="h-4 w-4 text-muted-foreground" />
                                                          </div>
                                                          <div className="space-y-2 flex-1">
                                                            <div className="flex items-center gap-2">
                                                              <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                                                              <RichTextEditor 
                                                                content={lesson.title || ''}
                                                                onChange={(newTitle) => updateLessonTitle(module.id, lesson.id, newTitle)}
                                                                placeholder="Lesson title..."
                                                                className="bg-transparent border-none min-h-0"
                                                                minHeight="24px"
                                                              />
                                                            </div>
                                                            <RichTextEditor 
                                                              content={lesson.content || ''}
                                                              onChange={(content) => debouncedUpdateLessonContent(module.id, lesson.id, content)}
                                                              placeholder="Lesson content..."
                                                              className="bg-muted/20"
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
                                                    )}
                                                  </Draggable>
                                                ))
                                              )}
                                              {provided.placeholder}
                                            </div>
                                          )}
                                        </Droppable>
                                      </div>
                                    )}
                                  </Card>
                                )}
                              </Draggable>
                            ))
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>

                  {filteredModules.length > 0 && (
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
                  )}
                  
                  <div className="pt-4 flex justify-end">
                    <Button onClick={handleSaveCourse} className="gap-2">
                      <SaveIcon className="h-4 w-4" />
                      {autoSaveEnabled ? "All Changes Saved" : "Save Course Structure"}
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
                  {filteredModules.map((module) => (
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
                              <div className="text-sm text-muted-foreground prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: lesson.content }}
                              />
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
                  
                  {filteredModules.length === 0 && (
                    <div className="text-center p-6">
                      <p className="text-muted-foreground">
                        {searchQuery ? 
                          `No results found for "${searchQuery}"` :
                          "Your course has no modules yet. Add some to see the preview."
                        }
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
