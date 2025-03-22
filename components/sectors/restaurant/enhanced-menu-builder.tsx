"use client"

import { useEffect } from "react"

import { useState } from "react"
import { Plus, Trash2, GripVertical, Image, DollarSign, Clock, Utensils } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  preparationTime?: number
  calories?: number
  allergens?: string[]
  dietary?: string[]
  image?: string
  modifierGroups?: string[]
}

interface MenuCategory {
  id: string
  name: string
  description?: string
  items: MenuItem[]
}

interface ModifierGroup {
  id: string
  name: string
  required: boolean
  multiSelect: boolean
  minSelections?: number
  maxSelections?: number
  modifiers: Modifier[]
}

interface Modifier {
  id: string
  name: string
  price: number
  isDefault: boolean
}

// Sample menu data
const initialMenuData: MenuCategory[] = [
  {
    id: "appetizers",
    name: "Appetizers",
    description: "Start your meal with these delicious options",
    items: [
      {
        id: "app-1",
        name: "Garlic Bread",
        description: "Freshly baked bread with garlic butter",
        price: 5.99,
        preparationTime: 10,
        calories: 320,
        allergens: ["gluten", "dairy"],
        dietary: ["vegetarian"],
      },
      {
        id: "app-2",
        name: "Mozzarella Sticks",
        description: "Breaded mozzarella sticks with marinara sauce",
        price: 7.99,
        preparationTime: 15,
        calories: 450,
        allergens: ["gluten", "dairy"],
        dietary: ["vegetarian"],
      },
    ],
  },
  {
    id: "main-courses",
    name: "Main Courses",
    description: "Hearty and satisfying entrees",
    items: [
      {
        id: "main-1",
        name: "Spaghetti Bolognese",
        description: "Classic spaghetti with beef bolognese sauce",
        price: 14.99,
        preparationTime: 20,
        calories: 680,
        allergens: ["gluten"],
        modifierGroups: ["pasta-options", "sauce-spiciness"],
      },
      {
        id: "main-2",
        name: "Grilled Salmon",
        description: "Fresh salmon fillet with lemon butter sauce",
        price: 18.99,
        preparationTime: 25,
        calories: 520,
        allergens: ["fish"],
        dietary: ["gluten-free"],
        modifierGroups: ["side-options"],
      },
    ],
  },
  {
    id: "desserts",
    name: "Desserts",
    description: "Sweet treats to finish your meal",
    items: [
      {
        id: "dessert-1",
        name: "Tiramisu",
        description: "Classic Italian dessert with coffee and mascarpone",
        price: 6.99,
        preparationTime: 10,
        calories: 420,
        allergens: ["gluten", "dairy", "eggs"],
        dietary: ["vegetarian"],
      },
      {
        id: "dessert-2",
        name: "Chocolate Cake",
        description: "Rich chocolate cake with vanilla ice cream",
        price: 7.99,
        preparationTime: 10,
        calories: 550,
        allergens: ["gluten", "dairy", "eggs"],
        dietary: ["vegetarian"],
      },
    ],
  },
]

const initialModifierGroups: ModifierGroup[] = [
  {
    id: "pasta-options",
    name: "Pasta Options",
    required: true,
    multiSelect: false,
    modifiers: [
      {
        id: "pasta-1",
        name: "Regular Spaghetti",
        price: 0,
        isDefault: true,
      },
      {
        id: "pasta-2",
        name: "Whole Wheat Pasta",
        price: 1.5,
        isDefault: false,
      },
      {
        id: "pasta-3",
        name: "Gluten-Free Pasta",
        price: 2,
        isDefault: false,
      },
    ],
  },
  {
    id: "sauce-spiciness",
    name: "Sauce Spiciness",
    required: false,
    multiSelect: false,
    modifiers: [
      {
        id: "spice-1",
        name: "Mild",
        price: 0,
        isDefault: true,
      },
      {
        id: "spice-2",
        name: "Medium",
        price: 0,
        isDefault: false,
      },
      {
        id: "spice-3",
        name: "Spicy",
        price: 0,
        isDefault: false,
      },
    ],
  },
  {
    id: "side-options",
    name: "Side Options",
    required: true,
    multiSelect: false,
    modifiers: [
      {
        id: "side-1",
        name: "Steamed Vegetables",
        price: 0,
        isDefault: true,
      },
      {
        id: "side-2",
        name: "Mashed Potatoes",
        price: 0,
        isDefault: false,
      },
      {
        id: "side-3",
        name: "French Fries",
        price: 1,
        isDefault: false,
      },
      {
        id: "side-4",
        name: "Side Salad",
        price: 2,
        isDefault: false,
      },
    ],
  },
]

// Sortable Category component
function SortableCategory({
  category,
  index,
  onAddItem,
  onRemoveCategory,
  onUpdateCategory,
  onUpdateItem,
  onRemoveItem,
  modifierGroups,
}: {
  category: MenuCategory
  index: number
  onAddItem: (categoryId: string) => void
  onRemoveCategory: (categoryId: string) => void
  onUpdateCategory: (categoryId: string, field: keyof MenuCategory, value: string) => void
  onUpdateItem: (categoryId: string, itemId: string, field: keyof MenuItem, value: any) => void
  onRemoveItem: (categoryId: string, itemId: string) => void
  modifierGroups: ModifierGroup[]
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Card ref={setNodeRef} style={style} className="border-2">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2" {...attributes} {...listeners}>
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
            <div className="flex-1">
              <Input
                value={category.name}
                onChange={(e) => onUpdateCategory(category.id, "name", e.target.value)}
                className="text-xl font-semibold h-8 px-2 py-1"
              />
              <Input
                value={category.description || ""}
                onChange={(e) => onUpdateCategory(category.id, "description", e.target.value)}
                className="text-sm text-muted-foreground h-6 px-2 py-1 mt-1"
                placeholder="Category description (optional)"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onAddItem(category.id)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => onRemoveCategory(category.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <SortableItemsList
          items={category.items}
          categoryId={category.id}
          onUpdateItem={onUpdateItem}
          onRemoveItem={onRemoveItem}
          modifierGroups={modifierGroups}
        />
      </CardContent>
    </Card>
  )
}

// Sortable Items List component
function SortableItemsList({
  items,
  categoryId,
  onUpdateItem,
  onRemoveItem,
  modifierGroups,
}: {
  items: MenuItem[]
  categoryId: string
  onUpdateItem: (categoryId: string, itemId: string, field: keyof MenuItem, value: any) => void
  onRemoveItem: (categoryId: string, itemId: string) => void
  modifierGroups: ModifierGroup[]
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)

      // We don't directly modify the items here, we'll handle this in the parent component
      // This is just to notify the parent component of the change
      const newItems = arrayMove(items, oldIndex, newIndex)

      // Update all items in the category
      newItems.forEach((item, index) => {
        onUpdateItem(categoryId, item.id, "name", item.name)
      })
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map((item) => (
            <SortableMenuItem
              key={item.id}
              item={item}
              categoryId={categoryId}
              onUpdateItem={onUpdateItem}
              onRemoveItem={onRemoveItem}
              modifierGroups={modifierGroups}
            />
          ))}
          {items.length === 0 && (
            <div className="flex h-16 items-center justify-center rounded-md border border-dashed">
              <p className="text-sm text-muted-foreground">Drag items here or add a new item</p>
            </div>
          )}
        </div>
      </SortableContext>
    </DndContext>
  )
}

// Sortable Menu Item component
function SortableMenuItem({
  item,
  categoryId,
  onUpdateItem,
  onRemoveItem,
  modifierGroups,
}: {
  item: MenuItem
  categoryId: string
  onUpdateItem: (categoryId: string, itemId: string, field: keyof MenuItem, value: any) => void
  onRemoveItem: (categoryId: string, itemId: string) => void
  modifierGroups: ModifierGroup[]
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id })
  const [activeTab, setActiveTab] = useState("basic")
  const [isModifierDialogOpen, setIsModifierDialogOpen] = useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const allergenOptions = ["gluten", "dairy", "eggs", "fish", "shellfish", "nuts", "peanuts", "soy", "sesame"]

  const dietaryOptions = [
    "vegetarian",
    "vegan",
    "gluten-free",
    "dairy-free",
    "nut-free",
    "halal",
    "kosher",
    "low-carb",
    "keto",
  ]

  const handleAllergenToggle = (allergen: string) => {
    const currentAllergens = item.allergens || []
    const newAllergens = currentAllergens.includes(allergen)
      ? currentAllergens.filter((a) => a !== allergen)
      : [...currentAllergens, allergen]
    onUpdateItem(categoryId, item.id, "allergens", newAllergens)
  }

  const handleDietaryToggle = (dietary: string) => {
    const currentDietary = item.dietary || []
    const newDietary = currentDietary.includes(dietary)
      ? currentDietary.filter((d) => d !== dietary)
      : [...currentDietary, dietary]
    onUpdateItem(categoryId, item.id, "dietary", newDietary)
  }

  const handleModifierGroupToggle = (groupId: string) => {
    const currentGroups = item.modifierGroups || []
    const newGroups = currentGroups.includes(groupId)
      ? currentGroups.filter((g) => g !== groupId)
      : [...currentGroups, groupId]
    onUpdateItem(categoryId, item.id, "modifierGroups", newGroups)
  }

  return (
    <div ref={setNodeRef} style={style} className="rounded-md border p-3">
      <Accordion type="single" collapsible>
        <AccordionItem value={item.id} className="border-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2" {...attributes} {...listeners}>
              <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
              <AccordionTrigger className="hover:no-underline">
                <span className="font-medium">{item.name}</span>
                <span className="ml-2 text-muted-foreground">${item.price.toFixed(2)}</span>
              </AccordionTrigger>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => onRemoveItem(categoryId, item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <AccordionContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
                <TabsTrigger value="modifiers">Modifiers</TabsTrigger>
                <TabsTrigger value="image">Image</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`${item.id}-name`}>Name</Label>
                    <Input
                      id={`${item.id}-name`}
                      value={item.name}
                      onChange={(e) => onUpdateItem(categoryId, item.id, "name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${item.id}-price`}>Price</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id={`${item.id}-price`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.price}
                        onChange={(e) =>
                          onUpdateItem(categoryId, item.id, "price", Number.parseFloat(e.target.value) || 0)
                        }
                        className="pl-8"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${item.id}-description`}>Description</Label>
                  <Textarea
                    id={`${item.id}-description`}
                    value={item.description}
                    onChange={(e) => onUpdateItem(categoryId, item.id, "description", e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${item.id}-prep-time`}>Preparation Time (minutes)</Label>
                  <div className="relative">
                    <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id={`${item.id}-prep-time`}
                      type="number"
                      min="0"
                      value={item.preparationTime || ""}
                      onChange={(e) =>
                        onUpdateItem(
                          categoryId,
                          item.id,
                          "preparationTime",
                          e.target.value ? Number.parseInt(e.target.value) : undefined,
                        )
                      }
                      className="pl-8"
                      placeholder="Preparation time in minutes"
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="nutrition" className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor={`${item.id}-calories`}>Calories</Label>
                  <Input
                    id={`${item.id}-calories`}
                    type="number"
                    min="0"
                    value={item.calories || ""}
                    onChange={(e) =>
                      onUpdateItem(
                        categoryId,
                        item.id,
                        "calories",
                        e.target.value ? Number.parseInt(e.target.value) : undefined,
                      )
                    }
                    placeholder="Calories per serving"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Allergens</Label>
                  <div className="flex flex-wrap gap-2">
                    {allergenOptions.map((allergen) => (
                      <Badge
                        key={allergen}
                        variant={item.allergens?.includes(allergen) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleAllergenToggle(allergen)}
                      >
                        {allergen}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Dietary Options</Label>
                  <div className="flex flex-wrap gap-2">
                    {dietaryOptions.map((dietary) => (
                      <Badge
                        key={dietary}
                        variant={item.dietary?.includes(dietary) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleDietaryToggle(dietary)}
                      >
                        {dietary}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="modifiers" className="space-y-4 py-4">
                <div className="flex items-center justify-between">
                  <Label>Modifier Groups</Label>
                  <Button variant="outline" size="sm" onClick={() => setIsModifierDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Manage Modifiers
                  </Button>
                </div>
                {modifierGroups.length === 0 ? (
                  <div className="flex h-20 items-center justify-center rounded-md border border-dashed">
                    <p className="text-sm text-muted-foreground">No modifier groups available</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {modifierGroups.map((group) => (
                      <div key={group.id} className="flex items-center space-x-2">
                        <Switch
                          id={`${item.id}-${group.id}`}
                          checked={item.modifierGroups?.includes(group.id) || false}
                          onCheckedChange={() => handleModifierGroupToggle(group.id)}
                        />
                        <Label htmlFor={`${item.id}-${group.id}`}>{group.name}</Label>
                        <span className="text-xs text-muted-foreground">
                          ({group.required ? "Required" : "Optional"})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="image" className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor={`${item.id}-image`}>Image URL</Label>
                  <div className="relative">
                    <Image className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id={`${item.id}-image`}
                      value={item.image || ""}
                      onChange={(e) => onUpdateItem(categoryId, item.id, "image", e.target.value)}
                      className="pl-8"
                      placeholder="Enter image URL"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  {item.image ? (
                    <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=200&width=400"
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center rounded-md border border-dashed">
                      <p className="text-sm text-muted-foreground">No image set</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Dialog open={isModifierDialogOpen} onOpenChange={setIsModifierDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier Groups</DialogTitle>
            <DialogDescription>
              Manage modifier groups for this menu item. These allow customers to customize their order.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            {modifierGroups.map((group) => (
              <div key={group.id} className="mb-4 rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">{group.name}</h3>
                  <Switch
                    id={`dialog-${item.id}-${group.id}`}
                    checked={item.modifierGroups?.includes(group.id) || false}
                    onCheckedChange={() => handleModifierGroupToggle(group.id)}
                  />
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {group.required ? "Required" : "Optional"} •{" "}
                  {group.multiSelect
                    ? `Select ${group.minSelections || 1}-${group.maxSelections || "any"}`
                    : "Select one"}
                </div>
                <div className="mt-2">
                  <Label>Options:</Label>
                  <div className="mt-1 space-y-1">
                    {group.modifiers.map((modifier) => (
                      <div key={modifier.id} className="flex items-center justify-between text-sm">
                        <span>{modifier.name}</span>
                        <div className="flex items-center">
                          {modifier.price > 0 && <span className="mr-2">+${modifier.price.toFixed(2)}</span>}
                          {modifier.isDefault && <Badge variant="outline">Default</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsModifierDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function EnhancedRestaurantMenuBuilder() {
  const [menuData, setMenuData] = useState<MenuCategory[]>(initialMenuData)
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>(initialModifierGroups)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [isModifierGroupDialogOpen, setIsModifierGroupDialogOpen] = useState(false)
  const [editingModifierGroup, setEditingModifierGroup] = useState<ModifierGroup | null>(null)
  const [activeTab, setActiveTab] = useState("menu")

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = menuData.findIndex((cat) => cat.id === active.id)
      const newIndex = menuData.findIndex((cat) => cat.id === over.id)

      setMenuData(arrayMove(menuData, oldIndex, newIndex))
    }
  }

  const addCategory = () => {
    if (!newCategoryName.trim()) return

    const newCategory: MenuCategory = {
      id: `category-${Date.now()}`,
      name: newCategoryName,
      items: [],
    }
    setMenuData([...menuData, newCategory])
    setNewCategoryName("")
  }

  const removeCategory = (categoryId: string) => {
    setMenuData(menuData.filter((category) => category.id !== categoryId))
  }

  const updateCategory = (categoryId: string, field: keyof MenuCategory, value: string) => {
    const categoryIndex = menuData.findIndex((cat) => cat.id === categoryId)
    if (categoryIndex === -1) return

    const newMenuData = [...menuData]
    newMenuData[categoryIndex] = {
      ...menuData[categoryIndex],
      [field]: value,
    }
    setMenuData(newMenuData)
  }

  const addMenuItem = (categoryId: string) => {
    const categoryIndex = menuData.findIndex((cat) => cat.id === categoryId)
    if (categoryIndex === -1) return

    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      name: "New Item",
      description: "Description",
      price: 0,
    }

    const newMenuData = [...menuData]
    newMenuData[categoryIndex] = {
      ...menuData[categoryIndex],
      items: [...menuData[categoryIndex].items, newItem],
    }
    setMenuData(newMenuData)
  }

  const updateMenuItem = (categoryId: string, itemId: string, field: keyof MenuItem, value: any) => {
    const categoryIndex = menuData.findIndex((cat) => cat.id === categoryId)
    if (categoryIndex === -1) return

    const itemIndex = menuData[categoryIndex].items.findIndex((item) => item.id === itemId)
    if (itemIndex === -1) return

    const newMenuData = [...menuData]
    newMenuData[categoryIndex].items[itemIndex] = {
      ...newMenuData[categoryIndex].items[itemIndex],
      [field]: value,
    }
    setMenuData(newMenuData)
  }

  const removeMenuItem = (categoryId: string, itemId: string) => {
    const categoryIndex = menuData.findIndex((cat) => cat.id === categoryId)
    if (categoryIndex === -1) return

    const newMenuData = [...menuData]
    newMenuData[categoryIndex] = {
      ...menuData[categoryIndex],
      items: menuData[categoryIndex].items.filter((item) => item.id !== itemId),
    }
    setMenuData(newMenuData)
  }

  const handleAddModifierGroup = () => {
    setEditingModifierGroup(null)
    setIsModifierGroupDialogOpen(true)
  }

  const handleEditModifierGroup = (group: ModifierGroup) => {
    setEditingModifierGroup(group)
    setIsModifierGroupDialogOpen(true)
  }

  const handleSaveModifierGroup = (group: ModifierGroup) => {
    if (editingModifierGroup) {
      // Update existing group
      setModifierGroups(modifierGroups.map((g) => (g.id === group.id ? group : g)))
    } else {
      // Add new group
      setModifierGroups([...modifierGroups, { ...group, id: `group-${Date.now()}` }])
    }
    setIsModifierGroupDialogOpen(false)
  }

  const handleDeleteModifierGroup = (groupId: string) => {
    setModifierGroups(modifierGroups.filter((group) => group.id !== groupId))
    // Also remove references to this group from menu items
    const newMenuData = menuData.map((category) => ({
      ...category,
      items: category.items.map((item) => ({
        ...item,
        modifierGroups: item.modifierGroups?.filter((id) => id !== groupId),
      })),
    }))
    setMenuData(newMenuData)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Restaurant Menu Builder</h2>
        <div className="flex items-center gap-2">
          <Input
            placeholder="New Category Name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="w-48"
          />
          <Button onClick={addCategory}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="menu">Menu Structure</TabsTrigger>
          <TabsTrigger value="modifiers">Modifier Groups</TabsTrigger>
        </TabsList>
        <TabsContent value="menu" className="space-y-4 pt-4">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={menuData.map((cat) => cat.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {menuData.map((category, index) => (
                  <SortableCategory
                    key={category.id}
                    category={category}
                    index={index}
                    onAddItem={addMenuItem}
                    onRemoveCategory={removeCategory}
                    onUpdateCategory={updateCategory}
                    onUpdateItem={updateMenuItem}
                    onRemoveItem={removeMenuItem}
                    modifierGroups={modifierGroups}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </TabsContent>
        <TabsContent value="modifiers" className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Modifier Groups</h3>
            <Button onClick={handleAddModifierGroup}>
              <Plus className="mr-2 h-4 w-4" />
              Add Modifier Group
            </Button>
          </div>

          {modifierGroups.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
              <div className="text-center">
                <Utensils className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No modifier groups yet</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={handleAddModifierGroup}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Modifier Group
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {modifierGroups.map((group) => (
                <Card key={group.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditModifierGroup(group)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDeleteModifierGroup(group.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={group.required ? "default" : "outline"}>
                          {group.required ? "Required" : "Optional"}
                        </Badge>
                        <Badge variant={group.multiSelect ? "default" : "outline"}>
                          {group.multiSelect ? "Multi-select" : "Single-select"}
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <Label>Options:</Label>
                        <div className="mt-1 space-y-1">
                          {group.modifiers.map((modifier) => (
                            <div key={modifier.id} className="flex items-center justify-between text-sm">
                              <span>{modifier.name}</span>
                              <div className="flex items-center">
                                {modifier.price > 0 && <span className="mr-2">+${modifier.price.toFixed(2)}</span>}
                                {modifier.isDefault && <Badge variant="outline">Default</Badge>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ModifierGroupDialog
        open={isModifierGroupDialogOpen}
        onOpenChange={setIsModifierGroupDialogOpen}
        group={editingModifierGroup}
        onSave={handleSaveModifierGroup}
      />
    </div>
  )
}

function ModifierGroupDialog({
  open,
  onOpenChange,
  group,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: ModifierGroup | null
  onSave: (group: ModifierGroup) => void
}) {
  const [name, setName] = useState("")
  const [required, setRequired] = useState(false)
  const [multiSelect, setMultiSelect] = useState(false)
  const [minSelections, setMinSelections] = useState<number | undefined>(undefined)
  const [maxSelections, setMaxSelections] = useState<number | undefined>(undefined)
  const [modifiers, setModifiers] = useState<Modifier[]>([])
  const [newModifierName, setNewModifierName] = useState("")
  const [newModifierPrice, setNewModifierPrice] = useState("0")

  // Reset form when dialog opens/closes or group changes
  useEffect(() => {
    if (group) {
      setName(group.name)
      setRequired(group.required)
      setMultiSelect(group.multiSelect)
      setMinSelections(group.minSelections)
      setMaxSelections(group.maxSelections)
      setModifiers(group.modifiers)
    } else {
      setName("")
      setRequired(false)
      setMultiSelect(false)
      setMinSelections(undefined)
      setMaxSelections(undefined)
      setModifiers([])
    }
  }, [group, open])

  const handleAddModifier = () => {
    if (!newModifierName.trim()) return

    const newModifier: Modifier = {
      id: `modifier-${Date.now()}`,
      name: newModifierName,
      price: Number.parseFloat(newModifierPrice) || 0,
      isDefault: modifiers.length === 0, // First modifier is default
    }

    setModifiers([...modifiers, newModifier])
    setNewModifierName("")
    setNewModifierPrice("0")
  }

  const handleRemoveModifier = (id: string) => {
    setModifiers(modifiers.filter((mod) => mod.id !== id))
  }

  const handleSetDefault = (id: string) => {
    setModifiers(
      modifiers.map((mod) => ({
        ...mod,
        isDefault: mod.id === id,
      })),
    )
  }

  const handleUpdateModifier = (id: string, field: keyof Modifier, value: any) => {
    setModifiers(
      modifiers.map((mod) =>
        mod.id === id
          ? {
              ...mod,
              [field]: value,
            }
          : mod,
      ),
    )
  }

  const handleSave = () => {
    const savedGroup: ModifierGroup = {
      id: group?.id || `group-${Date.now()}`,
      name,
      required,
      multiSelect,
      minSelections: multiSelect ? minSelections : undefined,
      maxSelections: multiSelect ? maxSelections : undefined,
      modifiers,
    }
    onSave(savedGroup)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{group ? "Edit Modifier Group" : "Add Modifier Group"}</DialogTitle>
          <DialogDescription>
            Modifier groups allow customers to customize their orders with options like toppings, sizes, etc.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Toppings, Sizes, Sauce Options"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Switch id="required" checked={required} onCheckedChange={setRequired} />
              <Label htmlFor="required">Required</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              If required, customers must select at least one option from this group
            </p>
          </div>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Switch id="multi-select" checked={multiSelect} onCheckedChange={setMultiSelect} />
              <Label htmlFor="multi-select">Allow Multiple Selections</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              If enabled, customers can select multiple options from this group
            </p>
          </div>
          {multiSelect && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-selections">Minimum Selections</Label>
                <Input
                  id="min-selections"
                  type="number"
                  min="0"
                  value={minSelections || ""}
                  onChange={(e) => setMinSelections(e.target.value ? Number.parseInt(e.target.value) : undefined)}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-selections">Maximum Selections</Label>
                <Input
                  id="max-selections"
                  type="number"
                  min="0"
                  value={maxSelections || ""}
                  onChange={(e) => setMaxSelections(e.target.value ? Number.parseInt(e.target.value) : undefined)}
                  placeholder="Optional"
                />
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label>Modifiers</Label>
            <div className="rounded-md border">
              <div className="p-4">
                <div className="grid grid-cols-5 gap-4">
                  <div className="col-span-3">
                    <Input
                      value={newModifierName}
                      onChange={(e) => setNewModifierName(e.target.value)}
                      placeholder="New modifier name"
                    />
                  </div>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newModifierPrice}
                      onChange={(e) => setNewModifierPrice(e.target.value)}
                      placeholder="Price"
                      className="pl-8"
                    />
                  </div>
                  <Button onClick={handleAddModifier}>Add</Button>
                </div>
              </div>
              <div className="border-t">
                {modifiers.length === 0 ? (
                  <div className="flex h-20 items-center justify-center p-4">
                    <p className="text-sm text-muted-foreground">No modifiers added yet</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {modifiers.map((modifier) => (
                      <div key={modifier.id} className="grid grid-cols-12 items-center gap-4 p-4">
                        <div className="col-span-5">
                          <Input
                            value={modifier.name}
                            onChange={(e) => handleUpdateModifier(modifier.id, "name", e.target.value)}
                          />
                        </div>
                        <div className="col-span-3 relative">
                          <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={modifier.price}
                            onChange={(e) =>
                              handleUpdateModifier(modifier.id, "price", Number.parseFloat(e.target.value) || 0)
                            }
                            className="pl-8"
                          />
                        </div>
                        <div className="col-span-2 flex items-center justify-center">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`default-${modifier.id}`}
                              checked={modifier.isDefault}
                              onCheckedChange={() => handleSetDefault(modifier.id)}
                              disabled={!multiSelect && modifiers.some((m) => m.id !== modifier.id && m.isDefault)}
                            />
                            <Label htmlFor={`default-${modifier.id}`} className="text-xs">
                              Default
                            </Label>
                          </div>
                        </div>
                        <div className="col-span-2 flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleRemoveModifier(modifier.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || modifiers.length === 0}>
            Save Modifier Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

