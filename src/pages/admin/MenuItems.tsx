
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose 
} from "@/components/ui/dialog";
import { 
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose 
} from "@/components/ui/sheet";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { 
  Plus, Pencil, Trash, Search, ArrowUpDown, ArrowUp, ArrowDown 
} from "lucide-react";
import { toast } from "sonner";

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  category_name?: string;
  preparation_time: string;
  spicy_level: string;
  image_url: string;
};

type Category = {
  id: string;
  name: string;
};

const AdminMenuItems = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterCategory, setFilterCategory] = useState<string>("");

  const [newItem, setNewItem] = useState<Omit<MenuItem, "id" | "category_name">>({
    name: "",
    description: "",
    price: 0,
    category_id: "",
    preparation_time: "",
    spicy_level: "",
    image_url: ""
  });

  // Fetch menu items and categories on load
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("*")
          .order("name");

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Fetch menu items with category names
        const { data: menuItemsData, error: menuItemsError } = await supabase
          .from("menu_items")
          .select(`
            *,
            categories:category_id (name)
          `)
          .order("name");

        if (menuItemsError) throw menuItemsError;
        
        // Format the data to include category name
        const formattedMenuItems = menuItemsData.map((item: any) => ({
          ...item,
          category_name: item.categories?.name || "Uncategorized"
        }));

        setMenuItems(formattedMenuItems || []);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load menu items");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Handle add new item
  const handleAddItem = async () => {
    try {
      // Basic validation
      if (!newItem.name || !newItem.price || !newItem.category_id) {
        toast.error("Please fill in all required fields");
        return;
      }

      const { data, error } = await supabase
        .from("menu_items")
        .insert([newItem])
        .select(`
          *,
          categories:category_id (name)
        `)
        .single();

      if (error) throw error;

      // Add to list with category name
      const newMenuItemWithCategory = {
        ...data,
        category_name: categories.find(c => c.id === data.category_id)?.name || "Uncategorized"
      };

      setMenuItems([...menuItems, newMenuItemWithCategory]);
      
      // Reset form
      setNewItem({
        name: "",
        description: "",
        price: 0,
        category_id: "",
        preparation_time: "",
        spicy_level: "",
        image_url: ""
      });
      
      toast.success("Menu item added successfully");
    } catch (error: any) {
      console.error("Error adding item:", error);
      toast.error("Failed to add menu item");
    }
  };

  // Handle update item
  const handleUpdateItem = async () => {
    if (!editingItem) return;

    try {
      // Basic validation
      if (!editingItem.name || !editingItem.price || !editingItem.category_id) {
        toast.error("Please fill in all required fields");
        return;
      }

      const { data, error } = await supabase
        .from("menu_items")
        .update({
          name: editingItem.name,
          description: editingItem.description,
          price: editingItem.price,
          category_id: editingItem.category_id,
          preparation_time: editingItem.preparation_time,
          spicy_level: editingItem.spicy_level,
          image_url: editingItem.image_url
        })
        .eq("id", editingItem.id)
        .select(`
          *,
          categories:category_id (name)
        `)
        .single();

      if (error) throw error;

      // Update item in list with category name
      const updatedItemWithCategory = {
        ...data,
        category_name: categories.find(c => c.id === data.category_id)?.name || "Uncategorized"
      };

      setMenuItems(menuItems.map(item => 
        item.id === editingItem.id ? updatedItemWithCategory : item
      ));
      
      // Reset editing state
      setEditingItem(null);
      
      toast.success("Menu item updated successfully");
    } catch (error: any) {
      console.error("Error updating item:", error);
      toast.error("Failed to update menu item");
    }
  };

  // Handle delete item
  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      const { error } = await supabase
        .from("menu_items")
        .delete()
        .eq("id", itemToDelete);

      if (error) throw error;

      // Remove from list
      setMenuItems(menuItems.filter(item => item.id !== itemToDelete));
      
      toast.success("Menu item deleted successfully");
    } catch (error: any) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete menu item");
    } finally {
      setItemToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  // Filter and sort items
  const filteredItems = menuItems
    .filter(item => 
      (item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
       item.description.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (filterCategory === "" || item.category_id === filterCategory)
    )
    .sort((a, b) => {
      if (sortField === "price") {
        return sortDirection === "asc" 
          ? a.price - b.price 
          : b.price - a.price;
      } else {
        const aValue = a[sortField as keyof MenuItem] || "";
        const bValue = b[sortField as keyof MenuItem] || "";
        
        return sortDirection === "asc"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      }
    });

  // Render sort icon
  const renderSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortDirection === "asc" 
      ? <ArrowUp className="ml-2 h-4 w-4" />
      : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu Items</h1>
          <p className="text-muted-foreground">
            Manage your restaurant's menu offerings
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="mt-4 md:mt-0">
              <Plus className="mr-2 h-4 w-4" /> Add New Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Menu Item</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right">Name*</label>
                <Input
                  id="name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="description" className="text-right">Description</label>
                <Input
                  id="description"
                  value={newItem.description || ""}
                  onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="price" className="text-right">Price*</label>
                <Input
                  id="price"
                  type="number"
                  value={newItem.price || ""}
                  onChange={(e) => setNewItem({...newItem, price: parseFloat(e.target.value)})}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="category" className="text-right">Category*</label>
                <Select 
                  value={newItem.category_id} 
                  onValueChange={(value) => setNewItem({...newItem, category_id: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="prep_time" className="text-right">Prep Time</label>
                <Input
                  id="prep_time"
                  value={newItem.preparation_time || ""}
                  onChange={(e) => setNewItem({...newItem, preparation_time: e.target.value})}
                  placeholder="e.g. 15-20 minutes"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="spicy_level" className="text-right">Spicy Level</label>
                <Select 
                  value={newItem.spicy_level || ""} 
                  onValueChange={(value) => setNewItem({...newItem, spicy_level: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select spicy level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Spicy">Not Spicy</SelectItem>
                    <SelectItem value="Mild">Mild</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hot">Hot</SelectItem>
                    <SelectItem value="Extra Hot">Extra Hot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="image_url" className="text-right">Image URL</label>
                <Input
                  id="image_url"
                  value={newItem.image_url || ""}
                  onChange={(e) => setNewItem({...newItem, image_url: e.target.value})}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleAddItem}>Add Item</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select 
          value={filterCategory} 
          onValueChange={setFilterCategory}
        >
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Menu Items Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("name")}>
                  Item Name {renderSortIcon("name")}
                </Button>
              </TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("price")}>
                  Price {renderSortIcon("price")}
                </Button>
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort("category_name")}>
                  Category {renderSortIcon("category_name")}
                </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading menu items...
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No menu items found. Add some new items!
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {item.description ? (
                      item.description.length > 50 
                        ? `${item.description.substring(0, 50)}...` 
                        : item.description
                    ) : "No description"}
                  </TableCell>
                  <TableCell>${parseFloat(item.price.toString()).toFixed(2)}</TableCell>
                  <TableCell className="hidden md:table-cell">{item.category_name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Sheet>
                        <SheetContent className="sm:max-w-[600px]">
                          <SheetHeader>
                            <SheetTitle>Edit Menu Item</SheetTitle>
                          </SheetHeader>
                          {editingItem && (
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="edit-name" className="text-right">Name*</label>
                                <Input
                                  id="edit-name"
                                  value={editingItem.name}
                                  onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                                  className="col-span-3"
                                  required
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="edit-description" className="text-right">Description</label>
                                <Input
                                  id="edit-description"
                                  value={editingItem.description || ""}
                                  onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="edit-price" className="text-right">Price*</label>
                                <Input
                                  id="edit-price"
                                  type="number"
                                  value={editingItem.price || ""}
                                  onChange={(e) => setEditingItem({...editingItem, price: parseFloat(e.target.value)})}
                                  className="col-span-3"
                                  required
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="edit-category" className="text-right">Category*</label>
                                <Select 
                                  value={editingItem.category_id} 
                                  onValueChange={(value) => setEditingItem({...editingItem, category_id: value})}
                                >
                                  <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {categories.map((category) => (
                                      <SelectItem key={category.id} value={category.id}>
                                        {category.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="edit-prep-time" className="text-right">Prep Time</label>
                                <Input
                                  id="edit-prep-time"
                                  value={editingItem.preparation_time || ""}
                                  onChange={(e) => setEditingItem({...editingItem, preparation_time: e.target.value})}
                                  placeholder="e.g. 15-20 minutes"
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="edit-spicy-level" className="text-right">Spicy Level</label>
                                <Select 
                                  value={editingItem.spicy_level || ""} 
                                  onValueChange={(value) => setEditingItem({...editingItem, spicy_level: value})}
                                >
                                  <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select spicy level" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Not Spicy">Not Spicy</SelectItem>
                                    <SelectItem value="Mild">Mild</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Hot">Hot</SelectItem>
                                    <SelectItem value="Extra Hot">Extra Hot</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="edit-image-url" className="text-right">Image URL</label>
                                <Input
                                  id="edit-image-url"
                                  value={editingItem.image_url || ""}
                                  onChange={(e) => setEditingItem({...editingItem, image_url: e.target.value})}
                                  className="col-span-3"
                                />
                              </div>
                            </div>
                          )}
                          <SheetFooter>
                            <SheetClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </SheetClose>
                            <Button onClick={handleUpdateItem}>Save Changes</Button>
                          </SheetFooter>
                        </SheetContent>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setEditingItem(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Sheet>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setItemToDelete(item.id);
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
              This action cannot be undone. This will permanently delete the menu item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminMenuItems;
