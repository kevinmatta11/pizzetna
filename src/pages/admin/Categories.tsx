
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose 
} from "@/components/ui/dialog";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Plus, Pencil, Trash, Search 
} from "lucide-react";
import { toast } from "sonner";

type Category = {
  id: string;
  name: string;
};

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  // Fetch categories on load
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("name");

        if (error) throw error;
        setCategories(data || []);
      } catch (error: any) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle add category
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("categories")
        .insert([{ name: newCategoryName.trim() }])
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          toast.error("A category with this name already exists");
        } else {
          throw error;
        }
        return;
      }

      setCategories([...categories, data]);
      setNewCategoryName("");
      toast.success("Category added successfully");
    } catch (error: any) {
      console.error("Error adding category:", error);
      toast.error("Failed to add category");
    }
  };

  // Handle update category
  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("categories")
        .update({ name: editingCategory.name.trim() })
        .eq("id", editingCategory.id)
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          toast.error("A category with this name already exists");
        } else {
          throw error;
        }
        return;
      }

      setCategories(categories.map(cat => 
        cat.id === editingCategory.id ? data : cat
      ));
      setEditingCategory(null);
      toast.success("Category updated successfully");
    } catch (error: any) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    }
  };

  // Handle delete category
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      // Check if category is being used by menu items
      const { data: menuItems, error: checkError } = await supabase
        .from("menu_items")
        .select("id")
        .eq("category_id", categoryToDelete)
        .limit(1);

      if (checkError) throw checkError;

      if (menuItems && menuItems.length > 0) {
        toast.error("Cannot delete category. It is being used by menu items.");
        setDeleteDialogOpen(false);
        setCategoryToDelete(null);
        return;
      }

      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryToDelete);

      if (error) throw error;

      setCategories(categories.filter(cat => cat.id !== categoryToDelete));
      toast.success("Category deleted successfully");
    } catch (error: any) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    } finally {
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  // Filter categories
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage your menu categories
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="mt-4 md:mt-0">
              <Plus className="mr-2 h-4 w-4" /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right">Name</label>
                <Input
                  id="name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter category name"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleAddCategory}>Add Category</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-8">
                  Loading categories...
                </TableCell>
              </TableRow>
            ) : filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-8">
                  No categories found.
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setEditingCategory(category)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Edit Category</DialogTitle>
                          </DialogHeader>
                          {editingCategory && (
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="edit-name" className="text-right">Name</label>
                                <Input
                                  id="edit-name"
                                  value={editingCategory.name}
                                  onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                                  className="col-span-3"
                                />
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline" onClick={() => setEditingCategory(null)}>Cancel</Button>
                            </DialogClose>
                            <Button onClick={handleUpdateCategory}>Save Changes</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setCategoryToDelete(category.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this category. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminCategories;
