"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAction, useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPaisa, rupeesToPaisa } from "@/lib/currency";
import { toast } from "sonner";
import { Plus, Sparkles, Trash2, Pencil } from "lucide-react";

type EditingItem = {
  itemId?: Id<"catalogItems">;
  name: string;
  description: string;
  priceRupees: string;
  discountPct: string;
  categoryId: string;
};

const emptyItem: EditingItem = {
  name: "",
  description: "",
  priceRupees: "",
  discountPct: "",
  categoryId: "none",
};

export default function CatalogPage() {
  const { isAuthenticated } = useConvexAuth();
  const catalog = useQuery(api.catalog.listMine, isAuthenticated ? {} : "skip");
  const createItem = useMutation(api.catalog.createItem);
  const updateItem = useMutation(api.catalog.updateItem);
  const deleteItem = useMutation(api.catalog.deleteItem);
  const createCategory = useMutation(api.catalog.createCategory);
  const generateImage = useAction(api.images.generateItemImage);
  const deleteCategory = useMutation(api.catalog.deleteCategory);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EditingItem>(emptyItem);
  const [newCategory, setNewCategory] = useState("");

  async function saveItem() {
    const price = Number(editing.priceRupees);
    if (!editing.name || !Number.isFinite(price) || price <= 0) {
      toast.error("Name aur sahih price zaroori hai");
      return;
    }
    const discount = editing.discountPct ? Number(editing.discountPct) : undefined;
    const categoryId =
      editing.categoryId === "none"
        ? undefined
        : (editing.categoryId as Id<"catalogCategories">);
    try {
      if (editing.itemId) {
        await updateItem({
          itemId: editing.itemId,
          name: editing.name,
          description: editing.description || undefined,
          pricePaisa: rupeesToPaisa(price),
          discountPct: discount ?? null,
          categoryId: categoryId ?? null,
        });
      } else {
        await createItem({
          name: editing.name,
          description: editing.description || undefined,
          pricePaisa: rupeesToPaisa(price),
          discountPct: discount,
          categoryId,
        });
      }
      toast.success("Saved");
      setDialogOpen(false);
      setEditing(emptyItem);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">
            Catalog
          </h1>
          <p className="text-sm text-stone-500">
            Your products, prices, and discounts.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/catalog/import">
            <Button
              variant="outline"
              className="rounded-full border-emerald-200 text-emerald-700"
            >
              <Sparkles className="h-4 w-4" /> AI Import
            </Button>
          </Link>
          <Button
            className="rounded-full bg-emerald-700 text-white hover:bg-emerald-800"
            onClick={() => {
              setEditing(emptyItem);
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Add Item
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editing.itemId ? "Edit Item" : "Add Item"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={editing.name}
                    onChange={(e) =>
                      setEditing({ ...editing, name: e.target.value })
                    }
                    placeholder="Chicken Karahi"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Textarea
                    value={editing.description}
                    onChange={(e) =>
                      setEditing({ ...editing, description: e.target.value })
                    }
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price (Rs.)</Label>
                    <Input
                      type="number"
                      value={editing.priceRupees}
                      onChange={(e) =>
                        setEditing({ ...editing, priceRupees: e.target.value })
                      }
                      placeholder="450"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Discount % (optional)</Label>
                    <Input
                      type="number"
                      value={editing.discountPct}
                      onChange={(e) =>
                        setEditing({ ...editing, discountPct: e.target.value })
                      }
                      placeholder="10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={editing.categoryId}
                    onValueChange={(v) =>
                      setEditing({ ...editing, categoryId: v ?? "none" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="No category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No category</SelectItem>
                      {catalog?.categories.map((c) => (
                        <SelectItem key={c._id} value={c._id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={saveItem}
                  className="w-full rounded-full bg-emerald-700 text-white hover:bg-emerald-800"
                >
                  Save Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {catalog?.categories.map((c) => (
          <span
            key={c._id}
            className="group flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-semibold text-stone-700"
          >
            {c.name}
            <button
              onClick={async () => {
                await deleteCategory({ categoryId: c._id });
                toast.success("Category removed");
              }}
              className="text-stone-400 hover:text-red-600"
              title="Delete category"
            >
              ×
            </button>
          </span>
        ))}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!newCategory.trim()) return;
            await createCategory({ name: newCategory.trim() });
            setNewCategory("");
          }}
          className="flex items-center gap-1"
        >
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category"
            className="h-7 w-32 rounded-full text-xs"
          />
          <Button
            type="submit"
            size="sm"
            variant="ghost"
            className="h-7 rounded-full px-2 text-xs"
          >
            Add
          </Button>
        </form>
      </div>

      {catalog === undefined ? (
        <div className="h-64 animate-pulse rounded-2xl bg-stone-200" />
      ) : catalog.items.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white py-16 text-center text-sm text-stone-500">
          No items yet. Add manually or use{" "}
          <Link
            href="/dashboard/catalog/import"
            className="text-emerald-700 underline"
          >
            AI Import
          </Link>{" "}
          to paste your whole menu at once.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.items.map((item) => (
            <div
              key={item._id}
              className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-xl border border-stone-100 object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100 text-lg">
                      🍽️
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-bold text-stone-900">
                      {item.name}
                    </p>
                    <p className="text-sm font-semibold text-emerald-700">
                      {item.discountPct ? (
                        <>
                          <span className="mr-1 text-xs text-stone-400 line-through">
                            {formatPaisa(item.pricePaisa)}
                          </span>
                          {formatPaisa(
                            Math.round(
                              item.pricePaisa * (1 - item.discountPct / 100),
                            ),
                          )}
                        </>
                      ) : (
                        formatPaisa(item.pricePaisa)
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 disabled:animate-pulse disabled:text-stone-300"
                    disabled={item.imageStatus === "generating"}
                    title="Generate AI image"
                    onClick={async () => {
                      toast.info(`Generating image for ${item.name}...`);
                      try {
                        await generateImage({ itemId: item._id });
                        toast.success("Image ready ✨");
                      } catch (e) {
                        toast.error(
                          e instanceof Error ? e.message : "Image failed",
                        );
                      }
                    }}
                  >
                    <Sparkles className="h-4 w-4" />
                  </button>
                  <button
                    className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                    onClick={() => {
                      setEditing({
                        itemId: item._id,
                        name: item.name,
                        description: item.description ?? "",
                        priceRupees: String(item.pricePaisa / 100),
                        discountPct: item.discountPct
                          ? String(item.discountPct)
                          : "",
                        categoryId: item.categoryId ?? "none",
                      });
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    className="rounded-lg p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600"
                    onClick={async () => {
                      await deleteItem({ itemId: item._id });
                      toast.success("Item deleted");
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-stone-100 pt-3">
                <span className="text-xs text-stone-500">
                  {catalog.categories.find((c) => c._id === item.categoryId)
                    ?.name ?? "Uncategorized"}
                </span>
                <label className="flex items-center gap-2 text-xs font-medium text-stone-600">
                  Available
                  <Switch
                    checked={item.available}
                    onCheckedChange={async (checked) => {
                      await updateItem({
                        itemId: item._id,
                        available: checked === true,
                      });
                    }}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
