"use client"

import { useState } from "react"
import { Plus, Trash2, GripVertical } from "lucide-react"
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

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
}

interface MenuCategory {
  id: string
  name: string
  items: MenuItem[]
}

// Sample menu data
const initialMenuData: MenuCategory[] = [
  {
    id: "appetizers",
    name: "Appetizers",
    items: [
      {
        id: "app-1",
        name: "Garlic Bread",
        description: "Freshly baked bread with garlic butter",
        price: 5.99,
      },
      {
        id: "app-2",
        name: "Mozzarella Sticks",
        description: "Breaded mozzarella sticks with marinara sauce",
        price: 7.99,
      },
    ],
  },
  {
    id: "main-courses",
    name: "Main Courses",
    items: [
      {
        id: "main-1",
        name: "Spaghetti Bolognese",
        description: "Classic spaghetti with beef bolognese sauce",
        price: 14.99,
      },
      {
        id: "main-2",
        name: "Grilled Salmon",
        description: "Fresh salmon fillet with lemon butter sauce",
        price: 18.99,
      },
    ],
  },
  {
    id: "desserts",
    name: "Desserts",
    items: [
      {
        id: "dessert-1",
        name: "Tiramisu",
        description: "Classic Italian dessert with coffee and mascarpone",
        price: 6.99,
      },
      {
        id: "dessert-2",
        name: "Chocolate Cake",
        description: "Rich chocolate cake with vanilla ice cream",
        price: 7.99,
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
  onUpdateItem,
  onRemoveItem,
}: {
  category: MenuCategory
  index: number
  onAddItem: (categoryId: string) => void
  onRemoveCategory: (categoryId: string) => void
  onUpdateItem: (categoryId: string, itemId: string, field: keyof MenuItem, value: string | number) => void
  onRemoveItem: (categoryId: string, itemId: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Card ref={setNodeRef} style={style} className="border-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2" {...attributes} {...listeners}>
          <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
          <CardTitle className="text-xl">{category.name}</CardTitle>
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
      </CardHeader>
      <CardContent>
        <SortableItemsList
          items={category.items}
          categoryId={category.id}
          onUpdateItem={onUpdateItem}
          onRemoveItem={onRemoveItem}
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
}: {
  items: MenuItem[]
  categoryId: string
  onUpdateItem: (categoryId: string, itemId: string, field: keyof MenuItem, value: string | number) => void
  onRemoveItem: (categoryId: string, itemId: string) => void
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
}: {
  item: MenuItem
  categoryId: string
  onUpdateItem: (categoryId: string, itemId: string, field: keyof MenuItem, value: string | number) => void
  onRemoveItem: (categoryId: string, itemId: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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
            <div className="grid gap-4 py-2">
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
                  <Input
                    id={`${item.id}-price`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.price}
                    onChange={(e) => onUpdateItem(categoryId, item.id, "price", Number.parseFloat(e.target.value) || 0)}
                  />
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
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export function RestaurantMenuBuilder() {
  const [menuData, setMenuData] = useState<MenuCategory[]>(initialMenuData)
  const [newCategoryName, setNewCategoryName] = useState("")

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

  const updateMenuItem = (categoryId: string, itemId: string, field: keyof MenuItem, value: string | number) => {
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
                onUpdateItem={updateMenuItem}
                onRemoveItem={removeMenuItem}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

